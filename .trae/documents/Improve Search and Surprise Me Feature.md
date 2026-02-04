I will improve the search functionality to intelligently handle person queries and enhance the "Surprise Me" feature to avoid repetitions.

### Backend Changes

1.  **Enhance TMDB Service (`server/services/tmdb.service.ts`)**
    *   Add a new method `getPersonCredits(personId)` that fetches the combined credits (movies and TV shows) for a specific person from TMDB.
    *   This will allow us to retrieve the filmography of an actor or director.

2.  **Upgrade Search Logic (`server/controllers/media.controller.ts`)**
    *   Modify the `search` controller.
    *   After receiving initial search results, check if the top result is a person.
    *   If it is a person, instead of returning the person object (which the frontend filters out or displays poorly), fetch their `combined_credits` using the new service method.
    *   Sort these credits by popularity to show their most famous works first.
    *   Enrich the results with certification data (e.g., PG-13, TV-MA).
    *   Return this list of movies and shows as the search result.

### Frontend Changes

1.  **Improve "Surprise Me" Logic (`src/pages/Home.tsx`)**
    *   Implement a local storage mechanism to track movies and shows that have already been suggested via the "Surprise Me" button.
    *   **Regarding your question:** Yes, `localStorage` works perfectly with Vercel deployments. It runs in the user's browser, so it will persist their history on that specific device/browser regardless of where the app is hosted.
    *   Update `handleSurprise` to filter out items that are either in the user's watch history OR in this new "surprised history" list.
    *   Add logic to reset the "surprised history" if the pool of available content runs out, ensuring the feature never breaks even after many uses.

This approach directly addresses your request to show a person's work instead of the person themselves and ensures the shuffle feature remains fresh.