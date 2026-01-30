'use client';

import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';

const ProjectSidebar = ({ project }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const budgetUsed = (project.spent / project.budget) * 100;

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Stack spacing={3}>
        {/* Project Progress */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Project Progress
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Overall Progress</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {project.progress}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={project.progress}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Budget Overview */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Budget Overview
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2">Total Budget</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatCurrency(project.budget)}
                  </Typography>
                </Stack>
              </Box>
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2">Spent</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatCurrency(project.spent)}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={budgetUsed}
                  color={budgetUsed > 80 ? 'error' : budgetUsed > 60 ? 'warning' : 'success'}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
              <Box>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Remaining</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatCurrency(project.budget - project.spent)}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Project Timeline */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Timeline
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <IconifyIcon icon="material-symbols:play-arrow" color="success.main" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Start Date
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(project.startDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={2}>
                <IconifyIcon icon="material-symbols:flag" color="error.main" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    End Date
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(project.endDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Team Members
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Project Manager
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar src={project.projectManager.avatar} sx={{ width: 32, height: 32 }}>
                    {project.projectManager.name.charAt(0)}
                  </Avatar>
                  <Typography variant="body2">{project.projectManager.name}</Typography>
                </Stack>
              </Box>
              <Divider />
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Team ({project.team.length})
                </Typography>
                <AvatarGroup max={4}>
                  {project.team.map((member, index) => (
                    <Avatar key={index} src={member.avatar} sx={{ width: 32, height: 32 }}>
                      {member.name.charAt(0)}
                    </Avatar>
                  ))}
                </AvatarGroup>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default ProjectSidebar;
