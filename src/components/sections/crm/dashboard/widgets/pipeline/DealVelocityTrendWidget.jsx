'use client';

import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import { LineChart } from 'echarts/charts';
import { LegendComponent, TooltipComponent, GridComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { useSettingsContext } from 'providers/SettingsProvider';
import ReactEchart from 'components/base/ReactEchart';
import DashboardWidgetContainer from '../../DashboardWidgetContainer';
import { dashboardPipelineMetrics } from 'data/crm/dashboard-metrics';

echarts.use([LegendComponent, TooltipComponent, GridComponent, LineChart, CanvasRenderer]);

/**
 * Deal Velocity Trend Widget
 * Displays area chart showing average days spent in each pipeline stage
 * Phase 1.7.3: Pipeline Visualization Widgets
 */
const DealVelocityTrendWidget = ({ data = dashboardPipelineMetrics, loading, error }) => {
  const { vars, typography } = useTheme();
  const { getThemeColor } = useSettingsContext();

  const velocityTrend = data?.velocityTrend || [];

  const option = useMemo(
    () => ({
      grid: { left: 60, right: 20, top: 40, bottom: 70 },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const dataItem = params[0];
          const plural = dataItem.value === 1 ? 'day' : 'days';
          return `
            <div style="margin-left: 8px;">
              <p style="margin: 0 0 4px 0; font-weight: 600;">${dataItem.name}</p>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 8px; height: 8px; background: ${dataItem.color}; border-radius: 50%;"></span>
                <span>${dataItem.value} ${plural}</span>
              </div>
            </div>
          `;
        },
      },
      xAxis: {
        type: 'category',
        data: velocityTrend.map((item) => item.stage),
        axisLabel: {
          rotate: 30,
          margin: 20,
          fontSize: 12,
          color: getThemeColor(vars.palette.text.disabled),
          fontFamily: typography.fontFamily,
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
          formatter: (value) => `${value}d`,
        },
        splitLine: {
          lineStyle: {
            color: getThemeColor(vars.palette.chGrey?.[200] || vars.palette.divider),
          },
        },
        min: 0,
      },
      series: [
        {
          name: 'Average Days',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: getThemeColor(vars.palette.warning?.main || '#ff9800'),
          },
          itemStyle: {
            color: getThemeColor(vars.palette.warning?.main || '#ff9800'),
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
                  color: getThemeColor(vars.palette.warning?.light || 'rgba(255, 152, 0, 0.3)'),
                },
                {
                  offset: 1,
                  color: getThemeColor(
                    vars.palette.warning?.lighter || 'rgba(255, 152, 0, 0.05)'
                  ),
                },
              ],
            },
          },
          data: velocityTrend.map((item) => item.avgDays),
        },
      ],
    }),
    [vars.palette, getThemeColor, velocityTrend, typography.fontFamily]
  );

  return (
    <DashboardWidgetContainer
      title="Deal Velocity by Stage"
      subtitle="Average days in each pipeline stage"
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

export default DealVelocityTrendWidget;
