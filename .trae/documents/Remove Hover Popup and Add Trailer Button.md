I will modify the application to remove the hover popup on movie cards and add a trailer button to the details page.

**Plan:**

1.  **Simplify `src/components/MediaCard.tsx`**:
    - Remove the hover detection logic (`isHovered`, `handleMouseEnter`, `handleMouseLeave`).
    - Remove the "My List" functionality from the card itself (`useMyList`, `toggleList`), as users will navigate to the details page first.
    - Remove the `createPortal` code that renders the hover popup.
    - Clean up unused imports (`createPortal`, `AnimatePresence`, `Play`, `Plus`, `Check`, `Info`).
    - Ensure the card remains a clickable link to the details page.

2.  **Enhance `src/pages/Details.tsx`**:
    - Import the `Youtube` icon from `lucide-react`.
    - Logic to find the trailer video from `media.videos.results` (looking for `type === 'Trailer'` and `site === 'YouTube'`).
    - Add a "Trailer" button next to the "Watch Now" and "Share" buttons.
    - The "Trailer" button will open the YouTube video in a new tab.

This will streamline the user interface as requested, forcing navigation to the details page for actions and providing direct access to the trailer.