import { Helmet } from 'react-helmet-async';
import Hero from '@/components/home/Hero';
import DailyPicks from '@/components/home/DailyPicks';
import AnalyticsDashboardPreview from '@/components/home/AnalyticsDashboardPreview';
import NewsInsights from '@/components/home/NewsInsights';
import SubscriptionPlans from '@/components/home/SubscriptionPlans';
import Testimonials from '@/components/home/Testimonials';
import CallToAction from '@/components/home/CallToAction';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>MLB Edge | Professional Baseball Wagering Analytics</title>
        <meta name="description" content="Get the edge in MLB wagering with advanced analytics, real-time data, and deep research to maximize your probability of winning." />
      </Helmet>

      <Hero />
      <DailyPicks />
      <AnalyticsDashboardPreview />
      <NewsInsights />
      <SubscriptionPlans />
      <Testimonials />
      <CallToAction />
    </>
  );
};

export default Home;
