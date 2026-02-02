import { Paper, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavContext } from 'layouts/main-layout/NavProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import Image from 'components/base/Image';
import ScrollSpyContent from 'components/scroll-spy/ScrollSpyContent';

const EventPerformers = ({ performerList }) => {
  const { topbarHeight } = useNavContext();

  return (
    <Grid container spacing={{ xs: 4, md: 6, xl: 10 }}>
      <Grid size={{ xs: 12, xl: 6 }}>
        <div>
          <ScrollSpyContent
            id="details"
            sx={(theme) => ({
              scrollMarginTop: theme.mixins.topOffset(topbarHeight, 75, true),
            })}
          >
            <Typography variant="h6" sx={{ my: 3, lineHeight: 1.5 }}>
              Details
            </Typography>
          </ScrollSpyContent>
          <Stack spacing={1} sx={{ mb: 3 }}>
            {performerList.performers.map((performer) => (
              <Paper
                key={performer}
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
                  <Typography variant="subtitle1" color="text.secondary">
                    {performer}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </div>
      </Grid>
      <Grid size={{ xs: 12, xl: 6 }}>
        <Image
          src={performerList.image.src}
          alt={performerList.image.alt}
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

export default EventPerformers;
