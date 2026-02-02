'use client';

import { useState } from 'react';
import { IconButton, Paper, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavContext } from 'layouts/main-layout/NavProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import Image from 'components/base/Image';
import ScrollSpyContent from 'components/scroll-spy/ScrollSpyContent';
import SiteMapDrawer from 'components/sections/service/ticket-detail/SiteMapDrawer';

const EventEquipment = ({ equipmentList }) => {
  const { topbarHeight } = useNavContext();
  const [siteMapOpen, setSiteMapOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const handleOpenSiteMap = (equipment) => {
    setSelectedEquipment(equipment);
    setSiteMapOpen(true);
  };

  const handleMarkerPlace = (marker) => {
    console.log('Marker placed for equipment:', selectedEquipment, marker);
    // In a real implementation, this would save to database
  };

  return (
    <Grid container spacing={{ xs: 4, md: 6, xl: 10 }}>
      <Grid size={{ xs: 12, xl: 6 }}>
        <div>
          <ScrollSpyContent
            id="equipment"
            sx={(theme) => ({
              scrollMarginTop: theme.mixins.topOffset(topbarHeight, 75, true),
            })}
          >
            <Typography variant="h6" sx={{ my: 3, lineHeight: 1.5 }}>
              Equipment
            </Typography>
          </ScrollSpyContent>
          <Stack spacing={1} sx={{ mb: 3 }}>
            {equipmentList.equipment.map((item) => (
              <Paper
                key={item}
                background={1}
                sx={{
                  p: 2,
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <IconifyIcon
                    icon="material-symbols:circle"
                    color="background.elevation3"
                    fontSize={8}
                  />
                  <Typography variant="subtitle1" color="text.secondary" sx={{ flex: 1 }}>
                    {item}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenSiteMap(item)}
                    sx={{
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.lighter',
                      },
                    }}
                  >
                    <IconifyIcon icon="material-symbols:location-on-outline" fontSize={20} />
                  </IconButton>
                </Stack>
              </Paper>
            ))}
          </Stack>

          <SiteMapDrawer
            open={siteMapOpen}
            handleClose={() => setSiteMapOpen(false)}
            siteMaps={[
              { name: 'First Floor', image: null },
              { name: 'Second Floor', image: null },
            ]}
            onMarkerPlace={handleMarkerPlace}
          />
        </div>
      </Grid>
      <Grid size={{ xs: 12, xl: 6 }}>
        <Image
          src={equipmentList.image.src}
          alt={equipmentList.image.alt}
          height={584}
          width={600}
          sx={({ mixins }) => ({
            objectFit: 'cover',
            borderRadius: 6,
            width: 1,
            position: 'sticky',
            top: mixins.topOffset(topbarHeight, 75, true),
          })}
        />
      </Grid>
    </Grid>
  );
};

export default EventEquipment;
