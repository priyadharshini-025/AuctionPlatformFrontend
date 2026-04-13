import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auctionAPI } from '../services/api';
import AuctionCard from '../components/AuctionCard';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

function Home() {
  const { user } = useAuth();
  const location = useLocation();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveAuctions();
  }, [location]); // Refetch when location changes (navigation)

  const fetchActiveAuctions = async () => {
    try {
      const response = await auctionAPI.getAll();
      // Sort auctions: active first, then upcoming, then ended
      const sortedAuctions = response.data
        .filter((auction) => ['active', 'upcoming', 'ended'].includes(auction.status))
        .sort((a, b) => {
          const statusOrder = { active: 0, upcoming: 1, ended: 2 };
          return statusOrder[a.status] - statusOrder[b.status];
        })
        .slice(0, 6); // Show only first 6
      setAuctions(sortedAuctions);
    } catch (err) {
      console.error('Error fetching auctions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white py-24 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black bg-opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Welcome to AuctionHub
          </h1>
          <p className="text-xl mb-7 text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Discover unique treasures and unbeatable deals through our exciting auction platform. 
            Buy, sell, and bid with confidence in a secure marketplace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auctions" className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
              🛍️ Browse Auctions
            </Link>
            {!user && (
              <Link to="/register" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                🚀 Register Now
              </Link>
            )}
            {user && (
              <Link to={user.role === 'seller' ? '/seller-dashboard' : '/user-dashboard'} className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl font-bold hover:from-orange-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                📊 My Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            🔥 Featured Auctions
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover amazing deals on unique items from our latest auctions - active, upcoming, and recent
          </p>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" color="indigo" />
            <p className="text-gray-500 mt-4">Loading amazing auctions...</p>
          </div>
        ) : auctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {auctions.map((auction) => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            <div className="text-6xl mb-4">🏷️</div>
            <p className="text-xl">No auctions available at the moment</p>
            <p className="text-gray-400 mt-2">Check back soon for exciting new listings!</p>
          </div>
        )}

        <div className="text-center mt-16">
          <Link to="/auctions" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center">
            <span>View All Auctions</span>
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-br from-white to-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              ✨ Why Choose AuctionHub?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Experience the future of online auctions with our cutting-edge features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                🔒
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Secure Bidding</h3>
              <p className="text-gray-600 leading-relaxed">
                Your bids and personal information are protected with industry-leading security measures and encryption.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                ⚡
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Real-time Updates</h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant notifications when you're outbid or when an auction ends. Stay connected in real-time.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                🌍
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Global Marketplace</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect with buyers and sellers from around the world in our diverse and vibrant marketplace.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
