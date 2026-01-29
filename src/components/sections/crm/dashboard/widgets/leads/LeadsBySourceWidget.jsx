'use client';

import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import { BarChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { useSettingsContext } from 'providers/SettingsProvider';
import { useCRMDashboard } from 'providers/CRMDashboardProvider';
import { useLeadMetrics } from 'services/swr/api-hooks/useDashboardApi';
import ReactEchart from 'components/base/ReactEchart';
import DashboardWidgetContainer from '../../DashboardWidgetContainer';

echarts.use([TooltipComponent, GridComponent, BarChart, CanvasRenderer, LegendComponent]);

/**
 * Leads by Source Widget - Horizontal Bar Chart
 * Shows lead count distribution across different sources
 */
const LeadsBySourceWidget = () => {
  const { vars, typography } = useTheme();
  const { getThemeColor } = useSettingsContext();
  const { dateRange } = useCRMDashboard();
  const { data: leadMetrics, isLoading, error } = useLeadMetrics(dateRange);

  const option = useMemo(() => {
    if (!leadMetrics?.leadsBySource) return {};

    const data = leadMetrics.leadsBySource;

    return {
      grid: { left: 180, right: 40, top: 20, bottom: 20 },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params) => {
          const data = params[0];
          return `
            <div style="margin-left: 8px;">
              <p style="margin: 0 0 4px 0; font-weight: 600;">${data.name}</p>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 8px; height: 8px; background: ${data.color}; border-radius: 50%;"></span>
                <span>${data.value} leads</span>
              </div>
            </div>
          `;
        },
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          color: getThemeColor(vars.palette.text.disabled),
          fontFamily: typography.fontFamily,
        },
        splitLine: {
          lineStyle: {
            color: getThemeColor(vars.palette.chGrey[200]),
          },
        },
      },
      yAxis: {
        type: 'category',
        data: data.map((item) => item.source),
        axisLabel: {
          color: getThemeColor(vars.palette.text.primary),
          fontFamily: typography.fontFamily,
          fontSize: 13,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
      },
      series: [
        {
          name: 'Leads',
          type: 'bar',
          barWidth: 24,
          data: data.map((item) => ({
            value: item.count,
            itemStyle: {
              borderRadius: [0, 8, 8, 0],
              color: getThemeColor(vars.palette[item.color.split('.')[0]]?.[item.color.split('.')[1]] || vars.palette.primary.main),
            },
          })),
        },
      ],
    };
  }, [leadMetrics, vars.palette, getThemeColor, typography.fontFamily]);

  return (
    <DashboardWidgetContainer
      title="Leads by Source"
      subtitle="Distribution across acquisition channels"
      loading={isLoading}
      error={error}
      minHeight={300}
    >
      <ReactEchart
        echarts={echarts}
        option={option}
        sx={{ height: '100%', minHeight: { xs: 250, md: 300 }, width: 1 }}
      />
    </DashboardWidgetContainer>
  );
};

export default LeadsBySourceWidget;
