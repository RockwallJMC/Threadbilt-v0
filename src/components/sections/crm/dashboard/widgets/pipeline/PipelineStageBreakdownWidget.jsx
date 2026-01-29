'use client';

import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import { BarChart } from 'echarts/charts';
import { LegendComponent, TooltipComponent, GridComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { useSettingsContext } from 'providers/SettingsProvider';
import ReactEchart from 'components/base/ReactEchart';
import useNumberFormat from 'hooks/useNumberFormat';
import DashboardWidgetContainer from '../../DashboardWidgetContainer';
import { dashboardPipelineMetrics } from 'data/crm/dashboard-metrics';

echarts.use([LegendComponent, TooltipComponent, GridComponent, BarChart, CanvasRenderer]);

/**
 * Pipeline Stage Breakdown Widget
 * Displays vertical bar chart showing pipeline value per stage
 * Phase 1.7.3: Pipeline Visualization Widgets
 */
const PipelineStageBreakdownWidget = ({ data = dashboardPipelineMetrics, loading, error }) => {
  const { vars, typography } = useTheme();
  const { getThemeColor } = useSettingsContext();
  const { currencyFormat } = useNumberFormat();

  const stageBreakdown = data?.stageBreakdown || [];

  const option = useMemo(
    () => ({
      grid: { left: 60, right: 20, top: 30, bottom: 70 },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params) => {
          const dataItem = params[0];
          const stageData = stageBreakdown[dataItem.dataIndex];
          return `
            <div style="margin-left: 8px;">
              <p style="margin: 0 0 4px 0; font-weight: 600;">${dataItem.name}</p>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 8px; height: 8px; background: ${dataItem.color}; border-radius: 50%;"></span>
                <span>${currencyFormat(dataItem.value)}</span>
              </div>
              <div style="margin-top: 4px; font-size: 12px; color: ${getThemeColor(
                vars.palette.text.secondary
              )};">
                ${stageData?.count || 0} opportunities
              </div>
            </div>
          `;
        },
      },
      xAxis: {
        type: 'category',
        data: stageBreakdown.map((item) => item.stage),
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
          formatter: (value) => {
            if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
            return `$${value}`;
          },
        },
        splitLine: {
          lineStyle: {
            color: getThemeColor(vars.palette.chGrey?.[200] || vars.palette.divider),
          },
        },
      },
      series: [
        {
          name: 'Pipeline Value',
          type: 'bar',
          barWidth: 40,
          data: stageBreakdown.map((item) => ({
            value: item.value,
            itemStyle: {
              borderRadius: [8, 8, 0, 0],
              color: getThemeColor(vars.palette.primary?.main || '#1976d2'),
            },
          })),
        },
      ],
    }),
    [vars.palette, getThemeColor, stageBreakdown, currencyFormat, typography.fontFamily]
  );

  return (
    <DashboardWidgetContainer
      title="Pipeline by Stage"
      subtitle="Value distribution across pipeline stages"
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

export default PipelineStageBreakdownWidget;
