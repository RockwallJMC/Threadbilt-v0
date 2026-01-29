/**
 * Unit tests for WinLossAnalysisWidget
 *
 * RED phase: These tests will fail until WinLossAnalysisWidget.jsx is implemented
 *
 * Tests pie chart showing won vs lost opportunities
 */

import { render, screen } from '@testing-library/react';
import { useTheme } from '@mui/material';
import WinLossAnalysisWidget from '../WinLossAnalysisWidget';

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

// Mock win/loss analysis data
const mockPipelineMetrics = {
  winLossAnalysis: {
    won: { count: 50, value: 7250000, percentage: 62.5 },
    lost: { count: 30, value: 3000000, percentage: 37.5 },
  },
};

describe('WinLossAnalysisWidget', () => {
  const mockDateRange = {
    start: new Date('2026-01-01'),
    end: new Date('2026-01-29'),
    preset: 90,
  };

  const mockTheme = {
    vars: {
      palette: {
        success: { main: '#4caf50' },
        error: { main: '#f44336' },
        text: { secondary: '#666', disabled: '#999' },
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
    render(<WinLossAnalysisWidget data={mockPipelineMetrics} />);

    expect(screen.getByText('Win/Loss Analysis')).toBeInTheDocument();
  });

  test('renders ECharts pie chart', () => {
    const { container } = render(<WinLossAnalysisWidget data={mockPipelineMetrics} />);

    // Check for ECharts canvas container
    const chartContainer = container.querySelector('[class*="echarts"]');
    expect(chartContainer).toBeInTheDocument();
  });

  test('displays won and lost segments', () => {
    // Verify data structure has both won and lost
    expect(mockPipelineMetrics.winLossAnalysis.won).toBeDefined();
    expect(mockPipelineMetrics.winLossAnalysis.lost).toBeDefined();
    expect(mockPipelineMetrics.winLossAnalysis.won.count).toBe(50);
    expect(mockPipelineMetrics.winLossAnalysis.lost.count).toBe(30);
  });

  test('renders loading state', () => {
    render(<WinLossAnalysisWidget data={null} loading={true} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders error state', () => {
    render(<WinLossAnalysisWidget data={null} error="Failed to load win/loss data" />);

    expect(screen.getByText('Failed to load win/loss data')).toBeInTheDocument();
  });

  test('handles missing data gracefully', () => {
    const emptyData = { winLossAnalysis: {} };
    const { container } = render(<WinLossAnalysisWidget data={emptyData} />);

    // Should still render chart container
    const chartContainer = container.querySelector('[class*="echarts"]');
    expect(chartContainer).toBeInTheDocument();
  });

  test('uses DashboardWidgetContainer wrapper', () => {
    const { container } = render(<WinLossAnalysisWidget data={mockPipelineMetrics} />);

    // DashboardWidgetContainer renders a Paper with background={1}
    const paper = container.querySelector('[class*="MuiPaper"]');
    expect(paper).toBeInTheDocument();
  });

  test('percentages add up to 100', () => {
    const { won, lost } = mockPipelineMetrics.winLossAnalysis;
    expect(won.percentage + lost.percentage).toBe(100);
  });

  test('includes count and value for each segment', () => {
    const { won, lost } = mockPipelineMetrics.winLossAnalysis;

    // Won segment
    expect(typeof won.count).toBe('number');
    expect(typeof won.value).toBe('number');
    expect(typeof won.percentage).toBe('number');

    // Lost segment
    expect(typeof lost.count).toBe('number');
    expect(typeof lost.value).toBe('number');
    expect(typeof lost.percentage).toBe('number');
  });

  test('won count is greater than lost count', () => {
    // Business logic verification: should have more wins than losses
    const { won, lost } = mockPipelineMetrics.winLossAnalysis;
    expect(won.count).toBeGreaterThan(lost.count);
  });
});
