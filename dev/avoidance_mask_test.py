"""Test avoidance timeline and gradient mask functionality."""
import asyncio
import os
import sys
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML_PATH = os.path.join(ROOT, 'index.html')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
        )
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        errors = []
        page.on('pageerror', lambda e: errors.append(e.message))

        await page.goto('file:///' + HTML_PATH.replace('\\', '/'))
        await page.wait_for_load_state('networkidle')

        results = await page.evaluate(r"""
        () => {
          const logs = [];
          const assert = (cond, msg) => {
            if (!cond) throw new Error('Assertion failed: ' + msg);
            logs.push('OK: ' + msg);
          };

          // 1. Data model & normalization
          assert(typeof J.normalizeAvoidanceMask === 'function', 'J.normalizeAvoidanceMask exists');
          const defMask = J.normalizeAvoidanceMask(null);
          assert(defMask.maskAvoidance === false, 'defMask.maskAvoidance is false');
          assert(defMask.maskRadiusOffset === 0, 'defMask.maskRadiusOffset is 0');
          assert(defMask.maskFeather === 60, 'defMask.maskFeather is 60');
          assert(defMask.maskCurve === 'smooth', 'defMask.maskCurve is smooth');

          const customMask = J.normalizeAvoidanceMask({ maskAvoidance: true, maskRadiusOffset: 25, maskFeather: 100, maskCurve: 'steep' });
          assert(customMask.maskAvoidance === true, 'customMask.maskAvoidance is true');
          assert(customMask.maskRadiusOffset === 25, 'customMask.maskRadiusOffset is 25');
          assert(customMask.maskFeather === 100, 'customMask.maskFeather is 100');
          assert(customMask.maskCurve === 'steep', 'customMask.maskCurve is steep');

          // 2. Planning with avoidance mask
          const proj = J.defaultProject();
          proj.lyrics = 'テスト歌詞一\nテスト歌詞二';
          proj.lyricEffects = { autoPlacement: true, avoidCenter: true };
          proj.avoidance = J.normalizeAvoidance({
            enabled: true,
            maskAvoidance: true,
            maskRadiusOffset: 10,
            maskFeather: 80,
            maskCurve: 'linear',
            cutOverrides: {
              0: { cx: 0.5, cy: 0.5, r: 0.2, maskAvoidance: true, maskRadiusOffset: 20, maskFeather: 50, maskCurve: 'soft' }
            }
          });

          const plan = J.plan(proj);
          assert(plan.lyricAvoidance && plan.lyricAvoidance.enabled === true, 'plan.lyricAvoidance is enabled');
          assert(plan.lyricAvoidance.maskAvoidance === true, 'plan.lyricAvoidance.maskAvoidance is true');

          const cut0Circle = J.circleAvoidanceForCut(plan, plan.cuts[0], plan.cuts[0].start);
          assert(cut0Circle.maskAvoidance === true, 'cut0Circle.maskAvoidance is true');
          assert(cut0Circle.maskRadiusOffset === 20, 'cut0Circle.maskRadiusOffset overridden to 20');
          assert(cut0Circle.maskFeather === 50, 'cut0Circle.maskFeather overridden to 50');
          assert(cut0Circle.maskCurve === 'soft', 'cut0Circle.maskCurve overridden to soft');

          // Radii helper test
          const radii = J.avoidanceMaskRadii(cut0Circle, plan.W, plan.H);
          assert(radii.rInner > 0, 'radii.rInner is positive');
          assert(radii.rOuter > radii.rInner, 'radii.rOuter is greater than rInner');

          // 3. Render pixel test: Check that decor/auxiliary gets punched out while main text is preserved
          const canvas = document.createElement('canvas');
          canvas.width = 400;
          canvas.height = 300;
          const renderer = new J.Renderer();

          // Render with maskAvoidance: true
          renderer.frame(canvas.getContext('2d'), plan, plan.cuts[0].start + 0.1, { scale: 400 / plan.W });
          const ctx = canvas.getContext('2d');
          
          // Check pixel near stage center (circle center = cx:0.5, cy:0.5 -> canvas 200, 150)
          // In the avoidance center, auxiliary decor/knockouts should be punched out
          // Let's test applyAvoidanceCircleMask directly on a test canvas to verify exact math
          const testCv = document.createElement('canvas');
          testCv.width = 400;
          testCv.height = 400;
          const tctx = testCv.getContext('2d');
          tctx.fillStyle = 'rgba(255, 0, 0, 1)';
          tctx.fillRect(0, 0, 400, 400); // solid red
          
          const testCircle = { cx: 200, cy: 200, r: 50, maskRadiusOffset: 0, maskFeather: 50, maskCurve: 'linear' };
          J.applyAvoidanceCircleMask(tctx, { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }, testCircle, 400, 400);
          
          // Center pixel (200, 200) must be 100% transparent (alpha = 0)
          const centerPix = tctx.getImageData(200, 200, 1, 1).data;
          assert(centerPix[3] === 0, `Center pixel alpha is 0 (got ${centerPix[3]})`);

          // Pixel inside rInner (at r = 25) must also be transparent
          const innerPix = tctx.getImageData(225, 200, 1, 1).data;
          assert(innerPix[3] === 0, `Inner pixel alpha is 0 (got ${innerPix[3]})`);

          // Pixel at r = 75 (halfway through feather 50..100) must be partially transparent
          const midPix = tctx.getImageData(275, 200, 1, 1).data;
          assert(midPix[3] > 20 && midPix[3] < 235, `Mid-feather pixel alpha is partial (got ${midPix[3]})`);

          // Pixel beyond rOuter (at r = 120 > 100) must be untouched (alpha = 255)
          const outerPix = tctx.getImageData(320, 200, 1, 1).data;
          assert(outerPix[3] === 255, `Outer pixel alpha is 255 (got ${outerPix[3]})`);

          return { success: true, logs };
        }
        """)

        print(f"JavaScript tests passed: {len(results['logs'])} assertions.")
        for log in results['logs']:
            print(" ", log)

        # 4. Interactive UI tests
        print("\n--- Testing UI Elements ---")
        # Check that #avoidancePane has the new controls
        mask_cb = page.locator('#avoidanceMask')
        assert await mask_cb.count() == 1, "#avoidanceMask checkbox exists"

        default_fields = page.locator('#avoidanceDefaultMaskFields')
        assert await default_fields.count() == 1, "#avoidanceDefaultMaskFields exists"

        # Check avoidance editor mask controls
        edit_mask_cb = page.locator('#avoidanceEditMask')
        assert await edit_mask_cb.count() == 1, "#avoidanceEditMask exists"
        
        inner_ring = page.locator('#avoidanceMaskInnerRing')
        outer_ring = page.locator('#avoidanceMaskOuterRing')
        assert await inner_ring.count() == 1, "#avoidanceMaskInnerRing exists"
        assert await outer_ring.count() == 1, "#avoidanceMaskOuterRing exists"

        # Test UI interactions: toggle avoidanceMask in avoidance pane
        await page.evaluate(r"""
        () => {
          S.sourceTab = 'avoidance';
          S.project.avoidance.maskAvoidance = true;
          S.project.avoidance.maskRadiusOffset = 15;
          S.project.avoidance.maskFeather = 75;
          S.project.avoidance.maskCurve = 'steep';
          syncSourceTab();
        }
        """)

        assert await mask_cb.is_checked(), "avoidanceMask checkbox is checked"
        assert not await default_fields.is_hidden(), "default_fields is visible when maskAvoidance is true"
        assert await page.locator('#avoidanceMaskOffset').input_value() == '15'
        assert await page.locator('#avoidanceMaskFeather').input_value() == '75'
        assert await page.locator('#avoidanceMaskCurve').input_value() == 'steep'
        print("Avoidance pane default mask fields test passed.")

        # Test opening avoidance editor
        await page.evaluate(r"""
        () => {
          openAvoidanceEditor(0, true);
        }
        """)

        assert not await page.locator('#avoidanceMaskControls').is_hidden(), "#avoidanceMaskControls is visible during avoidance edit"
        assert await page.locator('#avoidanceEditMask').is_checked(), "#avoidanceEditMask is checked"

        # Change edit offset and feather
        await page.locator('#avoidanceEditMaskOffset').fill('30')
        await page.locator('#avoidanceEditMaskOffset').dispatch_event('change')
        await page.locator('#avoidanceEditMaskFeather').fill('90')
        await page.locator('#avoidanceEditMaskFeather').dispatch_event('change')

        # Rings should be visible
        assert not await inner_ring.is_hidden(), "inner_ring is visible"
        assert not await outer_ring.is_hidden(), "outer_ring is visible"

        # Apply edit
        await page.locator('#areaApplyOne').click()
        saved_ov = await page.evaluate("() => S.project.avoidance.cutOverrides[0]")
        assert saved_ov['maskAvoidance'] == True, "Saved override has maskAvoidance: true"
        assert saved_ov['maskRadiusOffset'] == 30, "Saved override has maskRadiusOffset: 30"
        assert saved_ov['maskFeather'] == 90, "Saved override has maskFeather: 90"
        print("Avoidance editor apply test passed.")

        assert len(errors) == 0, f"Page errors occurred: {errors}"
        print("\nAll avoidance mask tests passed successfully!")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
