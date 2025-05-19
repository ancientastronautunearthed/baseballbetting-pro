/**
 * MLB Edge Data Collection Strategy
 * 
 * This file defines strategies for collecting, processing, and analyzing data from 
 * various sources to generate accurate MLB predictions and insights.
 */

import { DataSource, allDataSources, getDataSourcesByType, getHighPriorityDataSources } from './dataSources';

/**
 * Data collection schedule with update frequency
 */
export const dataCollectionSchedule = {
  realtime: {
    sources: getDataSourcesByType('odds').concat(getDataSourcesByType('games')),
    interval: '5 minutes',
    description: 'Near real-time data collection for live odds, game status, and score updates',
    priority: 'critical'
  },
  hourly: {
    sources: getDataSourcesByType('weather').concat(getDataSourcesByType('injuries')),
    interval: '1 hour',
    description: 'Hourly updates for time-sensitive information like weather and injuries',
    priority: 'high'
  },
  daily: {
    sources: getDataSourcesByType('statistics').concat(getDataSourcesByType('news')),
    interval: '24 hours',
    description: 'Daily updates for team/player statistics and news',
    priority: 'medium'
  },
  weekly: {
    sources: getDataSourcesByType('historical').concat(getDataSourcesByType('projections')),
    interval: '7 days',
    description: 'Weekly updates for historical data and long-term projections',
    priority: 'low'
  }
};

/**
 * Data categories to collect and their importance in the prediction model
 */
export const dataCategories = {
  gameData: {
    description: 'Basic game information including teams, schedules, venues, officials',
    importance: 'baseline',
    sources: getDataSourcesByType('games'),
    dataPoints: [
      'game_date', 'start_time', 'venue', 'home_team', 'away_team', 
      'umpire_crew', 'series_info', 'broadcast_info'
    ]
  },
  teamPerformance: {
    description: 'Team statistics and performance metrics',
    importance: 'high',
    sources: getDataSourcesByType('teams').concat(getDataSourcesByType('statistics')),
    dataPoints: [
      'record', 'home_record', 'away_record', 'last_10_games', 'streak',
      'runs_scored', 'runs_allowed', 'team_batting_avg', 'team_era', 
      'bullpen_era', 'defensive_efficiency', 'run_differential'
    ]
  },
  playerPerformance: {
    description: 'Individual player statistics and metrics',
    importance: 'high',
    sources: getDataSourcesByType('players').concat(getDataSourcesByType('statistics')),
    dataPoints: [
      'player_name', 'position', 'batting_avg', 'obp', 'slg', 'ops', 'wrc_plus',
      'war', 'era', 'whip', 'fip', 'k_per_9', 'bb_per_9', 'hr_per_9'
    ]
  },
  advancedMetrics: {
    description: 'Advanced and predictive statistical measures',
    importance: 'critical',
    sources: getDataSourcesByType('advanced-metrics'),
    dataPoints: [
      'expected_batting_avg', 'hard_hit_percentage', 'barrel_rate', 'exit_velocity',
      'launch_angle', 'spin_rate', 'pitch_movement', 'chase_rate', 'zone_contact',
      'defensive_runs_saved', 'framing_runs', 'sprint_speed'
    ]
  },
  matchupHistory: {
    description: 'Historical performance in specific matchups',
    importance: 'medium',
    sources: getDataSourcesByType('historical'),
    dataPoints: [
      'head_to_head_record', 'pitcher_vs_team', 'batter_vs_pitcher',
      'home_vs_away_history', 'division_game_record', 'series_record'
    ]
  },
  environmentalFactors: {
    description: 'Weather and stadium conditions affecting game outcomes',
    importance: 'medium',
    sources: getDataSourcesByType('weather'),
    dataPoints: [
      'temperature', 'humidity', 'wind_speed', 'wind_direction', 'precipitation',
      'dome_or_outdoor', 'field_conditions', 'park_factors', 'altitude'
    ]
  },
  situationalFactors: {
    description: 'Team-specific situational elements',
    importance: 'medium',
    sources: getDataSourcesByType('news').concat(getDataSourcesByType('analysis')),
    dataPoints: [
      'travel_schedule', 'rest_days', 'day_or_night_game', 'doubleheader',
      'team_morale', 'recent_lineup_changes', 'playoff_implications'
    ]
  },
  injuryStatus: {
    description: 'Current injury information and impact assessment',
    importance: 'high',
    sources: getDataSourcesByType('injuries'),
    dataPoints: [
      'injured_players', 'injury_type', 'expected_return', 'injury_impact',
      'replacement_player_quality', 'cumulative_war_lost'
    ]
  },
  bettingMarket: {
    description: 'Betting odds, line movements, and market sentiment',
    importance: 'high',
    sources: getDataSourcesByType('odds').concat(getDataSourcesByType('betting-markets')),
    dataPoints: [
      'moneyline', 'run_line', 'total', 'first_5_innings_line', 'opening_line',
      'line_movement', 'public_betting_percentage', 'sharp_money_indicators'
    ]
  }
};

/**
 * Daily data collection workflow
 */
export const dailyDataCollectionWorkflow = {
  steps: [
    {
      name: 'Initialize Daily Collection',
      description: 'Set up the data collection environment for the day',
      tasks: [
        'Clear previous day temporary storage',
        'Check API key validity for all sources',
        'Log collection start time and parameters'
      ]
    },
    {
      name: 'Fetch Game Schedule',
      description: 'Get the complete MLB schedule for the day',
      tasks: [
        'Pull games from MLB Stats API',
        'Verify game statuses (scheduled, postponed, delayed)',
        'Create game ID tracking for the day\'s games'
      ]
    },
    {
      name: 'Collect Team Data',
      description: 'Gather team statistics and performance metrics',
      tasks: [
        'Pull team standings and records',
        'Get team batting and pitching statistics',
        'Collect team-specific park factors and home/away splits'
      ]
    },
    {
      name: 'Player Performance Collection',
      description: 'Gather individual player data for projected starters',
      tasks: [
        'Identify probable pitchers',
        'Pull pitcher statistics and recent performance',
        'Collect key batter statistics and trends',
        'Generate player matchup matrices'
      ]
    },
    {
      name: 'Weather and Environmental Data',
      description: 'Collect game-specific environmental conditions',
      tasks: [
        'Pull weather forecasts for each stadium',
        'Calculate wind impact on hitting and pitching',
        'Assess temperature effects on ball flight and pitcher grip'
      ]
    },
    {
      name: 'Injury and Roster Updates',
      description: 'Get latest injury news and lineup information',
      tasks: [
        'Check injury reports and IL status',
        'Identify key player absences',
        'Calculate impact of injuries on team performance'
      ]
    },
    {
      name: 'News and Analysis Integration',
      description: 'Collect qualitative insights and news reports',
      tasks: [
        'Scrape latest MLB news articles',
        'Extract team-specific developments',
        'Identify late-breaking information affecting games'
      ]
    },
    {
      name: 'Betting Market Collection',
      description: 'Gather odds, lines, and betting trends',
      tasks: [
        'Pull current odds from multiple sportsbooks',
        'Track line movements throughout the day',
        'Collect public betting percentages and sharp money indicators'
      ]
    },
    {
      name: 'Data Processing and Cleaning',
      description: 'Process raw data for analysis pipeline',
      tasks: [
        'Normalize data format across sources',
        'Filter out irrelevant or low-quality data points',
        'Handle missing values and outliers',
        'Merge data from different sources by game ID'
      ]
    },
    {
      name: 'Feature Engineering',
      description: 'Transform raw data into model features',
      tasks: [
        'Calculate derivative metrics from raw statistics',
        'Generate matchup-specific features',
        'Create time-series features for hot/cold streaks',
        'Construct situational context features'
      ]
    }
  ],
  outputFormat: {
    gameData: {
      structure: 'JSON object per game',
      storage: 'Database (main collection) and cache (for rapid access)',
      accessibility: 'API endpoints for frontend and model input'
    }
  }
};

/**
 * Data sources priority by prediction factor
 */
export const predictionFactorSources = {
  startingPitching: [
    ...getDataSourcesByType('pitch-analysis'),
    ...getDataSourcesByType('statistics').filter(s => s.name.includes('FanGraphs'))
  ],
  bullpenStrength: [
    ...getDataSourcesByType('statistics').filter(s => s.name.includes('FanGraphs')),
    ...getDataSourcesByType('statistics').filter(s => s.name.includes('Baseball Reference'))
  ],
  battingEffectiveness: [
    ...getDataSourcesByType('advanced-metrics'),
    ...getDataSourcesByType('statistics').filter(s => s.name.includes('Statcast'))
  ],
  defenseQuality: [
    ...getDataSourcesByType('statistics').filter(s => s.name.includes('FanGraphs')),
    ...getDataSourcesByType('advanced-metrics')
  ],
  homeFieldAdvantage: [
    ...getDataSourcesByType('statistics').filter(s => s.name.includes('Baseball Reference')),
    ...getDataSourcesByType('historical')
  ],
  weatherImpact: [
    ...getDataSourcesByType('weather'),
    ...getDataSourcesByType('historical').filter(s => s.url.includes('baseball-reference'))
  ],
  injuries: [
    ...getDataSourcesByType('injuries'),
    ...getDataSourcesByType('news')
  ],
  recentForm: [
    ...getDataSourcesByType('statistics'),
    ...getDataSourcesByType('historical')
  ],
  restAndSchedule: [
    ...getDataSourcesByType('schedules'),
    ...getDataSourcesByType('news')
  ],
  headToHead: [
    ...getDataSourcesByType('historical'),
    ...getDataSourcesByType('statistics')
  ],
  marketMovement: [
    ...getDataSourcesByType('odds'),
    ...getDataSourcesByType('betting-trends')
  ]
};

/**
 * Data collection error handling strategy
 */
export const dataCollectionErrorStrategy = {
  sourceFallbacks: {
    // For each primary source, define fallback sources
    'MLB Stats API': ['Baseball Reference', 'ESPN MLB'],
    'Baseball Reference': ['FanGraphs', 'MLB Stats API'],
    'FanGraphs': ['Baseball Reference', 'MLB Stats API'],
    'Statcast': ['FanGraphs', 'Baseball Reference']
  },
  errorThresholds: {
    criticalError: {
      description: 'Error that prevents prediction generation',
      threshold: 'Missing >25% of critical data points',
      action: 'Abort prediction for affected games, notify admin'
    },
    majorError: {
      description: 'Error that significantly impacts prediction quality',
      threshold: 'Missing 10-25% of critical data points',
      action: 'Use fallback sources, flag prediction as lower confidence'
    },
    minorError: {
      description: 'Error that slightly impacts prediction quality',
      threshold: 'Missing <10% of critical data points',
      action: 'Use fallback sources or interpolation, note in prediction'
    }
  },
  retryPolicy: {
    maxRetries: 3,
    retryDelay: '30 seconds',
    exponentialBackoff: true
  }
};

/**
 * Data refreshing strategy with timing details
 */
export const dataRefreshStrategy = {
  gameDay: {
    preGame: [
      { time: '12 hours before', sources: ['historical', 'advanced-metrics', 'projections'] },
      { time: '6 hours before', sources: ['weather', 'injuries', 'news'] },
      { time: '2 hours before', sources: ['lineups', 'odds', 'betting-trends'] },
      { time: '30 minutes before', sources: ['weather', 'lineups', 'odds', 'betting-trends'] }
    ],
    inGame: {
      interval: '5 minutes',
      sources: ['game-stats', 'odds']
    },
    postGame: [
      { time: 'immediately after', sources: ['game-results'] },
      { time: '1 hour after', sources: ['advanced-stats', 'player-performance'] },
      { time: '12 hours after', sources: ['analysis', 'model-performance'] }
    ]
  },
  nonGameDay: {
    daily: {
      time: '10:00 AM EST',
      sources: ['news', 'injuries', 'transactions', 'team-stats']
    },
    weekly: {
      time: 'Monday 8:00 AM EST',
      sources: ['historical', 'trends', 'model-tuning']
    }
  }
};

// Get a comprehensive plan for a specific game
export function getDataCollectionPlanForGame(gameId: string) {
  return {
    gameId,
    dataSources: getHighPriorityDataSources(),
    collectionSchedule: {
      ...dataCollectionSchedule.realtime,
      ...dataCollectionSchedule.hourly
    },
    dataCategories: Object.values(dataCategories),
    collectionSteps: dailyDataCollectionWorkflow.steps,
    errorHandling: dataCollectionErrorStrategy,
    refreshStrategy: dataRefreshStrategy.gameDay
  };
}