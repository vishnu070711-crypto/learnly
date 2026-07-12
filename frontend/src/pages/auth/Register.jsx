import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
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

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const user = await register(form);
      enqueueSnackbar(`Welcome to Learnly, ${user.name.split(' ')[0]}!`, { variant: 'success' });
      navigate(dashboardPathFor(user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
        py: 4,
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
            Create your account
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Start learning or start teaching today
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
              <ToggleButtonGroup
                exclusive
                fullWidth
                value={form.role}
                onChange={(e, val) => val && setForm({ ...form, role: val })}
                color="primary"
              >
                <ToggleButton value="student">I'm a student</ToggleButton>
                <ToggleButton value="instructor">I'm an instructor</ToggleButton>
              </ToggleButtonGroup>

              <TextField
                label="Full name"
                required
                fullWidth
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
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
                helperText="At least 6 characters"
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
                {loading ? 'Creating account…' : 'Create account'}
              </Button>
            </Stack>
          </Box>
        </Paper>

        <Typography align="center" sx={{ mt: 3 }} color="text.secondary">
          Already have an account?{' '}
          <RouterLink to="/login" style={{ color: '#4338CA', fontWeight: 600 }}>
            Log in
          </RouterLink>
        </Typography>
      </Container>
    </Box>
  );
};

export default Register;
