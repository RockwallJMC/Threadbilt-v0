'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { files } from 'data/file-manager';
import dayjs from 'dayjs';
import { useFileManager } from 'providers/FileManagerProvider';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import FilterAndSort from './FilterAndSort';
import NoFilesFound from './NoFilesFound';
import GridView from './grid-view';
import ListView from './list-view';

const AllFiles = () => {
  const { viewMode, allFiles, selectedFiles, filter, isSlideDownOpen } = useFileManager();
  const router = useRouter();
  const pathname = usePathname();
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  const currentFolder = files.find((folder) => folder.id.toString() === pathname.split('/').pop());

  const currentFiles = allFiles.filter((file) => {
    switch (filter) {
      case 'all':
        return file;
      case 'recent':
        return dayjs().diff(dayjs(file.uploadedAt), 'hour') <= 1;
      case 'folder':
        return file.type === 'folder';
      case 'favorite':
        return file.favorite;
      case 'shared':
        return file.shared.length > 0;
    }
  });

  // Handle exit animation timing
  useEffect(() => {
    if (isSlideDownOpen) {
      setShouldRender(true);
      setIsAnimatingOut(false);
    } else if (shouldRender) {
      setIsAnimatingOut(true);
      const timer = setTimeout(() => setShouldRender(false), 450);
      return () => clearTimeout(timer);
    }
  }, [isSlideDownOpen, shouldRender]);

  // Shared content rendering (used by both views)
  const renderFilesContent = () => (
    <>
      {!(pathname === paths.fileManager || pathname === paths.fileManager + '/') ? (
        <Breadcrumbs
          separator={<IconifyIcon icon="material-symbols:navigate-next" sx={{ fontSize: 20 }} />}
          sx={{ mb: 2 }}
        >
          <Typography
            component={Link}
            onClick={() => router.back()}
            variant="h5"
            sx={{ fontSize: { xs: 20, md: 24 } }}
          >
            All Files
          </Typography>
          <Typography variant="h5" sx={{ fontSize: { xs: 20, md: 24 } }}>
            {currentFolder?.name}
          </Typography>
        </Breadcrumbs>
      ) : (
        <Typography variant="h5" sx={{ mb: 2, fontSize: { xs: 20, md: 24 } }}>
          All Files
        </Typography>
      )}

      {allFiles.length > 0 && <FilterAndSort />}
      {currentFiles.length === 0 && <NoFilesFound />}

      {viewMode === 'grid' && currentFiles.length > 0 && <GridView allFiles={currentFiles} />}
      {viewMode === 'list' && currentFiles.length > 0 && (
        <ListView allFiles={currentFiles} selectedFiles={selectedFiles} />
      )}
    </>
  );

  return (
    <>
      {/* Slide-Down Container */}
      {shouldRender && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            animation: isAnimatingOut
              ? {
                  xs: 'slideUp 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                  md: 'slideUp 0.45s cubic-bezier(0.4, 0.0, 0.2, 1)',
                }
              : {
                  xs: 'slideDown 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                  md: 'slideDown 0.45s cubic-bezier(0.4, 0.0, 0.2, 1)',
                },
            '@keyframes slideDown': {
              from: { transform: 'translateY(-100%)', opacity: 0 },
              to: { transform: 'translateY(0)', opacity: 1 },
            },
            '@keyframes slideUp': {
              from: { transform: 'translateY(0)', opacity: 1 },
              to: { transform: 'translateY(-100%)', opacity: 0 },
            },
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
            },
          }}
        >
          <Paper
            sx={{
              height: 'calc(100vh - 64px - 72px)',
              p: { xs: 3, md: 5 },
              boxShadow: 24,
            }}
          >
            <Container maxWidth={false} sx={{ maxWidth: 1, height: 1, p: '0 !important' }}>
              {renderFilesContent()}
            </Container>
          </Paper>
        </Box>
      )}

      {/* Main "My Files" Container (hidden when slide-down is open) */}
      {!shouldRender && (
        <Paper sx={{ height: 1, p: { xs: 3, md: 5 }, flexGrow: 1 }}>
          <Container maxWidth={false} sx={{ maxWidth: 1, height: 1, p: '0 !important' }}>
            {renderFilesContent()}
          </Container>
        </Paper>
      )}
    </>
  );
};

export default AllFiles;
