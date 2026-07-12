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
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  LinearProgress,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import SlideshowRoundedIcon from '@mui/icons-material/SlideshowRounded';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import { materialAPI, courseAPI } from '../../api/services';
import { useSnackbar } from 'notistack';

const iconFor = (type) => {
  if (type === 'video') return <PlayCircleRoundedIcon color="primary" />;
  if (type === 'pdf') return <PictureAsPdfRoundedIcon color="error" />;
  return <SlideshowRoundedIcon color="warning" />;
};

const formatSize = (bytes) => {
  const mb = bytes / (1024 * 1024);
  if (mb > 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb.toFixed(1)} MB`;
};

const ManageMaterials = () => {
  const { courseId } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', order: 0, type: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const load = () => {
    setLoading(true);
    Promise.all([courseAPI.get(courseId), materialAPI.list(courseId)])
      .then(([c, m]) => {
        setCourse(c.data.course);
        setMaterials(m.data.materials);
      })
      .catch(() => enqueueSnackbar('Could not load materials', { variant: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(load, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f && !uploadForm.title) {
      setUploadForm((prev) => ({ ...prev, title: f.name.replace(/\.[^/.]+$/, '') }));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      enqueueSnackbar('Please choose a file to upload', { variant: 'warning' });
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('order', uploadForm.order || 0);

      await materialAPI.upload(courseId, formData, (evt) => {
        setProgress(Math.round((evt.loaded * 100) / evt.total));
      });

      enqueueSnackbar('Material uploaded successfully', { variant: 'success' });
      setFile(null);
      setUploadForm({ title: '', description: '', order: 0, type: '' });
      load();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Upload failed', { variant: 'error' });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDelete = async (materialId) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await materialAPI.remove(materialId);
      enqueueSnackbar('Material deleted', { variant: 'success' });
      load();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Delete failed', { variant: 'error' });
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
          Study materials
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          {course?.title}
        </Typography>

        <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Upload new material
          </Typography>
          <Box component="form" onSubmit={handleUpload}>
            <Stack spacing={2}>
              <Button component="label" variant="outlined" startIcon={<CloudUploadRoundedIcon />}>
                {file ? file.name : 'Choose video, PDF or PPT file'}
                <input
                  type="file"
                  hidden
                  accept="video/mp4,video/webm,video/quicktime,application/pdf,.ppt,.pptx"
                  onChange={handleFileSelect}
                />
              </Button>
              {file && (
                <Typography variant="caption" color="text.secondary">
                  Selected: {file.name} ({formatSize(file.size)}) — videos up to 1.5GB, PDFs/PPTs up to 50MB
                </Typography>
              )}
              <TextField
                label="Title"
                required
                fullWidth
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              />
              <TextField
                label="Description (optional)"
                fullWidth
                multiline
                minRows={2}
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              />
              <TextField
                label="Order"
                type="number"
                sx={{ maxWidth: 160 }}
                value={uploadForm.order}
                onChange={(e) => setUploadForm({ ...uploadForm, order: e.target.value })}
              />
              {uploading && (
                <Box>
                  <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
                  <Typography variant="caption" color="text.secondary">
                    Uploading… {progress}%
                  </Typography>
                </Box>
              )}
              <Button type="submit" variant="contained" disabled={uploading} sx={{ alignSelf: 'flex-start' }}>
                {uploading ? 'Uploading…' : 'Upload material'}
              </Button>
            </Stack>
          </Box>
        </Paper>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Existing materials ({materials.length})
        </Typography>
        {materials.length === 0 ? (
          <Typography color="text.secondary">No materials uploaded yet.</Typography>
        ) : (
          <Paper variant="outlined">
            <List disablePadding>
              {materials.map((m) => (
                <ListItem
                  key={m._id}
                  divider
                  secondaryAction={
                    <IconButton edge="end" color="error" onClick={() => handleDelete(m._id)}>
                      <DeleteRoundedIcon />
                    </IconButton>
                  }
                >
                  <ListItemIcon>{iconFor(m.type)}</ListItemIcon>
                  <ListItemText
                    primary={m.title}
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={m.type.toUpperCase()} size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {formatSize(m.fileSize)}
                        </Typography>
                      </Stack>
                    }
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

export default ManageMaterials;
