import { useEffect, useState, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Stack,
  Chip,
  Button,
  TextField,
  Divider,
  Alert,
} from '@mui/material';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import { assignmentAPI } from '../../api/services';
import { useSnackbar } from 'notistack';

const AssignmentDetail = () => {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: assignmentRes }, { data: mine }] = await Promise.all([
        assignmentAPI.get(id),
        assignmentAPI.mySubmission(id),
      ]);
      setAssignment(assignmentRes.assignment);
      setSubmission(mine.submission);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (file) formData.append('file', file);
      const { data } = await assignmentAPI.submit(id, formData);
      setSubmission(data.submission);
      enqueueSnackbar('Assignment submitted!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Submission failed', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
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
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Button startIcon={<ArrowBackRoundedIcon />} component={RouterLink} to="/student" sx={{ mb: 3 }}>
          Back to dashboard
        </Button>

        <Paper variant="outlined" sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ mb: 1 }}>
            {assignment?.title || 'Assignment'}
          </Typography>
          {assignment && (
            <>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {assignment.description}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                <Chip size="small" label={`Due ${new Date(assignment.dueDate).toLocaleDateString()}`} />
                <Chip size="small" label={`Max score: ${assignment.maxScore}`} />
              </Stack>
              <Divider sx={{ mb: 3 }} />
            </>
          )}

          {submission ? (
            <Box>
              <Alert severity={submission.status === 'graded' ? 'success' : 'info'} sx={{ mb: 2 }}>
                {submission.status === 'graded'
                  ? `Graded: ${submission.score} / ${assignment?.maxScore || 100}`
                  : `Submitted (${submission.status}) — awaiting grading`}
              </Alert>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Your submission
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                {submission.content}
              </Typography>
              {submission.feedback && (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Instructor feedback
                  </Typography>
                  <Typography color="text.secondary">{submission.feedback}</Typography>
                </>
              )}
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                label="Your answer"
                multiline
                minRows={5}
                fullWidth
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                component="label"
                variant="outlined"
                startIcon={<AttachFileRoundedIcon />}
                sx={{ mb: 2 }}
              >
                {file ? file.name : 'Attach a file (optional, PDF/PPT)'}
                <input type="file" hidden accept=".pdf,.ppt,.pptx" onChange={(e) => setFile(e.target.files[0])} />
              </Button>
              <Button type="submit" variant="contained" fullWidth disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit assignment'}
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Layout>
  );
};

export default AssignmentDetail;
