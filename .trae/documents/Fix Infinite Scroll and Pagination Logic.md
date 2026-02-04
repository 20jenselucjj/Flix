I have updated the plan to address the user's specific request for "All Movies", "All TV Shows", and "Genre" pages.

### **1. Backend Fixes (Enable Pagination)**
The backend currently ignores the `page` parameter for several endpoints, causing them to always return the first page.

*   **`server/services/tmdb.service.ts`**:
    *   Update `getTrending`, `getPopularMovies`, `getPopularTV`, and `getShortsContent` to accept a `page` parameter.
    *   Pass this `page` parameter to the respective TMDB API calls.
*   **`server/controllers/media.controller.ts`**:
    *   Update `getTrending`, `getPopular`, and `getShorts` methods to extract the `page` query parameter and pass it to the service layer.

### **2. Frontend Fixes (Implement Infinite Scroll)**
The "Genre" pages currently lack the infinite scroll implementation entirely.

*   **`src/pages/Genre.tsx`**:
    *   Add `page`, `hasMore`, and `isFetching` states.
    *   Implement the `IntersectionObserver` pattern (similar to `Category.tsx`) to detect when the user scrolls to the bottom.
    *   Update the data fetching logic to append new results to the existing list instead of replacing them.

### **Summary of Fixes by Page**
*   **Home / Shorts**: Backend fix will enable loading new content.
*   **All Movies / All TV Shows (`Category.tsx`)**: Backend fix will enable loading subsequent pages (frontend already has logic).
*   **Genre Pages (`Genre.tsx`)**: Frontend fix will add the missing infinite scroll logic.
