I will implement the **"Smart" Personalization** feature.

### 1. Backend Updates
*   **File:** `server/services/tmdb.service.ts`
    *   **Change:** Update `discoverByGenre` to accept `genreId` as `string | number` to support multiple genre IDs (e.g., "28|878").
*   **File:** `server/controllers/media.controller.ts`
    *   **Change:** Update `discover` method to pass `with_genres` query parameter directly to the service without enforcing `parseInt` on multiple values.

### 2. Frontend Logic
*   **File:** `src/lib/api.ts`
    *   **Change:** Add `getRecommendations(genres: string)` to the API client.
*   **File:** `src/hooks/useWatchHistory.ts`
    *   **Change:** Add `getTopGenres()` function to analyze the user's local watch history and identify their top 3 most-watched genres.
*   **File:** `src/hooks/useRecommendations.ts` (New File)
    *   **Change:** Create a hook that uses `getTopGenres` to fetch content from the backend.

### 3. Frontend UI
*   **File:** `src/pages/Home.tsx`
    *   **Change:** Add a new `MediaRow` component titled **"Recommended For You"**. This row will dynamically appear when the user has enough watch history to generate recommendations.

### 4. Verification
*   **Step:** Watch 3 Sci-Fi movies in the app.
*   **Step:** Return to Home and verify the "Recommended For You" row appears with Sci-Fi suggestions.
