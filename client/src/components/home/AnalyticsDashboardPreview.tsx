import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const AnalyticsDashboardPreview = () => {
  return (
    <section className="py-12 bg-neutral">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold font-heading text-primary mb-3">Powered by Advanced Analytics</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">Our proprietary algorithm analyzes thousands of data points to give you the highest probability winning picks each day.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=600" 
            alt="Advanced baseball analytics dashboard" 
            className="w-full h-auto rounded-lg mb-6"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-neutral p-4 rounded-lg">
              <h3 className="font-heading font-bold text-xl mb-2 text-primary">Pitcher Analysis</h3>
              <p className="text-gray-700 mb-3">Deep analysis of starting and relief pitchers, including pitch selection, velocity trends, and matchup history.</p>
              <div className="flex items-center text-sm text-gray-600">
                <i className="fas fa-chart-line mr-2 text-secondary"></i>
                <span>Updated daily with real-time performance data</span>
              </div>
            </div>
            
            <div className="bg-neutral p-4 rounded-lg">
              <h3 className="font-heading font-bold text-xl mb-2 text-primary">Batting Metrics</h3>
              <p className="text-gray-700 mb-3">Comprehensive batting statistics beyond standard metrics, including exit velocity, hard-hit rates, and situational performance.</p>
              <div className="flex items-center text-sm text-gray-600">
                <i className="fas fa-chart-bar mr-2 text-secondary"></i>
                <span>Individual and team performance tracking</span>
              </div>
            </div>
            
            <div className="bg-neutral p-4 rounded-lg">
              <h3 className="font-heading font-bold text-xl mb-2 text-primary">Environmental Factors</h3>
              <p className="text-gray-700 mb-3">Weather conditions, ballpark effects, travel fatigue, and other external variables that impact game outcomes.</p>
              <div className="flex items-center text-sm text-gray-600">
                <i className="fas fa-cloud-sun-rain mr-2 text-secondary"></i>
                <span>Real-time weather and game condition updates</span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Link href="/analysis">
              <Button className="bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-md">
                Explore Our Analytics Platform
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsDashboardPreview;
