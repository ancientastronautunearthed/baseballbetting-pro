/**
 * MLB Edge Analysis Routes
 * 
 * This file contains API routes for accessing the comprehensive data collection
 * and analysis system of MLB Edge.
 */

import { Router } from 'express';
import { storage } from '../storage';
import { 
  getSystemStatus, 
  runDailyDataWorkflow, 
  triggerGameUpdate,
  performDataQualityCheck
} from '../dataCollection/integrationManager';

const router = Router();

/**
 * Get the status of the data collection system
 * GET /api/analysis/system-status
 */
router.get('/system-status', (req, res) => {
  try {
    const status = getSystemStatus();
    res.json(status);
  } catch (error) {
    console.error("Error getting system status:", error);
    res.status(500).json({ error: "Failed to get system status" });
  }
});

/**
 * Run a manual data refresh for all today's games
 * This endpoint should require authentication and admin privileges in production
 * POST /api/analysis/refresh-data
 */
router.post('/refresh-data', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // In a production system, check for admin privileges
    // if (!req.user.isAdmin) return res.status(403).json({ error: "Unauthorized" });
    
    const predictions = await runDailyDataWorkflow();
    res.json({ 
      success: true, 
      message: `Successfully refreshed data and generated ${predictions.length} predictions`,
      count: predictions.length
    });
  } catch (error) {
    console.error("Error refreshing data:", error);
    res.status(500).json({ error: "Failed to refresh data" });
  }
});

/**
 * Refresh data for a specific game
 * POST /api/analysis/refresh-game/:gameId
 */
router.post('/refresh-game/:gameId', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const gameId = parseInt(req.params.gameId);
    if (isNaN(gameId)) {
      return res.status(400).json({ error: "Invalid game ID" });
    }
    
    const result = await triggerGameUpdate(gameId);
    res.json(result);
  } catch (error) {
    console.error(`Error refreshing game ${req.params.gameId}:`, error);
    res.status(500).json({ error: "Failed to refresh game data" });
  }
});

/**
 * Check data quality for a specific game
 * GET /api/analysis/data-quality/:gameId
 */
router.get('/data-quality/:gameId', (req, res) => {
  try {
    const gameId = req.params.gameId;
    const quality = performDataQualityCheck(gameId);
    res.json(quality);
  } catch (error) {
    console.error(`Error checking data quality for game ${req.params.gameId}:`, error);
    res.status(500).json({ error: "Failed to check data quality" });
  }
});

/**
 * Get all data sources used in the system
 * GET /api/analysis/data-sources
 */
router.get('/data-sources', (req, res) => {
  try {
    // Import data sources dynamically to avoid circular dependencies
    const { allDataSources, getHighPriorityDataSources } = require('../dataCollection/dataSources');
    
    res.json({
      allSources: allDataSources.map(s => ({
        name: s.name,
        dataType: s.dataType,
        updateFrequency: s.updateFrequency,
        priority: s.priority
      })),
      highPrioritySources: getHighPriorityDataSources().map(s => s.name)
    });
  } catch (error) {
    console.error("Error getting data sources:", error);
    res.status(500).json({ error: "Failed to get data sources" });
  }
});

/**
 * Get data collection plan for today
 * GET /api/analysis/collection-plan
 */
router.get('/collection-plan', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const games = await storage.getGamesByDate(today);
    
    if (!games || games.length === 0) {
      return res.json({ 
        date: today,
        message: "No games scheduled for today",
        games: [] 
      });
    }
    
    // Import data collection plan generator dynamically
    const { getDataCollectionPlanForGame } = require('../dataCollection/collectionStrategy');
    
    // Get first game's collection plan as an example
    const firstGamePlan = getDataCollectionPlanForGame(games[0].mlbId);
    
    res.json({
      date: today,
      gamesCount: games.length,
      gameIds: games.map(g => g.mlbId),
      samplePlan: firstGamePlan
    });
  } catch (error) {
    console.error("Error getting collection plan:", error);
    res.status(500).json({ error: "Failed to get data collection plan" });
  }
});

export default router;