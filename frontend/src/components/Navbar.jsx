import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { useAuth } from '../context/AuthContext';

const dashboardPathFor = (role) =>
  role === 'admin' ? '/admin' : role === 'instructor' ? '/instructor' : '/student';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:900px)');

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Browse Courses', to: '/courses' },
    ...(user ? [{ label: 'Dashboard', to: dashboardPathFor(user.role) }] : []),
  ];

  return (
    <AppBar position="sticky" color="inherit" sx={{ bgcolor: 'background.paper' }}>
      <Toolbar sx={{ maxWidth: 1280, width: '100%', mx: 'auto', px: { xs: 2, md: 3 } }}>
        <Box
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', mr: 3 }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4338CA 0%, #6D5CE0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SchoolRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700 }}>
            Learnly
          </Typography>
        </Box>

        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
            {navLinks.map((link) => (
              <Button
                key={link.to}
                component={RouterLink}
                to={link.to}
                sx={{ color: 'text.secondary', fontWeight: 500 }}
              >
                {link.label}
              </Button>
            ))}
          </Box>
        )}

        <Box sx={{ flexGrow: isMobile ? 1 : 0 }} />

        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>
        )}

        {!user ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button component={RouterLink} to="/login" sx={{ color: 'text.secondary' }}>
              Log in
            </Button>
            <Button component={RouterLink} to="/register" variant="contained">
              Get started
            </Button>
          </Box>
        ) : (
          <>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
              <Avatar
                src={user.avatar}
                sx={{ width: 38, height: 38, bgcolor: 'primary.main', fontSize: 16 }}
              >
                {user.name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {user.role} account
                </Typography>
              </Box>
              <Divider />
              <MenuItem
                component={RouterLink}
                to={dashboardPathFor(user.role)}
                onClick={() => setAnchorEl(null)}
              >
                Dashboard
              </MenuItem>
              <MenuItem component={RouterLink} to="/profile" onClick={() => setAnchorEl(null)}>
                Profile settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                Log out
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 240, pt: 2 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          <List>
            {navLinks.map((link) => (
              <ListItemButton key={link.to} component={RouterLink} to={link.to}>
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
