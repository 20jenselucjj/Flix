I will upgrade the Shorts algorithm to be more personalized, reactive, and "addictive" by implementing a weighted interest system and a mixed-content feed strategy.

### 1. Enhanced Interest Tracking (`useWatchHistory.ts`)

The current simple genre count is too basic. I will implement a **weighted scoring system**:

* **Track Interactions**: Record specific actions: `like`, `dislike`, `full_watch` (video ended), and `skip` (scrolled away quickly).

* **Weighted Scoring**:

  * **Like**: +10 points

  * **Full Watch**: +5 points

  * **Partial Watch**: +1 point

  * **Skip (< 5s)**: -5 points

* **Decay Factor**: Recent interactions will have more weight than older ones.

* **`getWeightedGenres()`**: A new function to return genres sorted by this sophisticated score.

### 2. Smart Feed Algorithm (`useShortsFeed.ts`)

I will create a new custom hook to manage the feed logic, replacing the simple fetch in `Shorts.tsx`:

* **Mixed Source Fetching**: Instead of just one API call, we will fetch from three buckets:

  * **Core Interests** (60%): Shorts matching the user's top weighted genres.

  * **Related Discovery** (20%): Shorts from genres *related* to their top ones (e.g., Action -> Adventure).

  * **Trending/Viral** (20%): Popular content to break "filter bubbles" and introduce new topics.

* **Client-Side Interleaving**: The hook will merge these streams into a single, seamless queue, ensuring variety (e.g., never 5 of the same genre in a row).

* **Duplicate Filtering**: Robust filtering to ensure the same video doesn't appear twice.

### 3. Interactive UI & Feedback Loop (`Shorts.tsx`)

* **Interaction Capture**:

  * Detect when a user swipes away. If they watched < 3 seconds, count as a "Skip".

  * Detect when a video finishes. Count as "Full Watch".

* **Double-Tap to Like**: Implement the industry-standard gesture with a "Heart" animation overlay to make interaction effortless.

* **Optimistic Updates**: The algorithm will adjust immediately. If you skip 3 "Horror" clips in a row, the next batch fetched will deprioritize Horror for this session.

This approach mimics the architecture of modern social media algorithms (TikTok/Reels) by balancing **exploitation** (showing what you like) with **exploration** (showing new things) and reacting in real-time.
