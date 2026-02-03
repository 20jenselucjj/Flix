I will implement three "blow away" features to transform the single-user experience:

### 1. "Continue Watching" with Persistent History
Since there is no login, I will build a robust local history engine that tracks your playback progress exactly like Netflix.
- **New Hook**: `useWatchHistory` to manage state in `localStorage`.
- **Player Integration**: Automatically saves your spot every few seconds and resumes exactly where you left off.
- **Home Screen**: Adds a dedicated "Continue Watching" row at the very top of the Home page, so you can jump right back in.

### 2. Immersive "Ambient Mode" Player
I will upgrade the video player from a simple black box to a cinematic experience.
- **Dynamic Background**: The player will fetch the movie/show's high-res backdrop and apply a deep blur and subtle glow effect behind the video container.
- **Visual Depth**: This creates a "Phillips Ambilight" style effect that makes the screen feel larger and more premium.
- **Metadata Integration**: The player will now display the content title and episode info in the overlay (currently missing).

### 3. "Surprise Me" Discovery
To solve "choice paralysis," I will add a fun shuffle feature.
- **New Button**: A "Surprise Me" button in the Hero section.
- **Logic**: It will intelligently pick a highly-rated movie or show from the current trending list that you haven't watched yet and instantly start playing it.

**Implementation Steps:**
1.  Create `src/hooks/useWatchHistory.ts`.
2.  Update `src/pages/Player.tsx` to fetch metadata, handle resume logic, and add the Ambient background.
3.  Update `src/pages/Home.tsx` to display the "Continue Watching" row and handle the "Surprise Me" logic.
4.  Update `src/components/Hero.tsx` to include the new button.
