import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

const dashboardPaths = {
  business: '/dashboard/analytics',
  sales: '/apps/crm',
  projects: '/dashboard/project',
  service: '/dashboard/time-tracker',
  inventory: '/dashboard/ecommerce',
};

const SideDeskContent = ({ deskType }) => {
  const iframeRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState('100%');

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
  }, [deskType]);

  if (!deskType) {
    return null;
  }

  const dashboardPath = dashboardPaths[deskType];

  if (!dashboardPath) {
    return null;
  }

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
        src={dashboardPath}
        style={{
          width: '100%',
          height: iframeHeight,
          minHeight: '100%',
          border: 'none',
          display: 'block',
        }}
        title={`${deskType} dashboard`}
      />
    </Box>
  );
};

export default SideDeskContent;
