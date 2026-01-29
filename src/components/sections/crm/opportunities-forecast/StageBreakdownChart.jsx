'use client';

import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import { BarChart } from 'echarts/charts';
import { LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { useSettingsContext } from 'providers/SettingsProvider';
import ReactEchart from 'components/base/ReactEchart';
import useNumberFormat from 'hooks/useNumberFormat';
import { calculateStageMetrics } from 'helpers/crm/forecastingCalculations';

echarts.use([LegendComponent, TooltipComponent, BarChart, CanvasRenderer]);

// Stage display configuration
const STAGE_CONFIG = {
  qualification: { label: 'Qualification', color: 'info' },
  proposal: { label: 'Proposal', color: 'primary' },
  negotiation: { label: 'Negotiation', color: 'warning' },
  closed_won: { label: 'Closed Won', color: 'success' },
  closed_lost: { label: 'Closed Lost', color: 'error' },
};

const StageBreakdownChart = ({ opportunities = [], sx }) => {
  const { vars, typography } = useTheme();
  const { getThemeColor } = useSettingsContext();
  const { currencyFormat } = useNumberFormat();

  const stageMetrics = useMemo(() => {
    const metrics = calculateStageMetrics(opportunities);

    // Convert to array and sort by stage order
    const stageOrder = ['qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

    return stageOrder
      .map((stage) => ({
        stage,
        label: STAGE_CONFIG[stage]?.label || stage,
        color: STAGE_CONFIG[stage]?.color || 'primary',
        count: metrics[stage]?.count || 0,
        value: metrics[stage]?.value || 0,
      }))
      .filter((item) => item.count > 0); // Only show stages with opportunities
  }, [opportunities]);

  const option = useMemo(
    () => ({
      grid: { left: 60, right: 20, top: 30, bottom: 70 },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params) => {
          const data = params[0];
          const stageData = stageMetrics[data.dataIndex];
          return `
            <div style="margin-left: 8px;">
              <p style="margin: 0 0 4px 0; font-weight: 600;">${data.name}</p>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 8px; height: 8px; background: ${data.color}; border-radius: 50%;"></span>
                <span>${currencyFormat(data.value)}</span>
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
        data: stageMetrics.map((item) => item.label),
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
            color: getThemeColor(vars.palette.chGrey[200]),
          },
        },
      },
      series: [
        {
          name: 'Pipeline Value',
          type: 'bar',
          barWidth: 40,
          data: stageMetrics.map((item, index) => ({
            value: item.value,
            itemStyle: {
              borderRadius: [8, 8, 0, 0],
              color: getThemeColor(vars.palette[item.color]?.main || vars.palette.primary.main),
            },
          })),
        },
      ],
    }),
    [vars.palette, getThemeColor, stageMetrics, currencyFormat, typography.fontFamily]
  );

  return (
    <ReactEchart
      echarts={echarts}
      option={option}
      sx={{ height: '100%', minHeight: { xs: 300, md: 400 }, width: 1, ...sx }}
    />
  );
};

export default StageBreakdownChart;
