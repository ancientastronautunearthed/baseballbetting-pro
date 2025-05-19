import { Game, InsertPrediction } from "@shared/schema"; // Using path alias, ensure tsconfig is set up
import { runPredictionPipeline } from './dataCollection/dataIntegration'; // This will be the advanced ML pipeline
import { initializeDataSystem } from './dataCollection/integrationManager'; // Manages data sources

// Initialize the data collection system when this module is loaded.
// This is a one-time setup for data source clients, etc.
initializeDataSystem().catch(err => console.error("🔴 Error initializing data system:", err));

/**
 * Generates predictions for MLB games.
 * Attempts to use the advanced "MLB Edge" research pipeline (runPredictionPipeline).
 * Falls back to a legacy rule-based system if the advanced pipeline fails or returns no predictions.
 * @param games An array of Game objects for which to generate predictions.
 * @returns A Promise resolving to an array of InsertPrediction objects.
 */
export async function generatePredictions(games: Game[]): Promise<InsertPrediction[]> {
  console.log(`⚪️ Generating predictions for ${games.length} games using MLB Edge research system...`);

  try {
    // Attempt to use the advanced prediction pipeline.
    // This function is expected to be developed according to the Manus.im ML design documents,
    // eventually calling models deployed on GCP (e.g., Vertex AI).
    const predictions = await runPredictionPipeline(games);

    if (predictions && predictions.length > 0) {
      console.log("🟢 Successfully generated predictions using MLB Edge research system.");
      return predictions;
    }

    // If the pipeline returned no predictions, fall back to the legacy method.
    console.warn("🟡 No predictions from MLB Edge pipeline, falling back to legacy method.");
    return generateLegacyPredictions(games);
  } catch (error) {
    console.error("🔴 Error in MLB Edge prediction pipeline:", error);
    console.warn("🟡 Using legacy prediction method due to error in MLB Edge pipeline.");
    return generateLegacyPredictions(games);
  }
}

/**
 * Legacy prediction method.
 * This is a simplified rule-based model, used as a fallback.
 * The logic here is for demonstration and should be less relied upon as the ML pipeline matures.
 * @param games An array of Game objects.
 * @returns A Promise resolving to an array of InsertPrediction objects.
 */
async function generateLegacyPredictions(games: Game[]): Promise<InsertPrediction[]> {
  const predictions: InsertPrediction[] = [];
  console.log(`⚙️ Generating ${games.length} predictions using LEGACY system...`);

  for (const game of games) {
    // Ensure game.id is present, as it's crucial for gameId in InsertPrediction.
    if (typeof game.id !== 'number') {
        console.error(`🔴 Legacy Prediction: Game ID is missing or invalid for game involving ${game.homeTeam}. Skipping.`);
        continue;
    }

    let homeWinPct = 0.5;
    let awayWinPct = 0.5;

    // Parse team records to get win percentages.
    // Assumes record format "W-L" (e.g., "10-5").
    try {
        if (game.homeTeamRecord && /^\d+-\d+$/.test(game.homeTeamRecord)) {
            const [homeWins, homeLosses] = game.homeTeamRecord.split('-').map(n => parseInt(n, 10));
            if (homeWins + homeLosses > 0) {
                homeWinPct = homeWins / (homeWins + homeLosses);
            }
        }

        if (game.awayTeamRecord && /^\d+-\d+$/.test(game.awayTeamRecord)) {
            const [awayWins, awayLosses] = game.awayTeamRecord.split('-').map(n => parseInt(n, 10));
            if (awayWins + awayLosses > 0) {
                awayWinPct = awayWins / (awayWins + awayLosses);
            }
        }
    } catch (e) {
        console.error(`🔴 Legacy Prediction: Error parsing team records for game ID ${game.id}:`, e);
        // Continue with default 0.5 win percentages or skip game
    }


    // Factor in home field advantage (approx. 5% historically).
    homeWinPct += 0.05;
    // Adjust away team to ensure probabilities sum closer to 1 before normalization.
    // This is a simplistic adjustment.
    awayWinPct -= 0.025; 
    homeWinPct = Math.max(0, Math.min(1, homeWinPct)); // Clamp between 0 and 1
    awayWinPct = Math.max(0, Math.min(1, awayWinPct)); // Clamp between 0 and 1


    // Factor in moneylines if available.
    if (game.homeTeamMoneyline != null && game.awayTeamMoneyline != null) {
      let homeImpliedProb = 0.5;
      let awayImpliedProb = 0.5;

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

      // Simple averaging with moneyline implied probabilities (weighted more towards moneylines).
      homeWinPct = (homeWinPct + homeImpliedProb * 2) / 3;
      awayWinPct = (awayWinPct + awayImpliedProb * 2) / 3;
    }

    // Normalize win percentages to sum to 1.
    const totalWinPct = homeWinPct + awayWinPct;
    if (totalWinPct > 0) {
        homeWinPct = homeWinPct / totalWinPct;
        awayWinPct = awayWinPct / totalWinPct;
    } else { // Avoid division by zero if both somehow ended up <= 0
        homeWinPct = 0.5;
        awayWinPct = 0.5;
    }


    // Calculate confidence level (higher difference = higher confidence).
    // Scale to a 0.5 - 1.0 range.
    const confidenceDiff = Math.abs(homeWinPct - awayWinPct);
    const confidenceLevel = Math.min(1.0, 0.5 + (confidenceDiff * 0.75)); // Adjusted scaling for a bit more variance

    let recommendedBet = '';
    let analysis = '';

    // Determine recommended bet (simplified logic).
    if (homeWinPct > awayWinPct && game.homeTeamMoneyline != null) {
      recommendedBet = `${game.homeTeamAbbreviation || game.homeTeam} ML`; // Use abbreviation if available
      analysis = generateHomeTeamFavoredAnalysis(game, homeWinPct > (game.homeTeamMoneyline > 0 ? (100 / (game.homeTeamMoneyline + 100)) : (Math.abs(game.homeTeamMoneyline) / (Math.abs(game.homeTeamMoneyline) + 100))) + 0.05); // Simple value check
    } else if (awayWinPct > homeWinPct && game.awayTeamMoneyline != null) {
      recommendedBet = `${game.awayTeamAbbreviation || game.awayTeam} ML`; // Use abbreviation if available
      analysis = generateAwayTeamFavoredAnalysis(game, awayWinPct > (game.awayTeamMoneyline > 0 ? (100 / (game.awayTeamMoneyline + 100)) : (Math.abs(game.awayTeamMoneyline) / (Math.abs(game.awayTeamMoneyline) + 100))) + 0.05); // Simple value check
    } else {
      // Fallback for very close games or missing moneylines for a primary bet.
      // This part of the legacy system is highly simplistic.
      const totalRuns = 7.5 + (Math.random() > 0.5 ? 1 : 0) + (Math.random() > 0.5 ? 0 : -1); // 6.5, 7.5, 8.5
      const overUnder = Math.random() > 0.5 ? 'Over' : 'Under';
      recommendedBet = `${overUnder} ${totalRuns.toFixed(1)}`;
      analysis = generateTotalRunsAnalysis(game, totalRuns, overUnder === 'Over');
    }

    // Determine tier based on confidence level.
    // Higher confidence predictions could be for higher tiers.
    // The 'predictions' schema table has a 'tier' column (default 'basic').
    // This logic assumes 'Elite' is the highest tier, 'Basic' the lowest.
    let tier = 'basic'; // Default tier
    if (confidenceLevel >= 0.85) { // Highest confidence
      tier = 'elite';
    } else if (confidenceLevel >= 0.70) { // Medium-high confidence
      tier = 'pro';
    } // else it remains 'basic' (lowest confidence in this legacy model)

    predictions.push({
      gameId: game.id, // This is critical
      homeTeamWinProbability: parseFloat(homeWinPct.toFixed(4)),
      awayTeamWinProbability: parseFloat(awayWinPct.toFixed(4)),
      recommendedBet,
      confidenceLevel: parseFloat(confidenceLevel.toFixed(4)),
      analysis,
      tier
      // createdAt will be set by the database default if not provided here
    });
  }

  return predictions;
}

/**
 * Generates placeholder analysis text for when the home team is favored by the legacy system.
 * @param game The game object.
 * @param isValueBet Whether the model considers this a value bet.
 * @returns A string containing generated analysis.
 */
function generateHomeTeamFavoredAnalysis(game: Game, isValueBet: boolean): string {
  const factors = [
    `${game.homeTeamAbbreviation || game.homeTeam} has shown a strong performance at home recently.`,
    `The starting pitcher for ${game.homeTeamAbbreviation || game.homeTeam} has favorable historical stats in this matchup.`,
    `${game.homeTeamAbbreviation || game.homeTeam}'s offense has been clicking, especially in home games.`,
    `${game.awayTeamAbbreviation || game.awayTeam} has some inconsistencies when playing on the road.`,
    `Key metrics suggest an edge for ${game.homeTeamAbbreviation || game.homeTeam} in today's conditions.`,
  ];
  const selectedFactors = factors.sort(() => 0.5 - Math.random()).slice(0, 2); // Pick 2 random factors
  let analysis = selectedFactors.join(' ');
  if (isValueBet && game.homeTeamMoneyline != null) {
    analysis += ` The current moneyline of ${game.homeTeamMoneyline > 0 ? '+' : ''}${game.homeTeamMoneyline} for ${game.homeTeamAbbreviation || game.homeTeam} may offer value.`;
  }
  return analysis;
}

/**
 * Generates placeholder analysis text for when the away team is favored by the legacy system.
 * @param game The game object.
 * @param isValueBet Whether the model considers this a value bet.
 * @returns A string containing generated analysis.
 */
function generateAwayTeamFavoredAnalysis(game: Game, isValueBet: boolean): string {
  const factors = [
    `${game.awayTeamAbbreviation || game.awayTeam} has been particularly strong in away games lately.`,
    `The historical data for ${game.awayTeamAbbreviation || game.awayTeam}'s starting pitcher against this opponent is positive.`,
    `${game.awayTeamAbbreviation || game.awayTeam} boasts a potent offense that travels well.`,
    `${game.homeTeamAbbreviation || game.homeTeam} has shown some vulnerabilities that ${game.awayTeamAbbreviation || game.awayTeam} could exploit.`,
    `Statistical trends indicate ${game.awayTeamAbbreviation || game.awayTeam} has a solid chance in this matchup.`,
  ];
  const selectedFactors = factors.sort(() => 0.5 - Math.random()).slice(0, 2); // Pick 2 random factors
  let analysis = selectedFactors.join(' ');
  if (isValueBet && game.awayTeamMoneyline != null) {
    analysis += ` The odds at ${game.awayTeamMoneyline > 0 ? '+' : ''}${game.awayTeamMoneyline} for ${game.awayTeamAbbreviation || game.awayTeam} could be undervalued.`;
  }
  return analysis;
}

/**
 * Generates placeholder analysis text for total runs (over/under) recommendations by the legacy system.
 * @param game The game object.
 * @param totalRuns The predicted total runs line.
 * @param isOver Whether the prediction is for 'Over'.
 * @returns A string containing generated analysis.
 */
function generateTotalRunsAnalysis(game: Game, totalRuns: number, isOver: boolean): string {
  const factors = isOver ? [
    `Both ${game.homeTeamAbbreviation || game.homeTeam} and ${game.awayTeamAbbreviation || game.awayTeam} have offenses capable of putting up big numbers.`,
    `Pitching matchups and recent bullpen usage suggest potential for more runs.`,
    `Weather conditions might favor hitters today.`,
  ] : [
    `Strong starting pitching is expected from both ${game.homeTeamAbbreviation || game.homeTeam} and ${game.awayTeamAbbreviation || game.awayTeam}.`,
    `Both bullpens are well-rested and have been effective.`,
    `Recent offensive trends for both teams suggest a tighter, lower-scoring game.`,
  ];
  const selectedFactors = factors.sort(() => 0.5 - Math.random()).slice(0, 1); // Pick 1 random factor
  let analysis = selectedFactors.join(' ');
  analysis += ` The model leans ${isOver ? 'OVER' : 'UNDER'} ${totalRuns.toFixed(1)} runs in this contest.`;
  return analysis;
}
