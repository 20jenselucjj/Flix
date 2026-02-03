I will update `scraper.service.ts` to replace the broken/unreliable sources with currently working ones.

1.  **Prioritize VidSrc**: Move `VidSrc.to` and `VidSrc.me` to the top of the list as they are the most stable current providers.
2.  **Fix AutoEmbed URL**: Update the AutoEmbed URL from `autoembed.co` (which is likely blocked or incorrect) to the correct player domain `player.autoembed.cc`.
3.  **Downgrade Embed.su**: Move `Embed.su` to the bottom of the list or remove it, as it is the primary source of the "connection reset" errors you are seeing.
4.  **Verify & Fix Syntax**: Ensure all URL patterns (especially for TV shows) match the latest API documentation for 2025.

**New Source Order:**
1.  VidSrc.to (Most reliable)
2.  VidSrc.me (Good backup)
3.  AutoEmbed (Fixed URL)
4.  MultiEmbed (Good for movies)
5.  Embed.su (Moved to bottom/backup)
