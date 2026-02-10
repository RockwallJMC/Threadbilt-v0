'use client';

import { useRef } from 'react';
import { SwiperSlide } from 'swiper/react';
import {
  Button,
  buttonClasses,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import StyledTextField from 'components/styled/StyledTextField';
import Swiper from 'components/base/Swiper';
import SortMenu from 'components/sections/projects/boards/page-header/SortMenu';
import BoardItem from './BoardItem';

const actionButtons = [
  {
    id: 1,
    text: 'Export / Import',
    icon: 'material-symbols:swap-vertical-circle-outline-rounded',
  },
  {
    id: 2,
    text: 'Filter',
    icon: 'material-symbols:filter-alt-outline',
  },
];

const BoardsSlider = ({
  boardList,
  size = 'medium',
  showControls = false,
  selectedId = null,
  onSelect = null,
  onViewBoard = null,
  onEdit = null,
  onArchive = null,
  onDelete = null,
  isLoading = false,
}) => {
  const { title, boards } = boardList || { title: 'Projects', boards: [] };
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);
  const swiperRef = useRef(null);
  const { up } = useBreakpoints();
  const upLg = up('lg');
  const upMd = up('md');

  return (
    <Paper sx={{ px: { xs: 3, md: 5 }, py: 5 }}>
      <Stack
        sx={{
          justifyContent: 'space-between',
          mb: 3,
          flexWrap: showControls ? { xs: 'wrap', md: 'nowrap' } : 'nowrap',
          gap: showControls ? 1.5 : 0,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 500, flexShrink: 0 }}>
          {title}
        </Typography>

        {showControls && (
          <Stack
            sx={{
              alignItems: 'center',
              gap: 1.5,
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              flex: 1,
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
            }}
          >
            <Button
              size="small"
              variant="contained"
              startIcon={
                <IconifyIcon icon="material-symbols:add-2-rounded" sx={{ fontSize: '16px !important' }} />
              }
              href={paths.createProject}
              sx={{ flexShrink: 0 }}
            >
              New Project
            </Button>

            {actionButtons.map((item) => (
              <Tooltip key={item.id} title={item.text} disableHoverListener={upMd}>
                <Button
                  variant={upMd ? 'text' : 'soft'}
                  color="neutral"
                  size="small"
                  shape={upMd ? undefined : 'square'}
                  sx={[
                    { flexShrink: 0, gap: 0.5 },
                    !upMd && {
                      [`& .${buttonClasses.startIcon}`]: { m: 0 },
                    },
                  ]}
                >
                  <IconifyIcon icon={item.icon} sx={{ fontSize: '16px !important' }} />
                  {upMd && item.text}
                </Button>
              </Tooltip>
            ))}

            <SortMenu />

            <StyledTextField
              id="search-projects"
              type="search"
              size="small"
              placeholder="Search"
              sx={{
                minWidth: 120,
                maxWidth: { xs: 160, sm: 200 },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconifyIcon
                        icon="material-symbols:search-rounded"
                        sx={{ color: 'text.secondary', fontSize: 18 }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>
        )}

        <Stack
          sx={{
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Button
            ref={navigationPrevRef}
            color="neutral"
            variant="soft"
            sx={{ p: 1, minWidth: 0, flexShrink: 0 }}
          >
            <IconifyIcon
              icon="material-symbols:chevron-left-rounded"
              sx={(theme) => ({
                fontSize: 20,
                transform: theme.direction === 'rtl' ? 'rotate(180deg)' : 'none',
              })}
            />
          </Button>
          <Button
            ref={navigationNextRef}
            color="neutral"
            variant="soft"
            sx={{ p: 1, minWidth: 0, flexShrink: 0 }}
          >
            <IconifyIcon
              icon="material-symbols:chevron-right-rounded"
              sx={(theme) => ({
                fontSize: 20,
                transform: theme.direction === 'rtl' ? 'rotate(180deg)' : 'none',
              })}
            />
          </Button>
        </Stack>
      </Stack>
      {isLoading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
          <CircularProgress />
        </Stack>
      ) : boards.length === 0 ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
          <Typography color="text.secondary">No projects found</Typography>
        </Stack>
      ) : (
        <Swiper
          slidesPerView="auto"
          spaceBetween={16}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          navigation={{
            prevEl: navigationPrevRef,
            nextEl: navigationNextRef,
          }}
          sx={{
            '& .swiper-slide': {
              width: 'auto',
              height: 'auto',
              boxSizing: 'border-box',
            },
          }}
        >
          {boards.map((board) => (
            <SwiperSlide key={board.id}>
              <BoardItem
                board={board}
                size={size}
                isSelected={selectedId === board.id}
                onSelect={onSelect}
                onViewBoard={onViewBoard}
                onEdit={onEdit}
                onArchive={onArchive}
                onDelete={onDelete}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </Paper>
  );
};

export default BoardsSlider;
