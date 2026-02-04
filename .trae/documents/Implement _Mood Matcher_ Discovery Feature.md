I will implement the **"Flix Shorts"** feature as requested.

### 1. Backend Updates

* **File:** `server/services/tmdb.service.ts`
  * **Change:** Create `getShortsContent()`:
    * Fetch trending movies/TV shows.
    * For the top results, fetch their video data in parallel.
    * Filter to find the best "Trailer" (YouTube) for each item.
    * Return a simplified list: `{ id, title, videoId, overview, poster_path }`.

* **File:** `server/controllers/media.controller.ts`
  * **Change:** Add `/api/shorts` endpoint to serve this feed.

### 2. Frontend Logic

* **File:** `src/lib/api.ts`
  * **Change:** Add `getShorts()` method to the API client.

### 3. Frontend UI

* **File:** `src/pages/Shorts.tsx` (New Page)
  * **Change:** Create a TikTok/Reels-style container:
    * **Scroll Snap**: `snap-y snap-mandatory` for full-screen scrolling.
    * **Video Player**: A component that plays the YouTube trailer. It will handle:
      * Auto-play when the card comes into view (using Intersection Observer).
      * Muting/Unmuting.
      * "Letterbox" style presentation (16:9 video on vertical screen) with a blurred ambient background.
    * **Overlay Controls**:
      * **Right Side**: "Add to List" (Plus icon), "Share", "Like".
      * **Bottom**: Title, Genre, "Watch Full Movie" button.

* **File:** `src/components/Navbar.tsx`
  * **Change:** Add a "Shorts" icon (e.g., `Film` or `Clapperboard` icon) to the main navigation bar.

### 4. Verification

* **Step:** Click the new "Shorts" tab in the navbar.
* **Step:** Verify the first trailer starts playing automatically.
* **Step:** Swipe up to the next video and verify the previous one stops and the new one starts.
* **Step:** Click "Watch Full Movie" and ensure it navigates to the Player.
