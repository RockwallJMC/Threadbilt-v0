'use client';

import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import { LineChart } from 'echarts/charts';
import {
  LegendComponent,
  TooltipComponent,
  GridComponent,
  MarkPointComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { useSettingsContext } from 'providers/SettingsProvider';
import ReactEchart from 'components/base/ReactEchart';
import DashboardWidgetContainer from '../../DashboardWidgetContainer';
import { dashboardPipelineMetrics } from 'data/crm/dashboard-metrics';

echarts.use([
  LegendComponent,
  TooltipComponent,
  GridComponent,
  MarkPointComponent,
  LineChart,
  CanvasRenderer,
]);

/**
 * Conversion Rate by Stage Widget
 * Displays line chart showing conversion rates between pipeline stages
 * Phase 1.7.3: Pipeline Visualization Widgets
 */
const ConversionRateByStageWidget = ({ data = dashboardPipelineMetrics, loading, error }) => {
  const { vars, typography } = useTheme();
  const { getThemeColor } = useSettingsContext();

  const conversionRates = data?.conversionRates || [];

  const option = useMemo(
    () => ({
      grid: { left: 80, right: 20, top: 40, bottom: 90 },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const dataItem = params[0];
          return `
            <div style="margin-left: 8px;">
              <p style="margin: 0 0 4px 0; font-weight: 600;">${dataItem.name}</p>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 8px; height: 8px; background: ${dataItem.color}; border-radius: 50%;"></span>
                <span>${dataItem.value}%</span>
              </div>
            </div>
          `;
        },
      },
      xAxis: {
        type: 'category',
        data: conversionRates.map((item) => item.stage),
        axisLabel: {
          rotate: 45,
          margin: 20,
          fontSize: 11,
          color: getThemeColor(vars.palette.text.disabled),
          fontFamily: typography.fontFamily,
          formatter: (value) => {
            // Shorten long stage names for better display
            return value.replace(' → ', '\n→ ');
          },
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: getThemeColor(vars.palette.text.disabled),
          formatter: (value) => `${value}%`,
        },
        splitLine: {
          lineStyle: {
            color: getThemeColor(vars.palette.chGrey?.[200] || vars.palette.divider),
          },
        },
        min: 0,
        max: 100,
      },
      series: [
        {
          name: 'Conversion Rate',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: getThemeColor(vars.palette.success?.main || '#4caf50'),
          },
          itemStyle: {
            color: getThemeColor(vars.palette.success?.main || '#4caf50'),
            borderWidth: 2,
            borderColor: '#fff',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: getThemeColor(vars.palette.success?.light || 'rgba(76, 175, 80, 0.3)'),
                },
                {
                  offset: 1,
                  color: getThemeColor(vars.palette.success?.lighter || 'rgba(76, 175, 80, 0.05)'),
                },
              ],
            },
          },
          data: conversionRates.map((item) => item.rate),
        },
      ],
    }),
    [vars.palette, getThemeColor, conversionRates, typography.fontFamily]
  );

  return (
    <DashboardWidgetContainer
      title="Conversion Rate by Stage"
      subtitle="Stage-to-stage conversion performance"
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

export default ConversionRateByStageWidget;
