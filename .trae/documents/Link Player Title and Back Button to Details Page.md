I will modify the **Player** component (`src/pages/Player.tsx`) to implement the requested navigation changes.

**1. Update Back Button Logic**
- Change the `handleBack` function to navigate to the media details page (`/${type}/${id}`) instead of the home page (`/`).
- Add a fallback to the home page if `type` or `id` parameters are missing.

**2. Make Title Clickable**
- Update the title display in the player controls.
- Add an `onClick` handler to the title `div` that navigates to the details page (`/${type}/${id}`).
- Add styling classes (`cursor-pointer`, `hover:text-primary`, `transition-colors`) to indicate the title is interactive.

**Files to Modify:**
- `src/pages/Player.tsx`: Implement the navigation logic for both the back button and the title.
