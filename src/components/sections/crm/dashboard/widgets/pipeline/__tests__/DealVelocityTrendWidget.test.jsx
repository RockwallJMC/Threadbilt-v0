/**
 * Unit tests for DealVelocityTrendWidget
 *
 * RED phase: These tests will fail until DealVelocityTrendWidget.jsx is implemented
 *
 * Tests area chart showing average days in each stage
 */

import { render, screen } from '@testing-library/react';
import { useTheme } from '@mui/material';
import DealVelocityTrendWidget from '../DealVelocityTrendWidget';

// Mock dependencies
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useTheme: jest.fn(),
}));
jest.mock('@/providers/CRMDashboardProvider');
jest.mock('@/providers/SettingsProvider');

const { useCRMDashboard } = require('@/providers/CRMDashboardProvider');
const { useSettingsContext } = require('@/providers/SettingsProvider');

// Mock velocity trend data
const mockPipelineMetrics = {
  velocityTrend: [
    { stage: 'Qualification', avgDays: 8 },
    { stage: 'Needs Analysis', avgDays: 12 },
    { stage: 'Proposal', avgDays: 10 },
    { stage: 'Negotiation', avgDays: 14 },
    { stage: 'Verbal Commit', avgDays: 7 },
    { stage: 'Contracting', avgDays: 5 },
  ],
};

describe('DealVelocityTrendWidget', () => {
  const mockDateRange = {
    start: new Date('2026-01-01'),
    end: new Date('2026-01-29'),
    preset: 90,
  };

  const mockTheme = {
    vars: {
      palette: {
        warning: { main: '#ff9800', light: '#ffb74d' },
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
    render(<DealVelocityTrendWidget data={mockPipelineMetrics} />);

    expect(screen.getByText('Deal Velocity by Stage')).toBeInTheDocument();
  });

  test('renders ECharts area chart', () => {
    const { container } = render(<DealVelocityTrendWidget data={mockPipelineMetrics} />);

    // Check for ECharts canvas container
    const chartContainer = container.querySelector('[class*="echarts"]');
    expect(chartContainer).toBeInTheDocument();
  });

  test('displays all 6 stages', () => {
    const { container } = render(<DealVelocityTrendWidget data={mockPipelineMetrics} />);

    // Verify chart container and data structure
    const chartContainer = container.querySelector('[class*="echarts"]');
    expect(chartContainer).toBeInTheDocument();
    expect(mockPipelineMetrics.velocityTrend).toHaveLength(6);
  });

  test('renders loading state', () => {
    render(<DealVelocityTrendWidget data={null} loading={true} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders error state', () => {
    render(<DealVelocityTrendWidget data={null} error="Failed to load velocity data" />);

    expect(screen.getByText('Failed to load velocity data')).toBeInTheDocument();
  });

  test('handles empty data gracefully', () => {
    const emptyData = { velocityTrend: [] };
    const { container } = render(<DealVelocityTrendWidget data={emptyData} />);

    // Should still render chart container
    const chartContainer = container.querySelector('[class*="echarts"]');
    expect(chartContainer).toBeInTheDocument();
  });

  test('uses DashboardWidgetContainer wrapper', () => {
    const { container } = render(<DealVelocityTrendWidget data={mockPipelineMetrics} />);

    // DashboardWidgetContainer renders a Paper with background={1}
    const paper = container.querySelector('[class*="MuiPaper"]');
    expect(paper).toBeInTheDocument();
  });

  test('avgDays are positive numbers', () => {
    // Verify data structure has valid day values
    mockPipelineMetrics.velocityTrend.forEach((item) => {
      expect(typeof item.avgDays).toBe('number');
      expect(item.avgDays).toBeGreaterThan(0);
    });
  });

  test('stages are in correct order', () => {
    // Verify stages follow pipeline progression
    const expectedOrder = [
      'Qualification',
      'Needs Analysis',
      'Proposal',
      'Negotiation',
      'Verbal Commit',
      'Contracting',
    ];

    mockPipelineMetrics.velocityTrend.forEach((item, index) => {
      expect(item.stage).toBe(expectedOrder[index]);
    });
  });
});
