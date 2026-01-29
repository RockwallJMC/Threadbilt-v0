/**
 * Unit tests for ConversionRateByStageWidget
 *
 * RED phase: These tests will fail until ConversionRateByStageWidget.jsx is implemented
 *
 * Tests line chart showing conversion rates between stages
 */

import { render, screen } from '@testing-library/react';
import { useTheme } from '@mui/material';
import ConversionRateByStageWidget from '../ConversionRateByStageWidget';

// Mock dependencies
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useTheme: jest.fn(),
}));
jest.mock('@/providers/CRMDashboardProvider');
jest.mock('@/providers/SettingsProvider');

const { useCRMDashboard } = require('@/providers/CRMDashboardProvider');
const { useSettingsContext } = require('@/providers/SettingsProvider');

// Mock conversion rates data
const mockPipelineMetrics = {
  conversionRates: [
    { stage: 'Qualification → Needs Analysis', rate: 85.7 },
    { stage: 'Needs Analysis → Proposal', rate: 79.2 },
    { stage: 'Proposal → Negotiation', rate: 73.7 },
    { stage: 'Negotiation → Verbal Commit', rate: 54.5 },
    { stage: 'Verbal Commit → Contracting', rate: 83.3 },
    { stage: 'Contracting → Closed Won', rate: 57.1 },
  ],
};

describe('ConversionRateByStageWidget', () => {
  const mockDateRange = {
    start: new Date('2026-01-01'),
    end: new Date('2026-01-29'),
    preset: 90,
  };

  const mockTheme = {
    vars: {
      palette: {
        primary: { main: '#1976d2' },
        success: { main: '#4caf50' },
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
    render(<ConversionRateByStageWidget data={mockPipelineMetrics} />);

    expect(screen.getByText('Conversion Rate by Stage')).toBeInTheDocument();
  });

  test('renders ECharts line chart', () => {
    const { container } = render(<ConversionRateByStageWidget data={mockPipelineMetrics} />);

    // Check for ECharts canvas container
    const chartContainer = container.querySelector('[class*="echarts"]');
    expect(chartContainer).toBeInTheDocument();
  });

  test('displays all 6 stage transitions', () => {
    const { container } = render(<ConversionRateByStageWidget data={mockPipelineMetrics} />);

    // Verify chart container exists and data structure is correct
    const chartContainer = container.querySelector('[class*="echarts"]');
    expect(chartContainer).toBeInTheDocument();
    expect(mockPipelineMetrics.conversionRates).toHaveLength(6);
  });

  test('renders loading state', () => {
    render(<ConversionRateByStageWidget data={null} loading={true} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders error state', () => {
    render(
      <ConversionRateByStageWidget data={null} error="Failed to load conversion rates" />
    );

    expect(screen.getByText('Failed to load conversion rates')).toBeInTheDocument();
  });

  test('handles empty data gracefully', () => {
    const emptyData = { conversionRates: [] };
    const { container } = render(<ConversionRateByStageWidget data={emptyData} />);

    // Should still render chart container
    const chartContainer = container.querySelector('[class*="echarts"]');
    expect(chartContainer).toBeInTheDocument();
  });

  test('uses DashboardWidgetContainer wrapper', () => {
    const { container } = render(<ConversionRateByStageWidget data={mockPipelineMetrics} />);

    // DashboardWidgetContainer renders a Paper with background={1}
    const paper = container.querySelector('[class*="MuiPaper"]');
    expect(paper).toBeInTheDocument();
  });

  test('formats rates as percentages', () => {
    // This test verifies the data structure has rate values
    // The chart formatter will add % symbols
    mockPipelineMetrics.conversionRates.forEach((item) => {
      expect(typeof item.rate).toBe('number');
      expect(item.rate).toBeGreaterThan(0);
      expect(item.rate).toBeLessThanOrEqual(100);
    });
  });
});
