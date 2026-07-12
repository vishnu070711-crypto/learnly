import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Avatar,
  Box,
  Divider,
} from '@mui/material';
import Layout from '../components/Layout';
import BackButton from '../components/BackButton';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/services';
import { useSnackbar } from 'notistack';

const Profile = () => {
  const { user, updateUserInState } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('bio', form.bio);
      if (avatarFile) formData.append('avatar', avatarFile);
      const { data } = await authAPI.updateProfile(formData);
      updateUserInState(data.user);
      enqueueSnackbar('Profile updated', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Update failed', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwSaving(true);
    try {
      await authAPI.changePassword(pwForm);
      setPwForm({ currentPassword: '', newPassword: '' });
      enqueueSnackbar('Password updated', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Could not change password', { variant: 'error' });
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <BackButton to="/" label="Back to home" />
        <Typography variant="h4" sx={{ mb: 4 }}>
          Profile settings
        </Typography>

        <Paper variant="outlined" sx={{ p: 4, mb: 4 }}>
          <Box component="form" onSubmit={handleSaveProfile}>
            <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
              <Avatar src={avatarPreview} sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: 28 }}>
                {user?.name?.[0]}
              </Avatar>
              <Button component="label" variant="outlined">
                Change photo
                <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
              </Button>
            </Stack>
            <Stack spacing={2.5}>
              <TextField
                label="Full name"
                fullWidth
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <TextField label="Email" fullWidth value={user?.email} disabled helperText="Email cannot be changed" />
              <TextField
                label="Bio"
                fullWidth
                multiline
                minRows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
              <Button type="submit" variant="contained" disabled={saving} sx={{ alignSelf: 'flex-start' }}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </Stack>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Change password
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box component="form" onSubmit={handleChangePassword}>
            <Stack spacing={2.5}>
              <TextField
                label="Current password"
                type="password"
                required
                fullWidth
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              />
              <TextField
                label="New password"
                type="password"
                required
                fullWidth
                helperText="At least 6 characters"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              />
              <Button type="submit" variant="contained" disabled={pwSaving} sx={{ alignSelf: 'flex-start' }}>
                {pwSaving ? 'Updating…' : 'Update password'}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
};

export default Profile;
