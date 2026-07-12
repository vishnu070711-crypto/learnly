import { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from 'notistack';

const dashboardPathFor = (role) =>
  role === 'admin' ? '/admin' : role === 'instructor' ? '/instructor' : '/student';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      enqueueSnackbar(`Welcome back, ${user.name.split(' ')[0]}!`, { variant: 'success' });
      const redirectTo = location.state?.from?.pathname || dashboardPathFor(user.role);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(180deg, #EEF0FF 0%, #F7F7FC 100%)',
      }}
    >
      <Container maxWidth="xs">
        <Stack alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <Box
            component={RouterLink}
            to="/"
            sx={{
              width: 48,
              height: 48,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #4338CA 0%, #6D5CE0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SchoolRoundedIcon sx={{ color: '#fff' }} />
          </Box>
          <Typography variant="h5" fontWeight={700}>
            Welcome back
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Log in to continue your learning journey
          </Typography>
        </Stack>

        <Paper sx={{ p: 4 }} variant="outlined">
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Email address"
                type="email"
                required
                fullWidth
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                fullWidth
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? 'Logging in…' : 'Log in'}
              </Button>
            </Stack>
          </Box>
        </Paper>

        <Typography align="center" sx={{ mt: 3 }} color="text.secondary">
          Don't have an account?{' '}
          <RouterLink to="/register" style={{ color: '#4338CA', fontWeight: 600 }}>
            Sign up
          </RouterLink>
        </Typography>

        <Box sx={{ mt: 4, p: 2, borderRadius: 2, bgcolor: 'rgba(67,56,202,0.06)' }}>
          <Typography variant="caption" color="text.secondary" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
            Demo accounts (after running the seed script):
          </Typography>
          <Typography variant="caption" color="text.secondary" component="div">
            admin@demo.com · instructor@demo.com · student@demo.com — password123
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
