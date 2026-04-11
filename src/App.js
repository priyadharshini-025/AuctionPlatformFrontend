import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import BrowseAuctions from './pages/BrowseAuctions';
import AuctionDetail from './pages/AuctionDetail';
import SellerDashboard from './pages/SellerDashboard';
import UserDashboard from './pages/UserDashboard';
import CreateAuction from './pages/CreateAuction';
import EditProduct from './pages/EditProduct';
import EditAuction from './pages/EditAuction';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auctions" element={<BrowseAuctions />} />
        <Route path="/auction/:id" element={<AuctionDetail />} />
        <Route
          path="/seller-dashboard"
          element={
            <PrivateRoute user={user} allowedRoles={['seller']}>
              <SellerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/user-dashboard"
          element={
            <PrivateRoute user={user} allowedRoles={['user']}>
              <UserDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-auction"
          element={
            <PrivateRoute user={user} allowedRoles={['seller']}>
              <CreateAuction />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute user={user}>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-product/:id"
          element={
            <PrivateRoute user={user} allowedRoles={['seller']}>
              <EditProduct />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-auction/:id"
          element={
            <PrivateRoute user={user} allowedRoles={['seller']}>
              <EditAuction />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
