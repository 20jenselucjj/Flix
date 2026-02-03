I will add functionality to display seasons and episodes for TV shows, allowing you to select and play specific episodes.

### Backend Updates
1.  **`api/services/tmdb.service.ts`**: Add `getSeasonDetails` to fetch specific season data (including episodes) from TMDB.
2.  **`api/controllers/media.controller.ts`**: Add a controller method to handle season detail requests.
3.  **`api/routes/media.routes.ts`**: Add a new API endpoint: `GET /media/tv/:id/season/:seasonNumber`.

### Frontend Updates
1.  **`src/types.ts`**: 
    *   Define `Season` and `Episode` interfaces.
    *   Update `MediaDetails` to include the list of available `seasons`.
2.  **`src/lib/api.ts`**: Add the `getSeasonDetails` method to the frontend API client.
3.  **`src/pages/Details.tsx`**:
    *   Add a **Season Selector** dropdown for TV shows.
    *   Implement fetching and displaying the **Episode List** for the selected season.
    *   Each episode item will show its title, overview, and a "Play" button.
    *   Update the "Play" functionality to support deep-linking to specific episodes (e.g., `/watch/tv/123?season=1&episode=5`).

### User Experience
*   When viewing a TV Show, you will see a list of seasons.
*   Selecting a season will load its episodes.
*   You can click "Play" on any episode to start watching that specific one.
