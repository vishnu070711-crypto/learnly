import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Stack,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import BackButton from '../../components/BackButton';
import { useAuth } from '../../context/AuthContext';
import { courseAPI } from '../../api/services';
import { useSnackbar } from 'notistack';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuCourse, setMenuCourse] = useState(null);

  const load = () => {
    setLoading(true);
    courseAPI
      .mine()
      .then(({ data }) => setCourses(data.courses))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openMenu = (e, course) => {
    setMenuAnchor(e.currentTarget);
    setMenuCourse(course);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuCourse(null);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${menuCourse.title}"? This cannot be undone.`)) return closeMenu();
    try {
      await courseAPI.remove(menuCourse._id);
      enqueueSnackbar('Course deleted', { variant: 'success' });
      load();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Delete failed', { variant: 'error' });
    } finally {
      closeMenu();
    }
  };

  const totalStudents = courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0);
  const totalRevenue = courses.reduce((sum, c) => sum + (c.enrollmentCount || 0) * (c.price || 0), 0);

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <BackButton to="/" label="Back to home" />
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4">Instructor dashboard</Typography>
            <Typography color="text.secondary">
              Welcome, {user?.name?.split(' ')[0]} — manage your courses below.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddRoundedIcon />} component={RouterLink} to="/instructor/courses/new">
            New course
          </Button>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight={700}>
                {courses.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Courses created
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight={700}>
                {totalStudents}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total enrollments
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight={700}>
                ${totalRevenue.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Estimated revenue
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Typography variant="h5" sx={{ mb: 3 }}>
          My courses
        </Typography>

        {loading ? (
          <Loader height="30vh" />
        ) : courses.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              You haven't created any courses yet.
            </Typography>
            <Button variant="contained" component={RouterLink} to="/instructor/courses/new">
              Create your first course
            </Button>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {courses.map((c) => (
              <Paper key={c._id} variant="outlined" sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography fontWeight={700}>{c.title}</Typography>
                      <Chip
                        label={c.published ? 'Published' : 'Draft'}
                        size="small"
                        color={c.published ? 'success' : 'default'}
                      />
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <PeopleAltRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {c.enrollmentCount} enrolled
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {c.isPaid ? `$${c.price.toFixed(2)}` : 'Free'}
                      </Typography>
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" component={RouterLink} to={`/instructor/courses/${c._id}/materials`}>
                      Materials
                    </Button>
                    <Button size="small" component={RouterLink} to={`/instructor/courses/${c._id}/assignments`}>
                      Assignments
                    </Button>
                    <Button size="small" component={RouterLink} to={`/instructor/courses/${c._id}/edit`}>
                      Edit
                    </Button>
                    <IconButton size="small" onClick={(e) => openMenu(e, c)}>
                      <MoreVertRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}

        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
          <MenuItem
            component={RouterLink}
            to={`/courses/${menuCourse?._id}`}
            onClick={closeMenu}
          >
            View public page
          </MenuItem>
          <MenuItem
            component={RouterLink}
            to={`/instructor/courses/${menuCourse?._id}/students`}
            onClick={closeMenu}
          >
            View enrolled students
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            Delete course
          </MenuItem>
        </Menu>
      </Container>
    </Layout>
  );
};

export default InstructorDashboard;
