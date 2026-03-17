import React from 'react';
import { motion } from 'framer-motion';
import { BookmarkPlus } from 'lucide-react';
import { MediaCard } from '../components/MediaCard';
import { useMyList } from '../hooks/useMyList';
import { useWatchHistory } from '../hooks/useWatchHistory';
import { MediaRow } from '../components/MediaRow';
import { EmptyState } from '../components/EmptyState';
import { Link } from 'react-router-dom';

export const MyList: React.FC = () => {
  const { list, fetchList, removeFromList } = useMyList();
  const { history } = useWatchHistory();

  React.useEffect(() => {
    fetchList();
  }, [fetchList]);

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
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-12">
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
          <EmptyState
            icon={BookmarkPlus}
            title="Your list is empty"
            description="Add movies and TV shows to your list so you can easily find them later."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/movies" className="inline-block rounded-full bg-white px-6 py-3 font-bold text-black transition-colors hover:bg-gray-200">
                  Browse Movies
                </Link>
                <Link to="/tv" className="inline-block rounded-full border border-white/15 bg-white/5 px-6 py-3 font-bold text-white transition-colors hover:bg-white/10">
                  Browse TV Shows
                </Link>
              </div>
            }
          />
        )}
      </motion.div>
    </div>
  );
};
