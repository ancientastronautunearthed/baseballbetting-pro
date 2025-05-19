import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import type { News } from '@shared/schema';

interface NewsCardProps {
  newsItem: News;
}

const NewsCard = ({ newsItem }: NewsCardProps) => {
  const getCategoryBadgeClass = (category: string) => {
    switch (category.toLowerCase()) {
      case 'injury update':
        return 'bg-primary';
      case 'team news':
        return 'bg-primary';
      case 'analytics':
        return 'bg-primary';
      default:
        return 'bg-primary';
    }
  };

  const getImpactClass = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high':
        return 'text-secondary';
      case 'medium':
        return 'text-secondary';
      case 'low':
        return 'text-gray-500';
      default:
        return 'text-secondary';
    }
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };

  // Default image if none provided
  const defaultImage = "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400";

  return (
    <Card className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md stat-card">
      <img 
        src={newsItem.imageUrl || defaultImage} 
        alt={newsItem.title} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex items-center mb-3">
          <span className={`${getCategoryBadgeClass(newsItem.category)} text-white text-xs px-2 py-1 rounded mr-2`}>
            {newsItem.category}
          </span>
          <span className="text-gray-500 text-sm">
            {newsItem.publishDate ? formatDate(newsItem.publishDate) : 'N/A'}
          </span>
        </div>
        <h3 className="font-heading font-bold text-xl mb-2">{newsItem.title}</h3>
        <p className="text-gray-700 text-sm mb-3">{newsItem.excerpt}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-500">
            Impact: <span className={getImpactClass(newsItem.impact)}>{newsItem.impact}</span>
          </span>
          <a href="#" className="text-primary font-medium text-sm flex items-center">
            Read Analysis <i className="fas fa-arrow-right ml-1"></i>
          </a>
        </div>
      </div>
    </Card>
  );
};

export default NewsCard;
