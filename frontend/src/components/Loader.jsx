import { Box, CircularProgress } from '@mui/material';

const Loader = ({ height = '60vh' }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height }}>
    <CircularProgress thickness={4} />
  </Box>
);

export default Loader;
