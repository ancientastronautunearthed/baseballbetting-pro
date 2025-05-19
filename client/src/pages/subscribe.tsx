import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SubscriptionPlan } from '@shared/schema';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

const SubscribeForm = ({ planId }: { planId: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!stripe || !elements) {
      setIsSubmitting(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/dashboard?subscription=success",
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "You are now subscribed!",
      });
      setLocation("/dashboard");
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full bg-secondary hover:bg-opacity-90" 
        disabled={!stripe || isSubmitting}
      >
        {isSubmitting ? "Processing..." : "Subscribe Now"}
      </Button>
    </form>
  );
};

const SubscribePage = () => {
  const [location] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string>("");
  const { toast } = useToast();

  // Get URL parameters
  const params = new URLSearchParams(location.split('?')[1]);
  const planParam = params.get('plan');

  const { data: plans, isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription-plans'],
  });

  // Set initial plan based on URL parameter
  useEffect(() => {
    if (planParam && !selectedPlan) {
      setSelectedPlan(planParam);
    } else if (plans && plans.length > 0 && !selectedPlan) {
      setSelectedPlan(plans[0].name.toLowerCase());
    }
  }, [planParam, plans, selectedPlan]);

  // Create subscription intent when plan changes
  useEffect(() => {
    if (!selectedPlan) return;

    const createSubscription = async () => {
      try {
        const res = await apiRequest("POST", "/api/create-subscription", {
          plan: selectedPlan
        });
        const data = await res.json();
        setClientSecret(data.clientSecret);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to initialize subscription. Please try again.",
          variant: "destructive",
        });
      }
    };

    createSubscription();
  }, [selectedPlan, toast]);

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

  const displayPlans = plansLoading || !plans?.length ? defaultPlans : plans;

  return (
    <>
      <Helmet>
        <title>Subscribe | MLB Edge</title>
        <meta name="description" content="Choose a subscription plan to get access to our MLB predictions, analysis, and insights to improve your wagering success." />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold font-heading text-primary mb-6 text-center">Subscribe to MLB Edge</h1>
          <p className="text-lg text-gray-600 mb-8 text-center">Choose the plan that fits your needs and start making smarter MLB wagers today.</p>
          
          <Tabs 
            defaultValue={selectedPlan || "basic"} 
            value={selectedPlan} 
            onValueChange={setSelectedPlan}
            className="mb-8"
          >
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="pro">Pro</TabsTrigger>
              <TabsTrigger value="elite">Elite</TabsTrigger>
            </TabsList>
            
            {displayPlans.map((plan) => {
              const planValue = plan.name.toLowerCase();
              return (
                <TabsContent key={plan.id} value={planValue}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl font-heading">{plan.name} Plan</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-sm opacity-80">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-bold mb-3">Plan Features:</h3>
                      <ul className="space-y-2">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <i className="fas fa-check text-accent mt-1 mr-2"></i>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {clientSecret && selectedPlan === planValue ? (
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                          <SubscribeForm planId={plan.stripePriceId} />
                        </Elements>
                      ) : (
                        <div className="mt-6">
                          <div className="animate-pulse flex justify-center">
                            <div className="h-10 bg-gray-200 w-full rounded"></div>
                          </div>
                          <p className="text-center mt-2 text-sm text-gray-500">Loading payment form...</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2 text-sm text-gray-500">
                      <p>• 7-day money-back guarantee</p>
                      <p>• Cancel anytime, no long-term contracts</p>
                      <p>• Secure payments with Stripe</p>
                    </CardFooter>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
          
          <div className="bg-neutral p-6 rounded-lg mt-8">
            <h2 className="text-xl font-bold font-heading text-primary mb-3">Why Subscribe to MLB Edge?</h2>
            <p className="text-gray-700 mb-4">
              Our subscription provides you with data-driven MLB predictions and insights that have helped thousands of 
              bettors make more informed wagering decisions. With our proprietary algorithm and expert analysis, you'll gain 
              a significant edge over traditional betting approaches.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start">
                <i className="fas fa-chart-line text-secondary mt-1 mr-2"></i>
                <span>Historical success rate of 67%+ on high confidence picks</span>
              </div>
              <div className="flex items-start">
                <i className="fas fa-database text-secondary mt-1 mr-2"></i>
                <span>Analysis of thousands of data points for each prediction</span>
              </div>
              <div className="flex items-start">
                <i className="fas fa-user-shield text-secondary mt-1 mr-2"></i>
                <span>Privacy-focused platform with secure payment processing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubscribePage;
