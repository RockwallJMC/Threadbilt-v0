'use client';

import { Box } from '@mui/material';
import { useNavContext } from 'layouts/main-layout/NavProvider';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import PropTypes from 'prop-types';

/**
 * SplitScreenLayout - Renders two children side-by-side on desktop, stacked on mobile
 *
 * @param {Object} props
 * @param {React.ReactNode} props.leftChild - Content to render on the left side (desktop) or top (mobile)
 * @param {React.ReactNode} props.rightChild - Content to render on the right side (desktop) or bottom (mobile)
 */
const SplitScreenLayout = ({
  leftChild,
  rightChild,
  gap = 0,
  leftWidth = { xs: '100%', md: '50%' },
  rightWidth = { xs: '100%', md: '50%' },
  containerSx,
  leftSx,
  rightSx,
}) => {
  const { topbarHeight } = useNavContext();
  const { up } = useBreakpoints();
  const upSm = up('sm');
  const upMd = up('md');

  return (
    <Box
      data-testid="split-screen-container"
      sx={({ mixins }) => ({
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        height: mixins.contentHeight(
          topbarHeight,
          (upSm ? mixins.footer.sm : mixins.footer.xs) + 1,
        ),
        gap,
        width: '100%',
        alignItems: 'stretch',
        ...containerSx,
      })}
    >
      {/* Left side (desktop) / Top (mobile) */}
      <Box
        data-testid="split-screen-left"
        sx={{
          width: leftWidth,
          maxWidth: leftWidth,
          flexBasis: leftWidth,
          height: { xs: 'auto', md: '100%' },
          overflowY: 'auto',
          overflowX: 'hidden',
          ...leftSx,
        }}
      >
        {leftChild}
      </Box>

      {/* Right side (desktop) / Bottom (mobile) */}
      <Box
        data-testid="split-screen-right"
        sx={{
          width: rightWidth,
          maxWidth: rightWidth,
          flexBasis: rightWidth,
          height: { xs: 'auto', md: '100%' },
          overflowY: 'auto',
          overflowX: 'hidden',
          ...rightSx,
        }}
      >
        {rightChild}
      </Box>
    </Box>
  );
};

SplitScreenLayout.propTypes = {
  leftChild: PropTypes.node.isRequired,
  rightChild: PropTypes.node.isRequired,
  gap: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  leftWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  rightWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  containerSx: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.func]),
  leftSx: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.func]),
  rightSx: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.func]),
};

export default SplitScreenLayout;
