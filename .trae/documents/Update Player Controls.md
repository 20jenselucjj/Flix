I will modify `src/pages/Player.tsx` to update the video player controls as requested.

The changes will be:
1.  **Remove the HD Quality button**: Delete the button element that displays the current quality and toggles the settings menu.
2.  **Remove the Subtitle button**: Delete the button element that toggles subtitles.
3.  **Add the Fullscreen button to the top bar**: Insert a new button for fullscreen mode immediately before the Settings (Gear) button. This will replace the removed subtitle button.
    - The new button will use the same styling as the other top-bar buttons (rounded, semi-transparent background) to maintain consistency.
    - It will be visible on both mobile and desktop views.
4.  **Preserve the Settings (Gear) button**: Keep it as the last item in the sequence.

The resulting order in the top-right corner will be: **Fullscreen Button** → **Settings Button**.

I will apply these changes to the `Player` component in `src/pages/Player.tsx`.