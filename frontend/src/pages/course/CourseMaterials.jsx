import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Button, Stack, Box } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import MaterialViewer from '../../components/MaterialViewer';
import { useAuth } from '../../context/AuthContext';
import { materialAPI, enrollmentAPI, courseAPI } from '../../api/services';
import { useSnackbar } from 'notistack';

const CourseMaterials = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [courseRes, materialsRes] = await Promise.all([
          courseAPI.get(id),
          materialAPI.list(id),
        ]);
        setCourse(courseRes.data.course);
        setMaterials(materialsRes.data.materials || []);

        if (user?.role === 'student') {
          const statusRes = await enrollmentAPI.status(id);
          setEnrollment(statusRes.data.enrollment);
        }
      } catch {
        enqueueSnackbar('Could not load materials', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user, enqueueSnackbar]);

  const canView =
    user?.role === 'admin' ||
    user?.role === 'instructor' ||
    (user?.role === 'student' && enrollment && ['free', 'confirmed'].includes(enrollment.paymentStatus));

  const handleMarkComplete = async (materialId) => {
    if (!enrollment) return;
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

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Button component={RouterLink} to={`/courses/${id}`} startIcon={<ArrowBackRoundedIcon />} sx={{ mb: 1 }}>
              Back to course
            </Button>
            <Typography variant="h4">{course?.title || 'Study materials'}</Typography>
            <Typography color="text.secondary">
              Full-screen view for all lessons, PDFs, videos, and slide decks.
            </Typography>
          </Box>
        </Stack>

        {!canView ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h6" color="text.secondary">
              Enroll in this course to access the study materials.
            </Typography>
          </Box>
        ) : (
          <MaterialViewer
            materials={materials}
            completedMaterials={enrollment?.completedMaterials || []}
            onMarkComplete={user?.role === 'student' ? handleMarkComplete : null}
          />
        )}
      </Container>
    </Layout>
  );
};

export default CourseMaterials;
