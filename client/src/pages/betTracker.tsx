import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { format, parse, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Game, Prediction } from "@shared/schema";
import { 
  Calendar, 
  LineChart, 
  BarChart, 
  PieChart, 
  ChevronDown,
  Filter,
  Plus,
  Clock,
  Check,
  X,
  Home,
  ExternalLink,
  Info, 
  Moon,
  Sun,
  BarChart3,
  DollarSign,
  Percent,
  Calendar as CalendarIcon,
  Tag,
  Settings,
  Minus
} from "lucide-react";

// Type definitions
type GameTime = 'day' | 'night';
type GameLocation = 'home' | 'away';
type BetResult = 'win' | 'loss' | 'push' | 'pending';
type BetType = 'moneyline' | 'runline' | 'total' | 'prop';
type Team = {
  id: string;
  name: string;
  abbreviation: string;
  league: 'AL' | 'NL';
  division: 'East' | 'Central' | 'West';
};

type League = 'MLB';
type Season = string; // e.g. "2025"

type Bet = {
  id: string;
  date: string; // ISO string
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  betType: BetType;
  selection: string;
  odds: number;
  stake: number;
  result: BetResult;
  league: League;
  season: Season;
  gameTime: GameTime;
  gameLocation: GameLocation;
  notes: string;
  tags: string[];
  toWin: number;
  payout: number;
  referee?: string;
  weather?: string;
  temperature?: number;
  windSpeed?: number;
  windDirection?: string;
  createdAt: string;
  userId?: string;
};

type BetFilterOptions = {
  dateRange: { start: Date | null, end: Date | null } | null;
  betTypes: BetType[];
  results: BetResult[];
  teams: string[];
  gameTime: GameTime[];
  gameLocation: GameLocation[];
  minOdds: number | null;
  maxOdds: number | null;
  tags: string[];
};

type AnalyticsData = {
  totalBets: number;
  wins: number;
  losses: number;
  pushes: number;
  pendingBets: number;
  winRate: number;
  totalStaked: number;
  totalReturns: number;
  netProfit: number;
  roi: number;
  averageOdds: number;
  biggestWin: number;
  biggestLoss: number;
  longestWinStreak: number;
  longestLoseStreak: number;
  currentStreak: { type: 'win' | 'loss', count: number };
  betTypeBreakdown: { type: BetType; count: number; winRate: number; profit: number }[];
  teamPerformance: { team: string; bets: number; wins: number; winRate: number; profit: number }[];
  monthlyPerformance: { month: string; bets: number; winRate: number; profit: number }[];
  dayVsNight: { time: GameTime; bets: number; winRate: number; profit: number }[];
  homeVsAway: { location: GameLocation; bets: number; winRate: number; profit: number }[];
  tagPerformance: { tag: string; bets: number; winRate: number; profit: number }[];
};

// Mock team data
const MLB_TEAMS: Team[] = [
  { id: "ARI", name: "Arizona Diamondbacks", abbreviation: "ARI", league: "NL", division: "West" },
  { id: "ATL", name: "Atlanta Braves", abbreviation: "ATL", league: "NL", division: "East" },
  { id: "BAL", name: "Baltimore Orioles", abbreviation: "BAL", league: "AL", division: "East" },
  { id: "BOS", name: "Boston Red Sox", abbreviation: "BOS", league: "AL", division: "East" },
  { id: "CHC", name: "Chicago Cubs", abbreviation: "CHC", league: "NL", division: "Central" },
  { id: "CWS", name: "Chicago White Sox", abbreviation: "CWS", league: "AL", division: "Central" },
  { id: "CIN", name: "Cincinnati Reds", abbreviation: "CIN", league: "NL", division: "Central" },
  { id: "CLE", name: "Cleveland Guardians", abbreviation: "CLE", league: "AL", division: "Central" },
  { id: "COL", name: "Colorado Rockies", abbreviation: "COL", league: "NL", division: "West" },
  { id: "DET", name: "Detroit Tigers", abbreviation: "DET", league: "AL", division: "Central" },
  { id: "HOU", name: "Houston Astros", abbreviation: "HOU", league: "AL", division: "West" },
  { id: "KC", name: "Kansas City Royals", abbreviation: "KC", league: "AL", division: "Central" },
  { id: "LAA", name: "Los Angeles Angels", abbreviation: "LAA", league: "AL", division: "West" },
  { id: "LAD", name: "Los Angeles Dodgers", abbreviation: "LAD", league: "NL", division: "West" },
  { id: "MIA", name: "Miami Marlins", abbreviation: "MIA", league: "NL", division: "East" },
  { id: "MIL", name: "Milwaukee Brewers", abbreviation: "MIL", league: "NL", division: "Central" },
  { id: "MIN", name: "Minnesota Twins", abbreviation: "MIN", league: "AL", division: "Central" },
  { id: "NYM", name: "New York Mets", abbreviation: "NYM", league: "NL", division: "East" },
  { id: "NYY", name: "New York Yankees", abbreviation: "NYY", league: "AL", division: "East" },
  { id: "OAK", name: "Oakland Athletics", abbreviation: "OAK", league: "AL", division: "West" },
  { id: "PHI", name: "Philadelphia Phillies", abbreviation: "PHI", league: "NL", division: "East" },
  { id: "PIT", name: "Pittsburgh Pirates", abbreviation: "PIT", league: "NL", division: "Central" },
  { id: "SD", name: "San Diego Padres", abbreviation: "SD", league: "NL", division: "West" },
  { id: "SF", name: "San Francisco Giants", abbreviation: "SF", league: "NL", division: "West" },
  { id: "SEA", name: "Seattle Mariners", abbreviation: "SEA", league: "AL", division: "West" },
  { id: "STL", name: "St. Louis Cardinals", abbreviation: "STL", league: "NL", division: "Central" },
  { id: "TB", name: "Tampa Bay Rays", abbreviation: "TB", league: "AL", division: "East" },
  { id: "TEX", name: "Texas Rangers", abbreviation: "TEX", league: "AL", division: "West" },
  { id: "TOR", name: "Toronto Blue Jays", abbreviation: "TOR", league: "AL", division: "East" },
  { id: "WSH", name: "Washington Nationals", abbreviation: "WSH", league: "NL", division: "East" }
];

// Generate mock bet data
const generateMockBets = (count: number): Bet[] => {
  const bets: Bet[] = [];
  const betTypes: BetType[] = ['moneyline', 'runline', 'total', 'prop'];
  const results: BetResult[] = ['win', 'loss', 'push', 'pending'];
  const gameTimes: GameTime[] = ['day', 'night'];
  const gameLocations: GameLocation[] = ['home', 'away'];
  const tags = ['value', 'sharp', 'fade public', 'model pick', 'contrarian', 'injury impact', 'weather play'];
  
  for(let i = 0; i < count; i++) {
    const homeTeamIndex = Math.floor(Math.random() * MLB_TEAMS.length);
    let awayTeamIndex = Math.floor(Math.random() * MLB_TEAMS.length);
    // Ensure teams are different
    while(awayTeamIndex === homeTeamIndex) {
      awayTeamIndex = Math.floor(Math.random() * MLB_TEAMS.length);
    }
    
    const homeTeam = MLB_TEAMS[homeTeamIndex];
    const awayTeam = MLB_TEAMS[awayTeamIndex];
    const betType = betTypes[Math.floor(Math.random() * betTypes.length)];
    
    let selection = '';
    let betDetails = '';
    
    switch(betType) {
      case 'moneyline':
        selection = Math.random() > 0.5 ? homeTeam.name : awayTeam.name;
        break;
      case 'runline':
        if(Math.random() > 0.5) {
          selection = `${homeTeam.name} -1.5`;
        } else {
          selection = `${awayTeam.name} +1.5`;
        }
        break;
      case 'total':
        const runLine = 7.5 + Math.floor(Math.random() * 5);
        selection = Math.random() > 0.5 ? `Over ${runLine}` : `Under ${runLine}`;
        break;
      case 'prop':
        const players = ['Aaron Judge', 'Shohei Ohtani', 'Juan Soto', 'Mike Trout', 'Fernando Tatis Jr.'];
        const props = ['HR', 'Hits', 'RBIs', 'Strikeouts', 'Total Bases'];
        const player = players[Math.floor(Math.random() * players.length)];
        const prop = props[Math.floor(Math.random() * props.length)];
        const line = 0.5 + Math.floor(Math.random() * 4);
        selection = `${player} ${prop} ${Math.random() > 0.5 ? 'Over' : 'Under'} ${line}`;
        break;
    }
    
    // Generate random odds between -250 and +250
    const odds = Math.random() > 0.5 
      ? -(Math.floor(Math.random() * 200) + 100) // Negative odds
      : (Math.floor(Math.random() * 200) + 100); // Positive odds
    
    // Generate random stake between $10 and $200
    const stake = 10 + Math.floor(Math.random() * 190);
    
    // Calculate potential win amount
    const toWin = odds > 0 
      ? stake * (odds / 100) 
      : stake * (100 / Math.abs(odds));
    
    // Generate result
    const result = results[Math.floor(Math.random() * results.length)];
    
    // Calculate payout
    const payout = result === 'win' 
      ? stake + toWin 
      : (result === 'push' ? stake : 0);
    
    // Random tags
    const numTags = Math.floor(Math.random() * 3); // 0-2 tags
    const betTags = [];
    for (let j = 0; j < numTags; j++) {
      const tagIndex = Math.floor(Math.random() * tags.length);
      if (!betTags.includes(tags[tagIndex])) {
        betTags.push(tags[tagIndex]);
      }
    }
    
    // Random date in the last 90 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    
    bets.push({
      id: `bet-${i + 1}`,
      date: date.toISOString(),
      gameId: `game-${date.toISOString().split('T')[0]}-${homeTeam.abbreviation}-${awayTeam.abbreviation}`,
      homeTeam: homeTeam.name,
      awayTeam: awayTeam.name,
      betType,
      selection,
      odds,
      stake,
      result,
      league: 'MLB',
      season: '2025',
      gameTime: gameTimes[Math.floor(Math.random() * gameTimes.length)],
      gameLocation: gameLocations[Math.floor(Math.random() * gameLocations.length)],
      notes: '',
      tags: betTags,
      toWin: parseFloat(toWin.toFixed(2)),
      payout: parseFloat(payout.toFixed(2)),
      weather: Math.random() > 0.7 ? 'Clear' : Math.random() > 0.5 ? 'Partly Cloudy' : 'Rain',
      temperature: 60 + Math.floor(Math.random() * 30), // 60-90 degrees
      windSpeed: Math.floor(Math.random() * 15),
      windDirection: ['N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW'][Math.floor(Math.random() * 8)],
      createdAt: new Date().toISOString(),
    });
  }
  
  // Sort by date (newest first)
  return bets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Team color mapping for visualizations
const teamColors: Record<string, string> = {
  "Arizona Diamondbacks": "#A71930",
  "Atlanta Braves": "#CE1141",
  "Baltimore Orioles": "#DF4601",
  "Boston Red Sox": "#BD3039",
  "Chicago Cubs": "#0E3386",
  "Chicago White Sox": "#27251F",
  "Cincinnati Reds": "#C6011F",
  "Cleveland Guardians": "#00385D",
  "Colorado Rockies": "#333366",
  "Detroit Tigers": "#0C2340",
  "Houston Astros": "#EB6E1F",
  "Kansas City Royals": "#004687",
  "Los Angeles Angels": "#BA0021",
  "Los Angeles Dodgers": "#005A9C",
  "Miami Marlins": "#00A3E0",
  "Milwaukee Brewers": "#0A2351",
  "Minnesota Twins": "#002B5C",
  "New York Mets": "#FF5910",
  "New York Yankees": "#0C2340",
  "Oakland Athletics": "#003831",
  "Philadelphia Phillies": "#E81828",
  "Pittsburgh Pirates": "#FDB827",
  "San Diego Padres": "#2F241D",
  "San Francisco Giants": "#FD5A1E",
  "Seattle Mariners": "#0C2C56",
  "St. Louis Cardinals": "#C41E3A",
  "Tampa Bay Rays": "#092C5C",
  "Texas Rangers": "#003278",
  "Toronto Blue Jays": "#134A8E",
  "Washington Nationals": "#AB0003"
};

// Function to calculate analytics from bet data
const calculateAnalytics = (bets: Bet[]): AnalyticsData => {
  const wins = bets.filter(bet => bet.result === 'win').length;
  const losses = bets.filter(bet => bet.result === 'loss').length;
  const pushes = bets.filter(bet => bet.result === 'push').length;
  const pendingBets = bets.filter(bet => bet.result === 'pending').length;
  
  const completedBets = bets.filter(bet => bet.result !== 'pending');
  const winRate = completedBets.length > 0 ? (wins / (wins + losses)) * 100 : 0;
  
  const totalStaked = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const totalReturns = bets.reduce((sum, bet) => sum + bet.payout, 0);
  const netProfit = totalReturns - totalStaked;
  const roi = totalStaked > 0 ? (netProfit / totalStaked) * 100 : 0;
  
  // Calculate average odds
  const completedBetsWithOdds = completedBets.filter(bet => bet.odds !== 0);
  const totalOdds = completedBetsWithOdds.reduce((sum, bet) => {
    // Convert American odds to decimal for calculation
    const decimalOdds = bet.odds > 0 
      ? 1 + (bet.odds / 100) 
      : 1 + (100 / Math.abs(bet.odds));
    return sum + decimalOdds;
  }, 0);
  const averageOdds = completedBetsWithOdds.length > 0 
    ? totalOdds / completedBetsWithOdds.length 
    : 0;
  
  // Find biggest win and loss
  const wins2 = bets.filter(bet => bet.result === 'win');
  const losses2 = bets.filter(bet => bet.result === 'loss');
  
  const biggestWin = wins2.length > 0 
    ? Math.max(...wins2.map(bet => bet.payout - bet.stake)) 
    : 0;
  
  const biggestLoss = losses2.length > 0 
    ? Math.max(...losses2.map(bet => bet.stake)) 
    : 0;
  
  // Calculate streaks
  let currentStreak = { type: 'win' as 'win' | 'loss', count: 0 };
  let longestWinStreak = 0;
  let longestLoseStreak = 0;
  let currentWinStreak = 0;
  let currentLoseStreak = 0;
  
  // Sort bets by date for streak calculation
  const sortedBets = [...bets].filter(bet => bet.result !== 'pending' && bet.result !== 'push')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  sortedBets.forEach(bet => {
    if (bet.result === 'win') {
      currentWinStreak++;
      currentLoseStreak = 0;
      if (currentWinStreak > longestWinStreak) {
        longestWinStreak = currentWinStreak;
      }
    } else if (bet.result === 'loss') {
      currentLoseStreak++;
      currentWinStreak = 0;
      if (currentLoseStreak > longestLoseStreak) {
        longestLoseStreak = currentLoseStreak;
      }
    }
  });
  
  // Determine current streak
  if (sortedBets.length > 0) {
    const lastBet = sortedBets[sortedBets.length - 1];
    if (lastBet.result === 'win') {
      currentStreak = { type: 'win', count: currentWinStreak };
    } else {
      currentStreak = { type: 'loss', count: currentLoseStreak };
    }
  }
  
  // Calculate bet type breakdown
  const betTypes: BetType[] = ['moneyline', 'runline', 'total', 'prop'];
  const betTypeBreakdown = betTypes.map(type => {
    const typeBets = bets.filter(bet => bet.betType === type);
    const typeWins = typeBets.filter(bet => bet.result === 'win').length;
    const typeLosses = typeBets.filter(bet => bet.result === 'loss').length;
    const typeWinRate = typeLosses + typeWins > 0 ? (typeWins / (typeWins + typeLosses)) * 100 : 0;
    const typeStaked = typeBets.reduce((sum, bet) => sum + bet.stake, 0);
    const typeReturns = typeBets.reduce((sum, bet) => sum + bet.payout, 0);
    const typeProfit = typeReturns - typeStaked;
    
    return {
      type,
      count: typeBets.length,
      winRate: typeWinRate,
      profit: typeProfit
    };
  });
  
  // Calculate team performance
  const uniqueTeams = Array.from(new Set(bets.flatMap(bet => [bet.homeTeam, bet.awayTeam])));
  const teamPerformance = uniqueTeams.map(team => {
    const teamBets = bets.filter(bet => 
      (bet.selection.includes(team) || (
        bet.betType === 'total' && (bet.homeTeam === team || bet.awayTeam === team)
      ))
    );
    
    const teamWins = teamBets.filter(bet => bet.result === 'win').length;
    const teamLosses = teamBets.filter(bet => bet.result === 'loss').length;
    const teamWinRate = teamLosses + teamWins > 0 ? (teamWins / (teamWins + teamLosses)) * 100 : 0;
    
    const teamStaked = teamBets.reduce((sum, bet) => sum + bet.stake, 0);
    const teamReturns = teamBets.reduce((sum, bet) => sum + bet.payout, 0);
    const teamProfit = teamReturns - teamStaked;
    
    return {
      team,
      bets: teamBets.length,
      wins: teamWins,
      winRate: teamWinRate,
      profit: teamProfit
    };
  }).filter(team => team.bets > 0)
    .sort((a, b) => b.bets - a.bets);
  
  // Calculate monthly performance
  const months: Record<string, { bets: Bet[], wins: number, losses: number, stake: number, returns: number }> = {};
  
  bets.forEach(bet => {
    const month = bet.date.substring(0, 7); // YYYY-MM
    
    if (!months[month]) {
      months[month] = { bets: [], wins: 0, losses: 0, stake: 0, returns: 0 };
    }
    
    months[month].bets.push(bet);
    
    if (bet.result === 'win') {
      months[month].wins++;
    } else if (bet.result === 'loss') {
      months[month].losses++;
    }
    
    months[month].stake += bet.stake;
    months[month].returns += bet.payout;
  });
  
  const monthlyPerformance = Object.entries(months).map(([month, data]) => {
    const winRate = data.wins + data.losses > 0 
      ? (data.wins / (data.wins + data.losses)) * 100 
      : 0;
    const profit = data.returns - data.stake;
    
    // Format month name
    const date = new Date(month + '-01');
    const formattedMonth = format(date, 'MMM yyyy');
    
    return {
      month: formattedMonth,
      bets: data.bets.length,
      winRate,
      profit
    };
  }).sort((a, b) => {
    // Sort by month
    const aDate = new Date(a.month);
    const bDate = new Date(b.month);
    return aDate.getTime() - bDate.getTime();
  });
  
  // Calculate day vs night performance
  const dayBets = bets.filter(bet => bet.gameTime === 'day');
  const nightBets = bets.filter(bet => bet.gameTime === 'night');
  
  const dayWins = dayBets.filter(bet => bet.result === 'win').length;
  const dayLosses = dayBets.filter(bet => bet.result === 'loss').length;
  const dayWinRate = dayWins + dayLosses > 0 ? (dayWins / (dayWins + dayLosses)) * 100 : 0;
  
  const nightWins = nightBets.filter(bet => bet.result === 'win').length;
  const nightLosses = nightBets.filter(bet => bet.result === 'loss').length;
  const nightWinRate = nightWins + nightLosses > 0 ? (nightWins / (nightWins + nightLosses)) * 100 : 0;
  
  const dayStaked = dayBets.reduce((sum, bet) => sum + bet.stake, 0);
  const dayReturns = dayBets.reduce((sum, bet) => sum + bet.payout, 0);
  const dayProfit = dayReturns - dayStaked;
  
  const nightStaked = nightBets.reduce((sum, bet) => sum + bet.stake, 0);
  const nightReturns = nightBets.reduce((sum, bet) => sum + bet.payout, 0);
  const nightProfit = nightReturns - nightStaked;
  
  const dayVsNight = [
    { time: 'day' as GameTime, bets: dayBets.length, winRate: dayWinRate, profit: dayProfit },
    { time: 'night' as GameTime, bets: nightBets.length, winRate: nightWinRate, profit: nightProfit }
  ];
  
  // Calculate home vs away performance
  const homeBets = bets.filter(bet => bet.gameLocation === 'home');
  const awayBets = bets.filter(bet => bet.gameLocation === 'away');
  
  const homeWins = homeBets.filter(bet => bet.result === 'win').length;
  const homeLosses = homeBets.filter(bet => bet.result === 'loss').length;
  const homeWinRate = homeWins + homeLosses > 0 ? (homeWins / (homeWins + homeLosses)) * 100 : 0;
  
  const awayWins = awayBets.filter(bet => bet.result === 'win').length;
  const awayLosses = awayBets.filter(bet => bet.result === 'loss').length;
  const awayWinRate = awayWins + awayLosses > 0 ? (awayWins / (awayWins + awayLosses)) * 100 : 0;
  
  const homeStaked = homeBets.reduce((sum, bet) => sum + bet.stake, 0);
  const homeReturns = homeBets.reduce((sum, bet) => sum + bet.payout, 0);
  const homeProfit = homeReturns - homeStaked;
  
  const awayStaked = awayBets.reduce((sum, bet) => sum + bet.stake, 0);
  const awayReturns = awayBets.reduce((sum, bet) => sum + bet.payout, 0);
  const awayProfit = awayReturns - awayStaked;
  
  const homeVsAway = [
    { location: 'home' as GameLocation, bets: homeBets.length, winRate: homeWinRate, profit: homeProfit },
    { location: 'away' as GameLocation, bets: awayBets.length, winRate: awayWinRate, profit: awayProfit }
  ];
  
  // Calculate tag performance
  const uniqueTags = Array.from(new Set(bets.flatMap(bet => bet.tags)));
  const tagPerformance = uniqueTags.map(tag => {
    const tagBets = bets.filter(bet => bet.tags.includes(tag));
    
    const tagWins = tagBets.filter(bet => bet.result === 'win').length;
    const tagLosses = tagBets.filter(bet => bet.result === 'loss').length;
    const tagWinRate = tagLosses + tagWins > 0 ? (tagWins / (tagWins + tagLosses)) * 100 : 0;
    
    const tagStaked = tagBets.reduce((sum, bet) => sum + bet.stake, 0);
    const tagReturns = tagBets.reduce((sum, bet) => sum + bet.payout, 0);
    const tagProfit = tagReturns - tagStaked;
    
    return {
      tag,
      bets: tagBets.length,
      winRate: tagWinRate,
      profit: tagProfit
    };
  }).sort((a, b) => b.bets - a.bets);
  
  return {
    totalBets: bets.length,
    wins,
    losses,
    pushes,
    pendingBets,
    winRate,
    totalStaked,
    totalReturns,
    netProfit,
    roi,
    averageOdds,
    biggestWin,
    biggestLoss,
    longestWinStreak,
    longestLoseStreak,
    currentStreak,
    betTypeBreakdown,
    teamPerformance,
    monthlyPerformance,
    dayVsNight,
    homeVsAway,
    tagPerformance
  };
};

// Generate and use our mock bet data
const initialBets = generateMockBets(75);

// Helper function to convert American odds to decimal
const americanToDecimal = (americanOdds: number): number => {
  if (americanOdds > 0) {
    return 1 + (americanOdds / 100);
  } else {
    return 1 + (100 / Math.abs(americanOdds));
  }
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Main component
export default function BetTracker() {
  const [activeTab, setActiveTab] = useState("tracker");
  const [bets, setBets] = useState<Bet[]>(initialBets);
  const [filteredBets, setFilteredBets] = useState<Bet[]>(initialBets);
  const [analytics, setAnalytics] = useState<AnalyticsData>(calculateAnalytics(initialBets));
  const [filterOptions, setFilterOptions] = useState<BetFilterOptions>({
    dateRange: null,
    betTypes: [],
    results: [],
    teams: [],
    gameTime: [],
    gameLocation: [],
    minOdds: null,
    maxOdds: null,
    tags: []
  });
  
  const [newBetDialogOpen, setNewBetDialogOpen] = useState(false);
  const [quickFiltersOpen, setQuickFiltersOpen] = useState(false);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [editBetId, setEditBetId] = useState<string | null>(null);
  
  // Form state for new/edit bet
  const [betForm, setBetForm] = useState<Partial<Bet>>({
    homeTeam: '',
    awayTeam: '',
    betType: 'moneyline',
    selection: '',
    odds: 0,
    stake: 0,
    result: 'pending',
    gameTime: 'day',
    gameLocation: 'home',
    notes: '',
    tags: [],
    date: new Date().toISOString()
  });
  
  const [viewMode, setViewMode] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortField, setSortField] = useState<keyof Bet>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const { toast } = useToast();
  
  // Apply filters to bets
  useEffect(() => {
    let result = [...bets];
    
    // Filter by date range
    if (filterOptions.dateRange && filterOptions.dateRange.start && filterOptions.dateRange.end) {
      result = result.filter(bet => {
        const betDate = new Date(bet.date);
        return betDate >= filterOptions.dateRange!.start! && 
               betDate <= filterOptions.dateRange!.end!;
      });
    }
    
    // Filter by bet type
    if (filterOptions.betTypes.length > 0) {
      result = result.filter(bet => filterOptions.betTypes.includes(bet.betType));
    }
    
    // Filter by result
    if (filterOptions.results.length > 0) {
      result = result.filter(bet => filterOptions.results.includes(bet.result));
    }
    
    // Filter by teams
    if (filterOptions.teams.length > 0) {
      result = result.filter(bet => 
        filterOptions.teams.includes(bet.homeTeam) || 
        filterOptions.teams.includes(bet.awayTeam)
      );
    }
    
    // Filter by game time
    if (filterOptions.gameTime.length > 0) {
      result = result.filter(bet => filterOptions.gameTime.includes(bet.gameTime));
    }
    
    // Filter by game location
    if (filterOptions.gameLocation.length > 0) {
      result = result.filter(bet => filterOptions.gameLocation.includes(bet.gameLocation));
    }
    
    // Filter by odds range
    if (filterOptions.minOdds !== null) {
      result = result.filter(bet => bet.odds >= filterOptions.minOdds!);
    }
    if (filterOptions.maxOdds !== null) {
      result = result.filter(bet => bet.odds <= filterOptions.maxOdds!);
    }
    
    // Filter by tags
    if (filterOptions.tags.length > 0) {
      result = result.filter(bet => 
        filterOptions.tags.some(tag => bet.tags.includes(tag))
      );
    }
    
    setFilteredBets(result);
  }, [bets, filterOptions]);
  
  // Update analytics when filtered bets change
  useEffect(() => {
    setAnalytics(calculateAnalytics(filteredBets));
  }, [filteredBets]);
  
  // Apply view mode filters
  useEffect(() => {
    let dateRange = null;
    
    switch (viewMode) {
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dateRange = { start: today, end: new Date() };
        break;
      case 'week':
        const weekStart = startOfWeek(new Date());
        const weekEnd = endOfWeek(new Date());
        dateRange = { start: weekStart, end: weekEnd };
        break;
      case 'month':
        const monthStart = startOfMonth(new Date());
        const monthEnd = endOfMonth(new Date());
        dateRange = { start: monthStart, end: monthEnd };
        break;
      default:
        dateRange = null;
    }
    
    setFilterOptions(prev => ({
      ...prev,
      dateRange
    }));
  }, [viewMode]);
  
  // Effect to handle bet form calculation of toWin
  useEffect(() => {
    if (betForm.odds && betForm.stake) {
      const odds = betForm.odds;
      const stake = betForm.stake;
      
      const toWin = odds > 0 
        ? stake * (odds / 100)
        : stake * (100 / Math.abs(odds));
      
      setBetForm(prev => ({
        ...prev,
        toWin: parseFloat(toWin.toFixed(2))
      }));
    }
  }, [betForm.odds, betForm.stake]);
  
  // Sort filtered bets
  const sortedBets = [...filteredBets].sort((a, b) => {
    let aValue = a[sortField] || 0;
    let bValue = b[sortField] || 0;
    
    if (sortField === 'date') {
      aValue = new Date(a.date).getTime();
      bValue = new Date(b.date).getTime();
    }
    
    if (aValue === bValue) return 0;
    
    const comparison = aValue < bValue ? -1 : 1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  // Handle adding a new bet
  const handleAddBet = () => {
    // Validate form
    if (!betForm.homeTeam || !betForm.awayTeam || !betForm.betType || !betForm.selection || !betForm.odds || !betForm.stake) {
      toast({
        title: "Missing required fields",
        description: "Please fill out all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    const newBet: Bet = {
      id: editBetId || `bet-${Date.now()}`,
      date: betForm.date || new Date().toISOString(),
      gameId: `game-${new Date().toISOString().split('T')[0]}-${betForm.homeTeam}-${betForm.awayTeam}`,
      homeTeam: betForm.homeTeam!,
      awayTeam: betForm.awayTeam!,
      betType: betForm.betType as BetType,
      selection: betForm.selection!,
      odds: betForm.odds!,
      stake: betForm.stake!,
      result: betForm.result as BetResult,
      league: 'MLB',
      season: '2025',
      gameTime: betForm.gameTime as GameTime,
      gameLocation: betForm.gameLocation as GameLocation,
      notes: betForm.notes || '',
      tags: betForm.tags || [],
      toWin: betForm.toWin || 0,
      payout: betForm.result === 'win' 
        ? (betForm.stake! + (betForm.toWin || 0)) 
        : (betForm.result === 'push' ? betForm.stake! : 0),
      weather: betForm.weather,
      temperature: betForm.temperature,
      windSpeed: betForm.windSpeed,
      windDirection: betForm.windDirection,
      createdAt: new Date().toISOString(),
    };
    
    if (editBetId) {
      // Editing existing bet
      const updatedBets = bets.map(bet => bet.id === editBetId ? newBet : bet);
      setBets(updatedBets);
      toast({
        title: "Bet updated",
        description: "Your bet has been updated successfully."
      });
    } else {
      // Adding new bet
      setBets([newBet, ...bets]);
      toast({
        title: "Bet added",
        description: "Your bet has been added successfully."
      });
    }
    
    // Reset form and close dialog
    setBetForm({
      homeTeam: '',
      awayTeam: '',
      betType: 'moneyline',
      selection: '',
      odds: 0,
      stake: 0,
      result: 'pending',
      gameTime: 'day',
      gameLocation: 'home',
      notes: '',
      tags: [],
      date: new Date().toISOString()
    });
    setEditBetId(null);
    setNewBetDialogOpen(false);
  };
  
  // Handle editing a bet
  const handleEditBet = (id: string) => {
    const betToEdit = bets.find(bet => bet.id === id);
    if (betToEdit) {
      setBetForm(betToEdit);
      setEditBetId(id);
      setNewBetDialogOpen(true);
    }
  };
  
  // Handle deleting a bet
  const handleDeleteBet = (id: string) => {
    const updatedBets = bets.filter(bet => bet.id !== id);
    setBets(updatedBets);
    toast({
      title: "Bet deleted",
      description: "Your bet has been deleted successfully."
    });
  };
  
  // Handle updating bet result
  const handleUpdateResult = (id: string, result: BetResult) => {
    const betToUpdate = bets.find(bet => bet.id === id);
    if (betToUpdate) {
      const updatedBet = {
        ...betToUpdate,
        result,
        payout: result === 'win' 
          ? (betToUpdate.stake + betToUpdate.toWin) 
          : (result === 'push' ? betToUpdate.stake : 0),
      };
      
      const updatedBets = bets.map(bet => bet.id === id ? updatedBet : bet);
      setBets(updatedBets);
      
      toast({
        title: "Result updated",
        description: `Bet marked as ${result}.`
      });
    }
  };
  
  // Handle team selection in new bet form
  const handleTeamSelect = (team: string, type: 'home' | 'away') => {
    setBetForm(prev => ({
      ...prev,
      [type === 'home' ? 'homeTeam' : 'awayTeam']: team
    }));
  };
  
  // Get the color class for ROI and P/L display
  const getColorClass = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };
  
  // Determine win rate color class
  const getWinRateColorClass = (winRate: number) => {
    if (winRate >= 55) return 'text-green-600';
    if (winRate >= 52.4) return 'text-lime-600';
    if (winRate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <>
      <Helmet>
        <title>Bet Tracker | MLB Edge</title>
        <meta name="description" content="Track and analyze your MLB bets for better performance" />
      </Helmet>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold font-heading bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">Bet Tracker</h1>
              <p className="text-gray-600">
                Track your MLB bets, analyze performance, and improve your results
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    <span>Quick Filters</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Time Period</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setViewMode('all')}>
                    All Time {viewMode === 'all' && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewMode('today')}>
                    Today {viewMode === 'today' && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewMode('week')}>
                    This Week {viewMode === 'week' && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewMode('month')}>
                    This Month {viewMode === 'month' && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Bet Result</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterOptions(prev => ({
                    ...prev, 
                    results: []
                  }))}>
                    All Results {filterOptions.results.length === 0 && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterOptions(prev => ({
                    ...prev, 
                    results: ['win']
                  }))}>
                    Wins Only {filterOptions.results.includes('win') && filterOptions.results.length === 1 && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterOptions(prev => ({
                    ...prev, 
                    results: ['loss']
                  }))}>
                    Losses Only {filterOptions.results.includes('loss') && filterOptions.results.length === 1 && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterOptions(prev => ({
                    ...prev, 
                    results: ['pending']
                  }))}>
                    Pending Only {filterOptions.results.includes('pending') && filterOptions.results.length === 1 && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Dialog open={advancedFiltersOpen} onOpenChange={setAdvancedFiltersOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Advanced Filters</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Advanced Filters</DialogTitle>
                    <DialogDescription>
                      Filter your bets with advanced criteria
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label>Bet Types</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['moneyline', 'runline', 'total', 'prop'] as BetType[]).map(type => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`bet-type-${type}`} 
                              checked={filterOptions.betTypes.includes(type)}
                              onCheckedChange={(checked) => {
                                setFilterOptions(prev => {
                                  if (checked) {
                                    return { ...prev, betTypes: [...prev.betTypes, type] };
                                  } else {
                                    return { ...prev, betTypes: prev.betTypes.filter(t => t !== type) };
                                  }
                                });
                              }}
                            />
                            <label
                              htmlFor={`bet-type-${type}`}
                              className="text-sm font-medium leading-none cursor-pointer capitalize"
                            >
                              {type}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Bet Results</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['win', 'loss', 'push', 'pending'] as BetResult[]).map(result => (
                          <div key={result} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`bet-result-${result}`} 
                              checked={filterOptions.results.includes(result)}
                              onCheckedChange={(checked) => {
                                setFilterOptions(prev => {
                                  if (checked) {
                                    return { ...prev, results: [...prev.results, result] };
                                  } else {
                                    return { ...prev, results: prev.results.filter(r => r !== result) };
                                  }
                                });
                              }}
                            />
                            <label
                              htmlFor={`bet-result-${result}`}
                              className="text-sm font-medium leading-none cursor-pointer capitalize"
                            >
                              {result}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Game Time</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="game-time-day" 
                            checked={filterOptions.gameTime.includes('day')}
                            onCheckedChange={(checked) => {
                              setFilterOptions(prev => {
                                if (checked) {
                                  return { ...prev, gameTime: [...prev.gameTime, 'day'] };
                                } else {
                                  return { ...prev, gameTime: prev.gameTime.filter(t => t !== 'day') };
                                }
                              });
                            }}
                          />
                          <label
                            htmlFor="game-time-day"
                            className="text-sm font-medium leading-none cursor-pointer flex items-center gap-1"
                          >
                            <Sun className="h-3 w-3" /> Day Games
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="game-time-night" 
                            checked={filterOptions.gameTime.includes('night')}
                            onCheckedChange={(checked) => {
                              setFilterOptions(prev => {
                                if (checked) {
                                  return { ...prev, gameTime: [...prev.gameTime, 'night'] };
                                } else {
                                  return { ...prev, gameTime: prev.gameTime.filter(t => t !== 'night') };
                                }
                              });
                            }}
                          />
                          <label
                            htmlFor="game-time-night"
                            className="text-sm font-medium leading-none cursor-pointer flex items-center gap-1"
                          >
                            <Moon className="h-3 w-3" /> Night Games
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Game Location</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="game-location-home" 
                            checked={filterOptions.gameLocation.includes('home')}
                            onCheckedChange={(checked) => {
                              setFilterOptions(prev => {
                                if (checked) {
                                  return { ...prev, gameLocation: [...prev.gameLocation, 'home'] };
                                } else {
                                  return { ...prev, gameLocation: prev.gameLocation.filter(l => l !== 'home') };
                                }
                              });
                            }}
                          />
                          <label
                            htmlFor="game-location-home"
                            className="text-sm font-medium leading-none cursor-pointer flex items-center gap-1"
                          >
                            <Home className="h-3 w-3" /> Home Games
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="game-location-away" 
                            checked={filterOptions.gameLocation.includes('away')}
                            onCheckedChange={(checked) => {
                              setFilterOptions(prev => {
                                if (checked) {
                                  return { ...prev, gameLocation: [...prev.gameLocation, 'away'] };
                                } else {
                                  return { ...prev, gameLocation: prev.gameLocation.filter(l => l !== 'away') };
                                }
                              });
                            }}
                          />
                          <label
                            htmlFor="game-location-away"
                            className="text-sm font-medium leading-none cursor-pointer flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" /> Away Games
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['value', 'sharp', 'fade public', 'model pick', 'contrarian'].map(tag => (
                          <div key={tag} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`tag-${tag}`} 
                              checked={filterOptions.tags.includes(tag)}
                              onCheckedChange={(checked) => {
                                setFilterOptions(prev => {
                                  if (checked) {
                                    return { ...prev, tags: [...prev.tags, tag] };
                                  } else {
                                    return { ...prev, tags: prev.tags.filter(t => t !== tag) };
                                  }
                                });
                              }}
                            />
                            <label
                              htmlFor={`tag-${tag}`}
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              {tag}
                            </label>
                          </div>
                        )))}
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setFilterOptions({
                          dateRange: null,
                          betTypes: [],
                          results: [],
                          teams: [],
                          gameTime: [],
                          gameLocation: [],
                          minOdds: null,
                          maxOdds: null,
                          tags: []
                        });
                        setViewMode('all');
                      }}
                    >
                      Reset All Filters
                    </Button>
                    <Button onClick={() => setAdvancedFiltersOpen(false)}>
                      Apply Filters
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={newBetDialogOpen} onOpenChange={setNewBetDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    <span>Add Bet</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editBetId ? 'Edit Bet' : 'Add New Bet'}</DialogTitle>
                    <DialogDescription>
                      {editBetId ? 'Update your bet details' : 'Track a new baseball bet'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input 
                        id="date" 
                        type="date" 
                        value={betForm.date ? betForm.date.split('T')[0] : new Date().toISOString().split('T')[0]}
                        onChange={(e) => 
                          setBetForm(prev => ({ 
                            ...prev, 
                            date: new Date(e.target.value).toISOString() 
                          }))
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="homeTeam">Home Team</Label>
                      <Select 
                        value={betForm.homeTeam || ''} 
                        onValueChange={(val) => handleTeamSelect(val, 'home')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select home team" />
                        </SelectTrigger>
                        <SelectContent>
                          {MLB_TEAMS.map(team => (
                            <SelectItem key={team.id} value={team.name}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="awayTeam">Away Team</Label>
                      <Select 
                        value={betForm.awayTeam || ''} 
                        onValueChange={(val) => handleTeamSelect(val, 'away')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select away team" />
                        </SelectTrigger>
                        <SelectContent>
                          {MLB_TEAMS.map(team => (
                            <SelectItem key={team.id} value={team.name}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="betType">Bet Type</Label>
                        <Select 
                          value={betForm.betType || 'moneyline'} 
                          onValueChange={(val) => setBetForm(prev => ({ ...prev, betType: val as BetType }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select bet type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="moneyline">Moneyline</SelectItem>
                            <SelectItem value="runline">Run Line</SelectItem>
                            <SelectItem value="total">Total (Over/Under)</SelectItem>
                            <SelectItem value="prop">Player Prop</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="result">Result</Label>
                        <Select 
                          value={betForm.result || 'pending'} 
                          onValueChange={(val) => setBetForm(prev => ({ ...prev, result: val as BetResult }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select result" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="win">Win</SelectItem>
                            <SelectItem value="loss">Loss</SelectItem>
                            <SelectItem value="push">Push</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="selection">Selection</Label>
                      <Input 
                        id="selection" 
                        placeholder="e.g. Dodgers -1.5, Over 8.5, etc." 
                        value={betForm.selection || ''}
                        onChange={(e) => setBetForm(prev => ({ ...prev, selection: e.target.value }))}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="odds">American Odds</Label>
                        <Input 
                          id="odds" 
                          type="number" 
                          placeholder="-110, +150, etc." 
                          value={betForm.odds || ''}
                          onChange={(e) => setBetForm(prev => ({ 
                            ...prev, 
                            odds: parseInt(e.target.value, 10) 
                          }))}
                        />
                        <p className="text-xs text-gray-500">
                          {betForm.odds ? 
                            `Decimal odds: ${americanToDecimal(betForm.odds).toFixed(2)}` : 
                            'Enter American odds'}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="stake">Stake Amount ($)</Label>
                        <Input 
                          id="stake" 
                          type="number" 
                          placeholder="Enter stake amount" 
                          value={betForm.stake || ''}
                          onChange={(e) => setBetForm(prev => ({ 
                            ...prev, 
                            stake: parseFloat(e.target.value) 
                          }))}
                        />
                        <p className="text-xs text-gray-500">
                          {betForm.toWin ? 
                            `To win: $${betForm.toWin.toFixed(2)}` : 
                            'Enter stake amount'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gameTime">Game Time</Label>
                        <Select 
                          value={betForm.gameTime || 'day'} 
                          onValueChange={(val) => setBetForm(prev => ({ ...prev, gameTime: val as GameTime }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select game time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="day">Day Game</SelectItem>
                            <SelectItem value="night">Night Game</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="gameLocation">Game Location</Label>
                        <Select 
                          value={betForm.gameLocation || 'home'} 
                          onValueChange={(val) => setBetForm(prev => ({ ...prev, gameLocation: val as GameLocation }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="home">Home Game</SelectItem>
                            <SelectItem value="away">Away Game</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (Optional)</Label>
                      <Select 
                        onValueChange={(value) => {
                          setBetForm(prev => {
                            const currentTags = prev.tags || [];
                            if (!currentTags.includes(value)) {
                              return { ...prev, tags: [...currentTags, value] };
                            }
                            return prev;
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Add a tag" />
                        </SelectTrigger>
                        <SelectContent>
                          {['value', 'sharp', 'fade public', 'model pick', 'contrarian', 'injury impact', 'weather play'].map(tag => (
                            <SelectItem key={tag} value={tag}>
                              {tag}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {(betForm.tags && betForm.tags.length > 0) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {betForm.tags.map(tag => (
                            <Badge 
                              key={tag} 
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              {tag}
                              <button
                                onClick={() => setBetForm(prev => ({
                                  ...prev,
                                  tags: prev.tags?.filter(t => t !== tag) || []
                                }))}
                                className="ml-1 rounded-full"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Input 
                        id="notes" 
                        placeholder="Any additional notes" 
                        value={betForm.notes || ''}
                        onChange={(e) => setBetForm(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit" onClick={handleAddBet}>
                      {editBetId ? 'Update Bet' : 'Add Bet'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <span className="text-sm font-semibold uppercase text-gray-500">Win Rate</span>
                  <div className={`text-2xl font-bold ${getWinRateColorClass(analytics.winRate)}`}>
                    {analytics.winRate.toFixed(1)}%
                  </div>
                  <span className="text-xs text-gray-500 block mt-1">
                    {analytics.wins} - {analytics.losses}
                    {analytics.pushes > 0 ? ` - ${analytics.pushes}p` : ''}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <span className="text-sm font-semibold uppercase text-gray-500">Profit/Loss</span>
                  <div className={`text-2xl font-bold ${getColorClass(analytics.netProfit)}`}>
                    {formatCurrency(analytics.netProfit)}
                  </div>
                  <span className="text-xs text-gray-500 block mt-1">
                    {analytics.totalBets} total bets
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <span className="text-sm font-semibold uppercase text-gray-500">ROI</span>
                  <div className={`text-2xl font-bold ${getColorClass(analytics.roi)}`}>
                    {analytics.roi > 0 ? '+' : ''}{analytics.roi.toFixed(1)}%
                  </div>
                  <span className="text-xs text-gray-500 block mt-1">
                    {formatCurrency(analytics.totalStaked)} wagered
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <span className="text-sm font-semibold uppercase text-gray-500">Current Streak</span>
                  <div className={`text-2xl font-bold ${analytics.currentStreak.type === 'win' ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics.currentStreak.count} {analytics.currentStreak.type === 'win' ? 'W' : 'L'}
                  </div>
                  <span className="text-xs text-gray-500 block mt-1">
                    Longest: {analytics.longestWinStreak}W / {analytics.longestLoseStreak}L
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="tracker">
                <BarChart3 className="h-4 w-4 mr-2" />
                Bet History
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart className="h-4 w-4 mr-2" />
                Performance Analysis
              </TabsTrigger>
              <TabsTrigger value="insights">
                <Info className="h-4 w-4 mr-2" />
                MLB Edge Insights
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tracker" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row justify-between md:items-center">
                    <div>
                      <CardTitle>Bet History</CardTitle>
                      <CardDescription>Track all your MLB bets in one place</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                      <Label className="text-sm">Sort By:</Label>
                      <Select
                        value={`${sortField}-${sortDirection}`}
                        onValueChange={(value) => {
                          const [field, direction] = value.split('-');
                          setSortField(field as keyof Bet);
                          setSortDirection(direction as 'asc' | 'desc');
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                          <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                          <SelectItem value="stake-desc">Stake (High to Low)</SelectItem>
                          <SelectItem value="odds-desc">Odds (High to Low)</SelectItem>
                          <SelectItem value="odds-asc">Odds (Low to High)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Matchup</TableHead>
                          <TableHead>Bet</TableHead>
                          <TableHead className="text-right">Odds</TableHead>
                          <TableHead className="text-right">Stake</TableHead>
                          <TableHead className="text-center">Result</TableHead>
                          <TableHead className="text-right">P/L</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedBets.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                              No bets found with the current filters.
                            </TableCell>
                          </TableRow>
                        ) : (
                          sortedBets.map((bet) => (
                            <TableRow key={bet.id}>
                              <TableCell className="font-medium">
                                {format(new Date(bet.date), 'MMM d, yyyy')}
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  {bet.gameTime === 'day' ? 
                                    <Sun className="h-3 w-3" /> : 
                                    <Moon className="h-3 w-3" />
                                  }
                                  {bet.gameTime === 'day' ? 'Day' : 'Night'}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{bet.awayTeam} @ {bet.homeTeam}</div>
                                <div className="text-xs text-gray-500">{
                                  bet.gameLocation === 'home' ? 
                                    <span className="flex items-center gap-1">
                                      <Home className="h-3 w-3" /> Home Game
                                    </span> : 
                                    <span className="flex items-center gap-1">
                                      <ExternalLink className="h-3 w-3" /> Away Game
                                    </span>
                                }</div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{bet.selection}</div>
                                <div className="capitalize text-xs text-gray-500 flex items-center gap-1">
                                  <Tag className="h-3 w-3" /> {bet.betType}
                                </div>
                                {bet.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {bet.tags.map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs py-0 px-1">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="font-medium">
                                  {bet.odds > 0 ? '+' : ''}{bet.odds}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {americanToDecimal(bet.odds).toFixed(2)}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="font-medium">${bet.stake}</div>
                                <div className="text-xs text-gray-500">
                                  To win: ${bet.toWin.toFixed(2)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-center">
                                  {bet.result === 'pending' ? (
                                    <Badge variant="outline" className="capitalize">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {bet.result}
                                    </Badge>
                                  ) : bet.result === 'win' ? (
                                    <Badge className="bg-green-600 capitalize">
                                      <Check className="h-3 w-3 mr-1" />
                                      {bet.result}
                                    </Badge>
                                  ) : bet.result === 'loss' ? (
                                    <Badge variant="destructive" className="capitalize">
                                      <X className="h-3 w-3 mr-1" />
                                      {bet.result}
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="capitalize">
                                      {bet.result}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className={`text-right font-medium ${
                                bet.result === 'pending' 
                                  ? 'text-gray-400' 
                                  : bet.result === 'win' 
                                  ? 'text-green-600' 
                                  : bet.result === 'loss' 
                                  ? 'text-red-600' 
                                  : 'text-gray-600'
                              }`}>
                                {bet.result === 'pending' 
                                  ? '--' 
                                  : bet.result === 'win' 
                                  ? `+$${(bet.payout - bet.stake).toFixed(2)}` 
                                  : bet.result === 'loss' 
                                  ? `-$${bet.stake.toFixed(2)}` 
                                  : `$0.00`}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-2">
                                  {bet.result === 'pending' && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          Update
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleUpdateResult(bet.id, 'win')}>
                                          <Check className="h-4 w-4 mr-2 text-green-600" />
                                          Mark as Win
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleUpdateResult(bet.id, 'loss')}>
                                          <X className="h-4 w-4 mr-2 text-red-600" />
                                          Mark as Loss
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleUpdateResult(bet.id, 'push')}>
                                          <Minus className="h-4 w-4 mr-2" />
                                          Mark as Push
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Settings className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditBet(bet.id)}>
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => handleDeleteBet(bet.id)}
                                        className="text-red-600"
                                      >
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Bet Type Performance</CardTitle>
                    <CardDescription>
                      Performance breakdown by bet type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics.betTypeBreakdown.map((type) => (
                      <div key={type.type} className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center">
                            <span className="font-medium capitalize">{type.type}</span>
                            <Badge variant="outline" className="ml-2">
                              {type.count} bets
                            </Badge>
                          </div>
                          <div className="text-sm flex gap-4">
                            <span className={getWinRateColorClass(type.winRate)}>
                              {type.winRate.toFixed(1)}%
                            </span>
                            <span className={getColorClass(type.profit)}>
                              {type.profit >= 0 ? '+' : ''}{formatCurrency(type.profit)}
                            </span>
                          </div>
                        </div>
                        <Progress value={type.winRate} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Time & Location Analysis</CardTitle>
                    <CardDescription>
                      Performance by game time and location
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Day vs. Night Games</h4>
                        {analytics.dayVsNight.map((item) => (
                          <div key={item.time} className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center">
                                <span className="font-medium capitalize flex items-center">
                                  {item.time === 'day' ? (
                                    <><Sun className="h-4 w-4 mr-1" /> Day Games</>
                                  ) : (
                                    <><Moon className="h-4 w-4 mr-1" /> Night Games</>
                                  )}
                                </span>
                                <Badge variant="outline" className="ml-2">
                                  {item.bets} bets
                                </Badge>
                              </div>
                              <div className="text-sm flex gap-4">
                                <span className={getWinRateColorClass(item.winRate)}>
                                  {item.winRate.toFixed(1)}%
                                </span>
                                <span className={getColorClass(item.profit)}>
                                  {item.profit >= 0 ? '+' : ''}{formatCurrency(item.profit)}
                                </span>
                              </div>
                            </div>
                            <Progress value={item.winRate} className="h-2" />
                          </div>
                        ))}
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Home vs. Away Games</h4>
                        {analytics.homeVsAway.map((item) => (
                          <div key={item.location} className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center">
                                <span className="font-medium capitalize flex items-center">
                                  {item.location === 'home' ? (
                                    <><Home className="h-4 w-4 mr-1" /> Home Games</>
                                  ) : (
                                    <><ExternalLink className="h-4 w-4 mr-1" /> Away Games</>
                                  )}
                                </span>
                                <Badge variant="outline" className="ml-2">
                                  {item.bets} bets
                                </Badge>
                              </div>
                              <div className="text-sm flex gap-4">
                                <span className={getWinRateColorClass(item.winRate)}>
                                  {item.winRate.toFixed(1)}%
                                </span>
                                <span className={getColorClass(item.profit)}>
                                  {item.profit >= 0 ? '+' : ''}{formatCurrency(item.profit)}
                                </span>
                              </div>
                            </div>
                            <Progress value={item.winRate} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Team Performance</CardTitle>
                    <CardDescription>
                      Win rate and profit by team
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {analytics.teamPerformance.slice(0, 10).map((team) => (
                        <div key={team.team} className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center">
                              <span className="font-medium" style={{ color: teamColors[team.team] || '#888' }}>
                                {team.team}
                              </span>
                              <Badge variant="outline" className="ml-2">
                                {team.bets} bets
                              </Badge>
                            </div>
                            <div className="text-sm flex gap-4">
                              <span className={getWinRateColorClass(team.winRate)}>
                                {team.winRate.toFixed(1)}%
                              </span>
                              <span className={getColorClass(team.profit)}>
                                {team.profit >= 0 ? '+' : ''}{formatCurrency(team.profit)}
                              </span>
                            </div>
                          </div>
                          <Progress 
                            value={team.winRate} 
                            className="h-2" 
                            style={{ 
                              backgroundColor: `${teamColors[team.team]}20`,
                              "--progress-background": teamColors[team.team] || "#888"
                            } as React.CSSProperties}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Performance</CardTitle>
                    <CardDescription>
                      Performance trend over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.monthlyPerformance.map((month) => (
                        <div key={month.month} className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center">
                              <span className="font-medium flex items-center">
                                <Calendar className="h-4 w-4 mr-1" /> {month.month}
                              </span>
                              <Badge variant="outline" className="ml-2">
                                {month.bets} bets
                              </Badge>
                            </div>
                            <div className="text-sm flex gap-4">
                              <span className={getWinRateColorClass(month.winRate)}>
                                {month.winRate.toFixed(1)}%
                              </span>
                              <span className={getColorClass(month.profit)}>
                                {month.profit >= 0 ? '+' : ''}{formatCurrency(month.profit)}
                              </span>
                            </div>
                          </div>
                          <Progress value={month.winRate} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="insights" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>MLB Edge Insights</CardTitle>
                  <CardDescription>
                    Data-driven insights to improve your betting strategy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Accordion type="single" collapsible defaultValue="strengths">
                      <AccordionItem value="strengths">
                        <AccordionTrigger>
                          <div className="flex items-center">
                            <span className="text-green-600 mr-2">⬆</span>
                            Your Strengths
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            {analytics.betTypeBreakdown
                              .filter(type => type.winRate >= 52.4)
                              .map(type => (
                                <div key={type.type} className="p-3 bg-green-50 border border-green-100 rounded-md">
                                  <h3 className="font-medium capitalize mb-1">
                                    {type.type} Betting ({type.winRate.toFixed(1)}% win rate)
                                  </h3>
                                  <p className="text-sm text-gray-700">
                                    You've shown consistent success with {type.type} bets, 
                                    generating {formatCurrency(type.profit)} in profit from {type.count} bets. 
                                    Consider increasing your allocation to this bet type.
                                  </p>
                                </div>
                            ))}
                            
                            {analytics.teamPerformance
                              .filter(team => team.bets >= 3 && team.winRate >= 60)
                              .slice(0, 3)
                              .map(team => (
                                <div key={team.team} className="p-3 bg-green-50 border border-green-100 rounded-md">
                                  <h3 className="font-medium mb-1" style={{ color: teamColors[team.team] || '#333' }}>
                                    {team.team} ({team.winRate.toFixed(1)}% win rate)
                                  </h3>
                                  <p className="text-sm text-gray-700">
                                    You've generated {formatCurrency(team.profit)} profit when betting on {team.team} games,
                                    with {team.wins} wins in {team.bets} bets. Continue to leverage your edge with this team.
                                  </p>
                                </div>
                            ))}
                            
                            {analytics.dayVsNight.map(time => {
                              if (time.bets >= 10 && time.winRate >= 55) {
                                return (
                                  <div key={time.time} className="p-3 bg-green-50 border border-green-100 rounded-md">
                                    <h3 className="font-medium capitalize mb-1">
                                      {time.time} Games ({time.winRate.toFixed(1)}% win rate)
                                    </h3>
                                    <p className="text-sm text-gray-700">
                                      You perform better in {time.time} games with a {time.winRate.toFixed(1)}% win rate
                                      across {time.bets} bets. This has generated {formatCurrency(time.profit)} in profit.
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="weaknesses">
                        <AccordionTrigger>
                          <div className="flex items-center">
                            <span className="text-red-600 mr-2">⬇</span>
                            Areas for Improvement
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            {analytics.betTypeBreakdown
                              .filter(type => type.winRate < 47)
                              .map(type => (
                                <div key={type.type} className="p-3 bg-red-50 border border-red-100 rounded-md">
                                  <h3 className="font-medium capitalize mb-1">
                                    {type.type} Betting ({type.winRate.toFixed(1)}% win rate)
                                  </h3>
                                  <p className="text-sm text-gray-700">
                                    You're struggling with {type.type} bets, with a win rate well below breakeven.
                                    This has cost you {formatCurrency(Math.abs(type.profit))} across {type.count} bets.
                                    Consider reducing volume or improving your selection criteria.
                                  </p>
                                </div>
                            ))}
                            
                            {analytics.teamPerformance
                              .filter(team => team.bets >= 3 && team.winRate < 40)
                              .slice(0, 3)
                              .map(team => (
                                <div key={team.team} className="p-3 bg-red-50 border border-red-100 rounded-md">
                                  <h3 className="font-medium mb-1" style={{ color: teamColors[team.team] || '#333' }}>
                                    {team.team} ({team.winRate.toFixed(1)}% win rate)
                                  </h3>
                                  <p className="text-sm text-gray-700">
                                    You've lost {formatCurrency(Math.abs(team.profit))} when betting on {team.team} games,
                                    with only {team.wins} wins in {team.bets} bets. Consider avoiding bets on this team or
                                    revising your approach.
                                  </p>
                                </div>
                            ))}
                            
                            {(analytics.longestLoseStreak >= 4) && (
                              <div className="p-3 bg-red-50 border border-red-100 rounded-md">
                                <h3 className="font-medium mb-1">
                                  Losing Streaks ({analytics.longestLoseStreak} losses in a row)
                                </h3>
                                <p className="text-sm text-gray-700">
                                  Your longest losing streak is {analytics.longestLoseStreak} bets. Consider implementing
                                  a stop-loss strategy or reducing your bet size during downswings to protect your bankroll.
                                </p>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="recommendations">
                        <AccordionTrigger>
                          <div className="flex items-center">
                            <span className="text-blue-600 mr-2">→</span>
                            Betting Recommendations
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                              <h3 className="font-medium mb-1">Optimized Bet Distribution</h3>
                              <p className="text-sm text-gray-700 mb-2">
                                Based on your historical performance, here's how you should distribute your betting volume:
                              </p>
                              <div className="space-y-2">
                                {analytics.betTypeBreakdown
                                  .sort((a, b) => b.winRate - a.winRate)
                                  .map(type => (
                                    <div key={type.type}>
                                      <div className="flex justify-between items-center text-sm mb-1">
                                        <span className="font-medium capitalize">{type.type}</span>
                                        <span className={`${getWinRateColorClass(type.winRate)}`}>
                                          {type.winRate.toFixed(1)}% win rate
                                        </span>
                                      </div>
                                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-blue-600 rounded-full"
                                          style={{ 
                                            width: `${Math.max(40, Math.min(90, type.winRate))}%`,
                                            opacity: type.winRate >= 52.4 ? 1 : 0.5
                                          }}
                                        ></div>
                                      </div>
                                      <p className="text-xs text-gray-600 mt-1">
                                        {type.winRate >= 52.4 
                                          ? `Allocate ~${Math.round((type.winRate - 45) * 2)}% of your bets to this type` 
                                          : 'Minimize these bets or improve selection criteria'}
                                      </p>
                                    </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                              <h3 className="font-medium mb-1">Bankroll Management</h3>
                              <p className="text-sm text-gray-700 mb-2">
                                Based on your current win rate and variance, we recommend:
                              </p>
                              <ul className="space-y-2 text-sm list-disc pl-5">
                                <li>
                                  <span className="font-medium">Bet sizing:</span> Limit standard bets to 
                                  {analytics.winRate >= 55 
                                    ? ' 3-5% of your bankroll' 
                                    : analytics.winRate >= 52.4
                                    ? ' 2-3% of your bankroll'
                                    : ' 1-2% of your bankroll'}
                                </li>
                                <li>
                                  <span className="font-medium">Stop-loss rule:</span> Implement a daily 
                                  stop-loss of {analytics.winRate >= 55 ? '15%' : '10%'} of your bankroll
                                </li>
                                <li>
                                  <span className="font-medium">Progressive sizing:</span> {
                                    analytics.winRate >= 55
                                      ? 'Consider slightly larger bets on your strongest edges'
                                      : 'Maintain consistent sizing until your win rate improves'
                                  }
                                </li>
                              </ul>
                            </div>
                            
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                              <h3 className="font-medium mb-1">Team & Situation Focus</h3>
                              <p className="text-sm text-gray-700 mb-2">
                                Prioritize these high-performing situations:
                              </p>
                              <div className="space-y-3">
                                {analytics.teamPerformance
                                  .filter(team => team.bets >= 3 && team.winRate >= 55)
                                  .slice(0, 3)
                                  .map(team => (
                                    <div key={team.team} className="flex items-center justify-between">
                                      <span className="font-medium" style={{ color: teamColors[team.team] || '#333' }}>
                                        {team.team}
                                      </span>
                                      <Badge variant="outline">
                                        {team.winRate.toFixed(1)}% win rate
                                      </Badge>
                                    </div>
                                ))}
                                
                                {analytics.dayVsNight.filter(time => time.winRate >= 55).map(time => (
                                  <div key={time.time} className="flex items-center justify-between">
                                    <span className="font-medium capitalize flex items-center">
                                      {time.time === 'day' ? (
                                        <><Sun className="h-4 w-4 mr-1" /> Day Games</>
                                      ) : (
                                        <><Moon className="h-4 w-4 mr-1" /> Night Games</>
                                      )}
                                    </span>
                                    <Badge variant="outline">
                                      {time.winRate.toFixed(1)}% win rate
                                    </Badge>
                                  </div>
                                ))}
                                
                                {analytics.homeVsAway.filter(loc => loc.winRate >= 55).map(loc => (
                                  <div key={loc.location} className="flex items-center justify-between">
                                    <span className="font-medium capitalize flex items-center">
                                      {loc.location === 'home' ? (
                                        <><Home className="h-4 w-4 mr-1" /> Home Games</>
                                      ) : (
                                        <><ExternalLink className="h-4 w-4 mr-1" /> Away Games</>
                                      )}
                                    </span>
                                    <Badge variant="outline">
                                      {loc.winRate.toFixed(1)}% win rate
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="psychology">
                        <AccordionTrigger>
                          <div className="flex items-center">
                            <span className="text-purple-600 mr-2">🧠</span>
                            Betting Psychology
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <div className="p-3 bg-purple-50 border border-purple-100 rounded-md">
                              <h3 className="font-medium mb-1">Avoid Chasing Losses</h3>
                              <p className="text-sm text-gray-700">
                                Data analysis reveals that losing streaks are normal even with a winning strategy. 
                                Resist the urge to increase bet sizes after losses to "get even." Instead, stick to 
                                your predetermined bet sizes and trust your edge over the long run.
                              </p>
                            </div>
                            
                            <div className="p-3 bg-purple-50 border border-purple-100 rounded-md">
                              <h3 className="font-medium mb-1">Patience During Variance</h3>
                              <p className="text-sm text-gray-700">
                                Even with a 55% win rate (which is excellent), you'll experience 4+ game losing 
                                streaks multiple times per season. Understanding the role of variance will help you 
                                maintain discipline during inevitable downswings.
                              </p>
                            </div>
                            
                            <div className="p-3 bg-purple-50 border border-purple-100 rounded-md">
                              <h3 className="font-medium mb-1">Focus on Process, Not Results</h3>
                              <p className="text-sm text-gray-700">
                                The quality of your decisions matters more than short-term results. Evaluate 
                                your betting process rather than just outcomes. Were you getting the right price? 
                                Was your analysis thorough? Was there value in the bet at the time you placed it?
                              </p>
                            </div>
                            
                            <div className="p-3 bg-purple-50 border border-purple-100 rounded-md">
                              <h3 className="font-medium mb-1">Avoid Recency Bias</h3>
                              <p className="text-sm text-gray-700">
                                Don't overreact to recent results. Your most recent 10-20 bets are a tiny sample 
                                and may not reflect your true edge. Trust larger sample sizes and the broader patterns 
                                in your betting history when evaluating your strategy.
                              </p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}