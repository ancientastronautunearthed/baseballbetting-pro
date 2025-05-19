import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="relative h-96 md:h-[500px] bg-cover bg-center" style={{ backgroundImage: `url('https://pixabay.com/get/ge6676856dceee7a683ac9d2cc44e8ed7cd154f22dab839054eead51279d72c6c619780b1d56cabccf19bcf5b285abc586c23baa07506eafabd048480ddc895f8_1280.jpg')` }}>
      <div className="absolute inset-0 bg-primary bg-opacity-70"></div>
      <div className="container mx-auto px-4 relative h-full flex flex-col justify-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading">Gain The Edge In MLB Wagering</h1>
          <p className="text-xl mb-8">Advanced analytics, real-time data, and deep research to maximize your probability of winning.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/subscribe">
              <Button variant="secondary" size="lg" className="font-bold py-3 px-6">
                View Subscription Plans
              </Button>
            </Link>
            <Link href="/picks">
              <Button variant="outline" size="lg" className="bg-white hover:bg-opacity-90 text-primary font-bold py-3 px-6">
                See Today's Top Picks
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
