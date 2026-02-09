import { Box, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

const dashboardPaths = {
  business: '/dashboard/analytics',
  sales: '/apps/crm',
  projects: '/dashboard/project',
  service: '/dashboard/time-tracker',
  inventory: '/dashboard/ecommerce',
};

const SideDeskContent = ({ deskType, activeView }) => {
  const iframeRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState('100%');

  // Use activeView path if available, otherwise fall back to deskType path
  const contentPath = activeView?.path || dashboardPaths[deskType];

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      try {
        // Set iframe height based on content
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          const height = iframeDoc.documentElement.scrollHeight;
          setIframeHeight(`${height}px`);
        }
      } catch (e) {
        // Cross-origin restriction, use default height
        console.log('Cannot access iframe content:', e);
      }
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [contentPath]);

  if (!contentPath) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Select an item from the navigation menu
        </Typography>
      </Box>
    );
  }

  const title = activeView?.name || deskType || 'Side Desk';

  return (
    <Box
      sx={{
        flex: 1,
        overflow: 'auto',
        width: '100%',
        height: '100%',
      }}
    >
      <iframe
        ref={iframeRef}
        src={contentPath}
        style={{
          width: '100%',
          height: iframeHeight,
          minHeight: '100%',
          border: 'none',
          display: 'block',
        }}
        title={`${title} view`}
      />
    </Box>
  );
};

export default SideDeskContent;
