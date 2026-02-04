I will improve the media finding experience on both the **Genre** pages and the **All Movies/TV Shows** pages by adding **Sorting** capabilities.

### Backend Changes
1.  **Update `server/services/tmdb.service.ts`**:
    *   Generalize `discoverByGenre` to a `discover` method that accepts:
        *   `type` (movie/tv)
        *   `page`
        *   `sortBy` (default: `popularity.desc`)
        *   `genreId` (optional)
    *   This will allow fetching "all movies" sorted by different criteria, not just popularity.
2.  **Update `server/controllers/media.controller.ts`**:
    *   Update the `discover` handler to pass `sort_by` and optional `with_genres` to the service.

### Frontend Changes
1.  **Update `src/lib/api.ts`**:
    *   Add a generic `discover` method that supports `sortBy` and optional `genreId`.
2.  **Create `FilterBar` Component**:
    *   Create a reusable component `src/components/FilterBar.tsx` containing a **Sort By** dropdown.
    *   Options: "Most Popular", "Top Rated", "Newest".
3.  **Update `src/pages/Genre.tsx`**:
    *   Add the `FilterBar`.
    *   Update data fetching to use the selected sort order.
4.  **Update `src/pages/Category.tsx` (All Movies/TV)**:
    *   Add the `FilterBar`.
    *   Switch from the hardcoded "Popular" API call to the flexible `discover` API call.
    *   This enables sorting for the main Movie/TV lists as well.

### Verification
*   I will test sorting on a Genre page (e.g., Action Movies -> Newest).
*   I will test sorting on the main Movies page (e.g., All Movies -> Top Rated).
