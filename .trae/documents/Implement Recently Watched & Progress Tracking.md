I will implement the "Recently Watched" feature with progress tracking across the Home and My List pages.

### **1. Visual Progress Tracking (Remember where I left off)**
I will update the `MediaCard` component to display a progress bar for items that have been partially watched.
*   **File**: `src/components/MediaCard.tsx`
*   **Change**: Update the component to check for a `progress` property on the media object. If present (and > 0%), it will render a red progress bar at the bottom of the card, similar to streaming platforms like Netflix.

### **2. My List Integration**
I will update the "My List" page to include a "Recently Watched" section at the top.
*   **File**: `src/pages/MyList.tsx`
*   **Change**:
    *   Import `useWatchHistory`.
    *   Add a `MediaRow` component titled "Recently Watched" at the top of the page, displaying the user's watch history.
    *   This ensures the user's history is accessible from their personal list page as requested.

### **3. Home Page Verification**
*   **File**: `src/pages/Home.tsx`
*   **Status**: The Home page already includes a "Continue Watching" section that uses the watch history. By updating `MediaCard` in step 1, this existing section will automatically gain the progress bar visualization, fulfilling the requirement to "show on the home page" with "remember where I left off" context.
