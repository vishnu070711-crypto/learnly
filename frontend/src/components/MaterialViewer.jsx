import { useState } from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Paper,
  Stack,
  Button,
} from '@mui/material';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import SlideshowRoundedIcon from '@mui/icons-material/SlideshowRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';

const iconFor = (type) => {
  if (type === 'video') return <PlayCircleRoundedIcon />;
  if (type === 'pdf') return <PictureAsPdfRoundedIcon />;
  return <SlideshowRoundedIcon />;
};

const formatSize = (bytes) => {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  if (mb > 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb.toFixed(1)} MB`;
};

const MaterialViewer = ({ materials, completedMaterials = [], onMarkComplete }) => {
  const [active, setActive] = useState(materials[0] || null);

  if (materials.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 4 }}>
        No study materials have been added to this course yet.
      </Typography>
    );
  }

  const isCompleted = (id) => completedMaterials.includes(id);

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
      <Paper variant="outlined" sx={{ flex: 2, p: 2, minHeight: 360, display: 'flex', flexDirection: 'column' }}>
        {active ? (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {active.title}
            </Typography>

            {active.type === 'video' && (
              <Box sx={{ position: 'relative', pt: '56.25%', bgcolor: '#000', borderRadius: 2, overflow: 'hidden' }}>
                <video
                  key={active._id}
                  src={active.fileUrl}
                  controls
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                />
              </Box>
            )}

            {active.type === 'pdf' && (
              <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                <iframe
                  key={active._id}
                  title={active.title}
                  src={active.fileUrl}
                  style={{ width: '100%', height: 480, border: 'none' }}
                />
              </Box>
            )}

            {active.type === 'ppt' && (
              <Box
                sx={{
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                }}
              >
                <SlideshowRoundedIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography sx={{ mb: 2 }}>
                  Slide decks open best in PowerPoint or your browser's download viewer.
                </Typography>
                <Button
                  variant="contained"
                  endIcon={<OpenInNewRoundedIcon />}
                  href={active.fileUrl}
                  target="_blank"
                  rel="noopener"
                >
                  Open presentation
                </Button>
              </Box>
            )}

            {active.description && (
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                {active.description}
              </Typography>
            )}

            {onMarkComplete && (
              <Box sx={{ mt: 'auto', pt: 3 }}>
                <Button
                  variant={isCompleted(active._id) ? 'outlined' : 'contained'}
                  color={isCompleted(active._id) ? 'success' : 'primary'}
                  startIcon={<CheckCircleRoundedIcon />}
                  onClick={() => onMarkComplete(active._id)}
                  disabled={isCompleted(active._id)}
                >
                  {isCompleted(active._id) ? 'Completed' : 'Mark as complete'}
                </Button>
              </Box>
            )}
          </>
        ) : (
          <Typography color="text.secondary">Select a lesson to begin.</Typography>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ flex: 1, maxHeight: 560, overflowY: 'auto' }}>
        <List disablePadding>
          {materials.map((m, idx) => (
            <ListItemButton
              key={m._id}
              selected={active?._id === m._id}
              onClick={() => setActive(m)}
              sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {isCompleted(m._id) ? (
                  <CheckCircleRoundedIcon color="success" />
                ) : (
                  iconFor(m.type)
                )}
              </ListItemIcon>
              <ListItemText
                primary={`${idx + 1}. ${m.title}`}
                secondary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={m.type.toUpperCase()} size="small" />
                    <Typography variant="caption" color="text.secondary">
                      {formatSize(m.fileSize)}
                    </Typography>
                  </Stack>
                }
              />
            </ListItemButton>
          ))}
        </List>
      </Paper>
    </Stack>
  );
};

export default MaterialViewer;
