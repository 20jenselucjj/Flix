I will implement a "Smart Auto-Select" feature in the Player that actively checks source availability and defaults to the best working one.

### **Plan: Implement Auto-Source Finder**

1.  **Modify `src/pages/Player.tsx`**:
    *   **Add "Auto" State**: Introduce `isAutoMode` (default `true`) and `autoSourceIndex`.
    *   **Implement "Health Check"**: Create a `findBestSource` function that attempts to reach the source URLs (using `fetch` with `mode: 'no-cors'` to detect network/DNS errors) to filter out dead servers.
    *   **Update Selection Logic**:
        *   On load, trigger the "Health Check".
        *   Automatically select the first source that passes the check.
        *   If the checked source fails to play (user feedback), provide a "Next Source" button.
    *   **Enhance UI**:
        *   Add an **"Auto (Recommended)"** option to the top of the Source Selector menu.
        *   Show a "Finding best source..." indicator briefly if needed.
        *   Allow the user to manually select a specific source, which disables "Auto" mode.

### **Why this works**:
*   **Auto Find**: It filters out dead domains/servers automatically.
*   **Works Best**: It prioritizes the high-quality sources (defined in `scraper.service.ts`) but skips broken ones.
*   **Manual Override**: The user can always open the menu and pick a specific source if "Auto" fails.
