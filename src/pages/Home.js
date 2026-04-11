import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auctionAPI } from '../services/api';
import AuctionCard from '../components/AuctionCard';

function Home() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveAuctions();
  }, []);

  const fetchActiveAuctions = async () => {
    try {
      const response = await auctionAPI.getActive();
      const activeAuctions = response.data.filter((auction) => auction.status === 'active');
      setAuctions(activeAuctions.slice(0, 6));
    } catch (err) {
      console.error('Error fetching auctions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to AuctionHub</h1>
          <p className="text-xl mb-8">The ultimate platform for buying and selling through auctions</p>
          <div className="space-x-4">
            <Link to="/auctions" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100">
              Browse Auctions
            </Link>
            <Link to="/register" className="bg-green-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-600">
              Register Now
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-8">Featured Auctions</h2>
        
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : auctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">No active auctions at the moment</div>
        )}

        <div className="text-center mt-12">
          <Link to="/auctions" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700">
            View All Auctions
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose AuctionHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">Secure Bidding</h3>
              <p className="text-gray-600">Your bids and personal information are protected with industry-leading security.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Real-time Updates</h3>
              <p className="text-gray-600">Get instant notifications when you're outbid or when an auction ends.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold mb-2">Global Marketplace</h3>
              <p className="text-gray-600">Connect with Users and sellers from around the world.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
