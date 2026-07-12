import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  Stack,
  Chip,
  Button,
  LinearProgress,
  Box,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import { enrollmentAPI, courseAPI } from '../../api/services';
import { useSnackbar } from 'notistack';

const paymentColor = { free: 'default', pending: 'warning', confirmed: 'success', failed: 'error' };

const CourseStudents = () => {
  const { courseId } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [course, setCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([courseAPI.get(courseId), enrollmentAPI.courseEnrollments(courseId)])
      .then(([c, e]) => {
        setCourse(c.data.course);
        setEnrollments(e.data.enrollments);
      })
      .catch(() => enqueueSnackbar('Could not load students', { variant: 'error' }))
      .finally(() => setLoading(false));
  }, [courseId, enqueueSnackbar]);

  if (loading) {
    return (
      <Layout>
        <Loader height="60vh" />
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Button startIcon={<ArrowBackRoundedIcon />} component={RouterLink} to="/instructor" sx={{ mb: 2 }}>
          Back to dashboard
        </Button>
        <Typography variant="h4" sx={{ mb: 0.5 }}>
          Enrolled students
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          {course?.title} · {enrollments.length} student{enrollments.length !== 1 ? 's' : ''}
        </Typography>

        {enrollments.length === 0 ? (
          <Typography color="text.secondary">No students enrolled yet.</Typography>
        ) : (
          <Paper variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell sx={{ width: 200 }}>Progress</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enrollments.map((e) => (
                  <TableRow key={e._id}>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar src={e.student?.avatar} sx={{ width: 32, height: 32 }}>
                          {e.student?.name?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {e.student?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {e.student?.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={e.paymentStatus} size="small" color={paymentColor[e.paymentStatus]} />
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <LinearProgress
                          variant="determinate"
                          value={e.progress}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {e.progress}%
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Container>
    </Layout>
  );
};

export default CourseStudents;
