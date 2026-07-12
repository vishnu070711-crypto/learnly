import { Button } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ to, label = 'Back', sx, ...props }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
      return;
    }
    navigate(-1);
  };

  return (
    <Button startIcon={<ArrowBackRoundedIcon />} onClick={handleClick} sx={{ mb: 2, ...sx }} {...props}>
      {label}
    </Button>
  );
};

export default BackButton;
