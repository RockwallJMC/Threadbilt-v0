'use client';

/**
 * Test Harness for EditableCurrencyInput Component
 *
 * Simple page to test EditableCurrencyInput in isolation.
 * Supports query param ?value=null to test null state.
 */

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import EditableCurrencyInput from 'components/sections/crm/deal-details/deal-information/EditableCurrencyInput';

function TestHarnessContent() {
  const searchParams = useSearchParams();
  const initialValueParam = searchParams.get('value');

  const [budgetValue, setBudgetValue] = useState(() => {
    if (initialValueParam === 'null') return null;
    if (initialValueParam) return parseFloat(initialValueParam);
    return 12500; // Default test value
  });

  const handleSave = async (newValue) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    setBudgetValue(newValue);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper background={1} sx={{ p: { xs: 3, md: 5 } }}>
        <Stack spacing={3}>
          <Typography variant="h5">EditableCurrencyInput Test Harness</Typography>

          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Budget Forecast
            </Typography>
            <EditableCurrencyInput
              value={budgetValue}
              onSave={handleSave}
              label="Budget Forecast"
            />
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Current value: {budgetValue !== null ? `$${budgetValue}` : 'null'}
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}

export default function EditableCurrencyInputTestHarness() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestHarnessContent />
    </Suspense>
  );
}
