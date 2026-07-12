import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Stack,
  Button,
  TextField,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import { assignmentAPI } from '../../api/services';
import { useSnackbar } from 'notistack';

const statusColor = { submitted: 'info', graded: 'success', late: 'warning' };

const SubmissionRow = ({ submission, maxScore, onGraded }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [score, setScore] = useState(submission.score ?? '');
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [saving, setSaving] = useState(false);

  const handleGrade = async () => {
    setSaving(true);
    try {
      const { data } = await assignmentAPI.grade(submission._id, { score: Number(score), feedback });
      enqueueSnackbar('Grade saved', { variant: 'success' });
      onGraded(data.submission);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Could not save grade', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar src={submission.student?.avatar} sx={{ width: 36, height: 36 }}>
            {submission.student?.name?.[0]}
          </Avatar>
          <Box>
            <Typography fontWeight={600}>{submission.student?.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {submission.student?.email}
            </Typography>
          </Box>
        </Stack>
        <Chip label={submission.status} size="small" color={statusColor[submission.status]} />
      </Stack>
      <Typography color="text.secondary" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
        {submission.content}
      </Typography>
      {submission.fileUrl && (
        <Button size="small" href={submission.fileUrl} target="_blank" sx={{ mb: 2 }}>
          View attached file
        </Button>
      )}
      <Divider sx={{ mb: 2 }} />
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <TextField
          label={`Score (out of ${maxScore})`}
          type="number"
          size="small"
          sx={{ width: 160 }}
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />
        <TextField
          label="Feedback"
          size="small"
          fullWidth
          multiline
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <Button variant="contained" onClick={handleGrade} disabled={saving || score === ''}>
          {saving ? 'Saving…' : 'Save grade'}
        </Button>
      </Stack>
    </Paper>
  );
};

const GradeSubmissions = () => {
  const { assignmentId } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([assignmentAPI.get(assignmentId), assignmentAPI.submissions(assignmentId)])
      .then(([a, s]) => {
        setAssignment(a.data.assignment);
        setSubmissions(s.data.submissions);
      })
      .catch(() => enqueueSnackbar('Could not load submissions', { variant: 'error' }))
      .finally(() => setLoading(false));
  }, [assignmentId, enqueueSnackbar]);

  const handleGraded = (updated) => {
    setSubmissions((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
  };

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
          {assignment?.title}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
        </Typography>

        {submissions.length === 0 ? (
          <Typography color="text.secondary">No submissions yet.</Typography>
        ) : (
          <Stack spacing={3}>
            {submissions.map((s) => (
              <SubmissionRow
                key={s._id}
                submission={s}
                maxScore={assignment?.maxScore || 100}
                onGraded={handleGraded}
              />
            ))}
          </Stack>
        )}
      </Container>
    </Layout>
  );
};

export default GradeSubmissions;
