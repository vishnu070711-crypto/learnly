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
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import { assignmentAPI, courseAPI } from '../../api/services';
import { useSnackbar } from 'notistack';

const ManageAssignments = () => {
  const { courseId } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', maxScore: 100 });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([courseAPI.get(courseId), assignmentAPI.list(courseId)])
      .then(([c, a]) => {
        setCourse(c.data.course);
        setAssignments(a.data.assignments);
      })
      .catch(() => enqueueSnackbar('Could not load assignments', { variant: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(load, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await assignmentAPI.create(courseId, form);
      enqueueSnackbar('Assignment created', { variant: 'success' });
      setForm({ title: '', description: '', dueDate: '', maxScore: 100 });
      load();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Could not create assignment', { variant: 'error' });
    } finally {
      setSaving(false);
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
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Button startIcon={<ArrowBackRoundedIcon />} component={RouterLink} to="/instructor" sx={{ mb: 2 }}>
          Back to dashboard
        </Button>
        <Typography variant="h4" sx={{ mb: 0.5 }}>
          Assignments
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          {course?.title}
        </Typography>

        <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Create new assignment
          </Typography>
          <Box component="form" onSubmit={handleCreate}>
            <Stack spacing={2}>
              <TextField
                label="Title"
                required
                fullWidth
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <TextField
                label="Description / instructions"
                required
                fullWidth
                multiline
                minRows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Due date"
                  type="date"
                  required
                  InputLabelProps={{ shrink: true }}
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
                <TextField
                  label="Max score"
                  type="number"
                  value={form.maxScore}
                  onChange={(e) => setForm({ ...form, maxScore: e.target.value })}
                />
              </Stack>
              <Button type="submit" variant="contained" disabled={saving} sx={{ alignSelf: 'flex-start' }}>
                {saving ? 'Creating…' : 'Create assignment'}
              </Button>
            </Stack>
          </Box>
        </Paper>

        <Typography variant="h6" sx={{ mb: 2 }}>
          All assignments ({assignments.length})
        </Typography>
        {assignments.length === 0 ? (
          <Typography color="text.secondary">No assignments created yet.</Typography>
        ) : (
          <Paper variant="outlined">
            <List disablePadding>
              {assignments.map((a) => (
                <ListItem
                  key={a._id}
                  divider
                  secondaryAction={
                    <Button
                      size="small"
                      component={RouterLink}
                      to={`/instructor/assignments/${a._id}/submissions`}
                    >
                      View submissions
                    </Button>
                  }
                >
                  <ListItemText
                    primary={a.title}
                    secondary={`Due ${new Date(a.dueDate).toLocaleDateString()} · Max score ${a.maxScore}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Container>
    </Layout>
  );
};

export default ManageAssignments;
