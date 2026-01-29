// Import calculation functions
import {
  calculateTotalPipeline,
  calculateWeightedForecast,
  calculateStageMetrics,
  calculateWinRate,
} from '../../src/helpers/crm/forecastingCalculations';

describe('Forecasting Calculations', () => {
  const sampleOpportunities = [
    { id: 1, stage: 'qualification', value: 10000, probability: 25 },
    { id: 2, stage: 'proposal', value: 25000, probability: 50 },
    { id: 3, stage: 'negotiation', value: 50000, probability: 75 },
    { id: 4, stage: 'closed_won', value: 30000, probability: 100 },
    { id: 5, stage: 'closed_lost', value: 15000, probability: 0 },
  ];

  describe('calculateTotalPipeline', () => {
    it('should calculate total value of open opportunities', () => {
      const result = calculateTotalPipeline(sampleOpportunities);
      // Should sum only open stages: 10000 + 25000 + 50000 = 85000
      expect(result).toBe(85000);
    });

    it('should exclude closed_won opportunities', () => {
      const opportunities = [
        { id: 1, stage: 'qualification', value: 10000, probability: 25 },
        { id: 2, stage: 'closed_won', value: 30000, probability: 100 },
      ];
      const result = calculateTotalPipeline(opportunities);
      expect(result).toBe(10000);
    });

    it('should exclude closed_lost opportunities', () => {
      const opportunities = [
        { id: 1, stage: 'proposal', value: 25000, probability: 50 },
        { id: 2, stage: 'closed_lost', value: 15000, probability: 0 },
      ];
      const result = calculateTotalPipeline(opportunities);
      expect(result).toBe(25000);
    });

    it('should return 0 for empty array', () => {
      const result = calculateTotalPipeline([]);
      expect(result).toBe(0);
    });

    it('should return 0 when all opportunities are closed', () => {
      const opportunities = [
        { id: 1, stage: 'closed_won', value: 30000, probability: 100 },
        { id: 2, stage: 'closed_lost', value: 15000, probability: 0 },
      ];
      const result = calculateTotalPipeline(opportunities);
      expect(result).toBe(0);
    });
  });

  describe('calculateWeightedForecast', () => {
    it('should calculate weighted forecast using probability', () => {
      const result = calculateWeightedForecast(sampleOpportunities);
      // (10000 * 0.25) + (25000 * 0.50) + (50000 * 0.75) = 2500 + 12500 + 37500 = 52500
      expect(result).toBe(52500);
    });

    it('should exclude closed opportunities', () => {
      const opportunities = [
        { id: 1, stage: 'qualification', value: 10000, probability: 25 },
        { id: 2, stage: 'closed_won', value: 30000, probability: 100 },
        { id: 3, stage: 'closed_lost', value: 15000, probability: 0 },
      ];
      const result = calculateWeightedForecast(opportunities);
      // Only qualification: 10000 * 0.25 = 2500
      expect(result).toBe(2500);
    });

    it('should return 0 for empty array', () => {
      const result = calculateWeightedForecast([]);
      expect(result).toBe(0);
    });

    it('should handle 0 probability correctly', () => {
      const opportunities = [
        { id: 1, stage: 'qualification', value: 10000, probability: 0 },
      ];
      const result = calculateWeightedForecast(opportunities);
      expect(result).toBe(0);
    });

    it('should handle 100 probability correctly', () => {
      const opportunities = [
        { id: 1, stage: 'negotiation', value: 50000, probability: 100 },
      ];
      const result = calculateWeightedForecast(opportunities);
      expect(result).toBe(50000);
    });
  });

  describe('calculateStageMetrics', () => {
    it('should group opportunities by stage with count and value', () => {
      const result = calculateStageMetrics(sampleOpportunities);

      expect(result).toEqual({
        qualification: { count: 1, value: 10000 },
        proposal: { count: 1, value: 25000 },
        negotiation: { count: 1, value: 50000 },
        closed_won: { count: 1, value: 30000 },
        closed_lost: { count: 1, value: 15000 },
      });
    });

    it('should aggregate multiple opportunities in same stage', () => {
      const opportunities = [
        { id: 1, stage: 'qualification', value: 10000, probability: 25 },
        { id: 2, stage: 'qualification', value: 15000, probability: 25 },
        { id: 3, stage: 'proposal', value: 25000, probability: 50 },
      ];
      const result = calculateStageMetrics(opportunities);

      expect(result.qualification).toEqual({ count: 2, value: 25000 });
      expect(result.proposal).toEqual({ count: 1, value: 25000 });
    });

    it('should return empty object for empty array', () => {
      const result = calculateStageMetrics([]);
      expect(result).toEqual({});
    });

    it('should handle single opportunity', () => {
      const opportunities = [
        { id: 1, stage: 'proposal', value: 25000, probability: 50 },
      ];
      const result = calculateStageMetrics(opportunities);

      expect(result).toEqual({
        proposal: { count: 1, value: 25000 },
      });
    });
  });

  describe('calculateWinRate', () => {
    it('should calculate win rate percentage', () => {
      const result = calculateWinRate(sampleOpportunities);
      // 1 won out of 2 closed (won + lost) = 50%
      expect(result).toBe(50);
    });

    it('should return 100 when all closed opportunities are won', () => {
      const opportunities = [
        { id: 1, stage: 'closed_won', value: 30000, probability: 100 },
        { id: 2, stage: 'closed_won', value: 20000, probability: 100 },
      ];
      const result = calculateWinRate(opportunities);
      expect(result).toBe(100);
    });

    it('should return 0 when all closed opportunities are lost', () => {
      const opportunities = [
        { id: 1, stage: 'closed_lost', value: 15000, probability: 0 },
        { id: 2, stage: 'closed_lost', value: 10000, probability: 0 },
      ];
      const result = calculateWinRate(opportunities);
      expect(result).toBe(0);
    });

    it('should return 0 when no closed opportunities exist', () => {
      const opportunities = [
        { id: 1, stage: 'qualification', value: 10000, probability: 25 },
        { id: 2, stage: 'proposal', value: 25000, probability: 50 },
      ];
      const result = calculateWinRate(opportunities);
      expect(result).toBe(0);
    });

    it('should return 0 for empty array', () => {
      const result = calculateWinRate([]);
      expect(result).toBe(0);
    });

    it('should calculate correct percentage with multiple closed deals', () => {
      const opportunities = [
        { id: 1, stage: 'closed_won', value: 30000, probability: 100 },
        { id: 2, stage: 'closed_won', value: 20000, probability: 100 },
        { id: 3, stage: 'closed_lost', value: 15000, probability: 0 },
        { id: 4, stage: 'closed_lost', value: 10000, probability: 0 },
        { id: 5, stage: 'closed_lost', value: 5000, probability: 0 },
      ];
      const result = calculateWinRate(opportunities);
      // 2 won out of 5 closed = 40%
      expect(result).toBe(40);
    });
  });
});
