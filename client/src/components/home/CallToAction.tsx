import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const CallToAction = () => {
  return (
    <section className="py-16 relative">
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: `url('https://pixabay.com/get/gaf6a0465a396a5938f0c0f154e2be3b08b695596affb55ec88b717aef15196c22124f2ba71e229b56104508ce4e853b99d19eaec28cc749e7c33cb4e56bac62e_1280.jpg')` }}
      ></div>
      <div className="absolute inset-0 bg-primary bg-opacity-80"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold font-heading mb-6">Gain Your MLB Edge Today</h2>
          <p className="text-xl mb-8">Join now and get your first 7 days of any subscription plan for just $1. No long-term commitment required.</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/subscribe">
              <Button variant="secondary" size="lg" className="font-bold py-3 px-8">
                Get Started For $1
              </Button>
            </Link>
            <Link href="/analysis">
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-transparent border-2 border-white hover:bg-white hover:text-primary text-white font-bold py-3 px-8"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
