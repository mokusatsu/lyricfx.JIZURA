const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { NativeJobs } = require('../native-jobs.cjs');

(async () => {
  const tempDir = path.join(os.tmpdir(), 'jizura_export_e2e_' + Date.now());
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    const jobs = new NativeJobs({ appDataDir: tempDir });

    const width = 160;
    const height = 90;
    const fps = 10;
    const frameCount = 10;
    const frameSize = width * height * 4;

    const outPath = path.join(tempDir, 'test_export_result.mp4');
    const outputToken = jobs.registerOutput(outPath);

    // 1. Create a dummy WAV for audio multiplexing test
    const sr = 48000;
    const durationSec = frameCount / fps;
    const sampleCount = Math.round(sr * durationSec);
    const wavBytes = 44 + sampleCount * 2 * 2;
    const wavBuf = Buffer.alloc(wavBytes);
    wavBuf.write('RIFF', 0);
    wavBuf.writeUInt32LE(wavBytes - 8, 4);
    wavBuf.write('WAVEfmt ', 8);
    wavBuf.writeUInt32LE(16, 16);
    wavBuf.writeUInt16LE(1, 20); // PCM
    wavBuf.writeUInt16LE(2, 22); // 2 channels
    wavBuf.writeUInt32LE(sr, 24);
    wavBuf.writeUInt32LE(sr * 4, 28);
    wavBuf.writeUInt16LE(4, 32);
    wavBuf.writeUInt16LE(16, 34);
    wavBuf.write('data', 36);
    wavBuf.writeUInt32LE(sampleCount * 4, 40);

    const fakeWebContents = {
      isDestroyed: () => false,
      send: () => {}
    };

    console.log('Starting native export job...');
    const startRes = await jobs.startExportJob(fakeWebContents, {
      outputToken,
      width,
      height,
      fps,
      frameCount,
      qualityMode: 'high',
      bitrate: 500000,
      audioBuffer: wavBuf.buffer.slice(wavBuf.byteOffset, wavBuf.byteOffset + wavBuf.byteLength)
    });

    assert.equal(startRes.status, 'ready');
    const jobId = startRes.jobId;

    // 2. Stream RGBA frames
    const frameData = Buffer.alloc(frameSize);
    for (let i = 0; i < frameCount; i++) {
      // Color gradient per frame
      for (let p = 0; p < width * height; p++) {
        frameData[p * 4] = (i * 25) % 256;     // R
        frameData[p * 4 + 1] = 128;            // G
        frameData[p * 4 + 2] = 200;            // B
        frameData[p * 4 + 3] = 255;            // A
      }
      const rawBuf = frameData.buffer.slice(frameData.byteOffset, frameData.byteOffset + frameData.byteLength);
      await jobs.writeFrame(jobId, i, rawBuf);
    }

    // 3. Finalize export
    console.log('Finalizing native export...');
    const finishRes = await jobs.finishExport(jobId);
    assert.equal(finishRes.saved, true);
    assert.ok(finishRes.size > 0);
    assert.ok(finishRes.audioCodec, 'audioCodec must be reported');
    assert.ok(fs.existsSync(outPath), 'Final MP4 output must exist');
    assert.ok(fs.statSync(outPath).size > 1000, 'MP4 file should be non-trivial');

    // 4. Test job cancellation and cleanup
    const cancelOutPath = path.join(tempDir, 'cancel_test.mp4');
    const cancelToken = jobs.registerOutput(cancelOutPath);
    const cancelStart = await jobs.startExportJob(fakeWebContents, {
      outputToken: cancelToken,
      width,
      height,
      fps,
      frameCount: 50
    });
    const cancelRes = jobs.cancelJob(cancelStart.jobId);
    assert.equal(cancelRes.ok, true);

    // 5. Test native export with video-container audio (.mp4) pass-through (both video + audio tracks)
    const { execFileSync } = require('node:child_process');
    const dummyVideoPath = path.join(tempDir, 'source_video_with_audio.mp4');
    execFileSync(jobs._resolvePython(), ['-c', `
import subprocess, sys
ffmpeg = '${jobs.pythonPath}'.replace('python.exe', 'ffmpeg.exe') if 'python.exe' in '${jobs.pythonPath}' else 'ffmpeg'
subprocess.run([
    ffmpeg, '-y',
    '-f', 'lavfi', '-i', 'testsrc=duration=1:size=64x64:rate=10',
    '-f', 'lavfi', '-i', 'sine=frequency=440:duration=1',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '128k',
    sys.argv[1]
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
`, dummyVideoPath]);

    if (fs.existsSync(dummyVideoPath)) {
      console.log('Testing native export with video-derived MP4 audio pass-through...');
      const videoOutPath = path.join(tempDir, 'test_export_from_video.mp4');
      const videoOutputToken = jobs.registerOutput(videoOutPath);
      const videoAudioBuf = fs.readFileSync(dummyVideoPath);
      const vJob = await jobs.startExportJob(fakeWebContents, {
        outputToken: videoOutputToken,
        width,
        height,
        fps,
        frameCount,
        qualityMode: 'high',
        bitrate: 500000,
        audioBuffer: videoAudioBuf.buffer.slice(videoAudioBuf.byteOffset, videoAudioBuf.byteOffset + videoAudioBuf.byteLength),
        audioExt: '.mp4'
      });
      assert.equal(vJob.status, 'ready');
      for (let i = 0; i < frameCount; i++) {
        await jobs.writeFrame(vJob.jobId, i, frameData.buffer.slice(frameData.byteOffset, frameData.byteOffset + frameData.byteLength));
      }
      const vFinish = await jobs.finishExport(vJob.jobId);
      assert.equal(vFinish.saved, true);
      assert.equal(vFinish.audioCodec, 'AAC', 'Video audio codec should be detected as AAC');
      assert.equal(vFinish.audioMuxMode, 'copy', 'Lossless audio input must be muxed via copy mode');
      assert.ok(fs.existsSync(videoOutPath));

      // Inspect final MP4 container with FFmpeg to confirm Audio stream presence and codec
      const probeOutput = execFileSync(jobs._resolvePython(), ['-c', `
import subprocess, sys
ffmpeg = '${jobs.pythonPath}'.replace('python.exe', 'ffmpeg.exe') if 'python.exe' in '${jobs.pythonPath}' else 'ffmpeg'
res = subprocess.run([ffmpeg, '-hide_banner', '-i', sys.argv[1]], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
sys.stdout.buffer.write(res.stderr)
`, videoOutPath]).toString('utf-8');
      assert.ok(probeOutput.includes('Audio: aac'), 'Output MP4 must contain an AAC audio stream');

      // Verify bit-exact audio packet stream copy by comparing input and output audio MD5
      const inputAudioMd5 = execFileSync(jobs._resolvePython(), ['-c', `
import subprocess, sys
ffmpeg = '${jobs.pythonPath}'.replace('python.exe', 'ffmpeg.exe') if 'python.exe' in '${jobs.pythonPath}' else 'ffmpeg'
res = subprocess.run([ffmpeg, '-y', '-hide_banner', '-nostdin', '-i', sys.argv[1], '-vn', '-c:a', 'copy', '-f', 'md5', '-'], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
sys.stdout.buffer.write(res.stdout)
`, dummyVideoPath]).toString('utf-8').trim();

      const outputAudioMd5 = execFileSync(jobs._resolvePython(), ['-c', `
import subprocess, sys
ffmpeg = '${jobs.pythonPath}'.replace('python.exe', 'ffmpeg.exe') if 'python.exe' in '${jobs.pythonPath}' else 'ffmpeg'
res = subprocess.run([ffmpeg, '-y', '-hide_banner', '-nostdin', '-i', sys.argv[1], '-vn', '-c:a', 'copy', '-f', 'md5', '-'], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
sys.stdout.buffer.write(res.stdout)
`, videoOutPath]).toString('utf-8').trim();

      assert.ok(inputAudioMd5.startsWith('MD5='), 'Input audio MD5 must be valid');
      assert.equal(outputAudioMd5, inputAudioMd5, 'Output audio packet MD5 must match input audio packet MD5 exactly (proving bit-exact lossless streamcopy)');
      console.log('Video MP4 audio pass-through verified: bit-exact copy matches (MD5: ' + inputAudioMd5 + ').');
    }

    // 6. Test fallback to AAC re-encoding when direct copy mux is not possible (e.g. WMA format)
    console.log('Testing fallback to AAC re-encoding when audio requires conversion...');
    const wmaAudioPath = path.join(tempDir, 'test_audio.wma');
    execFileSync(jobs._resolvePython(), ['-c', `
import subprocess, sys
ffmpeg = '${jobs.pythonPath}'.replace('python.exe', 'ffmpeg.exe') if 'python.exe' in '${jobs.pythonPath}' else 'ffmpeg'
subprocess.run([
    ffmpeg, '-y',
    '-f', 'lavfi', '-i', 'sine=frequency=880:duration=1',
    '-c:a', 'wmav2',
    sys.argv[1]
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
`, wmaAudioPath]);

    if (fs.existsSync(wmaAudioPath)) {
      const fbOutPath = path.join(tempDir, 'test_export_fallback.mp4');
      const fbOutputToken = jobs.registerOutput(fbOutPath);
      const wmaAudioBuf = fs.readFileSync(wmaAudioPath);
      const fbJob = await jobs.startExportJob(fakeWebContents, {
        outputToken: fbOutputToken,
        width,
        height,
        fps,
        frameCount,
        qualityMode: 'high',
        bitrate: 500000,
        audioBuffer: wmaAudioBuf.buffer.slice(wmaAudioBuf.byteOffset, wmaAudioBuf.byteOffset + wmaAudioBuf.byteLength),
        audioExt: '.wma'
      });
      assert.equal(fbJob.status, 'ready');
      for (let i = 0; i < frameCount; i++) {
        await jobs.writeFrame(fbJob.jobId, i, frameData.buffer.slice(frameData.byteOffset, frameData.byteOffset + frameData.byteLength));
      }
      const fbFinish = await jobs.finishExport(fbJob.jobId);
      assert.equal(fbFinish.saved, true);
      assert.equal(fbFinish.audioCodec, 'AAC', 'Fallback audio codec must be AAC');
      assert.equal(fbFinish.audioMuxMode, 'reencode', 'Non-MP4 audio must trigger fallback reencode mode');
      assert.ok(fs.existsSync(fbOutPath));
      console.log('Fallback to AAC re-encode export verified successfully (MuxMode: reencode).');
    }

    jobs.cleanupAll();
    console.log('Native export E2E test passed successfully.');
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  }
})();
