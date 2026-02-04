I will implement the "pinch-to-zoom" feature to allow videos to fill the entire screen, including the camera cutout area, similar to YouTube.

1. **Update** **`index.html`**:

   * Modify the viewport meta tag to include `viewport-fit=cover`. This allows the application to extend into the device's safe areas (like the notch).

2. **Update** **`src/components/Navbar.tsx`**:

   * Add `pt-[env(safe-area-inset-top)]` to the Navbar container. This ensures that the navigation bar is not obscured by the notch on regular pages, compensating for the global `viewport-fit=cover` change.

3. **Update** **`src/pages/Player.tsx`**:

   * Add a state variable `isZoomed` to track whether the video should fill the screen.

   * Implement touch event handlers (`onTouchStart`, `onTouchMove`, `onTouchEnd`) on the player container to detect pinch-in and pinch-out gestures.

   * **For Native Video (`<video>`)**:

     * Dynamically toggle the CSS class between `object-contain` (normal) and `object-cover` (zoomed) based on the `isZoomed` state.

   * **For Embedded Video (`<iframe>`)**:

     * Apply a CSS transform (scale) to the iframe wrapper when zoomed, as `object-fit` does not work on iframes. This effectively zooms in on the embedded player.

   * Add a visual "Zoomed to Fill" / "Original" toast or indicator (optional, but good for feedback) or just rely on the visual change.

