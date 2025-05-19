import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import type { SubscriptionPlan } from '@shared/schema';

const SubscriptionPlans = () => {
  const { data: plans, isLoading, error } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription-plans'],
  });

  // Default plans in case API fails
  const defaultPlans = [
    {
      id: 1,
      name: 'Basic',
      price: 29,
      description: 'Perfect for casual bettors',
      features: [
        'Daily top 3 high-confidence picks',
        'Basic game analysis',
        'Daily MLB news digest',
        'Email delivery of picks'
      ],
      stripePriceId: 'basic_monthly'
    },
    {
      id: 2,
      name: 'Pro',
      price: 59,
      description: 'Most popular choice for serious bettors',
      features: [
        'All daily picks with confidence ratings',
        'Detailed game analysis & explanations',
        'Full access to MLB news & insights',
        'Mobile app access',
        'Basic analytics dashboard'
      ],
      stripePriceId: 'pro_monthly'
    },
    {
      id: 3,
      name: 'Elite',
      price: 99,
      description: 'The ultimate MLB wagering experience',
      features: [
        'Everything in Pro plan',
        'Advanced analytics dashboard access',
        'Historical model performance tracking',
        'Customizable alerts & notifications',
        'Weekly expert consultation',
        'Early access to picks (8 hrs advantage)'
      ],
      stripePriceId: 'elite_monthly'
    }
  ];

  const displayPlans = isLoading || error || !plans?.length ? defaultPlans : plans;

  return (
    <section id="subscriptions" className="py-12 bg-neutral">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold font-heading text-primary mb-3">Subscription Plans</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">Choose the plan that fits your needs and start making smarter MLB wagers today.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {displayPlans.map((plan, index) => {
            const isPopular = plan.name === 'Pro';
            
            return (
              <div 
                key={plan.id} 
                className={`subscription-card bg-white rounded-xl shadow-md overflow-hidden border-2 ${
                  isPopular ? 'border-secondary transform scale-105 md:scale-105 z-10 shadow-lg' : 'border-gray-200'
                }`}
              >
                <div className={`${isPopular ? 'bg-secondary' : 'bg-primary'} p-6 text-center text-white relative`}>
                  {isPopular && (
                    <span className="absolute top-0 right-0 bg-accent text-white text-xs px-3 py-1 rounded-bl-lg font-bold">
                      MOST POPULAR
                    </span>
                  )}
                  <h3 className="font-heading font-bold text-2xl">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-sm opacity-80">/month</span>
                  </div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <i className="fas fa-check text-accent mt-1 mr-2"></i>
                        <span>{feature}</span>
                      </li>
                    ))}
                    {/* Disabled features for Basic and Pro plans */}
                    {plan.name === 'Basic' && (
                      <>
                        <li className="flex items-start text-gray-400">
                          <i className="fas fa-times mt-1 mr-2"></i>
                          <span>Advanced analytics dashboard</span>
                        </li>
                        <li className="flex items-start text-gray-400">
                          <i className="fas fa-times mt-1 mr-2"></i>
                          <span>Historical performance tracking</span>
                        </li>
                      </>
                    )}
                    {plan.name === 'Pro' && (
                      <li className="flex items-start text-gray-400">
                        <i className="fas fa-times mt-1 mr-2"></i>
                        <span>Expert consultation</span>
                      </li>
                    )}
                  </ul>
                  <Link href={`/subscribe?plan=${plan.name.toLowerCase()}`}>
                    <Button 
                      className={`w-full ${isPopular ? 'bg-secondary' : 'bg-primary'} hover:bg-opacity-90 text-white font-bold py-3 px-4 rounded-lg`}
                    >
                      Select Plan
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-gray-600">All plans include a 7-day money-back guarantee. No long-term contracts required.</p>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionPlans;
