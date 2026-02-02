'use client';

import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { usePathname } from 'next/navigation';
import { fileStorageData } from 'data/file-manager';

const segmentColors = {
  Photos: 'info.main',
  Videos: 'primary.main',
  Document: 'warning.main',
  Email: 'success.main',
  Chats: 'error.main',
  Others: 'chGrey.300',
};

const StorageIndicator = ({ totalStorage = 20 }) => {
  const pathname = usePathname();

  // Only show on file manager pages
  if (!pathname?.startsWith('/apps/file-manager')) {
    return null;
  }

  const usedStorage = Number(fileStorageData.reduce((acc, curr) => acc + curr.size, 0).toFixed(2));
  const percentUsed = Math.round((usedStorage / totalStorage) * 100);

  let cumulativePercent = 0;
  const segments = fileStorageData.map((segment) => {
    const segmentPercent = (segment.size / totalStorage) * 100;
    const start = cumulativePercent;
    cumulativePercent += segmentPercent + 1;

    return {
      ...segment,
      percent: segmentPercent,
      start,
    };
  });

  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: 'center',
        px: 2,
        py: 0.5,
        bgcolor: 'background.elevation1',
        borderRadius: 1,
        minWidth: 200,
      }}
    >
      <Stack direction="column" gap={0.5} sx={{ flex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" fontWeight={600}>
            Your Storage
          </Typography>
          <Typography variant="caption" fontWeight={600} color="text.secondary">
            {percentUsed}% Full
          </Typography>
        </Stack>

        <Stack
          sx={{
            position: 'relative',
            height: 6,
            width: '100%',
            borderRadius: 3,
            bgcolor: 'background.elevation2',
            overflow: 'hidden',
          }}
        >
          {segments.map((segment, index) => (
            <Tooltip key={index} title={`${segment.title}: ${segment.percent.toFixed(2)}%`}>
              <Box
                sx={{
                  position: 'absolute',
                  left: `${segment.start}%`,
                  width: `${segment.percent}%`,
                  height: '100%',
                  bgcolor: segmentColors[segment.title],
                  transition: 'width 0.4s ease-in-out',
                }}
              />
            </Tooltip>
          ))}
        </Stack>

        <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ fontSize: 10 }}>
          {usedStorage} GB of {totalStorage} GB
        </Typography>
      </Stack>
    </Stack>
  );
};

export default StorageIndicator;
