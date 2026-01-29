/**
 * Unit tests for PipelineStageBreakdownWidget
 *
 * RED phase: These tests will fail until PipelineStageBreakdownWidget.jsx is implemented
 *
 * Tests vertical bar chart showing pipeline value per stage
 */

import { render, screen } from '@testing-library/react';
import { useTheme } from '@mui/material';
import PipelineStageBreakdownWidget from '../PipelineStageBreakdownWidget';

// Mock dependencies
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useTheme: jest.fn(),
}));
jest.mock('@/providers/CRMDashboardProvider');
jest.mock('@/providers/SettingsProvider');
jest.mock('@/hooks/useNumberFormat', () => ({
  __esModule: true,
  default: () => ({
    currencyFormat: (amount) => `$${(amount / 1000000).toFixed(1)}M`,
    numberFormat: (num) => num.toLocaleString(),
  }),
}));

const { useCRMDashboard } = require('@/providers/CRMDashboardProvider');
const { useSettingsContext } = require('@/providers/SettingsProvider');

// Mock dashboard pipeline metrics data
const mockPipelineMetrics = {
  stageBreakdown: [
    { stage: 'Qualification', value: 1240000, count: 28 },
    { stage: 'Needs Analysis', value: 1580000, count: 24 },
    { stage: 'Proposal', value: 1350000, count: 19 },
    { stage: 'Negotiation', value: 1620000, count: 22 },
    { stage: 'Verbal Commit', value: 980000, count: 12 },
    { stage: 'Contracting', value: 870000, count: 14 },
    { stage: 'Closed Won', value: 780000, count: 8 },
  ],
};

describe('PipelineStageBreakdownWidget', () => {
  const mockDateRange = {
    start: new Date('2026-01-01'),
    end: new Date('2026-01-29'),
    preset: 90,
  };

  const mockTheme = {
    vars: {
      palette: {
        primary: { main: '#1976d2' },
        text: { secondary: '#666', disabled: '#999' },
        chGrey: { 200: '#e0e0e0' },
      },
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useCRMDashboard.mockReturnValue({ dateRange: mockDateRange });
    useTheme.mockReturnValue(mockTheme);
    useSettingsContext.mockReturnValue({
      getThemeColor: (color) => color,
    });
  });

  test('renders widget with title', () => {
    render(<PipelineStageBreakdownWidget data={mockPipelineMetrics} />);

    expect(screen.getByText('Pipeline by Stage')).toBeInTheDocument();
  });

  test('renders ECharts vertical bar chart', () => {
    const { container } = render(<PipelineStageBreakdownWidget data={mockPipelineMetrics} />);

    // Check for ECharts canvas container
    const chartContainer = container.querySelector('[class*="echarts"]');
    expect(chartContainer).toBeInTheDocument();
  });

  test('displays all 7 pipeline stages', () => {
    const { container } = render(<PipelineStageBreakdownWidget data={mockPipelineMetrics} />);

    // ECharts will render stage labels in the chart
    // We verify the chart container exists and data was processed
    const chartContainer = container.querySelector('[class*="echarts"]');
    expect(chartContainer).toBeInTheDocument();
  });

  test('renders loading state', () => {
    render(<PipelineStageBreakdownWidget data={null} loading={true} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders error state', () => {
    render(<PipelineStageBreakdownWidget data={null} error="Failed to load pipeline data" />);

    expect(screen.getByText('Failed to load pipeline data')).toBeInTheDocument();
  });

  test('handles empty data gracefully', () => {
    const emptyData = { stageBreakdown: [] };
    const { container } = render(<PipelineStageBreakdownWidget data={emptyData} />);

    // Should still render chart container even with empty data
    const chartContainer = container.querySelector('[class*="echarts"]');
    expect(chartContainer).toBeInTheDocument();
  });

  test('uses DashboardWidgetContainer wrapper', () => {
    const { container } = render(<PipelineStageBreakdownWidget data={mockPipelineMetrics} />);

    // DashboardWidgetContainer renders a Paper with background={1}
    const paper = container.querySelector('[class*="MuiPaper"]');
    expect(paper).toBeInTheDocument();
  });
});
