I will implement genre-based navigation and improve the movie/TV show covers to display ratings.

### 1. Backend Implementation
*   **Update `api/services/tmdb.service.ts`**:
    *   Add `getGenres(type)` to fetch genre lists from TMDB.
    *   Add `discoverByGenre(type, genreId, page)` to fetch media by genre.
    *   Update `getDetails(type, id)` to include `release_dates` (movies) and `content_ratings` (TV) to extract age certifications (e.g., "PG-13", "TV-MA").
*   **Update `api/controllers/media.controller.ts`**:
    *   Add `getGenres` and `discover` methods.
*   **Update `api/routes/media.routes.ts`**:
    *   Add endpoints: `GET /genres/:type` and `GET /discover/:type`.

### 2. Frontend Logic & Types
*   **Update `src/types.ts`**:
    *   Add `Genre` interface.
    *   Add `certification` field to `MediaDetails` interface.
*   **Update `src/lib/api.ts`**:
    *   Add `getGenres` and `discoverByGenre` functions.

### 3. Frontend UI - Ratings on Covers
*   **Update `src/components/MediaCard.tsx`**:
    *   Add a visible badge in the bottom-right corner of the poster image displaying the **Review Rating** (e.g., "★ 7.5").
    *   Update the hover/details card to display the **Age Rating** (e.g., "PG-13", "R") when available.
    *   *Note*: Age ratings are generally not available in list views (like Home/Search) from the data provider without making individual requests for every item, so they will primarily appear in the detailed view or hover state when data allows.

### 4. Frontend UI - Genre Navigation
*   **Create `src/pages/Genre.tsx`**:
    *   A new page component that fetches and displays movies/TV shows for a specific genre.
*   **Update `src/App.tsx`**:
    *   Add route: `/genre/:type/:genreId` pointing to the new `Genre` page.
*   **Update `src/components/Navbar.tsx`**:
    *   Add a "Categories" dropdown menu that lists genres for Movies and TV Shows, allowing users to easily browse by genre.
