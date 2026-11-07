/* Portable project: fixed header, UTF-8 manifest, then original binary files.
   Blob slices avoid base64 expansion and copying entire videos into JS strings. */
(() => {
'use strict';
// iOS Files may disable unknown custom extensions. Keep desktop filters, but let
// iPhone/iPad select any document; the portable readers validate its contents.
J.configurePortableFileInput = input => {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    /Mac/.test(navigator.platform) && navigator.maxTouchPoints > 1;
  if (ios) input.removeAttribute('accept');
};
const magic = 'JIZURA01', text = new TextEncoder(), decode = new TextDecoder();
const fail = () => new Error(J.mediaLabel('プロジェクトファイルが不正または未対応の形式です', 'Invalid or unsupported project file'));
J.packProject = async (project, audioFile) => {
  const entries = [], parts = []; let offset = 0;
  const add = async (kind, id, file, name) => {
    if (!(file instanceof Blob)) throw new Error(J.mediaLabel('素材が見つかりません。再読み込みしてください：', 'Missing asset. Please import it again: ') + name);
    try { file = await J.snapshotMediaFile(file); }
    catch (error) {
      throw new Error(J.mediaLabel('素材を読み取れません。元ファイルが変更・移動されている可能性があります。素材を再度取り込んでください：', 'Cannot read asset. Its source may have changed or moved. Please import it again: ') + name);
    }
    entries.push({kind,id,name:name || file.name || id,type:file.type,offset,size:file.size});
    parts.push(file); offset += file.size;
  };
  const items = new Map([...project.media.items,...project.foreground.items].map(item=>[item.id,item]));
  for (const [id,item] of items) await add('media',id,J.mediaAssets.get(id)?.file || await J.loadMedia(id),item.name);
  for (const [id,ref] of J.personMaskReferences?.(project) || []) await add('person',id,await J.personMaskBlob(ref),id+'.jizmat');
  if (project.audioAsset) await add('audio',project.audioAsset.id,audioFile || await J.loadMedia(project.audioAsset.id),project.audioAsset.name);
  for (const font of project.userFonts || []) if (font.file) await add('font',font.key,await J.readFontFile(font.key),font.label);
  const manifest = text.encode(JSON.stringify({format:'jizura',version:1,project,entries}));
  if (manifest.length > 32 * 1024 * 1024) throw fail();
  const header = new Uint8Array(12); header.set(text.encode(magic)); new DataView(header.buffer).setUint32(8,manifest.length,true);
  return new Blob([header,manifest,...parts],{type:'application/octet-stream'});
};
J.unpackProject = async (file, extensions = [J.PROJECT_EXTENSION]) => {
  if (typeof file.name === 'string' && !extensions.some(ext => ext && file.name.toLowerCase().endsWith(ext))) throw fail();
  const header = new Uint8Array(await file.slice(0,12).arrayBuffer());
  if (header.length !== 12 || decode.decode(header.slice(0,8)) !== magic) throw fail();
  const length = new DataView(header.buffer).getUint32(8,true), start = 12 + length;
  if (length > 32 * 1024 * 1024 || start > file.size) throw fail();
  const manifest = JSON.parse(await file.slice(12,start).text());
  if (manifest.format !== 'jizura' || manifest.version !== 1 || typeof manifest.project?.lyrics !== 'string' || !Array.isArray(manifest.entries)) throw fail();
  let end = 0; const seen = new Set(), files = [];
  for (const entry of manifest.entries) {
    if (!['media','audio','font','person'].includes(entry.kind) || typeof entry.id !== 'string' || typeof entry.name !== 'string' || typeof entry.type !== 'string' || !Number.isSafeInteger(entry.offset) || !Number.isSafeInteger(entry.size) || entry.size < 0 || entry.offset !== end || start+end+entry.size > file.size || seen.has(entry.kind+':'+entry.id)) throw fail();
    seen.add(entry.kind+':'+entry.id); end += entry.size;
    files.push({...entry,file:new File([file.slice(start+entry.offset,start+end)],entry.name,{type:entry.type})});
  }
  if (start+end !== file.size) throw fail();
  for (const item of [...(manifest.project.media?.items || []),...(manifest.project.foreground?.items || [])]) if (!seen.has('media:'+item.id)) throw fail();
  if (manifest.project.audioAsset && !seen.has('audio:'+manifest.project.audioAsset.id)) throw fail();
  for (const font of manifest.project.userFonts || []) if (font.file && !seen.has('font:'+font.key)) throw fail();
  for (const [id,ref] of J.personMaskReferences?.(manifest.project) || []) {
    if(!seen.has('person:'+id))throw fail();
    await J.readPersonMask(files.find(entry=>entry.kind==='person'&&entry.id===id).file,ref);
  }
  return {project:manifest.project,files,portable:true};
};
})();
