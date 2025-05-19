import { useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GameCard from '@/components/picks/GameCard';
import NewsCard from '@/components/news/NewsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Game, User, Prediction, News } from '@shared/schema';

const Dashboard = () => {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();

  // Show subscription success toast if redirect from stripe payment
  useEffect(() => {
    const params = new URLSearchParams(search);
    if (params.get('subscription') === 'success') {
      toast({
        title: 'Subscription Activated',
        description: 'Thank you for subscribing to MLB Edge! Your account has been upgraded.',
      });
      // Clear the URL parameter
      setLocation('/dashboard', { replace: true });
    }
  }, [search, toast, setLocation]);

  // Get user data
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/auth/me'],
  });

  // Get today's picks
  const { data: todayPicks, isLoading: picksLoading } = useQuery<(Game & { prediction?: Prediction })[]>({
    queryKey: ['/api/picks/today'],
  });

  // Get recent news
  const { data: recentNews, isLoading: newsLoading } = useQuery<News[]>({
    queryKey: ['/api/news/latest'],
  });

  // Mock performance data
  const performanceData = [
    { date: 'May 1', winRate: 62 },
    { date: 'May 8', winRate: 65 },
    { date: 'May 15', winRate: 71 },
    { date: 'May 22', winRate: 68 },
    { date: 'May 29', winRate: 74 },
    { date: 'Jun 5', winRate: 69 },
    { date: 'Jun 12', winRate: 72 },
  ];

  return (
    <>
      <Helmet>
        <title>My Dashboard | MLB Edge</title>
        <meta name="description" content="View your MLB Edge dashboard with today's picks, performance metrics, and account information." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold font-heading text-primary">My Dashboard</h1>
          
          {/* Subscription badge */}
          {user && (
            <div className="mt-2 md:mt-0">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                user.subscriptionTier === 'elite' 
                  ? 'bg-secondary text-white' 
                  : user.subscriptionTier === 'pro'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-800'
              }`}>
                {user.subscriptionTier === 'free' ? 'Free Account' : `${user.subscriptionTier?.charAt(0).toUpperCase()}${user.subscriptionTier?.slice(1)} Subscriber`}
              </span>
            </div>
          )}
        </div>
        
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="picks">Today's Picks</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-heading">Today's Picks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-primary">{todayPicks?.length || 0}</div>
                  <p className="text-sm text-gray-500">Available picks for today</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-heading">Win Rate (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-accent">72%</div>
                  <p className="text-sm text-gray-500">Based on recommended picks</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-heading">Subscription Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-primary capitalize">
                    {user?.subscriptionTier || 'Free'}
                  </div>
                  <p className="text-sm text-gray-500">
                    {user?.subscriptionTier === 'free' 
                      ? 'Upgrade for full access' 
                      : 'Active subscription'}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading">Recent Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={performanceData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[50, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="winRate" name="Win Rate (%)" fill="var(--primary)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading">Latest News</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-72 overflow-y-auto">
                    {newsLoading ? (
                      <div className="animate-pulse space-y-3">
                        {[1, 2].map(i => (
                          <div key={i} className="flex space-x-3">
                            <div className="h-12 w-12 bg-gray-200 rounded"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded"></div>
                              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : recentNews?.length ? (
                      recentNews.slice(0, 3).map(news => (
                        <div key={news.id} className="flex border-b border-gray-100 pb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-sm">{news.title}</h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {news.category} • Impact: <span className="text-secondary">{news.impact}</span>
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No recent news available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="picks">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Today's MLB Picks</CardTitle>
              </CardHeader>
              <CardContent>
                {picksLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-64"></div>
                    ))}
                  </div>
                ) : todayPicks?.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {todayPicks.map(game => (
                      <GameCard key={game.id} game={game} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-lg font-medium">No picks available for today</p>
                    <p className="text-sm text-gray-500 mt-2">Check back later for updated picks</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Pick Performance History</CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={performanceData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[50, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="winRate" name="Win Rate (%)" fill="var(--primary)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Account Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {userLoading ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ) : user ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Username</h3>
                        <p>{user.username}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                        <p>{user.email}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Subscription</h3>
                        <p className="capitalize">{user.subscriptionTier} Plan</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-red-500">Unable to load account information</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Subscription Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {userLoading ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ) : user ? (
                    <>
                      <div className="space-y-4 mb-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Current Plan</h3>
                          <p className="capitalize font-medium">{user.subscriptionTier} Plan</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Status</h3>
                          <p className="text-accent">Active</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Next Billing Date</h3>
                          <p>July 15, 2023</p>
                        </div>
                      </div>
                      {user.subscriptionTier !== 'elite' && (
                        <div className="mt-4">
                          <a href="/subscribe" className="text-primary hover:underline font-medium text-sm">
                            Upgrade your subscription
                          </a>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-red-500">Unable to load subscription information</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Dashboard;
