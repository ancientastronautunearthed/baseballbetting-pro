/**
 * MLB Edge Data Integration System
 * 
 * This file implements the integration layer that pulls data from various sources,
 * transforms it into a unified format, and makes it available for the prediction engine.
 */

import { DataSource, allDataSources, getDataSourcesByType } from './dataSources';
import { dataCategories, dataCollectionErrorStrategy, getDataCollectionPlanForGame } from './collectionStrategy';
import { Game, Prediction, InsertPrediction } from '../../shared/schema';

// This is a type declaration to help with compatibility
type SourceFallbacks = {
  [key: string]: string[]
};

interface BaseballData {
  gameId: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  data: Record<string, any>;
  collectTime: string;
  source: string;
  confidence: number;
}

/**
 * Primary data fetching function that handles requests to external APIs
 * @param source The data source to fetch from
 * @param endpoint Specific API endpoint or path
 * @param params Query parameters for the request
 */
export async function fetchDataFromSource(
  source: DataSource, 
  endpoint: string = '', 
  params: Record<string, string> = {}
): Promise<any> {
  try {
    // In a real implementation, this would make an actual HTTP request
    // For demonstration purposes, we'll simulate successful data retrieval
    
    console.log(`[Data Collection] Fetching from ${source.name}: ${endpoint}`);
    
    // Simulate API key checks for sources that require it
    if (source.apiKeyRequired) {
      const apiKeyEnvVar = `${source.name.toUpperCase().replace(/\s/g, '_')}_API_KEY`;
      const apiKey = process.env[apiKeyEnvVar];
      
      if (!apiKey) {
        console.warn(`[Data Collection] Warning: Missing API key for ${source.name}`);
        // In production, we would handle this situation using fallback sources
      }
    }
    
    // Return simulated data structure based on the source type
    return {
      source: source.name,
      timestamp: new Date().toISOString(),
      data: simulateDataFromSource(source, endpoint),
      status: 'success'
    };
  } catch (error) {
    console.error(`[Data Collection] Error fetching data from ${source.name}:`, error);
    
    // Apply error handling strategy from collectionStrategy
    const fallbacks = dataCollectionErrorStrategy.sourceFallbacks[source.name];
    if (fallbacks && fallbacks.length > 0) {
      console.log(`[Data Collection] Trying fallback source: ${fallbacks[0]}`);
      const fallbackSource = allDataSources.find(s => s.name === fallbacks[0]);
      if (fallbackSource) {
        return fetchDataFromSource(fallbackSource, endpoint, params);
      }
    }
    
    throw new Error(`Failed to fetch data from ${source.name} and all fallbacks`);
  }
}

/**
 * Simulates returning data for different source types
 * In production, this would be replaced by actual API calls
 */
function simulateDataFromSource(source: DataSource, endpoint: string): any {
  // Return different mock data structures based on source type
  if (source.dataType.includes('games')) {
    return {
      games: [
        {
          id: "2025-05-19-0-SF-NYY",
          status: "Scheduled",
          teams: { away: { name: "San Francisco Giants" }, home: { name: "New York Yankees" } },
          venue: { name: "Yankee Stadium" },
          gameTime: "2025-05-19T19:05:00Z",
          weather: { condition: "Clear", tempF: 72, windMph: 5, windDirection: "SW" }
        },
        // Additional game data would be returned here
      ]
    };
  }
  
  if (source.dataType.includes('statistics')) {
    return {
      teams: [
        { 
          name: "New York Yankees", 
          stats: {
            batting: { avg: .267, obp: .342, slug: .445, ops: .787, hr: 82, runs: 321 },
            pitching: { era: 3.65, whip: 1.22, strikeouts: 642, walks: 201, hr_allowed: 61 },
            fielding: { errors: 31, fielding_pct: .986, defensive_runs_saved: 12 }
          }
        },
        // Additional team statistics would be returned here
      ]
    };
  }
  
  if (source.dataType.includes('players')) {
    return {
      players: [
        {
          id: 12345,
          name: "Aaron Judge",
          team: "New York Yankees",
          position: "RF",
          stats: {
            batting: { avg: .298, obp: .402, slug: .609, ops: 1.011, hr: 23, rbi: 52 },
            fielding: { fielding_pct: .982, defensive_runs_saved: 5 }
          }
        },
        // Additional player data would be returned here
      ]
    };
  }
  
  if (source.dataType.includes('weather')) {
    return {
      location: "Yankee Stadium, Bronx, NY",
      forecast: {
        gameTime: { tempF: 72, condition: "Clear", precipitation: 0, humidity: 45, windMph: 5, windDirection: "SW" },
        hourly: [
          { time: "18:00", tempF: 74, condition: "Clear" },
          { time: "19:00", tempF: 72, condition: "Clear" },
          { time: "20:00", tempF: 70, condition: "Clear" },
          { time: "21:00", tempF: 68, condition: "Clear" },
          { time: "22:00", tempF: 67, condition: "Clear" }
        ]
      }
    };
  }
  
  if (source.dataType.includes('odds')) {
    return {
      game: "San Francisco Giants @ New York Yankees",
      gameId: "2025-05-19-0-SF-NYY",
      odds: {
        moneyline: { home: -165, away: +145 },
        runline: { home: { line: -1.5, odds: +135 }, away: { line: +1.5, odds: -155 } },
        total: { line: 8.5, over: -110, under: -110 },
        movement: {
          moneyline: { opened: { home: -150, away: +130 }, current: { home: -165, away: +145 } },
          runline: { opened: { home: { odds: +150 } }, current: { home: { odds: +135 } } },
          total: { opened: { line: 8, over: -110, under: -110 }, current: { line: 8.5, over: -110, under: -110 } }
        }
      },
      consensus: {
        moneyline: { homePercentage: 68, awayPercentage: 32 },
        runline: { homePercentage: 45, awayPercentage: 55 },
        total: { overPercentage: 62, underPercentage: 38 }
      }
    };
  }
  
  // Default fallback data
  return {
    source: source.name,
    endpoint: endpoint,
    note: "Simulated generic data response"
  };
}

/**
 * Collect all required data for a specific game from all relevant sources
 * @param gameId Unique identifier for the game
 * @param date Game date in YYYY-MM-DD format
 */
export async function collectGameData(gameId: string, date: string): Promise<BaseballData[]> {
  console.log(`[Data Collection] Starting comprehensive data collection for game ${gameId}`);
  
  // Get collection plan for this specific game
  const plan = getDataCollectionPlanForGame(gameId);
  const collectedData: BaseballData[] = [];
  
  try {
    // Extract team information from gameId format (e.g., "2025-05-19-0-SF-NYY")
    const parts = gameId.split('-');
    const homeTeam = parts[4];
    const awayTeam = parts[3];
    
    // 1. Collect basic game information
    const gameSource = plan.dataSources.find(s => s.name === 'MLB Stats API');
    if (gameSource) {
      const gameInfo = await fetchDataFromSource(gameSource, '/v1/game/' + gameId);
      collectedData.push({
        gameId,
        date,
        homeTeam,
        awayTeam,
        data: gameInfo.data,
        collectTime: new Date().toISOString(),
        source: gameSource.name,
        confidence: 0.95
      });
    }
    
    // 2. Collect team statistics
    const statsSource = plan.dataSources.find(s => 
      s.name === 'Baseball Reference' || s.name === 'FanGraphs'
    );
    if (statsSource) {
      const homeTeamStats = await fetchDataFromSource(statsSource, `/teams/${homeTeam}`);
      const awayTeamStats = await fetchDataFromSource(statsSource, `/teams/${awayTeam}`);
      
      collectedData.push({
        gameId,
        date,
        homeTeam,
        awayTeam,
        data: { homeTeamStats: homeTeamStats.data, awayTeamStats: awayTeamStats.data },
        collectTime: new Date().toISOString(),
        source: statsSource.name,
        confidence: 0.9
      });
    }
    
    // 3. Collect weather information
    const weatherSource = plan.dataSources.find(s => s.dataType.includes('weather'));
    if (weatherSource) {
      const weather = await fetchDataFromSource(weatherSource, '/forecast/stadium');
      collectedData.push({
        gameId,
        date,
        homeTeam,
        awayTeam,
        data: weather.data,
        collectTime: new Date().toISOString(),
        source: weatherSource.name,
        confidence: 0.85 // Weather is less predictable further in advance
      });
    }
    
    // 4. Collect betting odds
    const oddsSource = plan.dataSources.find(s => s.name === 'Odds API');
    if (oddsSource) {
      const odds = await fetchDataFromSource(oddsSource, '/v4/sports/baseball_mlb/odds');
      collectedData.push({
        gameId,
        date,
        homeTeam,
        awayTeam,
        data: odds.data,
        collectTime: new Date().toISOString(),
        source: oddsSource.name,
        confidence: 0.9
      });
    }
    
    console.log(`[Data Collection] Successfully collected data from ${collectedData.length} sources for game ${gameId}`);
    return collectedData;
    
  } catch (error) {
    console.error(`[Data Collection] Error during data collection for game ${gameId}:`, error);
    // Return whatever data we managed to collect
    return collectedData;
  }
}

/**
 * Process collected data into a unified format suitable for prediction models
 * @param collectedData Array of data collected from various sources
 */
export function processGameData(collectedData: BaseballData[]): Record<string, any> {
  if (collectedData.length === 0) {
    throw new Error("No data available to process");
  }
  
  const gameId = collectedData[0].gameId;
  const homeTeam = collectedData[0].homeTeam;
  const awayTeam = collectedData[0].awayTeam;
  
  console.log(`[Data Processing] Processing data for game ${gameId}: ${awayTeam} @ ${homeTeam}`);
  
  // Create an organized structure to hold the processed data
  const processedData = {
    gameInfo: {
      gameId,
      date: collectedData[0].date,
      homeTeam,
      awayTeam,
      venue: '',
      startTime: '',
      weather: {}
    },
    teamStats: {
      home: { batting: {}, pitching: {}, fielding: {} },
      away: { batting: {}, pitching: {}, fielding: {} }
    },
    matchupHistory: {
      overall: { homeWins: 0, awayWins: 0 },
      lastTenGames: { homeWins: 0, awayWins: 0 },
      thisYearGames: { homeWins: 0, awayWins: 0 }
    },
    startingPitchers: {
      home: { name: '', stats: {} },
      away: { name: '', stats: {} }
    },
    bettingOdds: {
      moneyline: { home: 0, away: 0 },
      runline: {},
      total: {},
      movements: {}
    },
    situationalFactors: {
      homeTeamRestDays: 0,
      awayTeamRestDays: 0,
      homeTeamTravel: '',
      awayTeamTravel: '',
      homeTeamInjuryImpact: 0,
      awayTeamInjuryImpact: 0
    },
    dataConfidence: { 
      overall: 0,
      byCategory: {}
    }
  };
  
  // Populate the processed data structure from each collected data source
  collectedData.forEach(dataItem => {
    const { data, source, confidence } = dataItem;
    
    // Process data based on source type
    if (source === 'MLB Stats API') {
      if (data.games && data.games.length > 0) {
        const game = data.games[0];
        processedData.gameInfo.venue = game.venue?.name || '';
        processedData.gameInfo.startTime = game.gameTime || '';
        processedData.gameInfo.weather = game.weather || {};
      }
    }
    
    else if (source === 'Baseball Reference' || source === 'FanGraphs') {
      if (data.homeTeamStats?.stats) {
        processedData.teamStats.home = data.homeTeamStats.stats;
      }
      if (data.awayTeamStats?.stats) {
        processedData.teamStats.away = data.awayTeamStats.stats;
      }
    }
    
    else if (source === 'Weather.gov') {
      if (data.forecast) {
        processedData.gameInfo.weather = data.forecast.gameTime || {};
      }
    }
    
    else if (source === 'Odds API') {
      if (data.odds) {
        processedData.bettingOdds = {
          moneyline: data.odds.moneyline || {},
          runline: data.odds.runline || {},
          total: data.odds.total || {},
          movements: data.odds.movement || {}
        };
      }
    }
    
    // Add confidence level for this data category
    const category = Object.keys(dataCategories).find(
      key => dataCategories[key].sources.some(s => s.name === source)
    );
    
    if (category) {
      processedData.dataConfidence.byCategory[category] = confidence;
    }
  });
  
  // Calculate overall confidence score as weighted average
  const confidenceValues = Object.values(processedData.dataConfidence.byCategory) as number[];
  if (confidenceValues.length > 0) {
    processedData.dataConfidence.overall = confidenceValues.reduce((sum, val) => sum + val, 0) / confidenceValues.length;
  }
  
  console.log(`[Data Processing] Completed processing with overall confidence ${processedData.dataConfidence.overall.toFixed(2)}`);
  return processedData;
}

/**
 * Generate prediction for a game based on processed data
 * @param game The game to generate predictions for
 * @param processedData Processed data from various sources
 */
export function generateGamePrediction(game: Game, processedData: Record<string, any>): InsertPrediction {
  console.log(`[Prediction] Generating prediction for game ${game.id}`);
  
  // Extract team information - in a production system these would come from processed data
  const homeTeam = game.homeTeam;
  const awayTeam = game.awayTeam;
  
  // In a real system, this would use a complex algorithm, possibly machine learning model
  // For demonstration, we'll use a simplified approach
  
  // Example factors that would affect the prediction:
  // 1. Team performance (recent form, overall record, home/away record)
  // 2. Pitching matchup
  // 3. Batting performance
  // 4. Ballpark factors
  // 5. Weather conditions
  // 6. Injuries/lineup changes
  // 7. Rest days/travel
  // 8. Historical matchups
  // 9. Betting market wisdom
  
  // Simplified mock prediction logic
  const homeTeamWinProbability = simulatePredictionModel(processedData, true);
  const awayTeamWinProbability = 100 - homeTeamWinProbability;
  
  // Determine a favorite based on win percentage
  const favoredTeam = homeTeamWinProbability > awayTeamWinProbability ? 'home' : 'away';
  const favoredTeamName = favoredTeam === 'home' ? homeTeam : awayTeam;
  const underdogTeamName = favoredTeam === 'home' ? awayTeam : homeTeam;
  
  // Check if it's a value bet (odds don't match our prediction)
  const oddsImpliedProbability = {
    home: 0,
    away: 0
  };
  
  if (processedData.bettingOdds && processedData.bettingOdds.moneyline) {
    // Convert moneyline odds to implied probability
    if (processedData.bettingOdds.moneyline.home < 0) {
      oddsImpliedProbability.home = Math.abs(processedData.bettingOdds.moneyline.home) / 
        (Math.abs(processedData.bettingOdds.moneyline.home) + 100) * 100;
    } else {
      oddsImpliedProbability.home = 100 / (processedData.bettingOdds.moneyline.home + 100) * 100;
    }
    
    if (processedData.bettingOdds.moneyline.away < 0) {
      oddsImpliedProbability.away = Math.abs(processedData.bettingOdds.moneyline.away) / 
        (Math.abs(processedData.bettingOdds.moneyline.away) + 100) * 100;
    } else {
      oddsImpliedProbability.away = 100 / (processedData.bettingOdds.moneyline.away + 100) * 100;
    }
  }
  
  // Value bet if our model gives the team a higher win % than the betting market implies
  const homeTeamValueBet = homeTeamWinProbability > oddsImpliedProbability.home + 5;
  const awayTeamValueBet = awayTeamWinProbability > oddsImpliedProbability.away + 5;
  const isValueBet = favoredTeam === 'home' ? homeTeamValueBet : awayTeamValueBet;
  
  // Generate recommendation
  const recommendedBet = favoredTeam === 'home' ? 'HOME_TEAM' : 'AWAY_TEAM';
  cons
(Content truncated due to size limit. Use line ranges to read in chunks)