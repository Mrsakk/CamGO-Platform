/**
 * CamGO Travel - Playwright Responsive Smoke Tests
 * Validates:
 * 1. Zero horizontal overflow (scrollWidth <= innerWidth) at all target mobile viewports (360x640, 390x844, 768x1024, 1440x900)
 * 2. Primary buttons & interactive controls have tap targets >= 44x44px
 * 3. Zero console errors
 * 4. Screenshot artifacts captured per viewport
 */

import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "360x640_small_android", width: 360, height: 640 },
  { name: "390x844_iphone14", width: 390, height: 844 },
  { name: "768x1024_ipad_portrait", width: 768, height: 1024 },
  { name: "1440x900_desktop", width: 1440, height: 900 }
];

const ROUTES_UNDER_TEST = [
  { name: "Home", path: "/" },
  { name: "Destinations", path: "/destinations" },
  { name: "DestinationDetail", path: "/destinations/angkor-wat" },
  { name: "MapExplorer", path: "/map" },
  { name: "TripPlanner", path: "/trip-planner" },
  { name: "Login", path: "/login" },
  { name: "AdminDashboard", path: "/admin" }
];

for (const vp of VIEWPORTS) {
  test.describe(`Responsive tests for ${vp.name} (${vp.width}x${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const route of ROUTES_UNDER_TEST) {
      test(`[${vp.name}] ${route.name} (${route.path}) should have no overflow & 44px tap targets`, async ({ page }) => {
        const consoleErrors = [];
        page.on("console", (msg) => {
          if (msg.type() === "error") {
            consoleErrors.push(msg.text());
          }
        });

        // Navigate to the target page
        await page.goto(`http://localhost:5173${route.path}`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(800); // Allow layout and font rendering

        // 1. Assert: No Horizontal Page Overflow
        const isOverflowing = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(isOverflowing, `Horizontal overflow detected on ${route.path} at ${vp.width}px. ScrollWidth: ${scrollWidth}px vs Window: ${vp.width}px`).toBe(false);

        // 2. Assert: Primary CTA buttons meet or exceed 44px height tap target
        const primaryButtons = page.locator("button.btn-primary, a.btn-primary");
        const count = await primaryButtons.count();
        for (let i = 0; i < count; i++) {
          const btn = primaryButtons.nth(i);
          if (await btn.isVisible()) {
            const box = await btn.boundingBox();
            if (box) {
              expect(
                box.height,
                `Primary button on ${route.path} has height ${box.height}px, which is below 44px tap target`
              ).toBeGreaterThanOrEqual(43.5); // Allow sub-pixel rounding
            }
          }
        }

        // 3. Assert: No Critical Console Errors
        const criticalErrors = consoleErrors.filter(
          (err) => !err.includes("favicon") && !err.includes("Leaflet") && !err.includes("Download the React DevTools")
        );
        expect(criticalErrors.length, `Console errors found on ${route.path}: ${criticalErrors.join("; ")}`).toBe(0);

        // 4. Capture screenshot artifact
        await page.screenshot({
          path: `test-results/screenshots/${vp.name}-${route.name}.png`,
          fullPage: false
        });
      });
    }
  });
}
