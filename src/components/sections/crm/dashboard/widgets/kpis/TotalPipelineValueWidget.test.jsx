/**
 * Unit tests for TotalPipelineValueWidget
 *
 * RED phase: These tests will fail until TotalPipelineValueWidget.jsx is implemented
 */

import { render, screen } from '@testing-library/react';
import TotalPipelineValueWidget from './TotalPipelineValueWidget';

// Mock dependencies
jest.mock('@/services/swr/api-hooks/useDashboardApi');
jest.mock('@/providers/CRMDashboardProvider');
jest.mock('@/hooks/useNumberFormat', () => ({
  __esModule: true,
  default: () => ({
    currencyFormat: (amount) => `$${(amount / 1000000).toFixed(1)}M`,
    numberFormat: (num) => num.toLocaleString(),
  }),
}));

const { useDashboardKPIs } = require('@/services/swr/api-hooks/useDashboardApi');
const { useCRMDashboard } = require('@/providers/CRMDashboardProvider');

describe('TotalPipelineValueWidget', () => {
  const mockDateRange = {
    start: new Date('2026-01-01'),
    end: new Date('2026-01-29'),
    preset: 90,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useCRMDashboard.mockReturnValue({ dateRange: mockDateRange });
  });

  test('renders with loading state', () => {
    useDashboardKPIs.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<TotalPipelineValueWidget />);

    expect(screen.getByText('Total Pipeline Value')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders formatted currency value correctly', () => {
    useDashboardKPIs.mockReturnValue({
      data: {
        totalPipelineValue: 8420000,
        weightedForecast: 4210000,
        leadConversionRate: 18.5,
        opportunityWinRate: 32.0,
        averageDealSize: 145000,
        averageSalesCycle: 42,
        proposalsAcceptanceRate: 23.5,
        totalActiveAccounts: 85,
      },
      isLoading: false,
      error: null,
    });

    render(<TotalPipelineValueWidget />);

    expect(screen.getByText('Total Pipeline Value')).toBeInTheDocument();
    expect(screen.getByText('$8.4M')).toBeInTheDocument();
    expect(screen.getByText('All open opportunities')).toBeInTheDocument();
  });

  test('renders error state', () => {
    useDashboardKPIs.mockReturnValue({
      data: null,
      isLoading: false,
      error: 'Failed to fetch KPIs',
    });

    render(<TotalPipelineValueWidget />);

    expect(screen.getByText('Failed to fetch KPIs')).toBeInTheDocument();
  });

  test('renders dash when data is null', () => {
    useDashboardKPIs.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(<TotalPipelineValueWidget />);

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  test('uses correct icon', () => {
    useDashboardKPIs.mockReturnValue({
      data: {
        totalPipelineValue: 8420000,
      },
      isLoading: false,
      error: null,
    });

    const { container } = render(<TotalPipelineValueWidget />);

    // Check that icon is rendered (Iconify component renders svg)
    const avatar = container.querySelector('[class*="MuiAvatar"]');
    expect(avatar).toBeInTheDocument();
  });
});
