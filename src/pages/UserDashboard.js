import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bidAPI, setupSessionExpirationTimer, getTokenExpirationType } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function UserDashboard() {
  const { user } = useAuth();
  const [bidHistory, setBidHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionWarning, setSessionWarning] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    setError('');
    setSessionWarning(null);
    setBidHistory([]);
    fetchBidHistory();
    
    // Set up session expiration warning
    setupSessionExpirationTimer((notification) => {
      if (notification.type === 'warning') {
        setSessionWarning(notification.message);
      }
    });
    
    // Update time remaining every minute
    const interval = setInterval(() => {
      const tokenInfo = getTokenExpirationType();
      if (tokenInfo) {
        const minutesLeft = Math.ceil(tokenInfo.timeUntilExpiration / 60000);
        setTimeRemaining(minutesLeft);
      }
    }, 60000); // Update every minute
    
    // Initial time update
    const tokenInfo = getTokenExpirationType();
    if (tokenInfo) {
      const minutesLeft = Math.ceil(tokenInfo.timeUntilExpiration / 60000);
      setTimeRemaining(minutesLeft);
    }
    
    return () => {
      clearInterval(interval);
    };
  }, [user]);

  const fetchBidHistory = async () => {
    try {
      const response = await bidAPI.getBidHistory();
      setBidHistory(response.data);
    } catch (err) {
      console.error('Error fetching bid history:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else if (err.message === 'Token expired') {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.response?.data?.msg || 'Error fetching bid history. Please try again.');
      }
      setBidHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">My Dashboard</h1>

        {/* User Profile Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Profile Information</h2>
            <Link
              to="/profile"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Edit Profile
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="text-lg font-bold">{user?.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="text-lg font-bold">{user?.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Contact</p>
              <p className="text-lg font-bold">{user?.contact || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-gray-600">Member Since</p>
              <p className="text-lg font-bold">{new Date(user?.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {sessionWarning && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8">
            <p className="font-bold">⚠️ Session Warning</p>
            <p className="mt-1">{sessionWarning}</p>
            {timeRemaining && (
              <p className="mt-2 text-sm">Time remaining: <strong>{timeRemaining}</strong> minutes</p>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            <strong>Error:</strong> {error}
            <Link
              to="/login"
              className="block mt-2 text-red-600 font-bold hover:underline"
            >
              Click here to log in again
            </Link>
          </div>
        )}

        {/* Bid History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Bid History</h2>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : bidHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold">Auction</th>
                    <th className="px-6 py-3 text-left font-bold">Seller Rating</th>
                    <th className="px-6 py-3 text-left font-bold">Your Bid Amount</th>
                    <th className="px-6 py-3 text-left font-bold">Bid Date</th>
                    <th className="px-6 py-3 text-left font-bold">Auction Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bidHistory.map((bid) => (
                    <tr key={bid._id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4">{bid.auction?.product?.name || 'Auction/Product Deleted'}</td>
                      <td className="px-6 py-4">
                        {bid.auction?.seller?.rating ? `${bid.auction.seller.rating}/5` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-bold text-green-600">${bid.amount}</td>
                      <td className="px-6 py-4">
                        {new Date(bid.time).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 capitalize">{bid.auction ? bid.auction.status : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No bids placed yet. <a href="/auctions" className="text-blue-600 hover:underline">Browse auctions</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
