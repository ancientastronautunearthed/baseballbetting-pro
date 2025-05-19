import { Game, InsertPrediction } from "@shared/schema";

/**
 * Generates predictions for MLB games based on various factors
 * In a real implementation, this would use a complex algorithm and machine learning model
 */
export async function generatePredictions(games: Game[]): Promise<InsertPrediction[]> {
  const predictions: InsertPrediction[] = [];
  
  for (const game of games) {
    // Calculate win probabilities based on home field advantage, team records, and moneylines
    // This is a simplified model for demonstration
    
    // Parse records to get win percentages
    let homeWinPct = 0.5;
    let awayWinPct = 0.5;
    
    if (game.homeTeamRecord) {
      const [homeWins, homeLosses] = game.homeTeamRecord.split('-').map(n => parseInt(n));
      homeWinPct = homeWins / (homeWins + homeLosses);
    }
    
    if (game.awayTeamRecord) {
      const [awayWins, awayLosses] = game.awayTeamRecord.split('-').map(n => parseInt(n));
      awayWinPct = awayWins / (awayWins + awayLosses);
    }
    
    // Factor in home field advantage (about 5% advantage historically)
    homeWinPct += 0.05;
    
    // Factor in moneylines if available
    if (game.homeTeamMoneyline && game.awayTeamMoneyline) {
      // Convert moneylines to implied probabilities
      let homeImpliedProb = 0;
      let awayImpliedProb = 0;
      
      if (game.homeTeamMoneyline > 0) {
        homeImpliedProb = 100 / (game.homeTeamMoneyline + 100);
      } else {
        homeImpliedProb = Math.abs(game.homeTeamMoneyline) / (Math.abs(game.homeTeamMoneyline) + 100);
      }
      
      if (game.awayTeamMoneyline > 0) {
        awayImpliedProb = 100 / (game.awayTeamMoneyline + 100);
      } else {
        awayImpliedProb = Math.abs(game.awayTeamMoneyline) / (Math.abs(game.awayTeamMoneyline) + 100);
      }
      
      // Normalize the probabilities
      const totalProb = homeImpliedProb + awayImpliedProb;
      homeImpliedProb = homeImpliedProb / totalProb;
      awayImpliedProb = awayImpliedProb / totalProb;
      
      // Weight the implied probabilities with the record-based probabilities
      homeWinPct = (homeWinPct + homeImpliedProb * 2) / 3;
      awayWinPct = (awayWinPct + awayImpliedProb * 2) / 3;
      
      // Normalize again
      const totalWinPct = homeWinPct + awayWinPct;
      homeWinPct = homeWinPct / totalWinPct;
      awayWinPct = awayWinPct / totalWinPct;
    }
    
    // Calculate confidence level (higher difference = higher confidence)
    const confidenceDiff = Math.abs(homeWinPct - awayWinPct);
    const confidenceLevel = 0.5 + (confidenceDiff * 0.5); // Scale to 0.5-1.0 range
    
    // Determine recommended bet based on probabilities and moneylines
    let recommendedBet = '';
    let analysis = '';
    
    if (homeWinPct > awayWinPct && game.homeTeamMoneyline) {
      // Home team is favored
      if (game.homeTeamMoneyline > 0) {
        // Home team is underdog in odds but we predict they'll win
        recommendedBet = `${game.homeTeam} ML`;
        analysis = generateHomeTeamFavoredAnalysis(game, true);
      } else if (homeWinPct > 0.65) {
        // Home team is heavily favored by our model
        recommendedBet = `${game.homeTeam} ML`;
        analysis = generateHomeTeamFavoredAnalysis(game, false);
      } else {
        // Consider run line or other bets
        recommendedBet = `${game.homeTeam} ML`;
        analysis = generateHomeTeamFavoredAnalysis(game, false);
      }
    } else if (awayWinPct > homeWinPct && game.awayTeamMoneyline) {
      // Away team is favored
      if (game.awayTeamMoneyline > 0) {
        // Away team is underdog in odds but we predict they'll win
        recommendedBet = `${game.awayTeam} ML`;
        analysis = generateAwayTeamFavoredAnalysis(game, true);
      } else if (awayWinPct > 0.65) {
        // Away team is heavily favored by our model
        recommendedBet = `${game.awayTeam} ML`;
        analysis = generateAwayTeamFavoredAnalysis(game, false);
      } else {
        // Consider run line or other bets
        recommendedBet = `${game.awayTeam} ML`;
        analysis = generateAwayTeamFavoredAnalysis(game, false);
      }
    } else {
      // Close game, consider totals
      const totalRuns = 7.5 + (Math.random() > 0.5 ? 1 : 0);
      const overUnder = Math.random() > 0.5 ? 'Over' : 'Under';
      recommendedBet = `${overUnder} ${totalRuns}`;
      analysis = generateTotalRunsAnalysis(game, totalRuns, overUnder === 'Over');
    }
    
    // Determine tier based on confidence level
    let tier = 'basic';
    if (confidenceLevel >= 0.85) {
      tier = 'basic';
    } else if (confidenceLevel >= 0.7) {
      tier = 'pro';
    } else {
      tier = 'elite';
    }
    
    predictions.push({
      gameId: game.id,
      homeTeamWinProbability: homeWinPct,
      awayTeamWinProbability: awayWinPct,
      recommendedBet,
      confidenceLevel,
      analysis,
      tier
    });
  }
  
  return predictions;
}

/**
 * Generates analysis text for when home team is favored
 */
function generateHomeTeamFavoredAnalysis(game: Game, isValueBet: boolean): string {
  // Generate analysis based on common baseball factors
  const factors = [
    `${game.homeTeam} have a strong home record this season.`,
    `${game.homeTeam}'s starting pitcher has been dominant at home with a low ERA.`,
    `${game.homeTeam} have won 7 of their last 10 games at home.`,
    `${game.awayTeam} have struggled on the road this season.`,
    `${game.awayTeam} are facing a tough pitching matchup today.`,
    `Historical matchups favor ${game.homeTeam} in this ballpark.`,
    `Weather conditions today favor ${game.homeTeam}'s style of play.`,
    `${game.homeTeam} have a well-rested bullpen coming into this game.`,
    `${game.awayTeam} are on the last leg of a long road trip and showing signs of fatigue.`,
    `Key players for ${game.awayTeam} are underperforming in recent games.`
  ];
  
  // Select 3-4 random factors
  const factorCount = Math.floor(Math.random() * 2) + 3;
  const selectedFactors: string[] = [];
  const usedIndexes: number[] = [];
  
  for (let i = 0; i < factorCount; i++) {
    let index = Math.floor(Math.random() * factors.length);
    while (usedIndexes.includes(index)) {
      index = Math.floor(Math.random() * factors.length);
    }
    usedIndexes.push(index);
    selectedFactors.push(factors[index]);
  }
  
  // Combine factors into analysis
  let analysis = selectedFactors.join(' ');
  
  // Add value bet statement if applicable
  if (isValueBet) {
    analysis += ` The current moneyline of ${game.homeTeamMoneyline} for ${game.homeTeam} presents significant value as our model gives them a much higher win probability than the odds suggest.`;
  }
  
  return analysis;
}

/**
 * Generates analysis text for when away team is favored
 */
function generateAwayTeamFavoredAnalysis(game: Game, isValueBet: boolean): string {
  // Generate analysis based on common baseball factors
  const factors = [
    `${game.awayTeam} have been excellent on the road this season.`,
    `${game.awayTeam}'s starting pitcher has dominated ${game.homeTeam} in previous matchups.`,
    `${game.awayTeam} have a significant advantage in offensive production metrics.`,
    `${game.homeTeam} have struggled against left-handed pitching, which they face today.`,
    `Injuries to key players have weakened ${game.homeTeam}'s lineup.`,
    `${game.awayTeam} have won 8 of their last 10 games overall.`,
    `The pitching matchup strongly favors ${game.awayTeam}.`,
    `${game.awayTeam}'s bullpen has been more reliable in high-leverage situations recently.`,
    `${game.homeTeam} have been underperforming their expected win rate based on run differential.`,
    `Recent lineup changes for ${game.awayTeam} have improved their offensive output.`
  ];
  
  // Select 3-4 random factors
  const factorCount = Math.floor(Math.random() * 2) + 3;
  const selectedFactors: string[] = [];
  const usedIndexes: number[] = [];
  
  for (let i = 0; i < factorCount; i++) {
    let index = Math.floor(Math.random() * factors.length);
    while (usedIndexes.includes(index)) {
      index = Math.floor(Math.random() * factors.length);
    }
    usedIndexes.push(index);
    selectedFactors.push(factors[index]);
  }
  
  // Combine factors into analysis
  let analysis = selectedFactors.join(' ');
  
  // Add value bet statement if applicable
  if (isValueBet) {
    analysis += ` The current moneyline of ${game.awayTeamMoneyline} for ${game.awayTeam} represents strong value as our model gives them a much higher chance of winning than what the odds suggest.`;
  }
  
  return analysis;
}

/**
 * Generates analysis text for total runs (over/under) recommendations
 */
function generateTotalRunsAnalysis(game: Game, totalRuns: number, isOver: boolean): string {
  const factors = isOver ? [
    `Both teams rank in the top 10 in runs scored over the last 10 games.`,
    `The starting pitchers for both teams have elevated ERAs in recent outings.`,
    `The weather forecast indicates favorable hitting conditions with winds blowing out.`,
    `This ballpark has averaged 9.2 runs per game this season, well above league average.`,
    `Both teams have been hitting well against the opposing pitcher's throwing arm.`,
    `The total has gone OVER in 6 of the last 8 games for both teams.`,
    `Both teams have rested their top relievers, potentially leading to weaker bullpen performance.`,
    `Historical matchups between these teams have produced high-scoring games.`
  ] : [
    `Both starting pitchers have been in excellent form with sub-3.00 ERAs in their last three starts.`,
    `The weather conditions (wind blowing in) and evening game time favor pitchers.`,
    `Both teams have struggled offensively, ranking in the bottom third of the league in runs scored recently.`,
    `The total has gone UNDER in 7 of the last 10 matchups between these teams.`,
    `Both teams have their top relievers available after rest days.`,
    `This ballpark has played as pitcher-friendly this season with an average of just 7.3 total runs per game.`,
    `Both teams are missing key offensive players due to injuries.`,
    `The umpire assigned to this game has a reputation for a pitcher-friendly strike zone.`
  ];
  
  // Select 3-4 random factors
  const factorCount = Math.floor(Math.random() * 2) + 3;
  const selectedFactors: string[] = [];
  const usedIndexes: number[] = [];
  
  for (let i = 0; i < factorCount; i++) {
    let index = Math.floor(Math.random() * factors.length);
    while (usedIndexes.includes(index)) {
      index = Math.floor(Math.random() * factors.length);
    }
    usedIndexes.push(index);
    selectedFactors.push(factors[index]);
  }
  
  // Combine factors into analysis
  let analysis = selectedFactors.join(' ');
  
  // Add summary statement
  if (isOver) {
    analysis += ` These factors suggest a high-scoring game, making the OVER ${totalRuns} a strong play.`;
  } else {
    analysis += ` Based on these factors, we expect a lower-scoring contest, favoring the UNDER ${totalRuns}.`;
  }
  
  return analysis;
}
