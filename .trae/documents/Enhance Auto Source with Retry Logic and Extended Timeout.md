I will enhance the "Auto Source" functionality in `src/pages/Player.tsx` to be more robust and handle delayed source availability.

**Proposed Changes:**

1.  **Improve `checkSourceHealth`:**
    *   **Increase Timeout:** Increase the request timeout from 2 seconds to 5 seconds to accommodate slower servers.
    *   **Add Retry Logic:** Implement a retry mechanism that attempts to check the source up to 3 times with a 1.5-second delay between attempts. This directly addresses the issue where sources "don't load up immediately."

2.  **Enhance `findBestSource`:**
    *   **Check More Sources:** Increase the number of sources checked in parallel from 3 to 6 (or up to 50% of available sources) to increase the chances of finding a working one.
    *   **Smart Fallback:** If the health checks fail, the system currently falls back to the first source. I'll ensure this behavior is preserved but backed by more robust checks.

**Verification Plan:**
*   I will verify the changes by creating a test case or manually checking if the `checkSourceHealth` function correctly retries and waits. (Since I cannot run the GUI, I will rely on code correctness and unit-test-like verification if needed).
