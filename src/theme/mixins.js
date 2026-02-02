const mixins = {
  ecommerceTopbar: {
    xs: 188,
    sm: 190,
    md: 162,
  },
  topbar: {
    default: {
      xs: 64,
      md: 82,
    },
    slim: {
      xs: 38,
    },
    stacked: {
      xs: 129,
      md: 103,
    },
  },
  footer: { xs: 72, sm: 56 },
  gantt: {
    headerRowHeight: 28,
    tableBodyCellWidth: {
      xs: 90,
      sm: 130,
    },
    ticketTaskHeight: 44,
    avatarSize: 26,
    tableHeaderPadding: 16,
  },
  topOffset: (topbarHeight, offset, important = false) =>
    topbarHeight
      ? Object.entries(topbarHeight).reduce((acc, [key, value]) => {
          acc[key] = `${value + offset}px${important ? ' !important' : ''}`;

          return acc;
        }, {})
      : {},

  contentHeight: (topbarHeight, offset = 0, important = false) =>
    topbarHeight
      ? Object.entries(topbarHeight).reduce((acc, [key, value]) => {
          acc[key] = `calc(100vh - ${value + offset}px)${important ? ' !important' : ''}`;

          return acc;
        }, {})
      : {},
};

export default mixins;
