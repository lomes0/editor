"use client"
import { useScrollTrigger, Zoom, Fab } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';

const ScrollTop: React.FC = () => {
  const trigger = useScrollTrigger({ 
    disableHysteresis: true,
    threshold: 100
  });

  const handleClick = () => {
    const anchor = document.querySelector('#back-to-top-anchor');
    if (anchor) {
      anchor.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  return (
    <Zoom in={trigger}>
      <Fab 
        color="secondary" 
        size="small" 
        aria-label="scroll back to top" 
        onClick={handleClick}
        sx={{
          position: 'fixed', 
          bottom: 16, 
          right: 16, 
          displayPrint: "none", 
          transition: 'bottom 0.3s',
          '@media (max-width: 496px)': {
            '&:has(~.editor-container .editor-toolbar #text-format-toggles)': { 
              bottom: 48 
            }
          }
        }}
      >
        <KeyboardArrowUp />
      </Fab>
    </Zoom>
  );
};

export default ScrollTop;
