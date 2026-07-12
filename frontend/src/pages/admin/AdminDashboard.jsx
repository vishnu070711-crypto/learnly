import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Stack,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  Chip,
  Select,
  MenuItem,
  IconButton,
  Switch,
} from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import BackButton from '../../components/BackButton';
import { userAPI } from '../../api/services';
import { useSnackbar } from 'notistack';

const roleColor = { admin: 'error', instructor: 'primary', student: 'default' };

const AdminDashboard = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([userAPI.stats(), userAPI.list()])
      .then(([s, u]) => {
        setStats(s.data.stats);
        setUsers(u.data.users);
      })
      .catch(() => enqueueSnackbar('Could not load admin data', { variant: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoleChange = async (id, role) => {
    try {
      await userAPI.update(id, { role });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
      enqueueSnackbar('Role updated', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Update failed', { variant: 'error' });
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const isActive = !(user.isActive ?? true);
      await userAPI.update(user.id, { isActive });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive } : u)));
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Update failed', { variant: 'error' });
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    try {
      await userAPI.remove(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      enqueueSnackbar('User deleted', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Delete failed', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loader height="70vh" />
      </Layout>
    );
  }

  const statCards = [
    { label: 'Total users', value: stats.totalUsers, icon: GroupRoundedIcon, color: '#4338CA' },
    { label: 'Students', value: stats.totalStudents, icon: SchoolRoundedIcon, color: '#0EA5E9' },
    { label: 'Instructors', value: stats.totalInstructors, icon: AssignmentIndRoundedIcon, color: '#F59E0B' },
    { label: 'Published courses', value: stats.publishedCourses, icon: MenuBookRoundedIcon, color: '#16A34A' },
  ];

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <BackButton to="/" label="Back to home" />
        <Typography variant="h4" sx={{ mb: 0.5 }}>
          Admin dashboard
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Platform overview and user management.
        </Typography>

        <Grid container spacing={3} sx={{ mb: 5 }}>
          {statCards.map((s) => (
            <Grid item xs={12} sm={6} md={3} key={s.label}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: `${s.color}1A`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.5,
                  }}
                >
                  <s.icon sx={{ color: s.color, fontSize: 20 }} />
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  {s.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {s.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h5" sx={{ mb: 2 }}>
          All users ({users.length})
        </Typography>
        <Paper variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar src={u.avatar} sx={{ width: 32, height: 32 }}>
                        {u.name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {u.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {u.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value="student">
                        <Chip label="student" size="small" color={roleColor.student} sx={{ mr: 0 }} />
                      </MenuItem>
                      <MenuItem value="instructor">
                        <Chip label="instructor" size="small" color={roleColor.instructor} />
                      </MenuItem>
                      <MenuItem value="admin">
                        <Chip label="admin" size="small" color={roleColor.admin} />
                      </MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Switch checked={u.isActive ?? true} onChange={() => handleToggleActive(u)} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="error" onClick={() => handleDelete(u)}>
                      <DeleteRoundedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Container>
    </Layout>
  );
};

export default AdminDashboard;
