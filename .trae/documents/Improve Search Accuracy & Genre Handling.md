I have analyzed the codebase and identified that the search inaccuracy for genres stems from the backend simply passing the query to TMDB's text search endpoint (`/search/multi`), which looks for title matches rather than filtering by genre.

To improve the overall search feature and fix the genre accuracy, I propose the following changes:

### **1. Enhance Backend Logic (`tmdb.service.ts`)**
I will update the TMDB service to intelligently handle genre data:
-   **Add Genre Caching**: Implement in-memory caching for genre lists to prevent redundant API calls on every search.
-   **Add `findGenreByName` Helper**: Create a method that:
    -   Fetches both Movie and TV genres.
    -   Normalizes the user's query (case-insensitive, trimmed).
    -   Matches the query against known genre names.
    -   Supports aliases (e.g., mapping "Sci-Fi" to "Science Fiction").

### **2. Upgrade Search Controller (`media.controller.ts`)**
I will modify the `search` controller to intercept queries before sending them to TMDB:
-   **Check for Genre Match**: Before performing a text search, check if the query corresponds to a genre using the new helper.
-   **Conditional Logic**:
    -   **If Genre Match Found**:
        -   Call the `discover` API for both Movies and TV Shows using the matched Genre ID.
        -   Inject the correct `media_type` ('movie' or 'tv') into the results (required by the frontend).
        -   Merge the results and return them.
    -   **If No Genre Match**:
        -   Proceed with the existing text-based search (`/search/multi`).

### **3. Expected Outcome**
-   Searching for **"Action"** will now return popular Action movies and TV shows instead of movies with "Action" in the title.
-   Searching for **"Avatar"** will still function as a normal text search.
-   The frontend will receive the same data structure, so no frontend changes are required.

This approach solves the user's specific complaint while improving the overall robustness of the search feature.