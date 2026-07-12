import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Stack,
  Chip,
  useMediaQuery,
} from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import Layout from '../components/Layout';
import CourseCard from '../components/CourseCard';
import Loader from '../components/Loader';
import { courseAPI } from '../api/services';

const features = [
  {
    icon: VideoLibraryRoundedIcon,
    title: 'Rich study materials',
    desc: 'Stream lecture videos, download slide decks and reference PDFs — all in one place.',
  },
  {
    icon: AssignmentTurnedInRoundedIcon,
    title: 'Assignments & grading',
    desc: 'Submit work, get graded, and receive feedback directly from your instructor.',
  },
  {
    icon: WorkspacePremiumRoundedIcon,
    title: 'Track your progress',
    desc: 'Every lesson completed moves your progress bar — know exactly where you stand.',
  },
];

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery('(max-width:700px)');

  useEffect(() => {
    courseAPI
      .list({ limit: 6 })
      .then(({ data }) => setCourses(data.courses))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <Box
        sx={{
          background: 'linear-gradient(180deg, #EEF0FF 0%, #F7F7FC 100%)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                label="A learning platform built for focus"
                sx={{ bgcolor: 'rgba(67,56,202,0.08)', color: 'primary.main', fontWeight: 600, mb: 3 }}
              />
              <Typography variant="h2" sx={{ fontSize: { xs: 34, md: 52 }, lineHeight: 1.1, mb: 3 }}>
                Learn skills that
                <br />
                actually move you forward.
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, mb: 4, maxWidth: 520 }}>
                Video lessons, downloadable materials, real assignments and instructor feedback —
                everything you need to go from curious to capable.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  component={RouterLink}
                  to="/courses"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardRoundedIcon />}
                >
                  Browse courses
                </Button>
                <Button component={RouterLink} to="/register" variant="outlined" size="large">
                  Become an instructor
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              {!isMobile && (
                <Box
                  sx={{
                    borderRadius: 4,
                    p: 4,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 20px 60px -20px rgba(67,56,202,0.25)',
                  }}
                >
                  {[
                    { label: 'Active learners', value: '12,400+' },
                    { label: 'Courses published', value: '340+' },
                    { label: 'Avg. course rating', value: '4.7 / 5' },
                  ].map((stat) => (
                    <Box
                      key={stat.label}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 1.75,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-of-type': { borderBottom: 'none' },
                      }}
                    >
                      <Typography color="text.secondary">{stat.label}</Typography>
                      <Typography fontWeight={700}>{stat.value}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {features.map((f) => (
            <Grid item xs={12} md={4} key={f.title}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: 'rgba(67,56,202,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <f.icon sx={{ color: 'primary.main' }} />
              </Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {f.title}
              </Typography>
              <Typography color="text.secondary">{f.desc}</Typography>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured courses */}
      <Container maxWidth="lg" sx={{ pb: 10 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 3 }}>
          <Typography variant="h4">Popular courses</Typography>
          <Button component={RouterLink} to="/courses" endIcon={<ArrowForwardRoundedIcon />}>
            View all
          </Button>
        </Stack>

        {loading ? (
          <Loader height="30vh" />
        ) : courses.length === 0 ? (
          <Typography color="text.secondary">No courses published yet. Check back soon.</Typography>
        ) : (
          <Grid container spacing={3}>
            {courses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course._id}>
                <CourseCard course={course} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Layout>
  );
};

export default Home;
