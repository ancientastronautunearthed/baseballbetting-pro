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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

export default function BankrollManager() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  
  // Bankroll state
  const [totalBankroll, setTotalBankroll] = useState<number>(0);
  const [dailyBudget, setDailyBudget] = useState<number>(0);
  const [weeklyBudget, setWeeklyBudget] = useState<number>(0);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [riskTolerance, setRiskTolerance] = useState<number>(5);
  const [unitSize, setUnitSize] = useState<number>(0);
  const [maxUnitsPerBet, setMaxUnitsPerBet] = useState<number>(1);
  const [maxBetsPerDay, setMaxBetsPerDay] = useState<number>(3);
  const [saveSettings, setSaveSettings] = useState<boolean>(false);
  
  // Tracking state
  const [bettingHistoryExpanded, setBettingHistoryExpanded] = useState<boolean[]>([true, false, false, false, false]);
  
  // Performance metrics
  const [winRate, setWinRate] = useState<number>(0);
  const [profitLoss, setProfitLoss] = useState<number>(0);
  const [roi, setRoi] = useState<number>(0);
  
  // Mock betting history for demonstration
  const [bettingHistory, setBettingHistory] = useState([
    { 
      date: new Date().toISOString(),
      bets: [
        { id: 1, game: "BOS vs LAD", pick: "BOS -120", units: 1, result: "win", amount: 50, payout: 91.67 },
        { id: 2, game: "NYY vs HOU", pick: "Under 8.5", units: 2, result: "loss", amount: 100, payout: 0 }
      ]
    },
    { 
      date: format(addDays(new Date(), -1), 'yyyy-MM-dd'),
      bets: [
        { id: 3, game: "ATL vs PHI", pick: "ATL +115", units: 1, result: "win", amount: 50, payout: 107.5 },
        { id: 4, game: "CHC vs STL", pick: "STL -150", units: 1, result: "win", amount: 50, payout: 83.33 }
      ]
    },
    { 
      date: format(addDays(new Date(), -2), 'yyyy-MM-dd'),
      bets: [
        { id: 5, game: "SF vs LAD", pick: "LAD -135", units: 2, result: "loss", amount: 100, payout: 0 }
      ]
    },
    { 
      date: format(addDays(new Date(), -3), 'yyyy-MM-dd'),
      bets: [
        { id: 6, game: "NYM vs WSH", pick: "NYM -145", units: 1, result: "win", amount: 50, payout: 84.48 },
        { id: 7, game: "OAK vs SEA", pick: "SEA -180", units: 1, result: "win", amount: 50, payout: 77.78 }
      ]
    },
    { 
      date: format(addDays(new Date(), -4), 'yyyy-MM-dd'),
      bets: [
        { id: 8, game: "TB vs BAL", pick: "Under 8", units: 2, result: "loss", amount: 100, payout: 0 }
      ]
    }
  ]);
  
  // Load saved bankroll settings from local storage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('bankrollSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setTotalBankroll(settings.totalBankroll || 1000);
        setDailyBudget(settings.dailyBudget || 100);
        setWeeklyBudget(settings.weeklyBudget || 500);
        setMonthlyBudget(settings.monthlyBudget || 2000);
        setRiskTolerance(settings.riskTolerance || 5);
        setUnitSize(settings.unitSize || 50);
        setMaxUnitsPerBet(settings.maxUnitsPerBet || 2);
        setMaxBetsPerDay(settings.maxBetsPerDay || 3);
        setSaveSettings(true);
      } catch (error) {
        console.error('Error loading bankroll settings:', error);
      }
    } else {
      // Default values
      setTotalBankroll(1000);
      setDailyBudget(100);
      setWeeklyBudget(500);
      setMonthlyBudget(2000);
      setUnitSize(50);
      setMaxUnitsPerBet(2);
      setMaxBetsPerDay(3);
    }
  }, []);
  
  // Calculate performance metrics based on betting history
  useEffect(() => {
    // Calculate win rate
    const allBets = bettingHistory.flatMap(day => day.bets);
    const wins = allBets.filter(bet => bet.result === 'win').length;
    const winRateCalc = (wins / allBets.length) * 100;
    
    // Calculate profit/loss
    const totalPayout = allBets.reduce((sum, bet) => sum + bet.payout, 0);
    const totalStaked = allBets.reduce((sum, bet) => sum + bet.amount, 0);
    const profitLossCalc = totalPayout - totalStaked;
    
    // Calculate ROI
    const roiCalc = (profitLossCalc / totalStaked) * 100;
    
    setWinRate(winRateCalc);
    setProfitLoss(profitLossCalc);
    setRoi(roiCalc);
  }, [bettingHistory]);
  
  // Save bankroll settings to local storage
  useEffect(() => {
    if (saveSettings) {
      const settings = {
        totalBankroll,
        dailyBudget,
        weeklyBudget,
        monthlyBudget,
        riskTolerance,
        unitSize,
        maxUnitsPerBet,
        maxBetsPerDay
      };
      localStorage.setItem('bankrollSettings', JSON.stringify(settings));
    }
  }, [saveSettings, totalBankroll, dailyBudget, weeklyBudget, monthlyBudget, riskTolerance, unitSize, maxUnitsPerBet, maxBetsPerDay]);
  
  // Calculate today's remaining budget
  const getTodaysBudgetRemaining = () => {
    const today = new Date().toISOString().split('T')[0];
    const todaysBets = bettingHistory.find(day => day.date.startsWith(today))?.bets || [];
    const amountBet = todaysBets.reduce((sum, bet) => sum + bet.amount, 0);
    return dailyBudget - amountBet;
  };
  
  // Calculate this week's remaining budget
  const getWeeklyBudgetRemaining = () => {
    const startOfCurrentWeek = startOfWeek(new Date()).toISOString();
    const thisWeeksBets = bettingHistory
      .filter(day => new Date(day.date) >= new Date(startOfCurrentWeek))
      .flatMap(day => day.bets);
    const amountBet = thisWeeksBets.reduce((sum, bet) => sum + bet.amount, 0);
    return weeklyBudget - amountBet;
  };
  
  // Update all budget values when total bankroll changes
  const updateAllBudgets = (newBankroll: number) => {
    setTotalBankroll(newBankroll);
    
    // Update budgets based on standard bankroll management percentages
    const newDailyBudget = Math.round(newBankroll * 0.1); // 10% of bankroll
    const newWeeklyBudget = Math.round(newBankroll * 0.5); // 50% of bankroll
    const newMonthlyBudget = Math.round(newBankroll * 2); // 200% of bankroll (turnover)
    const newUnitSize = Math.round(newBankroll * 0.05); // 5% of bankroll
    
    setDailyBudget(newDailyBudget);
    setWeeklyBudget(newWeeklyBudget);
    setMonthlyBudget(newMonthlyBudget);
    setUnitSize(newUnitSize);
  };
  
  // Get recommended bet size based on confidence level
  const getRecommendedBetSize = (confidence: number) => {
    let recommendedUnits = 1; // Base unit for low confidence bets
    
    if (confidence >= 80) {
      recommendedUnits = Math.min(maxUnitsPerBet, 3); // High confidence
    } else if (confidence >= 65) {
      recommendedUnits = Math.min(maxUnitsPerBet, 2); // Medium confidence
    }
    
    // Adjust based on risk tolerance
    if (riskTolerance <= 3) { // Conservative
      recommendedUnits = Math.max(1, recommendedUnits - 1);
    } else if (riskTolerance >= 8) { // Aggressive
      recommendedUnits = Math.min(maxUnitsPerBet, recommendedUnits + 1);
    }
    
    return recommendedUnits * unitSize;
  };
  
  // Generate risk assessment text
  const getRiskAssessmentText = () => {
    if (riskTolerance <= 3) {
      return "Your current risk tolerance is conservative. This approach prioritizes capital preservation and long-term sustainability over short-term gains.";
    } else if (riskTolerance <= 7) {
      return "Your current risk tolerance is balanced. This approach seeks steady growth while limiting exposure to significant downswings.";
    } else {
      return "Your current risk tolerance is aggressive. This approach maximizes potential returns but increases vulnerability to bankroll depletion during losing streaks.";
    }
  };

  // Generate bankroll advice based on current performance and settings
  const getBankrollAdvice = () => {
    const advice = [];
    
    // Check if win rate is concerning
    if (winRate < 40) {
      advice.push("Your current win rate is below sustainable levels. Consider focusing more on high-confidence picks and reviewing your selection criteria.");
    }
    
    // Check ROI
    if (roi < -10) {
      advice.push("Your ROI is significantly negative. We recommend reducing your unit size temporarily and focusing only on the highest confidence plays until results improve.");
    } else if (roi > 20) {
      advice.push("Your ROI is excellent. Consider gradually increasing your unit size to maximize this positive trend, but remain disciplined with your bankroll management rules.");
    }
    
    // Check daily budget usage
    const todaysBudgetRemaining = getTodaysBudgetRemaining();
    if (todaysBudgetRemaining < 0) {
      advice.push("You've exceeded your daily budget. Take a break today and reset tomorrow with a clear mindset.");
    }
    
    // Check weekly budget
    const weeklyBudgetRemaining = getWeeklyBudgetRemaining();
    if (weeklyBudgetRemaining < weeklyBudget * 0.2) {
      advice.push("You're approaching your weekly budget limit. Consider being more selective with remaining picks this week.");
    }
    
    // Default advice
    if (advice.length === 0) {
      advice.push("Your bankroll management appears to be on track. Continue following your established limits and betting strategy.");
    }
    
    return advice;
  };

  return (
    <>
      <Helmet>
        <title>Bankroll Manager | MLB Edge</title>
        <meta name="description" content="Manage your sports betting bankroll, track performance, and follow disciplined wagering strategies." />
      </Helmet>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold font-heading bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">Bankroll Manager</h1>
              <p className="text-gray-600">
                Professional bankroll management tools and guidance
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="bg-muted/30 pb-2">
                <CardTitle className="text-center">Today's Budget</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 text-center">
                <div className="flex justify-center items-baseline mb-2">
                  <span className="text-3xl font-bold">${getTodaysBudgetRemaining()}</span>
                  <span className="text-gray-500 ml-2">/ ${dailyBudget}</span>
                </div>
                <Progress value={(getTodaysBudgetRemaining() / dailyBudget) * 100} className="h-2 mb-2" />
                <p className="text-sm text-gray-500">Remaining daily budget</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="bg-muted/30 pb-2">
                <CardTitle className="text-center">Weekly Budget</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 text-center">
                <div className="flex justify-center items-baseline mb-2">
                  <span className="text-3xl font-bold">${getWeeklyBudgetRemaining()}</span>
                  <span className="text-gray-500 ml-2">/ ${weeklyBudget}</span>
                </div>
                <Progress value={(getWeeklyBudgetRemaining() / weeklyBudget) * 100} className="h-2 mb-2" />
                <p className="text-sm text-gray-500">Remaining weekly budget</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="bg-muted/30 pb-2">
                <CardTitle className="text-center">Win Rate</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 text-center">
                <div className="flex justify-center items-baseline mb-2">
                  <span className="text-3xl font-bold">{winRate.toFixed(1)}%</span>
                </div>
                <Progress value={winRate} className="h-2 mb-2" />
                <p className="text-sm text-gray-500">Overall performance</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="tracking">Performance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bankroll Overview</CardTitle>
                  <CardDescription>
                    Professional bankroll management is the foundation of successful sports betting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-muted/30 p-4 rounded-lg border mb-4">
                      <h3 className="text-lg font-semibold mb-2">Your Current Status</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm mb-1 text-gray-500">Total Bankroll</p>
                          <p className="font-bold text-xl">${totalBankroll.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm mb-1 text-gray-500">Unit Size</p>
                          <p className="font-bold text-xl">${unitSize}</p>
                        </div>
                        <div>
                          <p className="text-sm mb-1 text-gray-500">Profit/Loss</p>
                          <p className={`font-bold text-xl ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm mb-1 text-gray-500">ROI</p>
                          <p className={`font-bold text-xl ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Today's Recommended Bet Sizing</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        <div className="p-3 bg-muted rounded-lg border">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-500">High Confidence (80%+)</span>
                            <Badge variant="secondary">Strong Play</Badge>
                          </div>
                          <span className="text-lg font-bold">${getRecommendedBetSize(80)}</span>
                        </div>
                        <div className="p-3 bg-muted rounded-lg border">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-500">Medium Confidence (65%+)</span>
                            <Badge>Moderate Play</Badge>
                          </div>
                          <span className="text-lg font-bold">${getRecommendedBetSize(65)}</span>
                        </div>
                        <div className="p-3 bg-muted rounded-lg border">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-500">Low Confidence (&lt;65%)</span>
                            <Badge variant="outline">Conservative Play</Badge>
                          </div>
                          <span className="text-lg font-bold">${getRecommendedBetSize(50)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                      <h3 className="text-lg font-semibold mb-3">Bankroll Advice</h3>
                      <ul className="space-y-2">
                        {getBankrollAdvice().map((advice, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-primary font-bold mr-2">•</span>
                            <span>{advice}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-muted p-4 rounded-lg border">
                      <h3 className="text-lg font-semibold mb-3">MLB Edge Bankroll Principles</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Do:</h4>
                          <ul className="space-y-1 pl-5 list-disc text-sm">
                            <li>Set aside a dedicated bankroll that you can afford to lose</li>
                            <li>Stick to your predetermined unit sizes based on confidence levels</li>
                            <li>Maintain consistent bet sizing regardless of recent outcomes</li>
                            <li>Take breaks after significant losses to reset mentally</li>
                            <li>Track all bets to identify patterns and improve strategy</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Don't:</h4>
                          <ul className="space-y-1 pl-5 list-disc text-sm">
                            <li>Chase losses by increasing bet sizes after losing streaks</li>
                            <li>Bet more than your daily/weekly limits regardless of "sure things"</li>
                            <li>Wager money needed for essential expenses</li>
                            <li>Make emotional betting decisions based on fandom or frustration</li>
                            <li>Ignore the bankroll advice system during downswings</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bankroll Settings</CardTitle>
                  <CardDescription>
                    Configure your bankroll management parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="totalBankroll">Total Bankroll ($)</Label>
                        <Input 
                          id="totalBankroll" 
                          type="number" 
                          value={totalBankroll} 
                          onChange={(e) => updateAllBudgets(Number(e.target.value))}
                          min={1}
                        />
                        <p className="text-sm text-gray-500">
                          Your total allocated bankroll for sports betting
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="unitSize">Unit Size ($)</Label>
                        <Input 
                          id="unitSize" 
                          type="number" 
                          value={unitSize} 
                          onChange={(e) => setUnitSize(Number(e.target.value))}
                          min={1}
                        />
                        <p className="text-sm text-gray-500">
                          Your standard betting unit (typically 1-5% of bankroll)
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="dailyBudget">Daily Budget ($)</Label>
                        <Input 
                          id="dailyBudget" 
                          type="number" 
                          value={dailyBudget} 
                          onChange={(e) => setDailyBudget(Number(e.target.value))}
                          min={1}
                        />
                        <p className="text-sm text-gray-500">
                          Maximum amount to wager daily
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="weeklyBudget">Weekly Budget ($)</Label>
                        <Input 
                          id="weeklyBudget" 
                          type="number" 
                          value={weeklyBudget} 
                          onChange={(e) => setWeeklyBudget(Number(e.target.value))}
                          min={1}
                        />
                        <p className="text-sm text-gray-500">
                          Maximum amount to wager weekly
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="monthlyBudget">Monthly Budget ($)</Label>
                        <Input 
                          id="monthlyBudget" 
                          type="number" 
                          value={monthlyBudget} 
                          onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                          min={1}
                        />
                        <p className="text-sm text-gray-500">
                          Maximum amount to wager monthly
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <Label>Risk Tolerance</Label>
                      <div className="pt-2">
                        <Slider
                          value={[riskTolerance]}
                          min={1}
                          max={10}
                          step={1}
                          onValueChange={(value) => setRiskTolerance(value[0])}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 pt-1">
                        <span>Conservative</span>
                        <span>Balanced</span>
                        <span>Aggressive</span>
                      </div>
                      <p className="text-sm mt-2">
                        {getRiskAssessmentText()}
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="maxUnitsPerBet">Maximum Units Per Bet</Label>
                        <Select value={maxUnitsPerBet.toString()} onValueChange={(value) => setMaxUnitsPerBet(Number(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select maximum units" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Maximum Units</SelectLabel>
                              <SelectItem value="1">1 unit</SelectItem>
                              <SelectItem value="2">2 units</SelectItem>
                              <SelectItem value="3">3 units</SelectItem>
                              <SelectItem value="4">4 units</SelectItem>
                              <SelectItem value="5">5 units</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-500">
                          Maximum number of units to wager on a single bet
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="maxBetsPerDay">Maximum Bets Per Day</Label>
                        <Select value={maxBetsPerDay.toString()} onValueChange={(value) => setMaxBetsPerDay(Number(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select maximum bets" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Maximum Bets</SelectLabel>
                              <SelectItem value="1">1 bet</SelectItem>
                              <SelectItem value="2">2 bets</SelectItem>
                              <SelectItem value="3">3 bets</SelectItem>
                              <SelectItem value="4">4 bets</SelectItem>
                              <SelectItem value="5">5 bets</SelectItem>
                              <SelectItem value="10">10 bets</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-500">
                          Maximum number of bets to place each day
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="saveSettings" 
                        checked={saveSettings} 
                        onCheckedChange={(checked) => setSaveSettings(checked as boolean)}
                      />
                      <label
                        htmlFor="saveSettings"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Save these settings for future sessions
                      </label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      localStorage.removeItem('bankrollSettings');
                      window.location.reload();
                    }}
                  >
                    Reset to Default
                  </Button>
                  <Button 
                    onClick={() => {
                      if (saveSettings) {
                        localStorage.setItem('bankrollSettings', JSON.stringify({
                          totalBankroll,
                          dailyBudget,
                          weeklyBudget,
                          monthlyBudget,
                          riskTolerance,
                          unitSize,
                          maxUnitsPerBet,
                          maxBetsPerDay
                        }));
                      }
                      toast({
                        title: "Settings Saved",
                        description: "Your bankroll settings have been updated.",
                      });
                    }}
                  >
                    Save Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="tracking" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Tracking</CardTitle>
                  <CardDescription>
                    Track your betting performance and identify patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="border">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <span className="text-xs font-semibold uppercase text-gray-500">Win Rate</span>
                            <div className={`text-2xl font-bold ${winRate >= 52.4 ? 'text-green-600' : 'text-red-600'}`}>
                              {winRate.toFixed(1)}%
                            </div>
                            <span className="text-xs text-gray-500 block mt-1">
                              {winRate >= 52.4 ? 'Profitable' : 'Below breakeven'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <span className="text-xs font-semibold uppercase text-gray-500">Profit/Loss</span>
                            <div className={`text-2xl font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${Math.abs(profitLoss).toFixed(2)}
                              <span className="text-xs ml-1">{profitLoss >= 0 ? 'profit' : 'loss'}</span>
                            </div>
                            <span className="text-xs text-gray-500 block mt-1">
                              Last 30 days
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <span className="text-xs font-semibold uppercase text-gray-500">ROI</span>
                            <div className={`text-2xl font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {roi.toFixed(2)}%
                            </div>
                            <span className="text-xs text-gray-500 block mt-1">
                              Return on investment
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Separator />
                    
                    <h3 className="text-lg font-semibold">Betting History</h3>
                    <Accordion type="multiple" defaultValue={['item-0']} className="w-full">
                      {bettingHistory.map((day, i) => (
                        <AccordionItem key={i} value={`item-${i}`}>
                          <AccordionTrigger className="text-left">
                            <div className="flex justify-between w-full pr-4">
                              <span>{format(new Date(day.date), 'EEEE, MMMM d, yyyy')}</span>
                              <span className="text-gray-500">
                                {day.bets.length} {day.bets.length === 1 ? 'bet' : 'bets'}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4">
                              {day.bets.map((bet) => (
                                <div key={bet.id} className="p-3 rounded-lg border grid grid-cols-1 md:grid-cols-5 gap-3">
                                  <div>
                                    <span className="text-xs text-gray-500 block">Game</span>
                                    <span className="font-medium">{bet.game}</span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500 block">Pick</span>
                                    <span className="font-medium">{bet.pick}</span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500 block">Units</span>
                                    <span className="font-medium">{bet.units}</span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500 block">Amount</span>
                                    <span className="font-medium">${bet.amount}</span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500 block">Result</span>
                                    <span className={`font-medium ${bet.result === 'win' ? 'text-green-600' : 'text-red-600'}`}>
                                      {bet.result === 'win' ? `Win (+$${(bet.payout - bet.amount).toFixed(2)})` : `Loss (-$${bet.amount})`}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              
                              <div className="flex justify-between text-sm pt-2">
                                <span>
                                  Daily total: <span className="font-medium">${day.bets.reduce((sum, bet) => sum + bet.amount, 0)}</span>
                                </span>
                                <span>
                                  Daily P/L: <span className={`font-medium ${day.bets.reduce((sum, bet) => sum + bet.payout - bet.amount, 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {day.bets.reduce((sum, bet) => sum + bet.payout - bet.amount, 0) >= 0 ? '+' : ''}
                                    ${day.bets.reduce((sum, bet) => sum + bet.payout - bet.amount, 0).toFixed(2)}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                    
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 mt-6">
                      <h3 className="text-lg font-semibold mb-3">Performance Insights</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="font-medium mb-1">Best Performing Bet Types:</p>
                          <p className="text-sm">Moneyline favorites (71% win rate), Home underdogs (63% win rate)</p>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Worst Performing Bet Types:</p>
                          <p className="text-sm">Run line away favorites (42% win rate), Over bets (46% win rate)</p>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Recommendation:</p>
                          <p className="text-sm">Focus more on moneyline bets and reduce volume on totals until results improve.</p>
                        </div>
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