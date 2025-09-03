export const listTableOptions = {
  columns: [
    {
      field: 'group',
      title: 'department',
      width: 'auto',
      tree: true,
      fieldFormat(rec: any) {
        return rec['department'] ?? rec['group'] ?? rec['name'];
      },
    },
    {
      field: 'total_children',
      title: 'memebers count',
      width: 'auto',
      fieldFormat(rec: any) {
        if (rec?.['position']) {
          return `position:  ${rec['position']}`;
        } else return rec?.['total_children'];
      },
    },
    {
      field: 'monthly_expense',
      title: 'monthly expense',
      width: 'auto',
      fieldFormat(rec: any) {
        if (rec?.['salary']) {
          return `salary:  ${rec['salary']}`;
        } else return rec?.['monthly_expense'];
      },
    },
    {
      field: 'new_hires_this_month',
      title: 'new hires this month',
      width: 'auto',
    },
    {
      field: 'resignations_this_month',
      title: 'resignations this month',
      width: 'auto',
    },
    {
      field: 'complaints_and_suggestions',
      title: 'recived complaints counts',
      width: 'auto',
    },
  ],
  widthMode: 'standard',
};

export const listTableOptions0 = `(VTable, _VChart) => ({
  columns: [
    {
      field: 'group',
      title: 'department',
      width: 'auto',
      tree: true,
      fieldFormat(rec) {
        return rec['department'] ?? rec['group'] ?? rec['name'];
      },
    },
    {
      field: 'total_children',
      title: 'memebers count',
      width: 'auto',
      fieldFormat(rec) {
        if (rec?.['position']) {
          return 'position: ' + rec['position'];
        } else return rec?.['total_children'];
      },
    },
    {
      field: 'monthly_expense',
      title: 'monthly expense',
      width: 'auto',
      fieldFormat(rec) {
        if (rec?.['salary']) {
          return 'salary: ' + rec['salary'];
        } else return rec?.['monthly_expense'];
      },
    },
    {
      field: 'new_hires_this_month',
      title: 'new hires this month',
      width: 'auto',
    },
    {
      field: 'resignations_this_month',
      title: 'resignations this month',
      width: 'auto',
    },
    {
      field: 'complaints_and_suggestions',
      title: 'recived complaints counts',
      width: 'auto',
    },
  ],
  widthMode: 'standard',
  theme: VTable.themes.DEFAUL,
})`;

export const pivotChartOptions = {
  hideIndicatorName: true,
  rows: [
    {
      dimensionKey: 'Order Year',
      title: 'Order Year',
      headerStyle: {
        textStick: true,
      },
    },
    'Ship Mode',
  ],
  columns: [
    {
      dimensionKey: 'Region',
      title: 'Region',
      headerStyle: {
        textStick: true,
      },
    },
    'Category',
  ],
  indicators: [
    {
      indicatorKey: 'Quantity',
      title: 'Quantity',
      cellType: 'chart',
      chartModule: 'vchart',
      chartSpec: {
        // type: 'common',
        stack: true,
        type: 'pie',
        data: {
          id: 'data',
          fields: {
            'Segment-Indicator': {
              sortIndex: 1,
              domain: [
                'Consumer-Quantity',
                'Corporate-Quantity',
                'Home Office-Quantity',
              ],
            },
          },
        },
        categoryField: 'Segment-Indicator',
        valueField: 'Quantity',
        scales: [
          {
            id: 'color',
            type: 'ordinal',
            domain: [
              'Consumer-Quantity',
              'Corporate-Quantity',
              'Home Office-Quantity',
            ],
            range: ['#2E62F1', '#4DC36A', '#FF8406'],
          },
        ],
      },
      style: {
        padding: 1,
      },
    },
  ],
  defaultRowHeight: 200,
  defaultHeaderRowHeight: 50,
  defaultColWidth: 280,
  defaultHeaderColWidth: 100,
  indicatorTitle: '指标',
  autoWrapText: true,
  widthMode: 'adaptive',
  heightMode: 'adaptive',
  corner: {
    titleOnDimension: 'row',
    headerStyle: {
      autoWrapText: true,
    },
  },
  legends: {
    orient: 'bottom',
    type: 'discrete',
    data: [
      {
        label: 'Consumer-Quantity',
        shape: {
          fill: '#2E62F1',
          symbolType: 'circle',
        },
      },
      {
        label: 'Corporate-Quantity',
        shape: {
          fill: '#4DC36A',
          symbolType: 'square',
        },
      },
      {
        label: 'Home Office-Quantity',
        shape: {
          fill: '#FF8406',
          symbolType: 'square',
        },
      },
    ],
  },
};

export const pivotTableOptions = {
  rows: [
    {
      dimensionKey: 'City',
      title: 'City',
      headerStyle: {
        textStick: true,
      },
    },
  ],
  columns: [
    {
      dimensionKey: 'Category',
      title: 'Category',
      headerStyle: {
        textStick: true,
      },
    },
  ],
  indicators: [
    {
      indicatorKey: 'Quantity',
      title: 'Quantity',
      width: 'auto',
      showSort: false,
      headerStyle: {
        fontWeight: 'normal',
        color: 'purple',
      },
      style: {
        padding: [16, 28, 16, 28],
        color(args: any) {
          if (args.dataValue >= 0) return 'black';
          return 'red';
        },
      },
    },
    {
      indicatorKey: 'Sales',
      title: 'Sales',
      width: 'auto',
      showSort: false,
      headerStyle: {
        fontWeight: 'normal',
        color: 'red',
      },
      format: (rec: any) => {
        return '$' + Number(rec).toFixed(2);
      },
      style: {
        padding: [16, 28, 16, 28],
        color(args: any) {
          if (args.dataValue >= 0) return 'black';
          return 'red';
        },
      },
    },
    {
      indicatorKey: 'Profit',
      title: 'Profit',
      width: 'auto',
      showSort: false,
      headerStyle: {
        fontWeight: 'normal',
        color: 'green',
      },
      format: (rec: any) => {
        return '$' + Number(rec).toFixed(2);
      },
      style: {
        padding: [16, 28, 16, 28],
        color(args: any) {
          if (args.dataValue >= 0) return 'black';
          return 'red';
        },
      },
    },
  ],
  corner: {
    titleOnDimension: 'row',
    headerStyle: {
      autoWrapText: true,
    },
  },
  indicatorTitle: 'indicators title',
  indicatorsAsCol: false,
  dataConfig: {
    sortRules: [
      {
        sortField: 'Category',
        sortBy: ['Office Supplies', 'Technology', 'Furniture'],
      },
    ],
  },
  defaultHeaderColWidth: [120, 'auto'],
  widthMode: 'standard',
};
