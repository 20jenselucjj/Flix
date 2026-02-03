I have analyzed your codebase and prepared a comprehensive plan to transform the site into a premium, cinematic experience.

# Premium UI/UX Overhaul Plan

## 1. Visual Foundation & "Blow Away" Polish
We will move away from flat static designs to a dynamic, immersive interface.
- **Cinematic Lighting**: Implement subtle animated background gradients and "spotlight" effects behind the Hero section.
- **Glassmorphism**: Update the Navbar, Modals, and Overlay controls with premium backdrop-blur effects (`backdrop-filter`).
- **Smooth Animations**: Use `framer-motion` for page transitions, staggered list loading, and smooth interaction feedback.

## 2. Core Component Upgrades
### Hero Section 2.0
- **Cinematic Entry**: Title and description will fade up with a stagger effect.
- **Immersive Background**: Add a slow zoom/pan effect to the backdrop image.
- **Premium Buttons**: Glass-styled "More Info" and "Play" buttons with hover glow effects.

### Media Card 2.0 (Netflix-Style Interaction)
- **Smart Hover**: Cards will expand on hover (after a short delay) to reveal more info without clicking.
- **Quick Actions**: Add buttons directly on the card for "Play", "Add to List", and "Like".
- **Metadata**: Show "Match %", Age Rating, and Genres on the expanded card.

## 3. New Feature: "My List"
- **Functionality**: Allow users to save movies/shows to a personal watchlist.
- **Implementation**:
  - Create a `useMyList` hook (using `localStorage` for immediate persistence).
  - Add "Add to List" (+) button to the Hero and Media Cards.
  - Create a dedicated `/my-list` page to view saved content.

## 4. UX Enhancements
- **Skeleton Loading**: Replace generic loading spinners with shimmering "Skeleton" card placeholders for a perceived faster load time.
- **Search Experience**: Add "Trending Searches" or "Suggested" pills when the search bar is empty.
- **Player UI**: Polish the video player with custom-styled range sliders (progress bar) and volume controls to match the new theme.

## Implementation Steps
1.  **Setup**: Configure global styles, gradients, and animation variants.
2.  **Components**: Build `SkeletonCard`, enhance `Hero` and `MediaCard`.
3.  **Feature**: Implement `MyList` logic and page.
4.  **Polish**: Apply glassmorphism to `Navbar` and `Player` controls.
