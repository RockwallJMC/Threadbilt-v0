import { Paper, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavContext } from 'layouts/main-layout/NavProvider';
import Image from 'components/base/Image';
import ScrollSpyContent from 'components/scroll-spy/ScrollSpyContent';

const EventSchedule = ({ schedule }) => {
  const { topbarHeight } = useNavContext();

  return (
    <Grid container spacing={{ xs: 4, md: 6, xl: 10 }}>
      <Grid size={{ xs: 12, xl: 6 }}>
        <div>
          <ScrollSpyContent
            id="instructions"
            sx={(theme) => ({
              scrollMarginTop: theme.mixins.topOffset(topbarHeight, 75, true),
            })}
          >
            <Typography variant="h6" sx={{ my: 3, lineHeight: 1.5 }}>
              Instructions
            </Typography>
          </ScrollSpyContent>
          <Stack spacing={1} sx={{ mb: 3 }}>
            {schedule.info.map((item) => (
              <Grid container spacing={1} key={item.label}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper
                    background={1}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <Paper
                    background={1}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                    }}
                  >
                    <Typography color="text.secondary">{item.time}</Typography>
                  </Paper>
                </Grid>
              </Grid>
            ))}
          </Stack>
        </div>
      </Grid>
      <Grid size={{ xs: 12, xl: 6 }}>
        <Image
          src={schedule.image.src}
          alt={schedule.image.alt}
          height={246}
          width={600}
          sx={({ mixins }) => ({
            width: 1,
            objectFit: 'cover',
            borderRadius: 6,
            position: 'sticky',
            top: mixins.topOffset(topbarHeight, 75, true),
          })}
        />
      </Grid>
    </Grid>
  );
};

export default EventSchedule;
