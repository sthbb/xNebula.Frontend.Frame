import { theme } from '@@/store';

export const mockData = {
  selectList: [
    { label: 'theme.optionA', value: 1 },
    { label: 'theme.optionB', value: 2 },
    { label: 'theme.optionC', value: 3 },
  ],
  checkboxList: [
    { label: 'theme.optionA', value: 1 },
    { label: 'theme.optionB', value: 2 },
  ],
  buttons: [
    {
      type: 'primary',
      label: 'theme.primaryColor',
      icon: '',
      disabled: false,
    },
    {
      type: 'success',
      label: 'theme.successColor',
      icon: '',
      disabled: false,
    },
    {
      type: 'info',
      label: 'theme.infoColor',
      icon: '',
      disabled: false,
    },
    {
      type: 'warning',
      label: 'theme.warnColor',
      icon: '',
      disabled: false,
    },
    {
      type: 'danger',
      label: 'theme.dangerColor',
      icon: '',
      disabled: false,
    },
    {
      type: 'default',
      label: 'theme.iconEg',
      icon: 'Edit',
      disabled: false,
    },
    {
      type: 'default',
      label: 'theme.disabled',
      icon: '',
      disabled: true,
    },
  ],
  columns: [
    {
      prop: 'date',
      label: 'theme.tableDate',
      fixed: true,
      width: 150,
    },
    {
      prop: 'name',
      label: 'theme.tableName',
      fixed: false,
    },
    {
      prop: 'state',
      label: 'theme.tableStatus',
      fixed: false,
    },
    {
      prop: 'city',
      label: 'theme.tableCity',
      fixed: false,
    },
    {
      prop: 'address',
      label: 'theme.tableAddress',
      fixed: false,
    },
    {
      prop: 'zip',
      label: 'theme.tableZip',
      fixed: false,
      width: 120,
    },
    {
      prop: 'Operations',
      label: 'theme.tableAction',
      fixed: 'right',
      width: 100,
    },
  ],
  tableData: [
    {
      date: '2016-05-03',
      name: 'Tom',
      state: 'California',
      city: 'Los Angeles',
      address: 'No. 189, Grove St, Los Angeles',
      zip: 'CA 90036',
      tag: 'Home',
      key: 1,
    },
    {
      date: '2016-05-02',
      name: 'Tom',
      state: 'California',
      city: 'Los Angeles',
      address: 'No. 189, Grove St, Los Angeles',
      zip: 'CA 90036',
      tag: 'Office',
      key: 2,
    },
    {
      date: '2016-05-04',
      name: 'Tom',
      state: 'California',
      city: 'Los Angeles',
      address: 'No. 189, Grove St, Los Angeles',
      zip: 'CA 90036',
      tag: 'Home',
      key: 3,
    },
    {
      date: '2016-05-01',
      name: 'Tom',
      state: 'California',
      city: 'Los Angeles',
      address: 'No. 189, Grove St, Los Angeles',
      zip: 'CA 90036',
      tag: 'Office',
      key: 4,
    },
    {
      date: '2016-09-01',
      name: 'Tick',
      state: 'California',
      city: 'Beijing',
      address: 'No. 189, Zhaoyang St, Los Angeles',
      zip: 'CA 90036',
      tag: 'Office',
      key: 5,
    },
  ],
};

export const settingList: {
  label: string;
  key: theme.ThemeKey;
  selector: string | string[];
  tip?: string;
  image?: boolean;
  min?: number;
  max?: number;
  unit?: string;
  hide?: boolean;
  divider?: boolean;
}[] = [
  {
    label: 'theme.fontSize',
    key: 'fontSize',
    selector: 'inputNumber',
    min: 12,
    max: 24,
    // hide: true,
    divider: true,
  },
  {
    label: 'theme.titleColor',
    key: 'titleColor',
    selector: 'colorPicker',
  },
  {
    label: 'theme.headerColor',
    key: 'headerColor',
    selector: 'colorPicker',
  },
  {
    label: 'theme.headerBgColor',
    key: 'headerBgColor',
    selector: 'colorPicker',
    image: true,
  },
  {
    label: 'theme.headerHeight',
    key: 'headerHeight',
    selector: 'inputNumber',
    min: 2,
    max: 5,
    unit: 'rem',
    divider: true,
  },
  {
    label: 'theme.tagViewColor',
    key: 'tagViewColor',
    selector: 'colorPicker',
  },
  {
    label: 'theme.tagViewBgColor',
    key: 'tagViewBgColor',
    selector: 'colorPicker',
  },
  {
    label: 'theme.tagViewActiveColor',
    key: 'tagViewActiveColor',
    selector: 'colorPicker',
  },
  {
    label: 'theme.tagViewActiveBgColor',
    key: 'tagViewActiveBgColor',
    selector: 'colorPicker',
  },
  {
    label: 'theme.tagViewHeight',
    key: 'tagViewHeight',
    selector: 'inputNumber',
    min: 2,
    max: 5,
    unit: 'rem',
    divider: true,
  },
  {
    label: 'theme.sidebarBgColor',
    key: 'sidebarBgColor',
    selector: 'colorPicker',
    image: true,
  },
  {
    label: 'theme.menuWidth',
    key: 'menuWidth',
    selector: 'inputNumber',
    min: 10,
    max: 16,
    unit: 'rem',
  },
  {
    label: 'theme.menuOpenedBgColor',
    key: 'menuOpenedBgColor',
    selector: 'colorPicker',
  },
  {
    label: 'theme.menuItemColor',
    key: 'menuItemColor',
    selector: 'colorPicker',
  },
  {
    label: 'theme.menuItemHoverColor',
    key: 'menuItemHoverColor',
    selector: 'colorPicker',
  },
  {
    label: 'theme.menuItemHoverBgColor',
    key: 'menuItemHoverBgColor',
    selector: 'colorPicker',
  },
  {
    label: 'theme.menuItemActiveColor',
    key: 'menuItemActiveColor',
    selector: 'colorPicker',
  },
  {
    label: 'theme.menuItemActiveBgColor',
    key: 'menuItemActiveBgColor',
    selector: 'colorPicker',
  },
  {
    label: 'theme.menuItemFavoriteColor',
    key: 'menuItemFavoriteColor',
    selector: 'colorPicker',
  },
  {
    label: 'theme.menuItemAllColor',
    key: 'menuItemAllColor',
    selector: 'colorPicker',
  },
  {
    label: 'theme.menuItemHeight',
    key: 'menuItemHeight',
    selector: 'inputNumber',
    min: 1,
    max: 5,
    unit: 'rem',
    divider: true,
  },
  {
    label: 'theme.themeBgLayout',
    key: 'themeBgLayout',
    selector: 'colorPicker',
  },
  {
    label: 'theme.primaryColor',
    key: 'themePrimary',
    selector: 'colorPicker',
  },
  {
    label: 'theme.successColor',
    key: 'themeSuccess',
    selector: 'colorPicker',
  },
  {
    label: 'theme.infoColor',
    key: 'themeInfo',
    selector: 'colorPicker',
  },
  {
    label: 'theme.warnColor',
    key: 'themeWarn',
    selector: 'colorPicker',
  },
  {
    label: 'theme.dangerColor',
    key: 'themeDanger',
    selector: 'colorPicker',
  },
  {
    label: 'theme.textColor',
    key: 'themeColor',
    selector: 'colorPicker',
  },
  {
    label: 'theme.borderColor',
    key: 'themeBorder',
    selector: 'colorPicker',
  },
  {
    label: 'theme.themeBgLight',
    key: 'themeBgLight',
    selector: 'colorPicker',
  },
  {
    label: 'theme.themeTwoColumns',
    key: 'themeTwoColumns',
    selector: 'inputNumber',
    min: 0,
    max: 16,
    tip: 'theme_two_columns',
  },
  {
    label: 'theme.themeFormColor',
    key: 'themeFormColor',
    selector: 'colorPicker',
    divider: true,
  },
  {
    label: 'theme.themeTableHeaderBg',
    key: 'themeTableHeaderBg',
    selector: 'colorPicker',
  },
  {
    label: 'theme.themeTableHeaderColor',
    key: 'themeTableHeaderColor',
    selector: 'colorPicker',
  },
  {
    label: 'theme.themeTableBodyBg',
    key: 'themeTableBodyBg',
    selector: 'colorPicker',
  },
  {
    label: 'theme.themeBgLighter',
    key: 'themeBgLighter',
    selector: 'colorPicker',
  },
  {
    label: 'theme.tableHeadRowPadding',
    key: 'tableHeadRowPadding',
    selector: 'inputNumber',
  },
  {
    label: 'theme.tableHeadColumnPadding',
    key: 'tableHeadColumnPadding',
    selector: 'inputNumber',
  },
  {
    label: 'theme.tableBodyRowPadding',
    key: 'tableBodyRowPadding',
    selector: 'inputNumber',
  },
  {
    label: 'theme.tableBodyColumnPadding',
    key: 'tableBodyColumnPadding',
    selector: 'inputNumber',
  },
];
