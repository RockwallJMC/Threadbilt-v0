/**
 * Calculate total pipeline value (sum of all open opportunities)
 * Excludes closed_won and closed_lost stages
 *
 * @param {Array} opportunities - Array of opportunity objects
 * @returns {number} Total pipeline value
 */
export function calculateTotalPipeline(opportunities) {
  return opportunities
    .filter((opp) => !['closed_won', 'closed_lost'].includes(opp.stage))
    .reduce((sum, opp) => sum + (opp.value || opp.amount || 0), 0);
}

/**
 * Calculate weighted forecast (sum of value * probability for open opportunities)
 * Excludes closed_won and closed_lost stages
 *
 * @param {Array} opportunities - Array of opportunity objects with value and probability
 * @returns {number} Weighted forecast value
 */
export function calculateWeightedForecast(opportunities) {
  return opportunities
    .filter((opp) => !['closed_won', 'closed_lost'].includes(opp.stage))
    .reduce((sum, opp) => sum + (opp.value || opp.amount || 0) * ((opp.probability || 0) / 100), 0);
}

/**
 * Calculate metrics grouped by stage
 * Returns count and total value for each stage
 *
 * @param {Array} opportunities - Array of opportunity objects
 * @returns {Object} Object with stage keys containing {count, value}
 */
export function calculateStageMetrics(opportunities) {
  const metrics = {};

  opportunities.forEach((opp) => {
    if (!metrics[opp.stage]) {
      metrics[opp.stage] = { count: 0, value: 0 };
    }
    metrics[opp.stage].count++;
    metrics[opp.stage].value += opp.value || opp.amount || 0;
  });

  return metrics;
}

/**
 * Calculate win rate percentage
 * Returns percentage of closed_won out of all closed opportunities
 *
 * @param {Array} opportunities - Array of opportunity objects
 * @returns {number} Win rate as percentage (0-100)
 */
export function calculateWinRate(opportunities) {
  const closed = opportunities.filter((opp) =>
    ['closed_won', 'closed_lost'].includes(opp.stage)
  );

  if (closed.length === 0) {
    return 0;
  }

  const won = closed.filter((opp) => opp.stage === 'closed_won');
  return (won.length / closed.length) * 100;
}
