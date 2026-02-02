'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Box, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import Mapbox from 'components/base/Mapbox';

// Interactive Mapbox map with location marker
const MapPlaceholder = ({ location, address }) => (
  <Box
    sx={{
      width: 1,
      height: 300,
      borderRadius: 6,
      position: 'relative',
    }}
  >
    <Mapbox
      sx={{
        width: 1,
        height: 300,
        borderRadius: 6,
      }}
      options={{
        center: location?.latitude && location?.longitude
          ? [location.longitude, location.latitude]
          : [-97.3331, 32.7767], // Fallback to DFW
        zoom: location?.zoom || 15,
        scrollZoom: false,
      }}
    />
    {address && (
      <Paper
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <IconifyIcon
            icon="material-symbols:location-on-outline"
            sx={{ fontSize: 20, color: 'primary.main' }}
          />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {address}
          </Typography>
        </Stack>
      </Paper>
    )}
  </Box>
);

const ServiceLocationMap = ({ location, address }) => {
  // Interactive Mapbox map with marker showing ticket location
  return <MapPlaceholder location={location} address={address} />;
};

export default ServiceLocationMap;
