import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';
import { Box, Typography, Button } from '@mui/material';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader height="100vh" />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <Box sx={{ textAlign: 'center', mt: 12 }}>
        <Typography variant="h4" gutterBottom>
          403 — Access denied
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Your account role ({user.role}) doesn't have permission to view this page.
        </Typography>
        <Button variant="contained" href="/">
          Back to home
        </Button>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;
