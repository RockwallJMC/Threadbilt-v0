/**
 * Unit tests for DashboardWidgetContainer error handling
 *
 * RED phase: Test for Error object rendering bug
 */

import { render, screen } from '@testing-library/react';
import DashboardWidgetContainer from '../DashboardWidgetContainer';

describe('DashboardWidgetContainer error handling', () => {
  test('renders error message from Error object', () => {
    const errorObj = new Error('Database connection failed');

    render(
      <DashboardWidgetContainer
        title="Test Widget"
        error={errorObj}
      >
        <div>Content</div>
      </DashboardWidgetContainer>
    );

    // Should display the error message, not try to render Error object
    expect(screen.getByText('Database connection failed')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  test('renders error message from Error object with empty message', () => {
    const errorObj = new Error('');

    render(
      <DashboardWidgetContainer
        title="Test Widget"
        error={errorObj}
      >
        <div>Content</div>
      </DashboardWidgetContainer>
    );

    // Should display a fallback message, not crash
    expect(screen.getByText(/error/i)).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  test('renders error message from string', () => {
    render(
      <DashboardWidgetContainer
        title="Test Widget"
        error="String error message"
      >
        <div>Content</div>
      </DashboardWidgetContainer>
    );

    expect(screen.getByText('String error message')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  test('renders content when no error', () => {
    render(
      <DashboardWidgetContainer
        title="Test Widget"
        error={null}
      >
        <div>Content</div>
      </DashboardWidgetContainer>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('does not render content when error exists', () => {
    render(
      <DashboardWidgetContainer
        title="Test Widget"
        error={new Error('Test error')}
      >
        <div>Should not appear</div>
      </DashboardWidgetContainer>
    );

    expect(screen.queryByText('Should not appear')).not.toBeInTheDocument();
  });
});
