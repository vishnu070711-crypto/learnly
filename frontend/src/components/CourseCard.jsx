import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardActionArea, Typography, Box, Chip, Avatar, Stack, Button } from '@mui/material';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { useSnackbar } from 'notistack';
import { useAuth } from '../context/AuthContext';
import { enrollmentAPI } from '../api/services';

const levelColor = {
  Beginner: 'success',
  Intermediate: 'warning',
  Advanced: 'error',
};

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);

  const initials = course.title
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  useEffect(() => {
    if (user?.role !== 'student' || !course?._id || statusChecked) return;

    enrollmentAPI
      .status(course._id)
      .then(({ data }) => {
        setIsEnrolled(Boolean(data.enrolled));
      })
      .catch(() => {})
      .finally(() => setStatusChecked(true));
  }, [course?._id, user?.role, statusChecked]);

  const handleEnroll = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login', { state: { from: { pathname: '/courses' } } });
      return;
    }

    if (user.role !== 'student') return;

    setEnrolling(true);
    try {
      const { data } = await enrollmentAPI.enroll(course._id);
      setIsEnrolled(Boolean(data?.enrollment));
      enqueueSnackbar(course.isPaid ? 'Enrollment created — complete payment to access the course.' : 'Enrolled! Happy learning.', {
        variant: course.isPaid ? 'info' : 'success',
      });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Could not enroll', { variant: 'error' });
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea
        component={RouterLink}
        to={`/courses/${course._id}`}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <Box
          sx={{
            height: 140,
            background: `linear-gradient(135deg, #4338CA 0%, #6D5CE0 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 34, fontFamily: 'Poppins' }}>
            {initials}
          </Typography>
        </Box>
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Stack direction="row" spacing={1}>
            <Chip label={course.level} size="small" color={levelColor[course.level] || 'default'} variant="outlined" />
            <Chip label={course.category} size="small" variant="outlined" />
          </Stack>
          <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.3 }}>
            {course.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{
            overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {course.shortDescription || course.description}
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" alignItems="center" spacing={1} sx={{ pt: 1 }}>
            <Avatar sx={{ width: 22, height: 22, fontSize: 11 }} src={course.instructor?.avatar}>
              {course.instructor?.name?.[0]}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              {course.instructor?.name}
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 1 }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <PeopleAltRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {course.enrollmentCount || 0} enrolled
              </Typography>
              {course.ratingCount > 0 && (
                <>
                  <StarRoundedIcon sx={{ fontSize: 16, color: 'secondary.main', ml: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    {course.ratingAverage.toFixed(1)}
                  </Typography>
                </>
              )}
            </Stack>
            <Typography variant="subtitle1" fontWeight={800} color="primary.main">
              {course.isPaid ? `$${course.price.toFixed(2)}` : 'Free'}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>

      {user?.role === 'student' && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Button
            fullWidth
            variant={isEnrolled ? 'outlined' : 'contained'}
            size="small"
            onClick={handleEnroll}
            disabled={enrolling || isEnrolled}
          >
            {enrolling ? 'Enrolling…' : isEnrolled ? 'Enrolled' : course.isPaid ? 'Enroll now' : 'Enroll for free'}
          </Button>
        </Box>
      )}
    </Card>
  );
};

export default CourseCard;
