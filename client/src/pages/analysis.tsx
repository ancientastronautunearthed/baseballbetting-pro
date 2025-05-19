import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalysisPage = () => {
  const [teamFilter, setTeamFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7');

  // Mock data for visualization - in a real app this would come from API
  const teamOptions = [
    { value: 'all', label: 'All Teams' },
    { value: 'NYY', label: 'New York Yankees' },
    { value: 'BOS', label: 'Boston Red Sox' },
    { value: 'LAD', label: 'Los Angeles Dodgers' },
    { value: 'CHC', label: 'Chicago Cubs' },
    { value: 'HOU', label: 'Houston Astros' },
  ];

  const performanceData = [
    { date: '6/1', winRate: 67, pickCount: 9 },
    { date: '6/2', winRate: 71, pickCount: 7 },
    { date: '6/3', winRate: 63, pickCount: 8 },
    { date: '6/4', winRate: 75, pickCount: 8 },
    { date: '6/5', winRate: 60, pickCount: 10 },
    { date: '6/6', winRate: 78, pickCount: 9 },
    { date: '6/7', winRate: 67, pickCount: 6 },
  ];

  const confidenceData = [
    { confidence: '90-100%', winRate: 89, count: 18 },
    { confidence: '80-89%', winRate: 82, count: 22 },
    { confidence: '70-79%', winRate: 76, count: 25 },
    { confidence: '60-69%', winRate: 64, count: 28 },
    { confidence: '<60%', winRate: 52, count: 23 },
  ];

  const teamPerformanceData = [
    { team: 'NYY', home: 72, away: 65 },
    { team: 'BOS', home: 68, away: 61 },
    { team: 'LAD', home: 75, away: 69 },
    { team: 'CHC', home: 66, away: 58 },
    { team: 'HOU', home: 73, away: 67 },
  ];

  return (
    <>
      <Helmet>
        <title>Analytics Dashboard | MLB Edge</title>
        <meta name="description" content="Explore our advanced baseball analytics dashboard with detailed performance metrics, predictions, and historical data." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold font-heading text-primary mb-6">MLB Analytics Dashboard</h1>
        
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-4">
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Team" />
              </SelectTrigger>
              <SelectContent>
                {teamOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="season">Full Season</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Tabs defaultValue="performance" className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-3 w-full sm:w-[400px]">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="confidence">Confidence</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-heading">Overall Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">68.5%</div>
              <p className="text-sm text-gray-500">Last {dateRange} days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-heading">High Confidence Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-accent">82.3%</div>
              <p className="text-sm text-gray-500">For picks with 80%+ confidence</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-heading">Total Picks Analyzed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-secondary">387</div>
              <p className="text-sm text-gray-500">Last {dateRange} days</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Performance Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="winRate" stroke="var(--accent)" name="Win Rate (%)" />
                  <Line type="monotone" dataKey="pickCount" stroke="var(--secondary)" name="Number of Picks" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Win Rate by Confidence Level</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confidenceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="confidence" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="winRate" fill="var(--primary)" name="Win Rate (%)" />
                  <Bar dataKey="count" fill="var(--secondary)" name="Number of Picks" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Team Performance Home vs. Away</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamPerformanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="team" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="home" fill="var(--primary)" name="Home Win %" />
                <Bar dataKey="away" fill="var(--secondary)" name="Away Win %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <div className="mt-8 bg-neutral p-6 rounded-lg">
          <h2 className="text-xl font-bold font-heading text-primary mb-3">Analytics Dashboard Overview</h2>
          <p className="text-gray-700 mb-4">
            Our analytics dashboard provides detailed insights into the performance of our MLB predictions, 
            allowing you to track historical accuracy, analyze patterns, and make more informed wagering decisions.
          </p>
          <div className="text-sm text-gray-600">
            <p>• Performance metrics are updated daily after games are completed</p>
            <p>• Elite subscribers have access to additional team-specific analytics and custom filters</p>
            <p>• Historical data available for the entire MLB season</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalysisPage;
