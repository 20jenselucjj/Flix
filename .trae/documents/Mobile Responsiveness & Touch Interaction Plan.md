I will implement mobile responsiveness and touch interactions by distinguishing between mobile and desktop behaviors.

### **1. Create Mobile Detection Hook**
*   **File:** `src/hooks/useIsMobile.ts`
*   **Action:** Create a new hook that uses `window.matchMedia` to track if the device viewport is mobile-sized (< 768px). This allows us to conditionally render logic based on the device type.

### **2. Update Media Card (Touch & Animation)**
*   **File:** `src/components/MediaCard.tsx`
*   **Touch Handling:** Disable the complex "Hover to Expand" portal on mobile devices. This prevents the "stuck hover" issue common on touchscreens.
*   **Adaptive Animation:**
    *   **Desktop:** Keep the existing "Expand on Hover" animation.
    *   **Mobile:** Introduce a new `whileTap={{ scale: 0.98 }}` animation. This gives users immediate tactile feedback when they touch a movie poster, confirming the interaction before navigating.
*   **Implementation:** Wrap the card in a `motion.div` and conditionally apply `onMouseEnter` handlers only when `!isMobile`.

### **3. Update Media Row (Swipe Interaction)**
*   **File:** `src/components/MediaRow.tsx`
*   **Action:** Hide the "Left/Right" scroll arrows on mobile screens using `hidden md:flex`.
*   **Reasoning:** Mobile users expect to swipe to scroll. Removing the buttons prevents them from obscuring content or being accidentally tapped, while keeping the interface clean.

### **Verification**
*   I will verify that cards scale down slightly when tapped on mobile (simulated).
*   I will verify that the expansion popup still works correctly on desktop.
*   I will verify that scroll arrows are hidden on small screens.