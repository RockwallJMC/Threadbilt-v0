'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import Mapbox from 'components/base/Mapbox';

const DEFAULT_CENTER = [-97.3331, 32.7767]; // DFW fallback

const TicketCardMap = ({ address, height = 200 }) => {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    const geocode = async () => {
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}&limit=1`,
        );
        const data = await response.json();

        if (data.features?.length > 0) {
          const [lng, lat] = data.features[0].center;
          setCoords([lng, lat]);
        }
      } catch (error) {
        console.error('Geocoding failed:', error);
      } finally {
        setLoading(false);
      }
    };

    geocode();
  }, [address]);

  if (loading) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover',
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Mapbox
      sx={{
        height,
        borderRadius: 0,
      }}
      options={{
        center: coords || DEFAULT_CENTER,
        zoom: 14,
        scrollZoom: false,
      }}
    />
  );
};

export default TicketCardMap;
