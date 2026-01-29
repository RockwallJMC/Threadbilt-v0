'use client';

import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import { LineChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { useSettingsContext } from 'providers/SettingsProvider';
import { useCRMDashboard } from 'providers/CRMDashboardProvider';
import { useLeadMetrics } from 'services/swr/api-hooks/useDashboardApi';
import ReactEchart from 'components/base/ReactEchart';
import DashboardWidgetContainer from '../../DashboardWidgetContainer';

echarts.use([TooltipComponent, GridComponent, LineChart, CanvasRenderer, LegendComponent]);

/**
 * Lead Engagement Trend Widget - Line Chart
 * Shows lead engagement metrics over time (email opens, link clicks, form submits)
 */
const LeadEngagementTrendWidget = () => {
  const { vars, typography } = useTheme();
  const { getThemeColor } = useSettingsContext();
  const { dateRange } = useCRMDashboard();
  const { data: leadMetrics, isLoading, error } = useLeadMetrics(dateRange);

  const option = useMemo(() => {
    if (!leadMetrics?.engagementTrend) return {};

    const data = leadMetrics.engagementTrend;

    return {
      grid: { left: 60, right: 40, top: 50, bottom: 60 },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      legend: {
        data: ['Email Opens', 'Link Clicks', 'Form Submits'],
        top: 10,
        textStyle: {
          color: getThemeColor(vars.palette.text.primary),
          fontFamily: typography.fontFamily,
        },
      },
      xAxis: {
        type: 'category',
        data: data.map((item) => {
          const date = new Date(item.date);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        }),
        axisLabel: {
          color: getThemeColor(vars.palette.text.disabled),
          fontFamily: typography.fontFamily,
          rotate: 30,
          margin: 20,
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
          fontFamily: typography.fontFamily,
        },
        splitLine: {
          lineStyle: {
            color: getThemeColor(vars.palette.chGrey[200]),
          },
        },
      },
      series: [
        {
          name: 'Email Opens',
          type: 'line',
          data: data.map((item) => item.emailOpens),
          smooth: true,
          lineStyle: {
            width: 2,
            color: getThemeColor(vars.palette.primary.main),
          },
          itemStyle: {
            color: getThemeColor(vars.palette.primary.main),
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
                  color: getThemeColor(vars.palette.primary.main) + '30',
                },
                {
                  offset: 1,
                  color: getThemeColor(vars.palette.primary.main) + '05',
                },
              ],
            },
          },
        },
        {
          name: 'Link Clicks',
          type: 'line',
          data: data.map((item) => item.linkClicks),
          smooth: true,
          lineStyle: {
            width: 2,
            color: getThemeColor(vars.palette.success.main),
          },
          itemStyle: {
            color: getThemeColor(vars.palette.success.main),
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
                  color: getThemeColor(vars.palette.success.main) + '30',
                },
                {
                  offset: 1,
                  color: getThemeColor(vars.palette.success.main) + '05',
                },
              ],
            },
          },
        },
        {
          name: 'Form Submits',
          type: 'line',
          data: data.map((item) => item.formSubmits),
          smooth: true,
          lineStyle: {
            width: 2,
            color: getThemeColor(vars.palette.warning.main),
          },
          itemStyle: {
            color: getThemeColor(vars.palette.warning.main),
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
                  color: getThemeColor(vars.palette.warning.main) + '30',
                },
                {
                  offset: 1,
                  color: getThemeColor(vars.palette.warning.main) + '05',
                },
              ],
            },
          },
        },
      ],
    };
  }, [leadMetrics, vars.palette, getThemeColor, typography.fontFamily]);

  return (
    <DashboardWidgetContainer
      title="Lead Engagement Trend"
      subtitle="Email opens, clicks, and form submissions"
      loading={isLoading}
      error={error}
      minHeight={350}
    >
      <ReactEchart
        echarts={echarts}
        option={option}
        sx={{ height: '100%', minHeight: { xs: 300, md: 350 }, width: 1 }}
      />
    </DashboardWidgetContainer>
  );
};

export default LeadEngagementTrendWidget;
