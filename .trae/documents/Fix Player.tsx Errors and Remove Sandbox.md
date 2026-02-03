I will fix the errors in `src/pages/Player.tsx` by addressing the missing references and updating the iframe configuration as requested.

### **Changes Plan**

1.  **Fix `ReferenceError: season is not defined`**:
    *   Update the `useEffect` dependency array (currently only `[type, id]`) to include `season`, `episode`, and `isAutoMode`. This ensures the effect re-runs when these values change and captures the correct variables from the component scope.

2.  **Fix `ReferenceError: findBestSource is not defined`**:
    *   Move the helper functions `checkSourceHealth` and `findBestSource` **outside** of the `Player` component. This prevents them from being re-created on every render and ensures they are always available to the component, resolving the reference and stability issues.

3.  **Remove Iframe Sandbox**:
    *   Remove the `sandbox` attribute from the `<iframe>` tag completely. This grants the iframe full permissions (same as a standard iframe), as requested by the user to fix playback issues.

### **File to Modify**
*   `src/pages/Player.tsx`

### **Verification**
*   I will verifying the changes by checking if the code compiles without linter errors (using `GetDiagnostics` if needed, though manual review of the simple changes should suffice).
*   The fixes directly address the stack trace errors reported.
