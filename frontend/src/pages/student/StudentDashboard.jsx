import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Stack,
  LinearProgress,
  Chip,
  Button,
  Avatar,
} from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import BackButton from '../../components/BackButton';
import { useAuth } from '../../context/AuthContext';
import { enrollmentAPI } from '../../api/services';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enrollmentAPI
      .mine()
      .then(({ data }) => setEnrollments(data.enrollments))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active = enrollments.filter((e) => ['free', 'confirmed'].includes(e.paymentStatus));
  const inProgress = active.filter((e) => !e.completed);
  const completedCount = active.filter((e) => e.completed).length;

  const stats = [
    { label: 'Enrolled courses', value: active.length, icon: SchoolRoundedIcon, color: '#4338CA' },
    { label: 'In progress', value: inProgress.length, icon: HourglassBottomRoundedIcon, color: '#F59E0B' },
    { label: 'Completed', value: completedCount, icon: TaskAltRoundedIcon, color: '#16A34A' },
  ];

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <BackButton to="/" label="Back to home" />
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }} src={user?.avatar}>
            {user?.name?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h4">Welcome back, {user?.name?.split(' ')[0]}</Typography>
            <Typography color="text.secondary">Here's where you left off.</Typography>
          </Box>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 5 }}>
          {stats.map((s) => (
            <Grid item xs={12} sm={4} key={s.label}>
              <Paper variant="outlined" sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: 2,
                    bgcolor: `${s.color}1A`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <s.icon sx={{ color: s.color }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {s.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {s.label}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h5" sx={{ mb: 3 }}>
          My courses
        </Typography>

        {loading ? (
          <Loader height="30vh" />
        ) : active.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              You haven't enrolled in any courses yet.
            </Typography>
            <Button variant="contained" component={RouterLink} to="/courses">
              Browse courses
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {active.map((e) => (
              <Grid item xs={12} md={6} key={e._id}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                    <Typography fontWeight={700}>{e.course?.title}</Typography>
                    {e.completed && <Chip label="Completed" color="success" size="small" />}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    by {e.course?.instructor?.name}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={e.progress}
                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                  />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {e.progress}% complete
                    </Typography>
                    <Button size="small" component={RouterLink} to={`/courses/${e.course?._id}`}>
                      Continue
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Layout>
  );
};

export default StudentDashboard;
