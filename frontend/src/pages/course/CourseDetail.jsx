import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Chip,
  Stack,
  Avatar,
  Button,
  Paper,
  Tabs,
  Tab,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from '@mui/material';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import MaterialViewer from '../../components/MaterialViewer';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from 'notistack';
import { courseAPI, enrollmentAPI, materialAPI, assignmentAPI } from '../../api/services';

const levelColor = { Beginner: 'success', Intermediate: 'warning', Advanced: 'error' };

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [enrollment, setEnrollment] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvc: '' });

  const isEnrolledActive = enrollment && ['free', 'confirmed'].includes(enrollment.paymentStatus);

  const loadEverything = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await courseAPI.get(id);
      setCourse(data.course);

      if (user?.role === 'student') {
        const statusRes = await enrollmentAPI.status(id);
        setEnrollment(statusRes.data.enrollment);
      }
    } catch {
      enqueueSnackbar('Course not found', { variant: 'error' });
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  }, [id, user, enqueueSnackbar, navigate]);

  useEffect(() => {
    loadEverything();
  }, [loadEverything]);

  useEffect(() => {
    if (!course) return;
    const canView =
      isEnrolledActive || user?.role === 'admin' || course.instructor?._id === user?.id;
    if (!canView) return;

    materialAPI.list(id).then(({ data }) => setMaterials(data.materials)).catch(() => {});
    assignmentAPI.list(id).then(({ data }) => setAssignments(data.assignments)).catch(() => {});
  }, [course, isEnrolledActive, id, user]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/courses/${id}` } } });
      return;
    }
    setEnrolling(true);
    try {
      const { data } = await enrollmentAPI.enroll(id);
      setEnrollment(data.enrollment);
      if (course.isPaid) {
        setPayDialogOpen(true);
      } else {
        enqueueSnackbar('Enrolled! Happy learning.', { variant: 'success' });
      }
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Could not enroll', { variant: 'error' });
    } finally {
      setEnrolling(false);
    }
  };

  const handleConfirmPayment = async () => {
    setPaying(true);
    try {
      const { data } = await enrollmentAPI.confirmPayment(enrollment._id);
      setEnrollment(data.enrollment);
      setPayDialogOpen(false);
      enqueueSnackbar('Payment confirmed — you\'re enrolled!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Payment failed', { variant: 'error' });
    } finally {
      setPaying(false);
    }
  };

  const handleCancelEnrollment = async () => {
    if (!window.confirm('Cancel your enrollment in this course?')) return;
    setCancelling(true);
    try {
      await enrollmentAPI.cancel(id);
      setEnrollment(null);
      enqueueSnackbar('Enrollment canceled', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Could not cancel enrollment', { variant: 'error' });
    } finally {
      setCancelling(false);
    }
  };

  const handleMarkComplete = async (materialId) => {
    try {
      const { data } = await enrollmentAPI.updateProgress(enrollment._id, materialId);
      setEnrollment(data.enrollment);
    } catch {
      enqueueSnackbar('Could not update progress', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loader height="70vh" />
      </Layout>
    );
  }

  if (!course) return null;

  const canViewMaterials =
    user?.role === 'admin' || user?.role === 'instructor' || isEnrolledActive || course.instructor?._id === user?.id;

  const canViewAssignments =
    user?.role === 'admin' || user?.role === 'instructor' || isEnrolledActive || course.instructor?._id === user?.id;

  return (
    <Layout>
      {/* Header */}
      <Box sx={{ background: 'linear-gradient(180deg, #1E1B4B 0%, #4338CA 100%)', color: '#fff' }}>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip label={course.level} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' }} />
            <Chip label={course.category} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' }} />
          </Stack>
          <Typography variant="h3" sx={{ fontSize: { xs: 28, md: 40 }, mb: 2, maxWidth: 700 }}>
            {course.title}
          </Typography>
          <Typography sx={{ opacity: 0.85, maxWidth: 640, mb: 3 }}>
            {course.shortDescription}
          </Typography>
          <Stack direction="row" spacing={3} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ width: 28, height: 28 }} src={course.instructor?.avatar}>
                {course.instructor?.name?.[0]}
              </Avatar>
              <Typography variant="body2">{course.instructor?.name}</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <PeopleAltRoundedIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2">{course.enrollmentCount} enrolled</Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {isEnrolledActive && user?.role === 'student' && (
              <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography fontWeight={600}>Your progress</Typography>
                  <Typography fontWeight={700} color="primary.main">
                    {enrollment.progress}%
                  </Typography>
                </Stack>
                <LinearProgress variant="determinate" value={enrollment.progress} sx={{ height: 8, borderRadius: 4 }} />
              </Paper>
            )}

            <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Tab label="Overview" />
              <Tab label="Study materials" />
              <Tab label="Assignments" />
            </Tabs>

            {tab === 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  About this course
                </Typography>
                <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
                  {course.description}
                </Typography>
                {course.tags?.length > 0 && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {course.tags.map((t) => (
                      <Chip key={t} label={t} size="small" variant="outlined" />
                    ))}
                  </Stack>
                )}
              </Box>
            )}

            {tab === 1 && (
              <Box>
                {!canViewMaterials ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <LockRoundedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                    <Typography color="text.secondary">
                      Enroll in this course to unlock videos, PDFs and slide decks.
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
                      <Typography color="text.secondary">
                        {materials.length} study material{materials.length === 1 ? '' : 's'} ready to view.
                      </Typography>
                      <Button component={RouterLink} to={`/courses/${id}/materials`} variant="contained">
                        Open full materials view
                      </Button>
                    </Stack>
                    <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        Full-screen study materials page
                      </Typography>
                      <Typography color="text.secondary">
                        Open the dedicated page to browse all lessons, videos, PDFs, and slide decks without the compact course tab layout.
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </Box>
            )}

            {tab === 2 && (
              <Box>
                {!canViewAssignments ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <LockRoundedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                    <Typography color="text.secondary">
                      Enroll in this course to view and submit assignments.
                    </Typography>
                  </Box>
                ) : assignments.length === 0 ? (
                  <Typography color="text.secondary">No assignments posted yet.</Typography>
                ) : (
                  <Stack spacing={2}>
                    {assignments.map((a) => (
                      <Paper key={a._id} variant="outlined" sx={{ p: 2.5 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography fontWeight={600}>{a.title}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              Due {new Date(a.dueDate).toLocaleDateString()} · Max score {a.maxScore}
                            </Typography>
                          </Box>
                          {user?.role === 'student' && (
                            <Button
                              size="small"
                              variant="outlined"
                              component={RouterLink}
                              to={`/assignments/${a._id}`}
                            >
                              View / submit
                            </Button>
                          )}
                          {(user?.role === 'instructor' || user?.role === 'admin') && (
                            <Button
                              size="small"
                              variant="outlined"
                              component={RouterLink}
                              to={`/instructor/assignments/${a._id}/submissions`}
                            >
                              View submissions
                            </Button>
                          )}
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 3, position: 'sticky', top: 90 }}>
              <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ mb: 2 }}>
                {course.isPaid ? `$${course.price.toFixed(2)}` : 'Free'}
              </Typography>

              {user?.role === 'instructor' || user?.role === 'admin' ? (
                <Button fullWidth variant="outlined" component={RouterLink} to="/instructor" sx={{ mb: 1 }}>
                  Manage from dashboard
                </Button>
              ) : user?.role === 'student' && enrollment ? (
                <Stack spacing={1} sx={{ mb: 1 }}>
                  <Button fullWidth variant="contained" disabled>
                    {enrollment.paymentStatus === 'pending' ? 'Payment pending' : "You're enrolled"}
                  </Button>
                  <Button fullWidth variant="outlined" color="error" onClick={handleCancelEnrollment} disabled={cancelling}>
                    {cancelling ? 'Canceling…' : 'Cancel course'}
                  </Button>
                </Stack>
              ) : enrollment?.paymentStatus === 'pending' ? (
                <Button fullWidth variant="contained" onClick={() => setPayDialogOpen(true)} sx={{ mb: 1 }}>
                  Complete payment
                </Button>
              ) : (
                <Button fullWidth variant="contained" onClick={handleEnroll} disabled={enrolling} sx={{ mb: 1 }}>
                  {enrolling ? 'Enrolling…' : course.isPaid ? 'Enroll now' : 'Enroll for free'}
                </Button>
              )}

              <Divider sx={{ my: 2 }} />
              <Stack spacing={1.5}>
                <Typography variant="body2" color="text.secondary">
                  ✔ Full lifetime access
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ✔ Video lessons, PDFs & slide decks
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ✔ Graded assignments with feedback
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Simulated payment dialog */}
      <Dialog open={payDialogOpen} onClose={() => setPayDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Complete your enrollment</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            You're paying <strong>${course.price.toFixed(2)}</strong> for <strong>{course.title}</strong>.
            This is a simulated checkout for demo purposes — no real payment is processed.
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Card number"
              placeholder="4242 4242 4242 4242"
              fullWidth
              value={cardForm.number}
              onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
              InputProps={{ startAdornment: <CreditCardRoundedIcon sx={{ mr: 1, color: 'text.disabled' }} /> }}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Expiry"
                placeholder="MM/YY"
                fullWidth
                value={cardForm.expiry}
                onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
              />
              <TextField
                label="CVC"
                placeholder="123"
                fullWidth
                value={cardForm.cvc}
                onChange={(e) => setCardForm({ ...cardForm, cvc: e.target.value })}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setPayDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmPayment} disabled={paying}>
            {paying ? 'Processing…' : `Pay $${course.price.toFixed(2)}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default CourseDetail;
