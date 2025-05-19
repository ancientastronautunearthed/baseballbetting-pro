/**
 * MLB Edge Data Sources
 * 
 * This file contains a comprehensive list of data sources used for MLB analytics
 * and prediction model. These sources are used to gather various types of data
 * including game stats, player performance, weather, injuries, and more.
 */

export interface DataSource {
  name: string;
  url: string;
  apiEndpoint?: string;
  apiKeyRequired: boolean;
  dataType: string[];
  updateFrequency: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

// Primary MLB data sources - these provide the core statistics and information
export const primarySources: DataSource[] = [
  {
    name: 'MLB Stats API',
    url: 'https://statsapi.mlb.com/api',
    apiEndpoint: '/v1',
    apiKeyRequired: false,
    dataType: ['games', 'players', 'teams', 'standings', 'schedules'],
    updateFrequency: 'real-time',
    description: 'Official MLB statistics API providing comprehensive game, team, and player data',
    priority: 'high'
  },
  {
    name: 'Baseball Reference',
    url: 'https://www.baseball-reference.com',
    apiKeyRequired: false,
    dataType: ['historical', 'statistics', 'players', 'teams'],
    updateFrequency: 'daily',
    description: 'Comprehensive historical baseball statistics with advanced metrics',
    priority: 'high'
  },
  {
    name: 'FanGraphs',
    url: 'https://www.fangraphs.com',
    apiKeyRequired: false,
    dataType: ['advanced-metrics', 'projections', 'analytics'],
    updateFrequency: 'daily',
    description: 'Advanced baseball analytics and projections with proprietary metrics',
    priority: 'high'
  },
  {
    name: 'Statcast',
    url: 'https://baseballsavant.mlb.com',
    apiKeyRequired: false,
    dataType: ['pitch-tracking', 'exit-velocity', 'launch-angle', 'sprint-speed'],
    updateFrequency: 'daily',
    description: 'MLB\'s tracking technology providing detailed physics and player movement data',
    priority: 'high'
  }
];

// Secondary data sources - these provide supplemental information
export const secondarySources: DataSource[] = [
  {
    name: 'Rotoworld',
    url: 'https://www.rotoworld.com/baseball/mlb',
    apiKeyRequired: false,
    dataType: ['news', 'injuries', 'transactions'],
    updateFrequency: 'hourly',
    description: 'Breaking news about player injuries, lineup changes, and transactions',
    priority: 'medium'
  },
  {
    name: 'Weather.gov',
    url: 'https://api.weather.gov',
    apiKeyRequired: false,
    dataType: ['weather', 'forecast'],
    updateFrequency: 'hourly',
    description: 'Weather forecasts for game locations to analyze environmental factors',
    priority: 'medium'
  },
  {
    name: 'ESPN MLB',
    url: 'https://www.espn.com/mlb',
    apiKeyRequired: false,
    dataType: ['news', 'analysis', 'insider-info'],
    updateFrequency: 'daily',
    description: 'News, analysis, and expert opinions on MLB teams and players',
    priority: 'medium'
  },
  {
    name: 'The Athletic',
    url: 'https://theathletic.com/mlb',
    apiKeyRequired: true,
    dataType: ['news', 'analysis', 'insider-info'],
    updateFrequency: 'daily',
    description: 'In-depth articles and analysis from baseball insiders and analysts',
    priority: 'medium'
  }
];

// Advanced analytics sources - these provide specialized metrics and projections
export const analyticsSources: DataSource[] = [
  {
    name: 'Baseball Prospectus',
    url: 'https://www.baseballprospectus.com',
    apiKeyRequired: true,
    dataType: ['PECOTA', 'DRA', 'advanced-analytics'],
    updateFrequency: 'daily',
    description: 'Specialized baseball analytics including PECOTA projections and DRA pitching metrics',
    priority: 'high'
  },
  {
    name: 'Brooks Baseball',
    url: 'https://www.brooksbaseball.net',
    apiKeyRequired: false,
    dataType: ['pitch-analysis', 'pitch-movement', 'release-points'],
    updateFrequency: 'daily',
    description: 'Detailed pitch analysis including movement, velocity, and release points',
    priority: 'medium'
  },
  {
    name: 'Crunchtimebaseball',
    url: 'https://www.crunchtimebaseball.com',
    apiKeyRequired: false,
    dataType: ['fantasy', 'projections', 'rankings'],
    updateFrequency: 'weekly',
    description: 'Fantasy baseball projections and player rankings',
    priority: 'low'
  }
];

// Sports betting sources - odds, lines, and betting trends
export const bettingSources: DataSource[] = [
  {
    name: 'Odds API',
    url: 'https://api.the-odds-api.com',
    apiEndpoint: '/v4/sports/baseball_mlb/odds',
    apiKeyRequired: true,
    dataType: ['odds', 'lines', 'betting-markets'],
    updateFrequency: 'real-time',
    description: 'Aggregated betting odds from multiple sportsbooks',
    priority: 'high'
  },
  {
    name: 'Action Network',
    url: 'https://www.actionnetwork.com/mlb',
    apiKeyRequired: false,
    dataType: ['betting-trends', 'public-betting', 'expert-picks'],
    updateFrequency: 'daily',
    description: 'Betting trends, public betting percentages, and professional handicapper insights',
    priority: 'medium'
  },
  {
    name: 'Covers',
    url: 'https://www.covers.com/mlb',
    apiKeyRequired: false,
    dataType: ['consensus-picks', 'line-movements', 'betting-analysis'],
    updateFrequency: 'daily',
    description: 'Betting consensus, line movements, and matchup analysis',
    priority: 'medium'
  }
];

// All data sources combined
export const allDataSources: DataSource[] = [
  ...primarySources,
  ...secondarySources,
  ...analyticsSources,
  ...bettingSources
];

// Get data sources by type
export function getDataSourcesByType(type: string): DataSource[] {
  return allDataSources.filter(source => source.dataType.includes(type));
}

// Get high priority data sources
export function getHighPriorityDataSources(): DataSource[] {
  return allDataSources.filter(source => source.priority === 'high');
}