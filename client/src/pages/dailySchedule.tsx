import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Clock, Info, ThumbsUp, Check, ChevronDown, BarChart, Users, Star, TrendingUp, X, AlertTriangle } from "lucide-react";
import { format } from 'date-fns';
import { apiRequest, queryClient } from "@/lib/queryClient";

// Types
type Pitcher = {
  id: string;
  name: string;
  team: string;
  handedness: 'L' | 'R';
  era: number;
  whip: number;
  strikeouts: number;
  walks: number;
  innings: number;
  wins: number;
  losses: number;
  avgGameScore: number;
  last3Games: {
    opponent: string;
    result: 'W' | 'L' | 'ND';
    innings: number;
    earnedRuns: number;
    hits: number;
    strikeouts: number;
    walks: number;
    gameScore: number;
  }[];
  vsTeam: {
    games: number;
    era: number;
    whip: number;
    strikeouts: number;
    walks: number;
    innings: number;
  };
  homeAwayStats: {
    home: {
      era: number;
      whip: number;
      strikeouts: number;
      walks: number;
    };
    away: {
      era: number;
      whip: number;
      strikeouts: number;
      walks: number;
    };
  };
  dayNightStats: {
    day: {
      era: number;
      whip: number;
      strikeouts: number;
      walks: number;
    };
    night: {
      era: number;
      whip: number;
      strikeouts: number;
      walks: number;
    };
  };
  withUmpire?: {
    games: number;
    era: number;
    strikeouts: number;
    walks: number;
  };
};

type Umpire = {
  id: string;
  name: string;
  position: string;
  experience: number;
  strikeZoneRating: number; // 1-10, 10 being most consistent
  runsPerGame: number;
  strikeoutsPerGame: number;
  walksPerGame: number;
  strikeZoneSize: 'Large' | 'Average' | 'Small';
  callsAboveAverage: number; // positive means more calls for pitchers
  favorsPitcherType: 'Neutral' | 'Power' | 'Finesse';
  favorsBatterType: 'Neutral' | 'Power' | 'Contact';
  overUnderRecord: {
    overs: number;
    unders: number;
    overPercentage: number;
  };
  homeAwayInfluence: {
    homeFavorRate: number;
    awayFavorRate: number;
  };
};

type Line = {
  type: string;
  homeOdds: number;
  awayOdds: number;
  homeSpread: number;
  awaySpread: number;
  over: number;
  overOdds: number;
  under: number;
  underOdds: number;
  movement: {
    openHomeOdds: number;
    openAwayOdds: number;
    openOver: number;
    openUnder: number;
  };
};

type PropBet = {
  id: string;
  player: string;
  team: string;
  propType: string;
  line: number;
  overOdds: number;
  underOdds: number;
  recommendation: 'Over' | 'Under';
  confidence: number;
  reason: string;
  playerSeasonAvg: number;
  playerLast5Avg: number;
  vsTeamAvg: number;
  pitcherMatchup: string;
  value: 'Good' | 'Fair' | 'Poor';
};

type Game = {
  id: string;
  date: string;
  time: string;
  homeTeam: {
    name: string;
    abbreviation: string;
    record: string;
    logo?: string;
  };
  awayTeam: {
    name: string;
    abbreviation: string;
    record: string;
    logo?: string;
  };
  venue: string;
  weather: {
    condition: string;
    temperature: number;
    wind: string;
    humidity: number;
  };
  homePitcher: Pitcher;
  awayPitcher: Pitcher;
  lines: Line;
  umpire: Umpire;
  earlyLean: string;
  earlyLeanReason: string;
  earlyLeanConfidence: number; // 1-10
  propBets: PropBet[];
  injuries: {
    team: string;
    player: string;
    position: string;
    status: string;
    notes: string;
  }[];
  teamStats: {
    home: {
      runsPerGame: number;
      battingAvg: number;
      ops: number;
      era: number;
      whip: number;
      defensiveRating: number;
    };
    away: {
      runsPerGame: number;
      battingAvg: number;
      ops: number;
      era: number;
      whip: number;
      defensiveRating: number;
    };
  };
  recentForm: {
    home: {
      last10: string;
      streak: string;
    };
    away: {
      last10: string;
      streak: string;
    };
  };
};

// Sample data generation for demo
const generateSampleGames = (): Game[] => {
  const today = new Date();
  
  // Generate sample pitchers
  const generatePitcher = (name: string, team: string, handedness: 'L' | 'R'): Pitcher => {
    const era = parseFloat((3 + Math.random() * 2).toFixed(2));
    const whip = parseFloat((1 + Math.random() * 0.5).toFixed(2));
    const strikeouts = Math.floor(40 + Math.random() * 60);
    const walks = Math.floor(10 + Math.random() * 20);
    const innings = Math.floor(30 + Math.random() * 20);
    const wins = Math.floor(3 + Math.random() * 5);
    const losses = Math.floor(1 + Math.random() * 5);
    const avgGameScore = Math.floor(50 + Math.random() * 20);
    
    const last3Games = Array(3).fill(null).map(() => {
      const opponents = ["NYY", "BOS", "LAD", "HOU", "ATL", "CHC", "STL", "SF"];
      const opponent = opponents[Math.floor(Math.random() * opponents.length)];
      const result = Math.random() > 0.5 ? (Math.random() > 0.5 ? 'W' : 'L') : 'ND' as 'W' | 'L' | 'ND';
      const innings = Math.floor(5 + Math.random() * 3);
      const earnedRuns = Math.floor(Math.random() * 5);
      const hits = Math.floor(3 + Math.random() * 6);
      const strikeouts = Math.floor(3 + Math.random() * 7);
      const walks = Math.floor(Math.random() * 4);
      const gameScore = Math.floor(40 + Math.random() * 40);
      
      return {
        opponent,
        result,
        innings,
        earnedRuns,
        hits,
        strikeouts,
        walks,
        gameScore
      };
    });
    
    return {
      id: Math.random().toString(36).substring(2, 9),
      name,
      team,
      handedness,
      era,
      whip,
      strikeouts,
      walks,
      innings,
      wins,
      losses,
      avgGameScore,
      last3Games,
      vsTeam: {
        games: Math.floor(1 + Math.random() * 5),
        era: parseFloat((3 + Math.random() * 2).toFixed(2)),
        whip: parseFloat((1 + Math.random() * 0.5).toFixed(2)),
        strikeouts: Math.floor(5 + Math.random() * 15),
        walks: Math.floor(1 + Math.random() * 8),
        innings: Math.floor(10 + Math.random() * 15)
      },
      homeAwayStats: {
        home: {
          era: parseFloat((2.8 + Math.random() * 2).toFixed(2)),
          whip: parseFloat((1 + Math.random() * 0.5).toFixed(2)),
          strikeouts: Math.floor(20 + Math.random() * 30),
          walks: Math.floor(5 + Math.random() * 10)
        },
        away: {
          era: parseFloat((3.2 + Math.random() * 2).toFixed(2)),
          whip: parseFloat((1.1 + Math.random() * 0.5).toFixed(2)),
          strikeouts: Math.floor(20 + Math.random() * 30),
          walks: Math.floor(5 + Math.random() * 10)
        }
      },
      dayNightStats: {
        day: {
          era: parseFloat((2.9 + Math.random() * 2).toFixed(2)),
          whip: parseFloat((1 + Math.random() * 0.5).toFixed(2)),
          strikeouts: Math.floor(15 + Math.random() * 25),
          walks: Math.floor(3 + Math.random() * 8)
        },
        night: {
          era: parseFloat((3.1 + Math.random() * 2).toFixed(2)),
          whip: parseFloat((1.05 + Math.random() * 0.5).toFixed(2)),
          strikeouts: Math.floor(20 + Math.random() * 25),
          walks: Math.floor(5 + Math.random() * 8)
        }
      }
    };
  };
  
  // Generate umpires
  const generateUmpire = (): Umpire => {
    const names = [
      "Joe West", "Angel Hernandez", "CB Bucknor", "Jim Joyce", 
      "Tim McClelland", "Bruce Froemming", "Fieldin Culbreth", "Brian Gorman",
      "Sam Holbrook", "Jerry Meals", "Tim Timmons", "Lance Barrett"
    ];
    const name = names[Math.floor(Math.random() * names.length)];
    
    const strikeZoneSize = Math.random() > 0.6 ? 'Average' : (Math.random() > 0.5 ? 'Large' : 'Small');
    const favorsPitcherType = Math.random() > 0.6 ? 'Neutral' : (Math.random() > 0.5 ? 'Power' : 'Finesse');
    const favorsBatterType = Math.random() > 0.6 ? 'Neutral' : (Math.random() > 0.5 ? 'Power' : 'Contact');
    
    return {
      id: Math.random().toString(36).substring(2, 9),
      name,
      position: "Home Plate",
      experience: Math.floor(5 + Math.random() * 20),
      strikeZoneRating: Math.floor(5 + Math.random() * 6),
      runsPerGame: parseFloat((7 + Math.random() * 3).toFixed(1)),
      strikeoutsPerGame: parseFloat((14 + Math.random() * 6).toFixed(1)),
      walksPerGame: parseFloat((5 + Math.random() * 3).toFixed(1)),
      strikeZoneSize,
      callsAboveAverage: parseFloat((-2 + Math.random() * 4).toFixed(1)),
      favorsPitcherType,
      favorsBatterType,
      overUnderRecord: {
        overs: Math.floor(20 + Math.random() * 40),
        unders: Math.floor(20 + Math.random() * 40),
        get overPercentage() {
          return parseFloat((this.overs / (this.overs + this.unders) * 100).toFixed(1));
        }
      },
      homeAwayInfluence: {
        homeFavorRate: parseFloat((48 + Math.random() * 8).toFixed(1)),
        awayFavorRate: parseFloat((48 + Math.random() * 8).toFixed(1))
      }
    };
  };
  
  // Generate prop bets
  const generatePropBets = (homeTeam: string, awayTeam: string, homePitcher: string, awayPitcher: string): PropBet[] => {
    const playerNames = {
      [homeTeam]: [
        `${homeTeam} Player 1`, 
        `${homeTeam} Player 2`, 
        `${homeTeam} Player 3`
      ],
      [awayTeam]: [
        `${awayTeam} Player 1`, 
        `${awayTeam} Player 2`, 
        `${awayTeam} Player 3`
      ]
    };
    
    const propTypes = [
      "Total Bases", 
      "Strikeouts", 
      "Hits", 
      "Home Runs", 
      "RBIs", 
      "Runs Scored",
      "Pitching Outs"
    ];
    
    // Generate 5 prop bets
    return Array(5).fill(null).map(() => {
      const team = Math.random() > 0.5 ? homeTeam : awayTeam;
      const player = playerNames[team][Math.floor(Math.random() * 3)];
      const propType = propTypes[Math.floor(Math.random() * propTypes.length)];
      
      // Determine if this is a pitcher prop
      const isPitcherProp = propType === "Strikeouts" || propType === "Pitching Outs";
      let adjustedPlayer = player;
      
      // If it's a pitcher prop, use one of the starting pitchers
      if (isPitcherProp) {
        adjustedPlayer = team === homeTeam ? homePitcher : awayPitcher;
      }
      
      // Set appropriate line based on prop type
      let line = 0;
      if (propType === "Total Bases") line = 1.5 + Math.floor(Math.random() * 2);
      else if (propType === "Strikeouts") line = 4.5 + Math.floor(Math.random() * 4);
      else if (propType === "Hits") line = 0.5 + Math.floor(Math.random() * 2);
      else if (propType === "Home Runs") line = 0.5;
      else if (propType === "RBIs") line = 0.5 + Math.floor(Math.random());
      else if (propType === "Runs Scored") line = 0.5;
      else if (propType === "Pitching Outs") line = 15.5 + Math.floor(Math.random() * 3);
      
      const recommendation = Math.random() > 0.5 ? 'Over' : 'Under';
      const playerSeasonAvg = parseFloat((line + (Math.random() * 0.6 - 0.3)).toFixed(1));
      const playerLast5Avg = parseFloat((line + (Math.random() * 0.8 - 0.4)).toFixed(1));
      const vsTeamAvg = parseFloat((line + (Math.random() * 0.7 - 0.35)).toFixed(1));
      
      let reason = "";
      if (recommendation === 'Over') {
        if (playerLast5Avg > line) {
          reason = `${adjustedPlayer} has averaged ${playerLast5Avg} ${propType.toLowerCase()} in his last 5 games`;
        } else if (vsTeamAvg > line) {
          reason = `${adjustedPlayer} has averaged ${vsTeamAvg} ${propType.toLowerCase()} against this opponent`;
        } else {
          reason = `Favorable matchup against opposing pitcher, expecting increased production`;
        }
      } else {
        if (playerLast5Avg < line) {
          reason = `${adjustedPlayer} has averaged only ${playerLast5Avg} ${propType.toLowerCase()} in his last 5 games`;
        } else if (vsTeamAvg < line) {
          reason = `${adjustedPlayer} has struggled against this opponent, averaging ${vsTeamAvg} ${propType.toLowerCase()}`;
        } else {
          reason = `Tough matchup against opposing pitcher who limits ${propType.toLowerCase()}`;
        }
      }
      
      // Calculate confidence based on how far the averages are from the line
      const avgDiff = Math.abs((playerSeasonAvg + playerLast5Avg + vsTeamAvg) / 3 - line);
      const confidence = Math.min(Math.floor(5 + avgDiff * 3), 10);
      
      // Determine value rating
      let value: 'Good' | 'Fair' | 'Poor';
      if (confidence >= 8) value = 'Good';
      else if (confidence >= 6) value = 'Fair';
      else value = 'Poor';
      
      return {
        id: Math.random().toString(36).substring(2, 9),
        player: adjustedPlayer,
        team,
        propType,
        line,
        overOdds: -110 + Math.floor(Math.random() * 40) * (Math.random() > 0.5 ? 1 : -1),
        underOdds: -110 + Math.floor(Math.random() * 40) * (Math.random() > 0.5 ? 1 : -1),
        recommendation,
        confidence,
        reason,
        playerSeasonAvg,
        playerLast5Avg,
        vsTeamAvg,
        pitcherMatchup: team === homeTeam ? awayPitcher : homePitcher,
        value
      };
    });
  };
  
  // MLB Teams
  const teams = [
    { name: "New York Yankees", abbreviation: "NYY", record: "26-15" },
    { name: "Boston Red Sox", abbreviation: "BOS", record: "22-19" },
    { name: "Tampa Bay Rays", abbreviation: "TB", record: "20-21" },
    { name: "Toronto Blue Jays", abbreviation: "TOR", record: "19-22" },
    { name: "Baltimore Orioles", abbreviation: "BAL", record: "25-16" },
    { name: "Chicago White Sox", abbreviation: "CWS", record: "15-26" },
    { name: "Cleveland Guardians", abbreviation: "CLE", record: "24-17" },
    { name: "Detroit Tigers", abbreviation: "DET", record: "18-23" },
    { name: "Kansas City Royals", abbreviation: "KC", record: "26-15" },
    { name: "Minnesota Twins", abbreviation: "MIN", record: "20-21" },
    { name: "Houston Astros", abbreviation: "HOU", record: "21-20" },
    { name: "Los Angeles Angels", abbreviation: "LAA", record: "17-24" },
    { name: "Oakland Athletics", abbreviation: "OAK", record: "16-25" },
    { name: "Seattle Mariners", abbreviation: "SEA", record: "19-22" },
    { name: "Texas Rangers", abbreviation: "TEX", record: "22-19" },
    { name: "Atlanta Braves", abbreviation: "ATL", record: "25-16" },
    { name: "Miami Marlins", abbreviation: "MIA", record: "14-27" },
    { name: "New York Mets", abbreviation: "NYM", record: "18-23" },
    { name: "Philadelphia Phillies", abbreviation: "PHI", record: "25-16" },
    { name: "Washington Nationals", abbreviation: "WSH", record: "16-25" },
    { name: "Chicago Cubs", abbreviation: "CHC", record: "20-21" },
    { name: "Cincinnati Reds", abbreviation: "CIN", record: "18-23" },
    { name: "Milwaukee Brewers", abbreviation: "MIL", record: "24-17" },
    { name: "Pittsburgh Pirates", abbreviation: "PIT", record: "17-24" },
    { name: "St. Louis Cardinals", abbreviation: "STL", record: "19-22" },
    { name: "Arizona Diamondbacks", abbreviation: "ARI", record: "20-21" },
    { name: "Colorado Rockies", abbreviation: "COL", record: "15-26" },
    { name: "Los Angeles Dodgers", abbreviation: "LAD", record: "28-13" },
    { name: "San Diego Padres", abbreviation: "SD", record: "22-19" },
    { name: "San Francisco Giants", abbreviation: "SF", record: "21-20" }
  ];
  
  // Pitcher names
  const pitcherNames = {
    "NYY": ["Gerrit Cole", "Carlos Rodon", "Marcus Stroman"],
    "BOS": ["Brayan Bello", "Nick Pivetta", "Kutter Crawford"],
    "TB": ["Zach Eflin", "Shane McClanahan", "Taj Bradley"],
    "TOR": ["Kevin Gausman", "Jose Berrios", "Chris Bassitt"],
    "BAL": ["Corbin Burnes", "Grayson Rodriguez", "Kyle Bradish"],
    "CWS": ["Garrett Crochet", "Michael Soroka", "Chris Flexen"],
    "CLE": ["Shane Bieber", "Tanner Bibee", "Logan Allen"],
    "DET": ["Tarik Skubal", "Kenta Maeda", "Jack Flaherty"],
    "KC": ["Seth Lugo", "Cole Ragans", "Michael Wacha"],
    "MIN": ["Pablo Lopez", "Joe Ryan", "Bailey Ober"],
    "HOU": ["Framber Valdez", "Cristian Javier", "Hunter Brown"],
    "LAA": ["Tyler Anderson", "Griffin Canning", "Patrick Sandoval"],
    "OAK": ["JP Sears", "Paul Blackburn", "Ross Stripling"],
    "SEA": ["Luis Castillo", "Logan Gilbert", "George Kirby"],
    "TEX": ["Nathan Eovaldi", "Jon Gray", "Andrew Heaney"],
    "ATL": ["Max Fried", "Charlie Morton", "Spencer Strider"],
    "MIA": ["Jesus Luzardo", "Trevor Rogers", "Edward Cabrera"],
    "NYM": ["Kodai Senga", "Luis Severino", "Jose Quintana"],
    "PHI": ["Zack Wheeler", "Aaron Nola", "Ranger Suarez"],
    "WSH": ["MacKenzie Gore", "Patrick Corbin", "Jake Irvin"],
    "CHC": ["Justin Steele", "Jameson Taillon", "Kyle Hendricks"],
    "CIN": ["Hunter Greene", "Nick Lodolo", "Graham Ashcraft"],
    "MIL": ["Freddy Peralta", "Colin Rea", "Wade Miley"],
    "PIT": ["Mitch Keller", "Luis Ortiz", "Bailey Falter"],
    "STL": ["Miles Mikolas", "Kyle Gibson", "Steven Matz"],
    "ARI": ["Zac Gallen", "Merrill Kelly", "Eduardo Rodriguez"],
    "COL": ["Kyle Freeland", "Cal Quantrill", "Austin Gomber"],
    "LAD": ["Yoshinobu Yamamoto", "Tyler Glasnow", "James Paxton"],
    "SD": ["Yu Darvish", "Joe Musgrove", "Michael King"],
    "SF": ["Logan Webb", "Blake Snell", "Alex Cobb"]
  };
  
  // Generate 8 games for today
  const games: Game[] = [];
  const usedTeams: string[] = [];
  
  for (let i = 0; i < 8; i++) {
    // Pick two teams that haven't been used yet
    let homeTeamIndex, awayTeamIndex;
    do {
      homeTeamIndex = Math.floor(Math.random() * teams.length);
    } while (usedTeams.includes(teams[homeTeamIndex].abbreviation));
    
    do {
      awayTeamIndex = Math.floor(Math.random() * teams.length);
    } while (
      awayTeamIndex === homeTeamIndex || 
      usedTeams.includes(teams[awayTeamIndex].abbreviation)
    );
    
    const homeTeam = teams[homeTeamIndex];
    const awayTeam = teams[awayTeamIndex];
    
    usedTeams.push(homeTeam.abbreviation, awayTeam.abbreviation);
    
    // Select pitchers for the game
    const homePitcherName = pitcherNames[homeTeam.abbreviation][Math.floor(Math.random() * pitcherNames[homeTeam.abbreviation].length)];
    const awayPitcherName = pitcherNames[awayTeam.abbreviation][Math.floor(Math.random() * pitcherNames[awayTeam.abbreviation].length)];
    
    const homePitcher = generatePitcher(homePitcherName, homeTeam.abbreviation, Math.random() > 0.7 ? 'L' : 'R');
    const awayPitcher = generatePitcher(awayPitcherName, awayTeam.abbreviation, Math.random() > 0.7 ? 'L' : 'R');
    
    // Generate umpire
    const umpire = generateUmpire();
    
    // Add umpire stats to pitcher stats
    homePitcher.withUmpire = {
      games: Math.floor(1 + Math.random() * 4),
      era: parseFloat((homePitcher.era + (Math.random() * 2 - 1)).toFixed(2)),
      strikeouts: Math.floor(homePitcher.strikeouts * (Math.random() * 0.4 + 0.8) / 5),
      walks: Math.floor(homePitcher.walks * (Math.random() * 0.4 + 0.8) / 5)
    };
    
    awayPitcher.withUmpire = {
      games: Math.floor(1 + Math.random() * 4),
      era: parseFloat((awayPitcher.era + (Math.random() * 2 - 1)).toFixed(2)),
      strikeouts: Math.floor(awayPitcher.strikeouts * (Math.random() * 0.4 + 0.8) / 5),
      walks: Math.floor(awayPitcher.walks * (Math.random() * 0.4 + 0.8) / 5)
    };
    
    // Generate game lines
    const homeOdds = -Math.floor(100 + Math.random() * 150);
    const awayOdds = Math.floor(100 + Math.random() * 150);
    const totalRuns = 7.5 + Math.floor(Math.random() * 3);
    
    const lines: Line = {
      type: "Game",
      homeOdds,
      awayOdds,
      homeSpread: -1.5,
      awaySpread: 1.5,
      over: totalRuns,
      overOdds: -110,
      under: totalRuns,
      underOdds: -110,
      movement: {
        openHomeOdds: homeOdds + Math.floor(Math.random() * 30) * (Math.random() > 0.5 ? 1 : -1),
        openAwayOdds: awayOdds + Math.floor(Math.random() * 30) * (Math.random() > 0.5 ? 1 : -1),
        openOver: totalRuns + (Math.random() > 0.7 ? 0.5 : 0),
        openUnder: totalRuns + (Math.random() > 0.7 ? 0.5 : 0)
      }
    };
    
    // Generate early lean
    const leanOptions = [`${homeTeam.abbreviation} ${homeOdds}`, `${awayTeam.abbreviation} +${awayOdds}`, `Over ${totalRuns}`, `Under ${totalRuns}`];
    const earlyLean = leanOptions[Math.floor(Math.random() * leanOptions.length)];
    let earlyLeanReason = "";
    let earlyLeanConfidence = Math.floor(6 + Math.random() * 5);
    
    if (earlyLean.includes(homeTeam.abbreviation)) {
      earlyLeanReason = `${homeTeam.name} has a significant pitching advantage with ${homePitcherName}. He's been dominant recently with a ${homePitcher.last3Games[0].gameScore} game score in his last start.`;
    } else if (earlyLean.includes(awayTeam.abbreviation)) {
      earlyLeanReason = `Value on the underdog here. ${awayTeam.name}'s offense has been clicking, and ${awayPitcherName} has a favorable matchup against this lineup.`;
    } else if (earlyLean.includes("Over")) {
      earlyLeanReason = `Both teams have been hitting well, and this umpire (${umpire.name}) has an over rate of ${umpire.overUnderRecord.overPercentage}% this season.`;
    } else {
      earlyLeanReason = `Two good pitchers on the mound and the weather conditions favor pitchers. ${umpire.name} has a ${umpire.strikeZoneSize} strike zone which should help the under.`;
    }
    
    // Get time for the game (between 1pm and 8pm)
    const hour = 13 + Math.floor(Math.random() * 8);
    const minute = Math.random() > 0.5 ? '05' : (Math.random() > 0.5 ? '10' : (Math.random() > 0.5 ? '35' : '40'));
    const time = `${hour}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`;
    
    // Generate prop bets
    const propBets = generatePropBets(
      homeTeam.name, 
      awayTeam.name, 
      homePitcherName, 
      awayPitcherName
    );
    
    // Generate team stats
    const homeTeamStats = {
      runsPerGame: parseFloat((4.2 + Math.random() * 1.3).toFixed(1)),
      battingAvg: parseFloat((0.240 + Math.random() * 0.040).toFixed(3)),
      ops: parseFloat((0.700 + Math.random() * 0.100).toFixed(3)),
      era: parseFloat((3.8 + Math.random() * 1.0).toFixed(2)),
      whip: parseFloat((1.20 + Math.random() * 0.20).toFixed(2)),
      defensiveRating: parseFloat((0 + Math.random() * 10).toFixed(1))
    };
    
    const awayTeamStats = {
      runsPerGame: parseFloat((4.2 + Math.random() * 1.3).toFixed(1)),
      battingAvg: parseFloat((0.240 + Math.random() * 0.040).toFixed(3)),
      ops: parseFloat((0.700 + Math.random() * 0.100).toFixed(3)),
      era: parseFloat((3.8 + Math.random() * 1.0).toFixed(2)),
      whip: parseFloat((1.20 + Math.random() * 0.20).toFixed(2)),
      defensiveRating: parseFloat((0 + Math.random() * 10).toFixed(1))
    };
    
    // Generate recent form
    const generateLastTen = () => {
      let wins = Math.floor(3 + Math.random() * 8);
      let losses = 10 - wins;
      return `${wins}-${losses}`;
    };
    
    const generateStreak = () => {
      const type = Math.random() > 0.5 ? 'W' : 'L';
      const length = Math.floor(1 + Math.random() * 5);
      return `${type}${length}`;
    };
    
    const homeRecentForm = {
      last10: generateLastTen(),
      streak: generateStreak()
    };
    
    const awayRecentForm = {
      last10: generateLastTen(),
      streak: generateStreak()
    };
    
    // Generate injuries
    const injuries = [];
    const positions = ["OF", "1B", "2B", "SS", "3B", "C", "SP", "RP"];
    const statuses = ["Out", "Day-to-Day", "Questionable"];
    
    if (Math.random() > 0.6) {
      injuries.push({
        team: homeTeam.abbreviation,
        player: `${homeTeam.name} Player`,
        position: positions[Math.floor(Math.random() * positions.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        notes: "Hamstring injury"
      });
    }
    
    if (Math.random() > 0.6) {
      injuries.push({
        team: awayTeam.abbreviation,
        player: `${awayTeam.name} Player`,
        position: positions[Math.floor(Math.random() * positions.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        notes: "Shoulder soreness"
      });
    }
    
    games.push({
      id: `game-${i+1}`,
      date: format(today, 'yyyy-MM-dd'),
      time,
      homeTeam,
      awayTeam,
      venue: `${homeTeam.name} Stadium`,
      weather: {
        condition: Math.random() > 0.7 ? "Clear" : (Math.random() > 0.5 ? "Partly Cloudy" : "Cloudy"),
        temperature: Math.floor(65 + Math.random() * 20),
        wind: `${Math.floor(3 + Math.random() * 12)} mph ${["N", "S", "E", "W", "NE", "NW", "SE", "SW"][Math.floor(Math.random() * 8)]}`,
        humidity: Math.floor(40 + Math.random() * 40)
      },
      homePitcher,
      awayPitcher,
      lines,
      umpire,
      earlyLean,
      earlyLeanReason,
      earlyLeanConfidence,
      propBets,
      injuries,
      teamStats: {
        home: homeTeamStats,
        away: awayTeamStats
      },
      recentForm: {
        home: homeRecentForm,
        away: awayRecentForm
      }
    });
  }
  
  return games;
};

// Format odds for display
const formatOdds = (odds: number): string => {
  if (odds > 0) {
    return `+${odds}`;
  }
  return odds.toString();
};

// Get badge variant for confidence level
const getConfidenceBadgeVariant = (confidence: number) => {
  if (confidence >= 8) return "default";
  if (confidence >= 6) return "secondary";
  return "outline";
};

// Get color class for value indicator
const getValueColorClass = (value: 'Good' | 'Fair' | 'Poor') => {
  if (value === 'Good') return "text-green-600";
  if (value === 'Fair') return "text-yellow-600";
  return "text-red-600";
};

// Main component
export default function DailySchedule() {
  const [games, setGames] = useState<Game[]>([]);
  const [activeTab, setActiveTab] = useState("schedule");
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedPropBets, setSelectedPropBets] = useState<PropBet[]>([]);
  const [topPropBets, setTopPropBets] = useState<PropBet[]>([]);
  const [dateString, setDateString] = useState(format(new Date(), 'EEEE, MMMM do, yyyy'));
  
  // Generate sample data on mount
  useEffect(() => {
    const sampleGames = generateSampleGames();
    setGames(sampleGames);
    
    // Find top 5 prop bets by confidence
    const allProps = sampleGames.flatMap(game => game.propBets);
    const topProps = [...allProps].sort((a, b) => b.confidence - a.confidence).slice(0, 5);
    setTopPropBets(topProps);
  }, []);
  
  // Update selected game props when game selection changes
  useEffect(() => {
    if (selectedGameId) {
      const selectedGame = games.find(game => game.id === selectedGameId);
      if (selectedGame) {
        setSelectedPropBets(selectedGame.propBets);
      }
    } else {
      setSelectedPropBets([]);
    }
  }, [selectedGameId, games]);
  
  // Get the selected game
  const selectedGame = selectedGameId ? games.find(game => game.id === selectedGameId) : null;
  
  return (
    <>
      <Helmet>
        <title>Daily Schedule | MLB Edge</title>
        <meta name="description" content="Daily MLB schedule, game analysis, and betting insights" />
      </Helmet>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold font-heading bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
                Today's MLB Schedule
              </h1>
              <p className="text-gray-600">
                {dateString} • Deep analysis of all games
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="schedule">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule & Lines
              </TabsTrigger>
              <TabsTrigger value="analysis">
                <BarChart className="h-4 w-4 mr-2" />
                Game Analysis
              </TabsTrigger>
              <TabsTrigger value="props">
                <Star className="h-4 w-4 mr-2" />
                Top Prop Bets
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="schedule" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Today's MLB Games</CardTitle>
                  <CardDescription>
                    Complete schedule with probable pitchers and betting lines
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time (ET)</TableHead>
                          <TableHead>Matchup</TableHead>
                          <TableHead>Pitchers</TableHead>
                          <TableHead>ML</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Run Line</TableHead>
                          <TableHead>Early Lean</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {games.map((game) => (
                          <TableRow 
                            key={game.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setSelectedGameId(game.id)}
                          >
                            <TableCell>
                              <div className="font-medium">{game.time}</div>
                              <div className="text-xs text-gray-500">{game.venue}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{game.awayTeam.name} ({game.awayTeam.record})</span>
                                <span className="font-medium">@ {game.homeTeam.name} ({game.homeTeam.record})</span>
                                <div className="text-xs text-gray-500 mt-1">
                                  Umpire: {game.umpire.name}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <div>
                                  <span className="text-sm font-medium">{game.awayPitcher.name}</span>
                                  <span className="text-xs text-gray-500 ml-1">({game.awayPitcher.handedness})</span>
                                </div>
                                <div>
                                  <span className="text-sm font-medium">{game.homePitcher.name}</span>
                                  <span className="text-xs text-gray-500 ml-1">({game.homePitcher.handedness})</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <div className="text-sm">{formatOdds(game.lines.awayOdds)}</div>
                                <div className="text-sm">{formatOdds(game.lines.homeOdds)}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <div className="text-sm">O {game.lines.over} ({formatOdds(game.lines.overOdds)})</div>
                                <div className="text-sm">U {game.lines.under} ({formatOdds(game.lines.underOdds)})</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <div className="text-sm">{game.awayTeam.abbreviation} {game.lines.awaySpread} ({formatOdds(-110)})</div>
                                <div className="text-sm">{game.homeTeam.abbreviation} {game.lines.homeSpread} ({formatOdds(-110)})</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="font-normal" variant={getConfidenceBadgeVariant(game.earlyLeanConfidence)}>
                                {game.earlyLean}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {selectedGame && (
                      <Card className="mt-6 border-primary/20">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">
                            {selectedGame.awayTeam.name} @ {selectedGame.homeTeam.name} • {selectedGame.time}
                          </CardTitle>
                          <CardDescription>
                            {selectedGame.venue} • {selectedGame.weather.condition}, {selectedGame.weather.temperature}°F
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-base font-semibold mb-2 flex items-center">
                                <Info className="h-4 w-4 mr-2 text-primary" />
                                Line Movement
                              </h3>
                              <div className="space-y-3 mb-4">
                                <div className="grid grid-cols-3 text-sm">
                                  <div className="font-medium">Market</div>
                                  <div className="font-medium">Open</div>
                                  <div className="font-medium">Current</div>
                                </div>
                                <div className="grid grid-cols-3 text-sm">
                                  <div>{selectedGame.awayTeam.abbreviation} ML</div>
                                  <div>{formatOdds(selectedGame.lines.movement.openAwayOdds)}</div>
                                  <div className={selectedGame.lines.movement.openAwayOdds !== selectedGame.lines.awayOdds ? 'text-red-600 font-medium' : ''}>
                                    {formatOdds(selectedGame.lines.awayOdds)}
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 text-sm">
                                  <div>{selectedGame.homeTeam.abbreviation} ML</div>
                                  <div>{formatOdds(selectedGame.lines.movement.openHomeOdds)}</div>
                                  <div className={selectedGame.lines.movement.openHomeOdds !== selectedGame.lines.homeOdds ? 'text-red-600 font-medium' : ''}>
                                    {formatOdds(selectedGame.lines.homeOdds)}
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 text-sm">
                                  <div>Total Over</div>
                                  <div>{selectedGame.lines.movement.openOver}</div>
                                  <div className={selectedGame.lines.movement.openOver !== selectedGame.lines.over ? 'text-red-600 font-medium' : ''}>
                                    {selectedGame.lines.over}
                                  </div>
                                </div>
                              </div>
                              
                              <h3 className="text-base font-semibold mb-2 flex items-center">
                                <Users className="h-4 w-4 mr-2 text-primary" />
                                Umpire Analysis: {selectedGame.umpire.name}
                              </h3>
                              <div className="space-y-1 mb-4">
                                <div className="flex justify-between text-sm">
                                  <span>Strike Zone Rating:</span>
                                  <span className="font-medium">{selectedGame.umpire.strikeZoneRating}/10</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Strike Zone Size:</span>
                                  <span className="font-medium">{selectedGame.umpire.strikeZoneSize}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Runs Per Game:</span>
                                  <span className="font-medium">{selectedGame.umpire.runsPerGame}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Over Percentage:</span>
                                  <span className="font-medium">{selectedGame.umpire.overUnderRecord.overPercentage}%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Favors:</span>
                                  <span className="font-medium">
                                    {selectedGame.umpire.favorsPitcherType !== 'Neutral' ? `${selectedGame.umpire.favorsPitcherType} Pitchers` : 'Neutral'}
                                  </span>
                                </div>
                              </div>
                              
                              {selectedGame.injuries.length > 0 && (
                                <>
                                  <h3 className="text-base font-semibold mb-2 flex items-center">
                                    <AlertTriangle className="h-4 w-4 mr-2 text-primary" />
                                    Injuries
                                  </h3>
                                  <div className="space-y-2 mb-4">
                                    {selectedGame.injuries.map((injury, idx) => (
                                      <div key={idx} className="text-sm">
                                        <span className="font-medium">{injury.player}</span>
                                        <span className="text-gray-500 ml-1">
                                          ({injury.team}, {injury.position})
                                        </span>
                                        <span className="text-red-500 ml-2">{injury.status}</span>
                                        <span className="text-gray-500 ml-2">- {injury.notes}</span>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}
                              
                              <h3 className="text-base font-semibold mb-2 flex items-center">
                                <ThumbsUp className="h-4 w-4 mr-2 text-primary" />
                                Early Lean Analysis
                              </h3>
                              <div className="bg-primary/5 p-3 rounded-md border border-primary/20">
                                <div className="flex items-center mb-2">
                                  <Badge variant={getConfidenceBadgeVariant(selectedGame.earlyLeanConfidence)}>
                                    {selectedGame.earlyLean}
                                  </Badge>
                                  <span className="ml-2 text-sm">
                                    Confidence: {selectedGame.earlyLeanConfidence}/10
                                  </span>
                                </div>
                                <p className="text-sm">{selectedGame.earlyLeanReason}</p>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-base font-semibold mb-2">Team Stats Comparison</h3>
                              <div className="space-y-4 mb-4">
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm">Runs Per Game</span>
                                    <div className="flex space-x-3">
                                      <span className="text-sm font-medium">
                                        {selectedGame.teamStats.away.runsPerGame}
                                      </span>
                                      <span className="text-sm font-medium">
                                        {selectedGame.teamStats.home.runsPerGame}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex h-2 mb-2">
                                    <div 
                                      className="bg-blue-500 rounded-l"
                                      style={{ width: `${(selectedGame.teamStats.away.runsPerGame / 8) * 100}%` }}
                                    ></div>
                                    <div 
                                      className="bg-red-500 rounded-r"
                                      style={{ width: `${(selectedGame.teamStats.home.runsPerGame / 8) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm">Team ERA</span>
                                    <div className="flex space-x-3">
                                      <span className="text-sm font-medium">
                                        {selectedGame.teamStats.away.era}
                                      </span>
                                      <span className="text-sm font-medium">
                                        {selectedGame.teamStats.home.era}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex h-2 mb-2">
                                    <div 
                                      className="bg-blue-500 rounded-l"
                                      style={{ width: `${(selectedGame.teamStats.away.era / 10) * 100}%` }}
                                    ></div>
                                    <div 
                                      className="bg-red-500 rounded-r"
                                      style={{ width: `${(selectedGame.teamStats.home.era / 10) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm">Team OPS</span>
                                    <div className="flex space-x-3">
                                      <span className="text-sm font-medium">
                                        {selectedGame.teamStats.away.ops}
                                      </span>
                                      <span className="text-sm font-medium">
                                        {selectedGame.teamStats.home.ops}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex h-2 mb-2">
                                    <div 
                                      className="bg-blue-500 rounded-l"
                                      style={{ width: `${(selectedGame.teamStats.away.ops / 1.2) * 100}%` }}
                                    ></div>
                                    <div 
                                      className="bg-red-500 rounded-r"
                                      style={{ width: `${(selectedGame.teamStats.home.ops / 1.2) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <h3 className="text-sm font-semibold mb-2">
                                    {selectedGame.awayTeam.name} Form
                                  </h3>
                                  <div className="text-sm">
                                    <div>Last 10: <span className="font-medium">{selectedGame.recentForm.away.last10}</span></div>
                                    <div>Streak: <span className="font-medium">{selectedGame.recentForm.away.streak}</span></div>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="text-sm font-semibold mb-2">
                                    {selectedGame.homeTeam.name} Form
                                  </h3>
                                  <div className="text-sm">
                                    <div>Last 10: <span className="font-medium">{selectedGame.recentForm.home.last10}</span></div>
                                    <div>Streak: <span className="font-medium">{selectedGame.recentForm.home.streak}</span></div>
                                  </div>
                                </div>
                              </div>
                              
                              <Accordion type="single" collapsible className="mb-4">
                                <AccordionItem value="props">
                                  <AccordionTrigger className="text-base font-semibold">
                                    Game Prop Bets ({selectedGame.propBets.length})
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="space-y-3">
                                      {selectedPropBets.map((prop) => (
                                        <div key={prop.id} className="border rounded-md p-3">
                                          <div className="flex justify-between items-start mb-1">
                                            <div>
                                              <div className="font-medium">
                                                {prop.player} {prop.propType} {prop.line}
                                              </div>
                                              <div className="text-sm text-gray-600">
                                                {prop.team} • Season Avg: {prop.playerSeasonAvg} • L5: {prop.playerLast5Avg}
                                              </div>
                                            </div>
                                            <Badge variant={getConfidenceBadgeVariant(prop.confidence)}>
                                              {prop.recommendation} ({prop.confidence}/10)
                                            </Badge>
                                          </div>
                                          <div className="text-sm mt-1">{prop.reason}</div>
                                          <div className="flex justify-between text-sm mt-2">
                                            <div>
                                              <span className={getValueColorClass(prop.value)}>
                                                {prop.value} Value
                                              </span>
                                            </div>
                                            <div>
                                              {prop.recommendation === 'Over' ? formatOdds(prop.overOdds) : formatOdds(prop.underOdds)}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <Button variant="outline" onClick={() => setSelectedGameId(null)}>
                                  Close Details
                                </Button>
                                <Button
                                  onClick={() => {
                                    setActiveTab("analysis");
                                    window.scrollTo(0, 0);
                                  }}
                                >
                                  View Deep Analysis
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analysis" className="mt-6">
              {selectedGame ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row justify-between md:items-center">
                        <div>
                          <CardTitle>
                            {selectedGame.awayTeam.name} @ {selectedGame.homeTeam.name}
                          </CardTitle>
                          <CardDescription>
                            {selectedGame.time} • {selectedGame.venue}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="mt-2 md:mt-0">
                              Select Different Game
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {games.map((game) => (
                              <DropdownMenuItem 
                                key={game.id}
                                onClick={() => setSelectedGameId(game.id)}
                              >
                                {game.awayTeam.abbreviation} @ {game.homeTeam.abbreviation} ({game.time})
                                {game.id === selectedGameId && <Check className="ml-2 h-4 w-4" />}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-lg font-semibold">Game Conditions</h3>
                          <div className="space-y-4 mt-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-muted/30 rounded-md p-3">
                                <h4 className="text-sm font-medium text-gray-500">Weather</h4>
                                <div className="mt-1">
                                  <div className="font-medium">{selectedGame.weather.condition}</div>
                                  <div className="text-sm">
                                    {selectedGame.weather.temperature}°F, {selectedGame.weather.wind}
                                  </div>
                                  <div className="text-sm">
                                    {selectedGame.weather.humidity}% Humidity
                                  </div>
                                </div>
                              </div>
                              <div className="bg-muted/30 rounded-md p-3">
                                <h4 className="text-sm font-medium text-gray-500">Game Info</h4>
                                <div className="mt-1">
                                  <div className="font-medium">{selectedGame.venue}</div>
                                  <div className="text-sm">First Pitch: {selectedGame.time}</div>
                                  <div className="text-sm">
                                    {selectedGame.weather.temperature > 80 ? "Hot" : 
                                      selectedGame.weather.temperature < 60 ? "Cool" : "Mild"} conditions
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-primary/5 rounded-md border border-primary/10 p-4">
                              <h4 className="font-semibold mb-2 flex items-center">
                                <Users className="h-4 w-4 mr-2" />
                                Home Plate Umpire: {selectedGame.umpire.name}
                              </h4>
                              <div className="space-y-4">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Strike Zone Rating</span>
                                    <span className="font-medium">{selectedGame.umpire.strikeZoneRating}/10</span>
                                  </div>
                                  <Progress 
                                    value={selectedGame.umpire.strikeZoneRating * 10} 
                                    className="h-2"
                                  />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <div className="font-medium">Strike Zone Size</div>
                                    <div className="mt-1">{selectedGame.umpire.strikeZoneSize}</div>
                                  </div>
                                  <div>
                                    <div className="font-medium">Calls Above Average</div>
                                    <div className="mt-1">
                                      {selectedGame.umpire.callsAboveAverage > 0 ? '+' : ''}
                                      {selectedGame.umpire.callsAboveAverage} 
                                      {selectedGame.umpire.callsAboveAverage > 0 ? ' (Pitcher Friendly)' : 
                                        selectedGame.umpire.callsAboveAverage < 0 ? ' (Hitter Friendly)' : ' (Neutral)'}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <div className="font-medium">Experience</div>
                                    <div className="mt-1">{selectedGame.umpire.experience} Years</div>
                                  </div>
                                  <div>
                                    <div className="font-medium">Favors</div>
                                    <div className="mt-1">
                                      {selectedGame.umpire.favorsPitcherType === 'Neutral' ? 'Neutral' : `${selectedGame.umpire.favorsPitcherType} Pitchers`}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  <div>
                                    <div className="font-medium">Runs/Game</div>
                                    <div className="mt-1">{selectedGame.umpire.runsPerGame}</div>
                                  </div>
                                  <div>
                                    <div className="font-medium">Strikeouts/Game</div>
                                    <div className="mt-1">{selectedGame.umpire.strikeoutsPerGame}</div>
                                  </div>
                                  <div>
                                    <div className="font-medium">Walks/Game</div>
                                    <div className="mt-1">{selectedGame.umpire.walksPerGame}</div>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="font-medium text-sm mb-1">Over/Under Record</div>
                                  <div className="flex justify-between text-sm">
                                    <span>
                                      {selectedGame.umpire.overUnderRecord.overs}-{selectedGame.umpire.overUnderRecord.unders}
                                      {' '}({selectedGame.umpire.overUnderRecord.overPercentage}% Overs)
                                    </span>
                                    <span className={selectedGame.umpire.overUnderRecord.overPercentage > 52 ? 'text-green-600 font-medium' : 
                                      selectedGame.umpire.overUnderRecord.overPercentage < 48 ? 'text-red-600 font-medium' : ''}>
                                      {selectedGame.umpire.overUnderRecord.overPercentage > 52 ? 'Over Trend' : 
                                       selectedGame.umpire.overUnderRecord.overPercentage < 48 ? 'Under Trend' : 'Neutral'}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="text-sm">
                                  <div className="font-medium">Home Team Advantage</div>
                                  <div className="mt-1">
                                    {selectedGame.umpire.homeAwayInfluence.homeFavorRate}% favorable calls for home team
                                    {selectedGame.umpire.homeAwayInfluence.homeFavorRate > 52 ? 
                                      ' (Strong home team bias)' : 
                                      selectedGame.umpire.homeAwayInfluence.homeFavorRate < 48 ? 
                                      ' (Favors visitors)' : ' (Neutral)'}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {selectedGame.injuries.length > 0 && (
                              <div className="bg-red-50 rounded-md border border-red-200 p-4">
                                <h4 className="font-semibold mb-2 flex items-center">
                                  <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                                  Injury Report
                                </h4>
                                <div className="space-y-2">
                                  {selectedGame.injuries.map((injury, idx) => (
                                    <div key={idx} className="flex justify-between">
                                      <div>
                                        <span className="font-medium">{injury.player}</span>
                                        <span className="text-gray-600 ml-1">({injury.team}, {injury.position})</span>
                                      </div>
                                      <div>
                                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                                          {injury.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-3 text-sm text-gray-600">
                                  <strong>Impact:</strong> {selectedGame.injuries.length > 0 ? 
                                    "These injuries may affect team performance and could impact betting value." : 
                                    "No significant injuries reported."
                                  }
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold">Pitching Matchup</h3>
                          <div className="space-y-4 mt-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-muted/30 rounded-md p-4">
                                <h4 className="font-medium mb-1 flex items-center">
                                  <span className="text-blue-600 mr-1">●</span> 
                                  {selectedGame.awayPitcher.name} ({selectedGame.awayTeam.abbreviation})
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Record:</span>
                                    <span className="font-medium">{selectedGame.awayPitcher.wins}-{selectedGame.awayPitcher.losses}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>ERA:</span>
                                    <span className="font-medium">{selectedGame.awayPitcher.era}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>WHIP:</span>
                                    <span className="font-medium">{selectedGame.awayPitcher.whip}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>K/BB:</span>
                                    <span className="font-medium">
                                      {(selectedGame.awayPitcher.strikeouts / (selectedGame.awayPitcher.walks || 1)).toFixed(1)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Game Score:</span>
                                    <span className="font-medium">{selectedGame.awayPitcher.avgGameScore}</span>
                                  </div>
                                </div>
                                
                                <div className="mt-4">
                                  <h5 className="text-xs font-medium uppercase text-gray-500 mb-2">vs. This Umpire</h5>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span>Games:</span>
                                      <span className="font-medium">{selectedGame.awayPitcher.withUmpire?.games || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>ERA:</span>
                                      <span className={`font-medium ${
                                        selectedGame.awayPitcher.withUmpire && selectedGame.awayPitcher.withUmpire.era < selectedGame.awayPitcher.era ? 
                                          'text-green-600' : 
                                        selectedGame.awayPitcher.withUmpire && selectedGame.awayPitcher.withUmpire.era > selectedGame.awayPitcher.era ? 
                                          'text-red-600' : ''
                                      }`}>
                                        {selectedGame.awayPitcher.withUmpire?.era || 'N/A'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>K/BB:</span>
                                      <span className="font-medium">
                                        {selectedGame.awayPitcher.withUmpire ? 
                                          (selectedGame.awayPitcher.withUmpire.strikeouts / 
                                          (selectedGame.awayPitcher.withUmpire.walks || 1)).toFixed(1) : 
                                          'N/A'
                                        }
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="mt-4">
                                  <h5 className="text-xs font-medium uppercase text-gray-500 mb-2">vs. Opponent</h5>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span>Games:</span>
                                      <span className="font-medium">{selectedGame.awayPitcher.vsTeam.games}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>ERA:</span>
                                      <span className={`font-medium ${
                                        selectedGame.awayPitcher.vsTeam.era < selectedGame.awayPitcher.era ? 
                                          'text-green-600' : 
                                        selectedGame.awayPitcher.vsTeam.era > selectedGame.awayPitcher.era ? 
                                          'text-red-600' : ''
                                      }`}>
                                        {selectedGame.awayPitcher.vsTeam.era}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>WHIP:</span>
                                      <span className={`font-medium ${
                                        selectedGame.awayPitcher.vsTeam.whip < selectedGame.awayPitcher.whip ? 
                                          'text-green-600' : 
                                        selectedGame.awayPitcher.vsTeam.whip > selectedGame.awayPitcher.whip ? 
                                          'text-red-600' : ''
                                      }`}>
                                        {selectedGame.awayPitcher.vsTeam.whip}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-muted/30 rounded-md p-4">
                                <h4 className="font-medium mb-1 flex items-center">
                                  <span className="text-red-600 mr-1">●</span> 
                                  {selectedGame.homePitcher.name} ({selectedGame.homeTeam.abbreviation})
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Record:</span>
                                    <span className="font-medium">{selectedGame.homePitcher.wins}-{selectedGame.homePitcher.losses}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>ERA:</span>
                                    <span className="font-medium">{selectedGame.homePitcher.era}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>WHIP:</span>
                                    <span className="font-medium">{selectedGame.homePitcher.whip}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>K/BB:</span>
                                    <span className="font-medium">
                                      {(selectedGame.homePitcher.strikeouts / (selectedGame.homePitcher.walks || 1)).toFixed(1)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Game Score:</span>
                                    <span className="font-medium">{selectedGame.homePitcher.avgGameScore}</span>
                                  </div>
                                </div>
                                
                                <div className="mt-4">
                                  <h5 className="text-xs font-medium uppercase text-gray-500 mb-2">vs. This Umpire</h5>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span>Games:</span>
                                      <span className="font-medium">{selectedGame.homePitcher.withUmpire?.games || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>ERA:</span>
                                      <span className={`font-medium ${
                                        selectedGame.homePitcher.withUmpire && selectedGame.homePitcher.withUmpire.era < selectedGame.homePitcher.era ? 
                                          'text-green-600' : 
                                        selectedGame.homePitcher.withUmpire && selectedGame.homePitcher.withUmpire.era > selectedGame.homePitcher.era ? 
                                          'text-red-600' : ''
                                      }`}>
                                        {selectedGame.homePitcher.withUmpire?.era || 'N/A'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>K/BB:</span>
                                      <span className="font-medium">
                                        {selectedGame.homePitcher.withUmpire ? 
                                          (selectedGame.homePitcher.withUmpire.strikeouts / 
                                          (selectedGame.homePitcher.withUmpire.walks || 1)).toFixed(1) : 
                                          'N/A'
                                        }
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="mt-4">
                                  <h5 className="text-xs font-medium uppercase text-gray-500 mb-2">vs. Opponent</h5>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span>Games:</span>
                                      <span className="font-medium">{selectedGame.homePitcher.vsTeam.games}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>ERA:</span>
                                      <span className={`font-medium ${
                                        selectedGame.homePitcher.vsTeam.era < selectedGame.homePitcher.era ? 
                                          'text-green-600' : 
                                        selectedGame.homePitcher.vsTeam.era > selectedGame.homePitcher.era ? 
                                          'text-red-600' : ''
                                      }`}>
                                        {selectedGame.homePitcher.vsTeam.era}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>WHIP:</span>
                                      <span className={`font-medium ${
                                        selectedGame.homePitcher.vsTeam.whip < selectedGame.homePitcher.whip ? 
                                          'text-green-600' : 
                                        selectedGame.homePitcher.vsTeam.whip > selectedGame.homePitcher.whip ? 
                                          'text-red-600' : ''
                                      }`}>
                                        {selectedGame.homePitcher.vsTeam.whip}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <h4 className="font-medium mt-4">Recent Performance</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-sm font-medium mb-2">{selectedGame.awayPitcher.name} - Last 3 Starts</h5>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-[80px]">Opp</TableHead>
                                      <TableHead className="text-center">Result</TableHead>
                                      <TableHead className="text-center">IP</TableHead>
                                      <TableHead className="text-center">ER</TableHead>
                                      <TableHead className="text-center">K</TableHead>
                                      <TableHead className="text-center">GS</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {selectedGame.awayPitcher.last3Games.map((game, index) => (
                                      <TableRow key={index}>
                                        <TableCell className="font-medium">
                                          {game.opponent}
                                        </TableCell>
                                        <TableCell className="text-center">
                                          <span className={
                                            game.result === 'W' ? 'text-green-600 font-medium' : 
                                            game.result === 'L' ? 'text-red-600 font-medium' : ''
                                          }>
                                            {game.result}
                                          </span>
                                        </TableCell>
                                        <TableCell className="text-center">{game.innings}</TableCell>
                                        <TableCell className="text-center">{game.earnedRuns}</TableCell>
                                        <TableCell className="text-center">{game.strikeouts}</TableCell>
                                        <TableCell className="text-center font-medium">
                                          <span className={
                                            game.gameScore >= 65 ? 'text-green-600' : 
                                            game.gameScore <= 40 ? 'text-red-600' : ''
                                          }>
                                            {game.gameScore}
                                          </span>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                              
                              <div>
                                <h5 className="text-sm font-medium mb-2">{selectedGame.homePitcher.name} - Last 3 Starts</h5>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-[80px]">Opp</TableHead>
                                      <TableHead className="text-center">Result</TableHead>
                                      <TableHead className="text-center">IP</TableHead>
                                      <TableHead className="text-center">ER</TableHead>
                                      <TableHead className="text-center">K</TableHead>
                                      <TableHead className="text-center">GS</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {selectedGame.homePitcher.last3Games.map((game, index) => (
                                      <TableRow key={index}>
                                        <TableCell className="font-medium">
                                          {game.opponent}
                                        </TableCell>
                                        <TableCell className="text-center">
                                          <span className={
                                            game.result === 'W' ? 'text-green-600 font-medium' : 
                                            game.result === 'L' ? 'text-red-600 font-medium' : ''
                                          }>
                                            {game.result}
                                          </span>
                                        </TableCell>
                                        <TableCell className="text-center">{game.innings}</TableCell>
                                        <TableCell className="text-center">{game.earnedRuns}</TableCell>
                                        <TableCell className="text-center">{game.strikeouts}</TableCell>
                                        <TableCell className="text-center font-medium">
                                          <span className={
                                            game.gameScore >= 65 ? 'text-green-600' : 
                                            game.gameScore <= 40 ? 'text-red-600' : ''
                                          }>
                                            {game.gameScore}
                                          </span>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                            
                            <h4 className="font-medium mt-4">Splits Analysis</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-sm font-medium mb-2">{selectedGame.awayPitcher.name}</h5>
                                <div className="space-y-3">
                                  <div>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span>Home ERA: {selectedGame.awayPitcher.homeAwayStats.home.era}</span>
                                      <span>Away ERA: {selectedGame.awayPitcher.homeAwayStats.away.era}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-blue-600 rounded-full"
                                        style={{ 
                                          width: `${(selectedGame.awayPitcher.homeAwayStats.away.era / 
                                            (selectedGame.awayPitcher.homeAwayStats.home.era + 
                                            selectedGame.awayPitcher.homeAwayStats.away.era)) * 100}%` 
                                        }}
                                      ></div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {selectedGame.awayPitcher.homeAwayStats.away.era < selectedGame.awayPitcher.homeAwayStats.home.era ? 
                                        `Better on the road by ${(selectedGame.awayPitcher.homeAwayStats.home.era - selectedGame.awayPitcher.homeAwayStats.away.era).toFixed(2)} ERA` :
                                        `Better at home by ${(selectedGame.awayPitcher.homeAwayStats.away.era - selectedGame.awayPitcher.homeAwayStats.home.era).toFixed(2)} ERA`
                                      }
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span>Day ERA: {selectedGame.awayPitcher.dayNightStats.day.era}</span>
                                      <span>Night ERA: {selectedGame.awayPitcher.dayNightStats.night.era}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full ${
                                          selectedGame.time.includes('PM') && parseInt(selectedGame.time.split(':')[0]) >= 5 ? 
                                          'bg-blue-600' : 'bg-yellow-500'
                                        }`}
                                        style={{ 
                                          width: selectedGame.time.includes('PM') && parseInt(selectedGame.time.split(':')[0]) >= 5 ? 
                                            `${(selectedGame.awayPitcher.dayNightStats.night.era / 
                                              (selectedGame.awayPitcher.dayNightStats.day.era + 
                                              selectedGame.awayPitcher.dayNightStats.night.era)) * 100}%` :
                                            `${(selectedGame.awayPitcher.dayNightStats.day.era / 
                                              (selectedGame.awayPitcher.dayNightStats.day.era + 
                                              selectedGame.awayPitcher.dayNightStats.night.era)) * 100}%`
                                        }}
                                      ></div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {selectedGame.time.includes('PM') && parseInt(selectedGame.time.split(':')[0]) >= 5 ? 
                                        (selectedGame.awayPitcher.dayNightStats.night.era < selectedGame.awayPitcher.dayNightStats.day.era ?
                                          `Better in night games (current game time)` : 
                                          `Performs better in day games than night games (current)`) :
                                        (selectedGame.awayPitcher.dayNightStats.day.era < selectedGame.awayPitcher.dayNightStats.night.era ?
                                          `Better in day games (current game time)` : 
                                          `Performs better in night games than day games (current)`)
                                      }
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h5 className="text-sm font-medium mb-2">{selectedGame.homePitcher.name}</h5>
                                <div className="space-y-3">
                                  <div>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span>Home ERA: {selectedGame.homePitcher.homeAwayStats.home.era}</span>
                                      <span>Away ERA: {selectedGame.homePitcher.homeAwayStats.away.era}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-red-600 rounded-full"
                                        style={{ 
                                          width: `${(selectedGame.homePitcher.homeAwayStats.home.era / 
                                            (selectedGame.homePitcher.homeAwayStats.home.era + 
                                            selectedGame.homePitcher.homeAwayStats.away.era)) * 100}%` 
                                        }}
                                      ></div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {selectedGame.homePitcher.homeAwayStats.home.era < selectedGame.homePitcher.homeAwayStats.away.era ? 
                                        `Better at home by ${(selectedGame.homePitcher.homeAwayStats.away.era - selectedGame.homePitcher.homeAwayStats.home.era).toFixed(2)} ERA` :
                                        `Better on the road by ${(selectedGame.homePitcher.homeAwayStats.home.era - selectedGame.homePitcher.homeAwayStats.away.era).toFixed(2)} ERA`
                                      }
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span>Day ERA: {selectedGame.homePitcher.dayNightStats.day.era}</span>
                                      <span>Night ERA: {selectedGame.homePitcher.dayNightStats.night.era}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full ${
                                          selectedGame.time.includes('PM') && parseInt(selectedGame.time.split(':')[0]) >= 5 ? 
                                          'bg-red-600' : 'bg-yellow-500'
                                        }`}
                                        style={{ 
                                          width: selectedGame.time.includes('PM') && parseInt(selectedGame.time.split(':')[0]) >= 5 ? 
                                            `${(selectedGame.homePitcher.dayNightStats.night.era / 
                                              (selectedGame.homePitcher.dayNightStats.day.era + 
                                              selectedGame.homePitcher.dayNightStats.night.era)) * 100}%` :
                                            `${(selectedGame.homePitcher.dayNightStats.day.era / 
                                              (selectedGame.homePitcher.dayNightStats.day.era + 
                                              selectedGame.homePitcher.dayNightStats.night.era)) * 100}%`
                                        }}
                                      ></div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {selectedGame.time.includes('PM') && parseInt(selectedGame.time.split(':')[0]) >= 5 ? 
                                        (selectedGame.homePitcher.dayNightStats.night.era < selectedGame.homePitcher.dayNightStats.day.era ?
                                          `Better in night games (current game time)` : 
                                          `Performs better in day games than night games (current)`) :
                                        (selectedGame.homePitcher.dayNightStats.day.era < selectedGame.homePitcher.dayNightStats.night.era ?
                                          `Better in day games (current game time)` : 
                                          `Performs better in night games than day games (current)`)
                                      }
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-primary/5 border border-primary/10 rounded-md p-4 mt-4">
                              <h3 className="font-semibold mb-3">Expert Analysis & Umpire Impact</h3>
                              <div className="space-y-4">
                                <p className="text-sm">
                                  <strong>Umpire {selectedGame.umpire.name} Impact:</strong> With a strike zone rated 
                                  {' '}{selectedGame.umpire.strikeZoneRating}/10 and {selectedGame.umpire.strikeZoneSize.toLowerCase()} zone, 
                                  {' '}{selectedGame.umpire.name} tends to favor 
                                  {' '}{selectedGame.umpire.favorsPitcherType !== 'Neutral' ? 
                                    `${selectedGame.umpire.favorsPitcherType.toLowerCase()} pitchers` : 
                                    'neither power nor finesse pitchers'
                                  }. 
                                  {' '}Games with this umpire average {selectedGame.umpire.runsPerGame} runs 
                                  with an over rate of {selectedGame.umpire.overUnderRecord.overPercentage}%.
                                </p>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p>
                                      <strong>{selectedGame.awayPitcher.name}</strong> has 
                                      {' '}{selectedGame.awayPitcher.withUmpire?.games || 0} games with this umpire
                                      {' '}with a {selectedGame.awayPitcher.withUmpire?.era || 'N/A'} ERA 
                                      {selectedGame.awayPitcher.withUmpire && selectedGame.awayPitcher.withUmpire.era < selectedGame.awayPitcher.era ? 
                                        ' (better than his season ERA)' : 
                                      selectedGame.awayPitcher.withUmpire && selectedGame.awayPitcher.withUmpire.era > selectedGame.awayPitcher.era ? 
                                        ' (worse than his season ERA)' : ''
                                      }.
                                    </p>
                                    <p className="mt-2">
                                      As a {selectedGame.awayPitcher.handedness === 'L' ? 'left-handed' : 'right-handed'} pitcher, 
                                      {' '}{selectedGame.umpire.strikeZoneSize === 'Large' ? 
                                        'he should benefit from the larger strike zone' : 
                                        selectedGame.umpire.strikeZoneSize === 'Small' ? 
                                        'he may find the tight zone challenging' : 
                                        'he should see a fairly neutral zone'
                                      }.
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <p>
                                      <strong>{selectedGame.homePitcher.name}</strong> has 
                                      {' '}{selectedGame.homePitcher.withUmpire?.games || 0} games with this umpire
                                      {' '}with a {selectedGame.homePitcher.withUmpire?.era || 'N/A'} ERA 
                                      {selectedGame.homePitcher.withUmpire && selectedGame.homePitcher.withUmpire.era < selectedGame.homePitcher.era ? 
                                        ' (better than his season ERA)' : 
                                      selectedGame.homePitcher.withUmpire && selectedGame.homePitcher.withUmpire.era > selectedGame.homePitcher.era ? 
                                        ' (worse than his season ERA)' : ''
                                      }.
                                    </p>
                                    <p className="mt-2">
                                      The {selectedGame.homePitcher.handedness === 'L' ? 'left-handed' : 'right-handed'} pitcher
                                      {' '}might receive {selectedGame.umpire.homeAwayInfluence.homeFavorRate > 52 ? 
                                        'favorable home team treatment from this umpire' : 
                                        selectedGame.umpire.homeAwayInfluence.homeFavorRate < 48 ? 
                                        'less favorable calls despite being the home team' : 
                                        'neutral treatment from this umpire'
                                      }.
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="mt-3">
                                  <strong>Umpire-Based Advantage:</strong>
                                  {' '}{selectedGame.umpire.strikeZoneSize === 'Large' ? 
                                      (selectedGame.homePitcher.strikeouts > selectedGame.homePitcher.walks * 3 || 
                                       selectedGame.awayPitcher.strikeouts > selectedGame.awayPitcher.walks * 3) ? 
                                        'Pitchers with good control should benefit from the large strike zone.' : 
                                        'Neither pitcher has exceptional control to take full advantage of the large zone.' :
                                    selectedGame.umpire.strikeZoneSize === 'Small' ? 
                                      'Hitters should see more favorable counts with the tight zone.' : 
                                      'The neutral strike zone doesn\'t strongly favor either side.'
                                  }
                                  {' '}With an over percentage of {selectedGame.umpire.overUnderRecord.overPercentage}%, 
                                  the total of {selectedGame.lines.over} 
                                  {selectedGame.umpire.overUnderRecord.overPercentage > 52 ? 
                                    ' might be attainable given the umpire\'s tendency toward higher scoring games.' : 
                                    selectedGame.umpire.overUnderRecord.overPercentage < 48 ? 
                                    ' could be difficult to reach with this umpire\'s tendency toward lower scoring games.' : 
                                    ' seems appropriate with this umpire\'s neutral impact on scoring.'
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => {
                          setActiveTab("schedule");
                          setSelectedGameId(null);
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Back to Schedule
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Select a Game for Detailed Analysis</CardTitle>
                    <CardDescription>
                      Choose a game from today's schedule to view comprehensive analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {games.map((game) => (
                        <Card 
                          key={game.id} 
                          className="cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => setSelectedGameId(game.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center mb-3">
                              <div className="font-medium">{game.time}</div>
                              <Badge variant={getConfidenceBadgeVariant(game.earlyLeanConfidence)}>
                                {game.earlyLean}
                              </Badge>
                            </div>
                            <div className="mb-3">
                              <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center">
                                  <span className="font-medium">{game.awayTeam.name}</span>
                                  <span className="text-sm text-gray-500 ml-2">({game.awayTeam.record})</span>
                                </div>
                                <div>{formatOdds(game.lines.awayOdds)}</div>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <span className="font-medium">{game.homeTeam.name}</span>
                                  <span className="text-sm text-gray-500 ml-2">({game.homeTeam.record})</span>
                                </div>
                                <div>{formatOdds(game.lines.homeOdds)}</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <div className="text-gray-500">Pitchers</div>
                                <div>{game.awayPitcher.name}</div>
                                <div>{game.homePitcher.name}</div>
                              </div>
                              <div>
                                <div className="text-gray-500">Umpire</div>
                                <div>{game.umpire.name}</div>
                                <div className="text-xs">
                                  {game.umpire.overUnderRecord.overPercentage}% overs
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="props" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Top 5 Prop Bets</CardTitle>
                  <CardDescription>
                    Highest confidence player prop recommendations across all games
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topPropBets.map((prop) => (
                      <Card key={prop.id} className="overflow-hidden">
                        <div className={`h-1 ${
                          prop.confidence >= 8 ? 'bg-green-500' : 
                          prop.confidence >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <CardContent className="pt-4">
                          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="font-semibold text-lg">
                                  {prop.player} {prop.propType} {prop.recommendation === 'Over' ? 'Over' : 'Under'} {prop.line}
                                </div>
                                <Badge variant={getConfidenceBadgeVariant(prop.confidence)}>
                                  {prop.confidence}/10
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {prop.team} • Season Avg: {prop.playerSeasonAvg} • Last 5: {prop.playerLast5Avg} • vs Opponent: {prop.vsTeamAvg}
                              </div>
                              <div className="mt-3">{prop.reason}</div>
                            </div>
                            <div className="flex flex-col items-center justify-center min-w-[100px]">
                              <div className="text-xl font-bold">
                                {formatOdds(prop.recommendation === 'Over' ? prop.overOdds : prop.underOdds)}
                              </div>
                              <div className={`mt-1 text-sm ${getValueColorClass(prop.value)}`}>
                                {prop.value} Value
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-4 text-sm">
                            <div className="flex space-x-4">
                              <div>
                                <span className="text-gray-500">Matchup:</span>{' '}
                                {games.find(g => g.propBets.some(p => p.id === prop.id))?.awayTeam.abbreviation} @{' '}
                                {games.find(g => g.propBets.some(p => p.id === prop.id))?.homeTeam.abbreviation}
                              </div>
                              <div>
                                <span className="text-gray-500">Time:</span>{' '}
                                {games.find(g => g.propBets.some(p => p.id === prop.id))?.time}
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const gameId = games.find(g => g.propBets.some(p => p.id === prop.id))?.id;
                                if (gameId) {
                                  setSelectedGameId(gameId);
                                  setActiveTab('analysis');
                                  window.scrollTo(0, 0);
                                }
                              }}
                            >
                              View Game Analysis
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <div className="bg-muted/30 rounded-md p-4 mt-6">
                      <h3 className="font-semibold mb-2 flex items-center">
                        <Info className="h-4 w-4 mr-2 text-primary" />
                        Prop Betting Strategy
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          The prop bets above are our highest confidence plays for today's MLB slate. Each recommendation is backed by thorough statistical analysis, recent performance trends, and matchup considerations.
                        </p>
                        <p>
                          Our confidence rating (1-10) reflects the strength of each recommendation based on statistical advantage, line value, and situational factors. Ratings of 8+ represent our strongest plays.
                        </p>
                        <p>
                          We recommend considering parlaying complementary props (like pitcher strikeouts in the same game) and examining umpire tendencies when betting totals. Today's home plate umpires have significant impact on strikeout props in particular.
                        </p>
                      </div>
                    </div>
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