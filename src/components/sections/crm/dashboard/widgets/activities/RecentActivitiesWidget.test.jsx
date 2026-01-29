import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecentActivitiesWidget from './RecentActivitiesWidget';

describe('RecentActivitiesWidget', () => {
  const mockActivities = [
    {
      id: 'act-001',
      type: 'opportunity_won',
      title: 'Enterprise Software Deal - Acme Corp',
      value: 285000,
      user: 'Sarah Johnson',
      timestamp: '2026-01-29T14:30:00Z',
      icon: 'material-symbols:check-circle',
      color: 'success.main',
    },
    {
      id: 'act-002',
      type: 'proposal_sent',
      title: 'Cloud Migration Proposal - TechStart Inc',
      value: 165000,
      user: 'Michael Chen',
      timestamp: '2026-01-29T11:15:00Z',
      icon: 'material-symbols:send',
      color: 'primary.main',
    },
  ];

  test('renders widget with title and activities', () => {
    render(<RecentActivitiesWidget activities={mockActivities} />);

    expect(screen.getByText('Recent Activities')).toBeInTheDocument();
    expect(screen.getByText('Enterprise Software Deal - Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Cloud Migration Proposal - TechStart Inc')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    render(<RecentActivitiesWidget loading={true} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('shows error state', () => {
    const errorMessage = 'Failed to load activities';
    render(<RecentActivitiesWidget error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('displays user names for activities', () => {
    render(<RecentActivitiesWidget activities={mockActivities} />);

    expect(screen.getByText(/Sarah Johnson/)).toBeInTheDocument();
    expect(screen.getByText(/Michael Chen/)).toBeInTheDocument();
  });
});
