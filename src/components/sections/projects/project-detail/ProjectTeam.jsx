'use client';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';

const ProjectTeam = ({ project }) => {
  const allMembers = [
    { ...project.projectManager, role: 'Project Manager', status: 'active' },
    ...project.team.map(member => ({ ...member, role: 'Developer', status: 'active' }))
  ];

  return (
    <Grid container spacing={3}>
      {/* Team Overview */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography variant="h6">
                Team Members ({allMembers.length})
              </Typography>
              <Button
                variant="outlined"
                startIcon={<IconifyIcon icon="material-symbols:person-add" />}
                size="small"
              >
                Add Member
              </Button>
            </Stack>
            
            <Grid container spacing={3}>
              {allMembers.map((member, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack alignItems="center" spacing={2}>
                        <Avatar
                          src={member.avatar}
                          sx={{ width: 64, height: 64 }}
                        >
                          {member.name.charAt(0)}
                        </Avatar>
                        
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ fontWeight: 500 }}>
                            {member.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {member.role}
                          </Typography>
                          <Chip
                            label={member.status}
                            color="success"
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </Box>
                        
                        <Stack direction="row" spacing={1}>
                          <Button size="small" variant="outlined">
                            <IconifyIcon icon="material-symbols:mail-outline" />
                          </Button>
                          <Button size="small" variant="outlined">
                            <IconifyIcon icon="material-symbols:chat-outline" />
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ProjectTeam;
