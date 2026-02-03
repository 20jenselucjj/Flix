import React from 'react';
import { motion } from 'framer-motion';
import { MediaCard } from '../components/MediaCard';
import { useMyList } from '../hooks/useMyList';
import { useWatchHistory } from '../hooks/useWatchHistory';
import { MediaRow } from '../components/MediaRow';

export const MyList: React.FC = () => {
  const { list, fetchList, removeFromList } = useMyList();
  const { history } = useWatchHistory();

  React.useEffect(() => {
    fetchList();
  }, []);

  // Merge list with history to show progress
  const listWithProgress = React.useMemo(() => {
    return list.map(item => {
      const historyItem = history.find(h => h.id === item.id);
      if (historyItem) {
        return {
          ...item,
          progress: historyItem.progress,
          season: historyItem.season,
          episode: historyItem.episode
        };
      }
      return item;
    });
  }, [list, history]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {history.length > 0 && (
          <div className="mb-12 -mx-4 md:-mx-12">
            <MediaRow title="Recently Watched" items={history} />
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white">My List</h1>
        
        {listWithProgress.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {listWithProgress.map((item) => (
              <MediaCard key={item.id} media={item} onRemove={removeFromList} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">📺</div>
            <h3 className="text-2xl font-bold text-white mb-2">Your list is empty</h3>
            <p className="text-text-secondary max-w-md">
              Add movies and TV shows to your list so you can easily find them later.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
