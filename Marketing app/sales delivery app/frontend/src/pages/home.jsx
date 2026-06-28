import Hero from '../components/hero.jsx';
import LatestCollection from '../components/latest.collection.jsx';
import BestSeller from '../components/best.seller.jsx';
import OurPolicy from '../components/our.policy.jsx';
import NewsletterBox from '../components/news.letter.box.jsx';
import useShop from '../hooks/useShop.js';

const Home = () => {
  const { productsLoading } = useShop();

  if (productsLoading) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <div className='w-12 h-12 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin' />
      </div>
    );
  }

  return (
    <div>
      <Hero />
      <LatestCollection />
      <BestSeller />
      <OurPolicy />
      <NewsletterBox />
    </div>
  );
};

export default Home;
