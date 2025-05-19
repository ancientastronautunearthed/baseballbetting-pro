import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import NewsCard from '@/components/news/NewsCard';
import type { News } from '@shared/schema';

const NewsPage = () => {
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: newsItems, isLoading, error } = useQuery<News[]>({
    queryKey: ['/api/news'],
  });

  // Filter news based on category and search query
  const filteredNews = newsItems?.filter(item => {
    const matchesCategory = category === 'all' || item.category.toLowerCase() === category.toLowerCase();
    const matchesSearch = 
      searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Helmet>
        <title>MLB News & Insights | MLB Edge</title>
        <meta name="description" content="Latest MLB news, injury updates, team developments and analytical insights to inform your baseball wagering decisions." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold font-heading text-primary mb-6">MLB News & Insights</h1>
        
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search news..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="all" className="w-full sm:w-auto" value={category} onValueChange={setCategory}>
            <TabsList className="grid grid-cols-4 w-full sm:w-[400px]">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="injury update">Injuries</TabsTrigger>
              <TabsTrigger value="team news">Team News</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-16 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Unable to load news. Please try again later.</p>
          </div>
        ) : filteredNews?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map(newsItem => (
              <NewsCard key={newsItem.id} newsItem={newsItem} />
            ))}
          </div>
        ) : (
          <Card className="bg-white p-8 text-center">
            <p className="mb-2">No news items found with the current filters.</p>
            <p className="text-sm text-gray-500">Try changing your filter criteria or search terms.</p>
          </Card>
        )}
        
        <div className="mt-12 bg-neutral p-4 rounded-lg">
          <h2 className="text-xl font-bold font-heading text-primary mb-2">Our News Coverage</h2>
          <p className="text-gray-700">
            Our team constantly monitors MLB news, team announcements, injury reports, and statistical trends 
            to provide you with the most comprehensive coverage that may impact betting outcomes. 
            We analyze the significance of each development and provide insights on how it might affect future games.
          </p>
        </div>
      </div>
    </>
  );
};

export default NewsPage;
