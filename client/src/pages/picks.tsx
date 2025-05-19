import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import GameCard from '@/components/picks/GameCard';
import type { Game, Prediction } from '@shared/schema';

const Picks = () => {
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: games, isLoading, error } = useQuery<(Game & { prediction?: Prediction })[]>({
    queryKey: [`/api/picks?date=${dateFilter}`],
  });

  // Filter games based on confidence level
  const filteredGames = games?.filter(game => {
    if (confidenceFilter === 'all') return true;
    if (!game.prediction) return false;
    
    const confidence = game.prediction.confidenceLevel * 100;
    if (confidenceFilter === 'high') return confidence >= 80;
    if (confidenceFilter === 'medium') return confidence >= 65 && confidence < 80;
    if (confidenceFilter === 'low') return confidence < 65;
    
    return true;
  });

  // Generate an array of dates for the date selector: today + 6 days
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: i === 0 ? 'Today' : format(date, 'EEE, MMM d')
    };
  });

  return (
    <>
      <Helmet>
        <title>Today's Picks | MLB Edge</title>
        <meta name="description" content="View today's MLB game predictions with confidence ratings and detailed analysis to make smarter wagers." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold font-heading text-primary mb-6">MLB Game Predictions</h1>
        
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Date" />
            </SelectTrigger>
            <SelectContent>
              {dateOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Tabs defaultValue="all" className="w-full sm:w-auto" value={confidenceFilter} onValueChange={setConfidenceFilter}>
            <TabsList className="grid grid-cols-4 w-full sm:w-[400px]">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="high">High Confidence</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="low">Low</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 animate-pulse">
                <div className="h-14 bg-gray-200"></div>
                <CardContent className="p-4">
                  <div className="h-24 bg-gray-200 mb-4 rounded"></div>
                  <div className="h-24 bg-gray-200 mb-4 rounded"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Unable to load predictions. Please try again later.</p>
          </div>
        ) : filteredGames?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <Card className="bg-white p-8 text-center">
            <p className="mb-2">No predictions available for the selected filters.</p>
            <p className="text-sm text-gray-500">Try changing your filter criteria or check back later.</p>
          </Card>
        )}
        
        <div className="mt-8 bg-neutral p-4 rounded-lg">
          <h2 className="text-xl font-bold font-heading text-primary mb-2">About Our Predictions</h2>
          <p className="text-gray-700">
            Our MLB predictions are generated using a proprietary algorithm that analyzes thousands of data points, 
            including player statistics, team performance, weather conditions, and historical matchup data. 
            Confidence ratings indicate our algorithm's certainty level in the predicted outcome.
          </p>
        </div>
      </div>
    </>
  );
};

export default Picks;
