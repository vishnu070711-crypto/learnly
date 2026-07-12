import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import Layout from '../components/Layout';

const NotFound = () => (
  <Layout>
    <Container maxWidth="sm" sx={{ py: 16, textAlign: 'center' }}>
      <Typography variant="h1" sx={{ fontSize: 96, fontWeight: 800, color: 'primary.main', mb: 1 }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Page not found
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Box>
        <Button variant="contained" component={RouterLink} to="/">
          Back to home
        </Button>
      </Box>
    </Container>
  </Layout>
);

export default NotFound;
