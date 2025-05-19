import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import NewsCard from '@/components/news/NewsCard';
import type { News } from '@shared/schema';

const NewsInsights = () => {
  const { data: newsItems, isLoading, error } = useQuery<News[]>({
    queryKey: ['/api/news/latest'],
  });

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <h2 className="text-3xl font-bold font-heading text-primary mb-3">Latest MLB News & Insights</h2>
          <p className="text-lg text-gray-600">Our team scours the latest news, injury reports, and team developments daily to inform our predictions.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-16 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-full text-center py-8">
              <p className="text-red-500">Unable to load news. Please try again later.</p>
            </div>
          ) : newsItems && newsItems.length > 0 ? (
            // News cards
            newsItems.slice(0, 3).map((item) => (
              <NewsCard key={item.id} newsItem={item} />
            ))
          ) : (
            // Empty state
            <div className="col-span-full text-center py-8">
              <p>No news available at the moment. Check back soon!</p>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/news">
            <Button variant="outline" className="border border-primary text-primary hover:bg-primary hover:text-white font-bold py-3 px-8 rounded-md">
              View All News & Insights
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewsInsights;
