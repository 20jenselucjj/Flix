I will remove all Fire TV and spatial navigation features and improve the video player for Android and Desktop.

### 1. Remove Spatial Navigation & Fire TV Features
*   **Uninstall Dependencies**: Remove `@noriginmedia/norigin-spatial-navigation`.
*   **Delete Files**: 
    *   `src/lib/navigation.ts`
    *   `FIRE_TV_GUIDE.md`
    *   `.trae/documents/Replace Custom Navigation with Spatial Navigation Library.md`
*   **Update Entry Point**: Remove `initNavigation()` from `src/App.tsx`.
*   **Refactor Components**:
    *   **`FocusableButton` & `FocusableLink`**: Rewrite these components to be simple wrappers around standard HTML buttons and React Router Links, stripping out all spatial navigation logic. This ensures existing code using these components continues to work without refactoring every single file immediately.
    *   **`Navbar.tsx`**: Remove `useFocusable` hooks and manual focus management.
    *   **`Player.tsx`**: Remove `useFocusable` hooks and Fire TV specific key handlers (like Backspace/Escape for remote back).

### 2. Improve Video Player (Android & Desktop)
I will enhance `src/pages/Player.tsx` with the following features:
*   **Loading State**: Add a visual loading spinner overlay when the video is buffering or initializing.
*   **Gestures (Mobile/Desktop)**:
    *   **Double Tap/Click to Seek**: Implement double-tap on the left/right 25% of the screen to rewind/forward 10 seconds.
*   **Keyboard Shortcuts (Desktop)**:
    *   `Space` / `K`: Play/Pause
    *   `Arrow Left` / `Arrow Right`: Seek -/+ 10s
    *   `Arrow Up` / `Arrow Down`: Volume +/-
    *   `F`: Toggle Fullscreen
    *   `M`: Mute/Unmute
*   **UI Improvements**:
    *   Refine the controls overlay for better visibility and auto-hide behavior on both touch and mouse interaction.
    *   Ensure the "Back" button works consistently on Android (hardware back button) and Desktop (UI button).
