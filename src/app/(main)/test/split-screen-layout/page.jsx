'use client';

import { Box, Typography } from '@mui/material';
import SplitScreenLayout from 'layouts/split-screen-layout/SplitScreenLayout';

const SplitScreenLayoutTestPage = () => {
  const leftContent = (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Left Content</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        This is the left side of the split screen layout.
      </Typography>
      {/* Add enough content to test scrolling */}
      {Array.from({ length: 50 }).map((_, i) => (
        <Typography key={i} variant="body2" sx={{ mt: 1 }}>
          Left content paragraph {i + 1}
        </Typography>
      ))}
    </Box>
  );

  const rightContent = (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Right Content</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        This is the right side of the split screen layout.
      </Typography>
      {/* Add enough content to test scrolling */}
      {Array.from({ length: 50 }).map((_, i) => (
        <Typography key={i} variant="body2" sx={{ mt: 1 }}>
          Right content paragraph {i + 1}
        </Typography>
      ))}
    </Box>
  );

  return <SplitScreenLayout leftChild={leftContent} rightChild={rightContent} />;
};

export default SplitScreenLayoutTestPage;
