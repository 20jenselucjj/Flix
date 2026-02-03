I will improve the recommendation logic and add a navigation back button to the Details page.

### 1. Update Types
**File:** `src/types.ts`
- Add `genre_ids` to the `Media` interface.
- Add `recommendations` to the `MediaDetails` interface.

### 2. Enhance Data Fetching
**File:** `api/services/tmdb.service.ts`
- Update `getDetails` to include `recommendations` in the `append_to_response` parameter.

### 3. Implement Smart Filtering & Back Button
**File:** `src/pages/Details.tsx`
- **Back Button:**
    - Import `ArrowLeft` from `lucide-react` and `useNavigate` from `react-router-dom`.
    - Add a styled "Back" button absolutely positioned at the top-left of the hero section (zIndex high) that triggers `navigate(-1)`.
- **Recommendation Logic:**
    - Create a derived list of recommendations that combines `recommendations` and `similar` results.
    - Filter this list to strictly enforce that recommended items share at least one genre with the current title.
    - Update the "You May Also Like" section to render this filtered list.
