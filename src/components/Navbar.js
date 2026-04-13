import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white shadow-xl sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold">
            🎯 AuctionHub
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`relative px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                isActive('/') 
                  ? 'bg-white bg-opacity-20 text-white shadow-md' 
                  : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/auctions" 
              className={`relative px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                isActive('/auctions') 
                  ? 'bg-white bg-opacity-20 text-white shadow-md' 
                  : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              Browse Auctions
            </Link>

            {user ? (
              <>
                {user.role === 'user' &&
                 <Link 
                   to="/user-dashboard" 
                   className={`relative px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                     isActive('/user-dashboard') 
                       ? 'bg-white bg-opacity-20 text-white shadow-md' 
                       : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10'
                   }`}
                 >
                   My Bids
                 </Link>
                }
                <Link 
                  to="/profile" 
                  className={`relative px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                    isActive('/profile') 
                      ? 'bg-white bg-opacity-20 text-white shadow-md' 
                      : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  Profile
                </Link>
                {user.role === 'seller' && (
                  <>
                    <Link 
                      to="/seller-dashboard" 
                      className={`relative px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                        isActive('/seller-dashboard') 
                          ? 'bg-white bg-opacity-20 text-white shadow-md' 
                          : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10'
                      }`}
                    >
                      Seller Dashboard
                    </Link>
                    <Link 
                      to="/create-auction" 
                      className={`relative px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                        isActive('/create-auction') 
                          ? 'bg-white bg-opacity-20 text-white shadow-md' 
                          : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10'
                      }`}
                    >
                      Create Auction
                    </Link>
                  </>
                )}
                <button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-red-500 to-pink-600 px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 font-medium shadow-md"
                    >
                    Logout
                    </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`relative px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                    isActive('/login') 
                      ? 'bg-white bg-opacity-20 text-white shadow-md' 
                      : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 font-medium shadow-md"
                >
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
          <div className="md:hidden pb-4 space-y-2 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg mt-4 p-4">
            <Link 
              to="/" 
              className={`block transition-all duration-200 font-medium py-2 px-3 rounded-lg ${
                isActive('/') 
                  ? 'bg-white bg-opacity-20 text-white shadow-md' 
                  : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/auctions" 
              className={`block transition-all duration-200 font-medium py-2 px-3 rounded-lg ${
                isActive('/auctions') 
                  ? 'bg-white bg-opacity-20 text-white shadow-md' 
                  : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              Browse Auctions
            </Link>
            {user ? (
              <>
                {user.role === 'user' && (
                  <Link 
                    to="/user-dashboard" 
                    className={`block transition-all duration-200 font-medium py-2 px-3 rounded-lg ${
                      isActive('/user-dashboard') 
                        ? 'bg-white bg-opacity-20 text-white shadow-md' 
                        : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    My Bids
                  </Link>
                )}
                <Link 
                  to="/profile" 
                  className={`block transition-all duration-200 font-medium py-2 px-3 rounded-lg ${
                    isActive('/profile') 
                      ? 'bg-white bg-opacity-20 text-white shadow-md' 
                      : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                {user.role === 'seller' && (
                  <>
                    <Link 
                      to="/seller-dashboard" 
                      className={`block transition-all duration-200 font-medium py-2 px-3 rounded-lg ${
                        isActive('/seller-dashboard') 
                          ? 'bg-white bg-opacity-20 text-white shadow-md' 
                          : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10'
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      Seller Dashboard
                    </Link>
                    <Link 
                      to="/create-auction" 
                      className={`block transition-all duration-200 font-medium py-2 px-3 rounded-lg ${
                        isActive('/create-auction') 
                          ? 'bg-white bg-opacity-20 text-white shadow-md' 
                          : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10'
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      Create Auction
                    </Link>
                  </>
                )}
                <button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-red-500 to-pink-600 px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 font-medium shadow-md w-full text-left mt-2"
                    >
                    Logout
                    </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`block transition-all duration-200 font-medium py-2 px-3 rounded-lg ${
                    isActive('/login') 
                      ? 'bg-white bg-opacity-20 text-white shadow-md' 
                      : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 font-medium shadow-md block text-center mt-2" 
                  onClick={() => setMenuOpen(false)}
                >
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
