import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Grid,
  MenuItem,
  Button,
  Stack,
  Switch,
  FormControlLabel,
  InputAdornment,
  Box,
} from '@mui/material';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import { courseAPI } from '../../api/services';
import { useSnackbar } from 'notistack';

const levels = ['Beginner', 'Intermediate', 'Advanced'];

const emptyForm = {
  title: '',
  shortDescription: '',
  description: '',
  category: '',
  level: 'Beginner',
  price: '0',
  tags: '',
  published: true,
};

const CourseForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    courseAPI
      .get(id)
      .then(({ data }) => {
        const c = data.course;
        setForm({
          title: c.title,
          shortDescription: c.shortDescription || '',
          description: c.description,
          category: c.category,
          level: c.level,
          price: String(c.price),
          tags: (c.tags || []).join(', '),
          published: c.published,
        });
      })
      .catch(() => enqueueSnackbar('Could not load course', { variant: 'error' }))
      .finally(() => setLoading(false));
  }, [id, isEdit, enqueueSnackbar]);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'published') {
          formData.append(k, v ? 'true' : 'false');
        } else {
          formData.append(k, v);
        }
      });

      if (isEdit) {
        await courseAPI.update(id, formData);
        enqueueSnackbar('Course updated', { variant: 'success' });
      } else {
        await courseAPI.create(formData);
        enqueueSnackbar('Course created', { variant: 'success' });
      }
      navigate('/instructor');
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Save failed', { variant: 'error' });
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
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          {isEdit ? 'Edit course' : 'Create a new course'}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          {isEdit ? 'Update your course details below.' : 'Fill in the details to publish a new course.'}
        </Typography>

        <Paper variant="outlined" sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  label="Course title"
                  required
                  fullWidth
                  value={form.title}
                  onChange={handleChange('title')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Short description"
                  fullWidth
                  helperText="A one-line tagline shown on course cards"
                  value={form.shortDescription}
                  onChange={handleChange('shortDescription')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Full description"
                  required
                  fullWidth
                  multiline
                  minRows={5}
                  value={form.description}
                  onChange={handleChange('description')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Category"
                  required
                  fullWidth
                  placeholder="e.g. Web Development"
                  value={form.category}
                  onChange={handleChange('category')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Level" fullWidth value={form.level} onChange={handleChange('level')}>
                  {levels.map((l) => (
                    <MenuItem key={l} value={l}>
                      {l}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Price"
                  type="number"
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  helperText="Set to 0 for a free course"
                  value={form.price}
                  onChange={handleChange('price')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Tags"
                  fullWidth
                  placeholder="react, javascript, frontend"
                  helperText="Comma-separated"
                  value={form.tags}
                  onChange={handleChange('tags')}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.published}
                      onChange={(e) => setForm({ ...form, published: e.target.checked })}
                    />
                  }
                  label="Published (visible to students)"
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button type="submit" variant="contained" size="large" disabled={saving}>
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create course'}
              </Button>
              <Button size="large" onClick={() => navigate('/instructor')}>
                Cancel
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
};

export default CourseForm;
