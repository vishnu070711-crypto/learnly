import { Box, Typography, Container, Stack } from '@mui/material';

const Footer = () => (
  <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 8, py: 4 }}>
    <Container maxWidth="lg">
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" gap={2}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Learnly. Built with the MERN stack.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Learn something new every day.
        </Typography>
      </Stack>
    </Container>
  </Box>
);

export default Footer;
