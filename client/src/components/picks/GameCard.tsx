import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { Game, Prediction } from '@shared/schema';

interface GameCardProps {
  game: Game & { prediction?: Prediction };
  showFullAnalysis?: boolean;
}

const GameCard = ({ game, showFullAnalysis = false }: GameCardProps) => {
  const formatGameTime = (time: Date) => {
    return format(new Date(time), 'h:mm a');
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 85) return { text: 'High Confidence', bg: 'bg-accent' };
    if (confidence >= 70) return { text: 'Medium Confidence', bg: 'bg-yellow-500' };
    return { text: 'Lower Confidence', bg: 'bg-orange-500' };
  };

  const confidenceInfo = game.prediction ? getConfidenceLabel(game.prediction.confidenceLevel * 100) : { text: 'Pending', bg: 'bg-gray-500' };

  return (
    <Card className="stat-card bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="bg-primary text-white p-3 flex justify-between items-center">
        <span className="font-heading font-bold">
          {game.startTime ? formatGameTime(game.startTime) : 'TBD'} EST
        </span>
        <span className={`${confidenceInfo.bg} text-white px-2 py-1 rounded text-sm font-bold`}>
          {game.prediction ? `${Math.round(game.prediction.confidenceLevel * 100)}% Confidence` : confidenceInfo.text}
        </span>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mr-3">
              <span className="font-bold text-primary text-xl">{game.awayTeamAbbreviation}</span>
            </div>
            <div>
              <p className="font-heading font-bold text-lg">{game.awayTeam}</p>
              <p className="text-sm text-gray-600">{game.awayTeamRecord || '-'}</p>
            </div>
          </div>
          <div className="text-2xl font-heading font-bold text-gray-400">
            {game.awayTeamMoneyline && (game.awayTeamMoneyline > 0 ? `+${game.awayTeamMoneyline}` : game.awayTeamMoneyline)}
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mr-3">
              <span className="font-bold text-primary text-xl">{game.homeTeamAbbreviation}</span>
            </div>
            <div>
              <p className="font-heading font-bold text-lg">{game.homeTeam}</p>
              <p className="text-sm text-gray-600">{game.homeTeamRecord || '-'}</p>
            </div>
          </div>
          <div className="text-2xl font-heading font-bold">
            {game.homeTeamMoneyline && (game.homeTeamMoneyline > 0 ? `+${game.homeTeamMoneyline}` : game.homeTeamMoneyline)}
          </div>
        </div>
        
        {game.prediction && (
          <div className="border-t border-gray-200 pt-4 mt-2">
            <h4 className="font-heading font-bold mb-2">Our Analysis:</h4>
            <p className="text-sm text-gray-700 mb-3">
              {showFullAnalysis 
                ? game.prediction.analysis 
                : `${game.prediction.analysis.substring(0, 120)}...`}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-primary">
                Recommended: <span className="text-accent">{game.prediction.recommendedBet}</span>
              </span>
              {!showFullAnalysis && (
                <Button size="sm" className="text-white bg-primary hover:bg-opacity-90 px-3 py-1 rounded text-sm font-medium">
                  Full Analysis
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GameCard;
