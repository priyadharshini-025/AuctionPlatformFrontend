import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold">
            🎯 AuctionHub
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link to="/" className="hover:text-blue-200">Home</Link>
            <Link to="/auctions" className="hover:text-blue-200">Browse Auctions</Link>

            {user ? (
              <>
                {user.role === 'user' &&
                 <Link to="/user-dashboard" className="hover:text-blue-200">My Bids</Link>
                }
                <Link to="/profile" className="hover:text-blue-200">Profile</Link>
                {user.role === 'seller' && (
                  <>
                    <Link to="/seller-dashboard" className="hover:text-blue-200">Seller Dashboard</Link>
                    <Link to="/create-auction" className="hover:text-blue-200">Create Auction</Link>
                  </>
                )}
                <button
                    onClick={handleLogout}
                    className="bg-red-500 px-2 pb-1 rounded hover:bg-red-700"
                    >
                    Logout
                    </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200">Login</Link>
                <Link to="/register" className="bg-green-500 px-2 pb-1 rounded hover:bg-green-700">
                    Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white focus:outline-none"
            >
              ☰
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block hover:text-blue-200">Home</Link>
            <Link to="/auctions" className="block hover:text-blue-200">Browse Auctions</Link>
            {user ? (
              <>
                {user.role === 'user' && (
                  <Link to="/user-dashboard" className="block hover:text-blue-200">My Bids</Link>
                )}
                <Link to="/profile" className="block hover:text-blue-200">Profile</Link>
                {user.role === 'seller' && (
                  <>
                    <Link to="/seller-dashboard" className="block hover:text-blue-200">Seller Dashboard</Link>
                    <Link to="/create-auction" className="block hover:text-blue-200">Create Auction</Link>
                  </>
                )}
                <button
                    onClick={handleLogout}
                    className="bg-red-500 px-2 pb-1 rounded hover:bg-red-700"
                    >
                    Logout
                    </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block hover:text-blue-200">Login</Link>
                <Link to="/register" className="bg-green-500 px-2 pb-1 rounded hover:bg-green-700">
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
