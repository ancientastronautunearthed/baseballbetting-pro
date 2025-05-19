import { InsertGame, InsertNews } from "@shared/schema";
import { format, parse, addDays } from "date-fns";

// MLB Stats API URLs
const MLB_API_BASE_URL = "https://statsapi.mlb.com/api/v1";
const MLB_SCHEDULE_URL = `${MLB_API_BASE_URL}/schedule`;
const MLB_TEAM_URL = `${MLB_API_BASE_URL}/teams`;
const MLB_NEWS_URL = `${MLB_API_BASE_URL}/news`;

interface MLBGame {
  gamePk: number;
  gameDate: string;
  teams: {
    away: {
      team: {
        id: number;
        name: string;
        abbreviation?: string;
      };
      leagueRecord?: {
        wins: number;
        losses: number;
      };
    };
    home: {
      team: {
        id: number;
        name: string;
        abbreviation?: string;
      };
      leagueRecord?: {
        wins: number;
        losses: number;
      };
    };
  };
  status: {
    abstractGameState: string;
  };
}

interface MLBTeam {
  id: number;
  name: string;
  abbreviation: string;
}

interface MLBNewsItem {
  headline: string;
  subhead: string;
  body: string;
  image: {
    url: string;
  };
  published: string;
  tags: {
    name: string;
    displayName: string;
    type: string;
  }[];
}

/**
 * Fetches MLB games for a specific date
 */
export async function fetchMLBGames(date: string): Promise<InsertGame[]> {
  try {
    // In a real implementation, we would call the MLB API
    // For now, generate some realistic data
    
    const formattedDate = format(parse(date, "yyyy-MM-dd", new Date()), "MM/dd/yyyy");
    
    // Generate some teams for the games
    const teams = [
      { name: "New York Yankees", abbreviation: "NYY", record: "62-48" },
      { name: "Boston Red Sox", abbreviation: "BOS", record: "58-53" },
      { name: "Houston Astros", abbreviation: "HOU", record: "66-45" },
      { name: "Texas Rangers", abbreviation: "TEX", record: "59-52" },
      { name: "Los Angeles Dodgers", abbreviation: "LAD", record: "70-40" },
      { name: "San Francisco Giants", abbreviation: "SF", record: "56-55" },
      { name: "Chicago Cubs", abbreviation: "CHC", record: "59-51" },
      { name: "St. Louis Cardinals", abbreviation: "STL", record: "51-59" },
      { name: "Atlanta Braves", abbreviation: "ATL", record: "68-42" },
      { name: "Philadelphia Phillies", abbreviation: "PHI", record: "60-50" }
    ];
    
    // Generate 3-5 games for the day
    const gameCount = Math.floor(Math.random() * 3) + 3;
    const games: InsertGame[] = [];
    const usedTeamIndexes: number[] = [];
    
    for (let i = 0; i < gameCount; i++) {
      // Select random teams that haven't been used yet
      let homeTeamIndex = Math.floor(Math.random() * teams.length);
      while (usedTeamIndexes.includes(homeTeamIndex)) {
        homeTeamIndex = Math.floor(Math.random() * teams.length);
      }
      usedTeamIndexes.push(homeTeamIndex);
      
      let awayTeamIndex = Math.floor(Math.random() * teams.length);
      while (awayTeamIndex === homeTeamIndex || usedTeamIndexes.includes(awayTeamIndex)) {
        awayTeamIndex = Math.floor(Math.random() * teams.length);
      }
      usedTeamIndexes.push(awayTeamIndex);
      
      // Generate random time for the game
      const hours = Math.floor(Math.random() * 6) + 16; // 4PM to 9PM
      const minutes = Math.random() > 0.5 ? 0 : 30;
      const gameTime = new Date();
      gameTime.setFullYear(parseInt(date.substring(0, 4)));
      gameTime.setMonth(parseInt(date.substring(5, 7)) - 1);
      gameTime.setDate(parseInt(date.substring(8, 10)));
      gameTime.setHours(hours, minutes, 0, 0);
      
      // Generate random moneylines
      const homeTeamMoneyline = Math.random() > 0.5 ? -Math.floor(Math.random() * 150) - 110 : Math.floor(Math.random() * 150) + 110;
      const awayTeamMoneyline = homeTeamMoneyline < 0 ? Math.floor(Math.random() * 150) + 110 : -Math.floor(Math.random() * 150) - 110;
      
      games.push({
        mlbId: `${date}-${i}-${teams[homeTeamIndex].abbreviation}-${teams[awayTeamIndex].abbreviation}`,
        homeTeam: teams[homeTeamIndex].name,
        awayTeam: teams[awayTeamIndex].name,
        homeTeamAbbreviation: teams[homeTeamIndex].abbreviation,
        awayTeamAbbreviation: teams[awayTeamIndex].abbreviation,
        homeTeamRecord: teams[homeTeamIndex].record,
        awayTeamRecord: teams[awayTeamIndex].record,
        homeTeamMoneyline: homeTeamMoneyline,
        awayTeamMoneyline: awayTeamMoneyline,
        startTime: gameTime,
        status: "scheduled",
        gameDate: date
      });
    }
    
    return games;
  } catch (error) {
    console.error("Error fetching MLB games:", error);
    return [];
  }
}

/**
 * Fetches news about MLB teams
 */
export async function fetchTeamNews(): Promise<InsertNews[]> {
  try {
    // In a real implementation, we would call the MLB API
    // For now, generate some realistic news items
    
    const newsItems: InsertNews[] = [
      {
        title: "Dodgers' Star Pitcher Expected to Return Next Week",
        excerpt: "After missing three starts with shoulder inflammation, the Dodgers' ace is scheduled to return against the Padres next Tuesday.",
        content: "The Los Angeles Dodgers received positive news today as their star pitcher has been cleared to return to the rotation after dealing with shoulder inflammation. The three-time Cy Young Award winner has been sidelined for the past three weeks but has shown significant improvement during his recent bullpen sessions. According to the team's medical staff, the inflammation has subsided, and the pitcher has regained full range of motion. This is a major boost for the Dodgers as they head into a crucial series against the division-rival Padres next week. The team has managed to maintain their lead in the division despite his absence, but his return significantly strengthens their rotation for the playoff push.",
        category: "Injury Update",
        imageUrl: "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
        publishDate: new Date(),
        teams: ["Los Angeles Dodgers", "San Diego Padres"],
        impact: "High"
      },
      {
        title: "Yankees Make Significant Bullpen Trade Ahead of Deadline",
        excerpt: "The Yankees acquired a dominant left-handed reliever to strengthen their bullpen for the playoff push.",
        content: "The New York Yankees have bolstered their bullpen by acquiring a dominant left-handed reliever from the Detroit Tigers in exchange for two minor league prospects. The 31-year-old reliever has been one of the most effective relievers in baseball this season, posting a 1.92 ERA with 52 strikeouts in 42 innings. He features a devastating slider that has generated a 38% whiff rate and has limited left-handed batters to a .143 batting average. This trade addresses a clear need for the Yankees, who have struggled with left-handed relief options this season. The acquisition is expected to have an immediate impact on the team's late-inning strategy, particularly in matchups against lefty-heavy lineups like the Houston Astros and Boston Red Sox.",
        category: "Team News",
        imageUrl: "https://pixabay.com/get/g849a75f3cb6ae0a496efc79c4e25e3ce5a408842942c2372d965605ba62138beca1e99905607fd1909f07503b32fb598bccf2765a5300cedd7608daf7d16e816_1280.jpg",
        publishDate: new Date(new Date().setDate(new Date().getDate() - 1)),
        teams: ["New York Yankees", "Detroit Tigers"],
        impact: "Medium"
      },
      {
        title: "Home Run Rates Dropping in Second Half of Season",
        excerpt: "Data shows a 12% decrease in home run rates since the All-Star break, potentially due to changing weather patterns.",
        content: "A comprehensive analysis of MLB statistics reveals a noteworthy 12% decrease in home run rates since the All-Star break. This drop-off contrasts sharply with the record-setting pace observed during the first half of the season. Several factors appear to be contributing to this decline, with changing weather patterns emerging as a primary culprit. As summer progresses, many ballparks are experiencing higher humidity levels, which increases air density and creates greater resistance for batted balls. Additionally, advanced metrics indicate pitchers have adjusted their approaches, with a 7% increase in sinkers and two-seam fastballs being thrown low in the strike zone. The implications for betting markets are significant, as the league-wide shift could impact game totals and team performance projections, particularly for power-dependent offenses. Teams most affected include the Yankees, Braves, and Rangers, who have seen their home run production decrease by over 20% in this period.",
        category: "Analytics",
        imageUrl: "https://pixabay.com/get/g917df41ece73eba8cec97110451252397dc858d4bd44909e2ef01581df434cb7df59439d5957495d545de80f6ea3ae285b9d35133b1209da50adf51bc49dffdb_1280.jpg",
        publishDate: new Date(new Date().setDate(new Date().getDate() - 2)),
        teams: ["New York Yankees", "Atlanta Braves", "Texas Rangers"],
        impact: "Medium"
      },
      {
        title: "Star Shortstop Signs Record-Breaking Contract Extension",
        excerpt: "The young phenom has committed to a 10-year, $325 million contract, making him the highest-paid shortstop in MLB history.",
        content: "In a move that will reshape the competitive landscape of the American League, a star shortstop has signed a historic 10-year, $325 million contract extension with his current team. The deal, which includes a full no-trade clause and player options after the seventh and eighth years, makes him the highest-paid shortstop in baseball history. At just 25 years old, the four-time All-Star and two-time Gold Glove winner has established himself as one of the game's elite talents, combining a career .301 batting average with exceptional defensive metrics. The contract reflects both his on-field performance and marketability as one of baseball's most popular players. Team officials emphasized that securing their franchise cornerstone was their top priority this offseason. This signing will have significant implications for the upcoming free agent market, particularly for teams that were hoping to pursue the shortstop when his previous contract expired after next season.",
        category: "Team News",
        imageUrl: "",
        publishDate: new Date(new Date().setDate(new Date().getDate() - 3)),
        teams: ["Boston Red Sox"],
        impact: "High"
      },
      {
        title: "New Pitch Clock Rules Dramatically Reducing Game Times",
        excerpt: "MLB games are averaging just 2 hours and 38 minutes this season, down from 3 hours and 10 minutes last year.",
        content: "The implementation of MLB's new pitch clock rules has led to a dramatic reduction in game times, with contests now averaging just 2 hours and 38 minutes—a 32-minute decrease from last season's average of 3 hours and 10 minutes. This 17% reduction represents the most significant pace-of-play improvement in modern baseball history. Beyond the raw numbers, the faster pace has created noticeable changes in game dynamics. Pitchers are working more efficiently, batters are staying in the box, and the overall rhythm of games has improved according to fan surveys. The data also reveals interesting competitive effects: fastball velocity has decreased slightly in late innings, suggesting pitchers may be conserving energy differently under time constraints. Additionally, teams with younger rosters appear to be adapting more successfully to the new rules, potentially creating a slight competitive advantage. As players continue to adjust, these trends will be crucial to monitor for their impact on betting models and game predictions.",
        category: "Analytics",
        imageUrl: "",
        publishDate: new Date(new Date().setDate(new Date().getDate() - 4)),
        teams: [],
        impact: "Medium"
      }
    ];
    
    return newsItems;
  } catch (error) {
    console.error("Error fetching team news:", error);
    return [];
  }
}

/**
 * Fetches MLB team information including records and standings
 */
export async function fetchTeamInfo(teamId: number): Promise<any> {
  try {
    // In a real implementation, we would call the MLB API
    // For now, return empty object
    return {};
  } catch (error) {
    console.error("Error fetching team info:", error);
    return {};
  }
}
