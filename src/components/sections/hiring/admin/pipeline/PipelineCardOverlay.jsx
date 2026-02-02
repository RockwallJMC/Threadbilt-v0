import Box from '@mui/material/Box';
import PipelineCard from './PipelineCard';

const PipelineCardOverlay = ({ pipeline, isOverGantt = false }) => {
  return (
    <Box
      sx={{
        cursor: 'grabbing',
        borderRadius: 4,
        boxShadow: (theme) => theme.vars.shadows[isOverGantt ? 1 : 5],
        transform: 'scale(0.85)',
        transformOrigin: 'top left',
      }}
    >
      <PipelineCard pipeline={pipeline} forceCollapsed />
    </Box>
  );
};

export default PipelineCardOverlay;
