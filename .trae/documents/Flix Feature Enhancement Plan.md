I'll proceed with just the **Embedded Trailer Player** and **PWA Support** as requested.

### 1. Embedded Trailer Player
-   **Create `TrailerModal` component**: A reusable modal component to play YouTube trailers without leaving the site.
-   **Update `Details` page**: Wire up the "Trailer" button to open this modal instead of a new tab.

### 2. PWA (Progressive Web App) Support
-   **Install Dependency**: Add `vite-plugin-pwa`.
-   **Configure Vite**: Set up the manifest (Name, Icons, Theme Color) to make the site installable on mobile and desktop.
-   **Offline Support**: Enable basic service worker caching for faster loads.

I will start by installing the necessary PWA plugin and then implement the code changes.
