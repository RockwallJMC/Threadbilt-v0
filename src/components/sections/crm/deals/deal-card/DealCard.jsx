'use client';

import { memo } from 'react';
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  Divider,
  IconButton,
  LinearProgress,
  Link,
  Stack,
  Tooltip,
  Typography,
  avatarClasses,
} from '@mui/material';
import dayjs from 'dayjs';
import useNumberFormat from 'hooks/useNumberFormat';
import { useDealsContext } from 'providers/DealsProvider';
import { TOGGLE_DEAL_EXPAND } from 'reducers/DealsReducer';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import Image from 'components/base/Image';

const contactLinks = [
  {
    id: 1,
    icon: 'material-symbols:call-outline',
    href: '#!',
  },
  {
    id: 2,
    icon: 'material-symbols:mail-outline-rounded',
    href: '#!',
  },
  {
    id: 3,
    icon: 'material-symbols:video-call-outline-rounded',
    href: '#!',
  },
  {
    id: 4,
    icon: 'material-symbols:contact-mail-outline-rounded',
    href: '#!',
  },
];

const DealCard = memo(({ deal }) => {
  const { dealsDispatch } = useDealsContext();
  const { currencyFormat } = useNumberFormat();

  const collaborators = deal.collaborators?.length
    ? deal.collaborators
    : deal.owner
      ? [deal.owner]
      : [];

  const companySeed = encodeURIComponent(deal.company?.name || deal.name || 'company');
  const colorPairs = [
    ['#1f7ae0', '#33c6f7'],
    ['#7b5cff', '#b44cff'],
    ['#00b37e', '#2dd4bf'],
    ['#f97316', '#facc15'],
    ['#ef4444', '#f472b6'],
    ['#0ea5e9', '#22d3ee'],
  ];
  const seedHash = (deal.company?.name || deal.name || 'company')
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const [iconA, iconB] = colorPairs[seedHash % colorPairs.length];
  const companyLogo = `https://api.dicebear.com/7.x/initials/svg?seed=${companySeed}&backgroundColor=00000000&radius=12`;

  const parseDate = (value) => {
    if (!value) return null;
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed : null;
  };

  const progressByDate = (() => {
    const start = parseDate(deal.createDate);
    const end = parseDate(deal.closeDate);
    if (!start || !end) return null;
    const now = dayjs();
    if (now.isAfter(end)) return 100;
    const total = end.diff(start, 'day');
    if (total <= 0) return null;
    const elapsed = Math.max(0, now.diff(start, 'day'));
    return Math.min(100, Math.round((elapsed / total) * 100));
  })();

  const progressValue = Number.isFinite(progressByDate) ? progressByDate : deal.progress || 0;

  const handleExpandClick = () => {
    dealsDispatch({ type: TOGGLE_DEAL_EXPAND, payload: { id: deal.id } });
  };

  return (
    <Card
      sx={(theme) => ({
        borderRadius: 4,
        bgcolor: 'background.elevation1',
        outline: 'none',
        border: `1px solid ${theme.vars.palette.divider}`,
        boxShadow: theme.vars.shadows[2],
        transition: theme.transitions.create(['box-shadow', 'transform'], {
          duration: theme.transitions.duration.shortest,
        }),
        '&:hover': {
          boxShadow: theme.vars.shadows[4],
          transform: 'translateY(-1px)',
        },
      })}
    >
      <CardHeader
        avatar={
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              p: 0.5,
              bgcolor: 'transparent',
              border: (theme) => `1px solid ${theme.vars.palette.divider}`,
              boxShadow: (theme) =>
                `inset 0 1px 0 ${theme.vars.palette.divider}, ${theme.vars.shadows[2]}`,
            }}
          >
            <Box
              sx={{
                width: 1,
                height: 1,
                borderRadius: 1.5,
                bgcolor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                src={companyLogo}
                width={36}
                height={36}
                unoptimized
                sx={{ borderRadius: 1.25 }}
              />
            </Box>
          </Box>
        }
        title={
          <Typography
            variant="subtitle2"
            component={Link}
            href={paths.dealDetails(deal.id)}
            underline="none"
            sx={{
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: { xs: 190, sm: 280 },
              color: 'text.primary',
              fontWeight: 600,
            }}
          >
            {deal.name}
          </Typography>
        }
        subheader={
          <Typography variant="body2" component={Link} href={deal.company.link}>
            {deal.company.name}
          </Typography>
        }
        action={
          <IconButton onClick={handleExpandClick}>
            <IconifyIcon
              icon="material-symbols:stat-minus-1-rounded"
              sx={(theme) => ({
                color: 'text.primary',
                transform: deal.expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: theme.transitions.create('transform', {
                  duration: theme.transitions.duration.shortest,
                }),
              })}
            />
          </IconButton>
        }
        sx={{ p: 3 }}
      />
      {!deal.expanded && (
        <CardContent sx={{ p: 3, pt: 0 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Budget:{' '}
            <Typography variant="body2" component="strong" sx={{ fontWeight: 600 }}>
              {currencyFormat(deal.amount, { minimumFractionDigits: 0 })}
            </Typography>
          </Typography>

          <Stack sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between' }}>
            <AvatarGroup
              max={5}
              sx={{
                mr: 1,
                display: 'inline-flex',
                [`& .${avatarClasses.root}`]: {
                  width: 32,
                  height: 32,
                  fontSize: 'caption.fontSize',
                  fontWeight: 'medium',
                  bgcolor: 'primary.main',
                },
              }}
            >
              {collaborators.map((user) => (
                <Tooltip key={user.id} title={user.name}>
                  <Avatar alt={user.name} src={user.avatar} />
                </Tooltip>
              ))}
            </AvatarGroup>

            <Chip
              icon={<IconifyIcon icon="material-symbols:timer-outline-rounded" />}
              label={dayjs(deal.closeDate).format('DD.MM.YY')}
              color="info"
            />
          </Stack>

          <LinearProgress
            variant="determinate"
            color={progressValue === 100 ? 'success' : 'primary'}
            value={progressValue}
          />
        </CardContent>
      )}
      <Collapse in={deal.expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ p: 3, pt: 0, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="column" spacing={2} divider={<Divider flexItem />} sx={{ width: 1 }}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Budget:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {currencyFormat(deal.amount, { minimumFractionDigits: 0 })}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Last update:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {dayjs(deal.lastUpdate).format('DD MMM, YYYY')}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Stage:
              </Typography>
              <Stack>
                <Chip label={deal.stage} color="warning" />
              </Stack>
            </Box>

            <Box sx={{ width: 1 }}>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Contact:
              </Typography>
              <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography
                  component={Link}
                  variant="body2"
                  sx={{ alignItems: 'center', fontWeight: 600, mr: 1.5 }}
                >
                  {deal.client.name}
                </Typography>

                {contactLinks.map((item) => (
                  <Button
                    key={item.id}
                    variant="soft"
                    shape="square"
                    color="neutral"
                    size="small"
                    sx={{ fontSize: 18 }}
                  >
                    <IconifyIcon icon={item.icon} />
                  </Button>
                ))}
              </Stack>
            </Box>

            <Box sx={{ width: 1 }}>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Agents:
              </Typography>

              <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                {collaborators.map((user) => (
                  <Chip
                    key={user.id}
                    avatar={
                      <Avatar
                        alt={user.name}
                        src={user.avatar}
                        sx={{ border: (theme) => `1px solid ${theme.vars.palette.background.default}` }}
                      />
                    }
                    label={user.name.replace(/(\w)\w+$/, '$1.')}
                    color="neutral"
                  />
                ))}
                <Button
                  variant="text"
                  shape="square"
                  color="primary"
                  size="small"
                  sx={{ fontSize: 18 }}
                >
                  <IconifyIcon icon="material-symbols:person-add-outline" />
                </Button>
              </Stack>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Closing:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {dayjs(deal.closeDate).format('DD MMM, YYYY')}
              </Typography>
            </Box>
          </Stack>

          <LinearProgress
            variant="determinate"
            color={progressValue === 100 ? 'success' : 'primary'}
            value={progressValue}
            sx={{ mt: 2 }}
          />
        </CardContent>
      </Collapse>
    </Card>
  );
});

export default DealCard;
