'use client';

import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import { PieChart } from 'echarts/charts';
import { LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { useSettingsContext } from 'providers/SettingsProvider';
import ReactEchart from 'components/base/ReactEchart';
import useNumberFormat from 'hooks/useNumberFormat';
import DashboardWidgetContainer from '../../DashboardWidgetContainer';
import { dashboardPipelineMetrics } from 'data/crm/dashboard-metrics';

echarts.use([LegendComponent, TooltipComponent, PieChart, CanvasRenderer]);

/**
 * Win/Loss Analysis Widget
 * Displays pie chart showing distribution of won vs lost opportunities
 * Phase 1.7.3: Pipeline Visualization Widgets
 */
const WinLossAnalysisWidget = ({ data = dashboardPipelineMetrics, loading, error }) => {
  const { vars, typography } = useTheme();
  const { getThemeColor } = useSettingsContext();
  const { currencyFormat, numberFormat } = useNumberFormat();

  const winLossAnalysis = data?.winLossAnalysis || { won: {}, lost: {} };
  const { won = {}, lost = {} } = winLossAnalysis;

  const chartData = useMemo(
    () => [
      {
        name: 'Won',
        value: won.count || 0,
        percentage: won.percentage || 0,
        totalValue: won.value || 0,
        itemStyle: {
          color: getThemeColor(vars.palette.success?.main || '#4caf50'),
        },
      },
      {
        name: 'Lost',
        value: lost.count || 0,
        percentage: lost.percentage || 0,
        totalValue: lost.value || 0,
        itemStyle: {
          color: getThemeColor(vars.palette.error?.main || '#f44336'),
        },
      },
    ],
    [won, lost, vars.palette, getThemeColor]
  );

  const option = useMemo(
    () => ({
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          const { name, value, data } = params;
          return `
            <div style="margin-left: 8px;">
              <p style="margin: 0 0 8px 0; font-weight: 600;">${name} Opportunities</p>
              <div style="margin-bottom: 4px;">
                <span style="color: ${getThemeColor(vars.palette.text.secondary)};">Count:</span>
                <span style="font-weight: 500; margin-left: 8px;">${numberFormat(value)}</span>
              </div>
              <div style="margin-bottom: 4px;">
                <span style="color: ${getThemeColor(vars.palette.text.secondary)};">Value:</span>
                <span style="font-weight: 500; margin-left: 8px;">${currencyFormat(data.totalValue)}</span>
              </div>
              <div>
                <span style="color: ${getThemeColor(vars.palette.text.secondary)};">Percentage:</span>
                <span style="font-weight: 500; margin-left: 8px;">${data.percentage.toFixed(1)}%</span>
              </div>
            </div>
          `;
        },
      },
      legend: {
        orient: 'horizontal',
        bottom: 10,
        left: 'center',
        textStyle: {
          color: getThemeColor(vars.palette.text.primary),
          fontFamily: typography.fontFamily,
        },
      },
      series: [
        {
          name: 'Win/Loss',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
          label: {
            show: true,
            position: 'outside',
            formatter: (params) => {
              return `{b|${params.name}}\n{per|${params.data.percentage.toFixed(1)}%}`;
            },
            rich: {
              b: {
                fontSize: 14,
                fontWeight: 600,
                color: getThemeColor(vars.palette.text.primary),
                fontFamily: typography.fontFamily,
                lineHeight: 22,
              },
              per: {
                fontSize: 12,
                color: getThemeColor(vars.palette.text.secondary),
                fontFamily: typography.fontFamily,
              },
            },
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 10,
          },
          data: chartData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    }),
    [chartData, vars.palette, getThemeColor, typography.fontFamily, currencyFormat, numberFormat]
  );

  return (
    <DashboardWidgetContainer
      title="Win/Loss Analysis"
      subtitle="Closed opportunity outcomes"
      loading={loading}
      error={error}
      minHeight={400}
    >
      <ReactEchart
        echarts={echarts}
        option={option}
        sx={{ height: '100%', minHeight: { xs: 200, md: 350 }, width: 1 }}
      />
    </DashboardWidgetContainer>
  );
};

export default WinLossAnalysisWidget;
