import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import GameCard from '@/components/picks/GameCard';
import { format } from 'date-fns';

const DailyPicks = () => {
  const { data: games, isLoading, error } = useQuery({
    queryKey: ['/api/picks/today'],
  });

  const formatLastUpdated = () => {
    const now = new Date();
    return `Today, ${format(now, 'h:mm a')} EST`;
  };

  return (
    <section id="todayspicks" className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h2 className="text-3xl font-bold font-heading text-primary">Today's Top MLB Picks</h2>
          <p className="text-gray-600 mt-2 md:mt-0">Last Updated: <span className="font-semibold">{formatLastUpdated()}</span></p>
        </div>
        
        {/* Game Predictions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 animate-pulse">
                <div className="h-14 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-24 bg-gray-200 mb-4 rounded"></div>
                  <div className="h-24 bg-gray-200 mb-4 rounded"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-full text-center py-8">
              <p className="text-red-500">Unable to load today's picks. Please try again later.</p>
            </div>
          ) : games && games.length > 0 ? (
            // Game cards
            games.slice(0, 3).map((game) => (
              <GameCard key={game.id} game={game} />
            ))
          ) : (
            // Empty state
            <div className="col-span-full text-center py-8">
              <p>No picks available for today yet. Check back soon!</p>
            </div>
          )}
        </div>
        
        <div className="mt-10 text-center">
          <Link href="/picks">
            <Button className="bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-md">
              View All Today's Picks <i className="fas fa-arrow-right ml-2"></i>
            </Button>
          </Link>
          <p className="mt-2 text-sm text-gray-600">Premium subscribers have access to all picks and detailed analyses</p>
        </div>
      </div>
    </section>
  );
};

export default DailyPicks;
