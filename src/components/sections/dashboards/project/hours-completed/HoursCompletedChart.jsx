import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import dayjs from 'dayjs';
import { LineChart } from 'echarts/charts';
import { GridComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { tooltipFormatterList } from 'helpers/echart-utils';
import { getPastDates } from 'lib/utils';
import { useSettingsContext } from 'providers/SettingsProvider';
import ReactEchart from 'components/base/ReactEchart';

echarts.use([GridComponent, CanvasRenderer, LineChart]);

const seriesColors = ['primary.main', 'warning.main', 'chBlue.200', 'success.main', 'error.main'];

const getColorValue = (vars, colorPath) => {
  const parts = colorPath.split('.');
  let value = vars.palette;
  for (const part of parts) {
    value = value?.[part];
  }
  return value;
};

const HoursCompletedChart = ({ sx, data, ref }) => {
  const { vars } = useTheme();
  const { getThemeColor } = useSettingsContext();

  const getOptions = useMemo(() => {
    const entries = Object.entries(data || {});
    const series = entries.map(([name, hours], index) => ({
      name,
      type: 'line',
      data: hours || [],
      zlevel: index + 1,
      lineStyle: {
        color: getThemeColor(getColorValue(vars, seriesColors[index % seriesColors.length])),
        width: index === 0 ? 2 : 1,
      },
      itemStyle: {
        color: getThemeColor(getColorValue(vars, seriesColors[index % seriesColors.length])),
      },
      showSymbol: false,
    }));

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          z: 1,
          lineStyle: {
            color: getThemeColor(vars.palette.chGrey[300]),
            type: 'solid',
          },
        },
        formatter: (params) => tooltipFormatterList(params),
      },
      xAxis: {
        data: getPastDates(9).map((date) => {
          return dayjs(date).format('MMM DD');
        }),
        boundaryGap: false,
        axisLine: {
          show: false,
        },
        axisLabel: {
          show: true,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: getThemeColor(vars.palette.divider),
          },
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false,
        },
        axisLabel: {
          show: true,
          align: 'left',
          margin: 30,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: getThemeColor(vars.palette.divider),
          },
        },
      },
      series,
      grid: {
        left: 30,
        right: 20,
        top: 6,
        bottom: 22,
        outerBoundsMode: 'none',
      },
    };
  }, [data, vars.palette, getThemeColor]);

  return <ReactEchart ref={ref} echarts={echarts} option={getOptions} sx={sx} />;
};

export default HoursCompletedChart;
