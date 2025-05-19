import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
  };

  return (
    <footer className="bg-primary text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <i className="fas fa-baseball-ball text-secondary text-2xl"></i>
              <span className="text-2xl font-bold font-heading">MLB EDGE</span>
            </div>
            <p className="text-gray-300 mb-4">Advanced analytics and daily MLB picks to give you the betting edge.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-heading font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/picks"><a className="text-gray-300 hover:text-white transition">Today's Picks</a></Link></li>
              <li><Link href="/news"><a className="text-gray-300 hover:text-white transition">MLB News</a></Link></li>
              <li><Link href="/analysis"><a className="text-gray-300 hover:text-white transition">Analytics Dashboard</a></Link></li>
              <li><Link href="/subscribe"><a className="text-gray-300 hover:text-white transition">Subscription Plans</a></Link></li>
              <li><Link href="/dashboard"><a className="text-gray-300 hover:text-white transition">Performance History</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-bold text-lg mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition">Help Center</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Contact Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">FAQ</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-bold text-lg mb-4">Newsletter</h4>
            <p className="text-gray-300 mb-4">Get free MLB insights and betting tips every week.</p>
            <form className="flex flex-col space-y-2" onSubmit={handleSubmit}>
              <Input
                type="email"
                placeholder="Your email address"
                className="px-4 py-2 rounded bg-white bg-opacity-10 border border-gray-600 text-white focus:outline-none focus:border-secondary"
              />
              <Button type="submit" variant="secondary" className="font-bold">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} MLB Edge. All rights reserved. MLB Edge is not affiliated with Major League Baseball.</p>
          <p className="mt-2">This service is intended for entertainment purposes only. Please gamble responsibly.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
