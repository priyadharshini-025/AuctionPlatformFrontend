import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ user, allowedRoles, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectTo = user.role === 'seller' ? '/seller-dashboard' : '/user-dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default PrivateRoute;
