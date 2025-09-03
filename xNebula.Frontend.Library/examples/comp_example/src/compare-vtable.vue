<template>
  <x-v-list-table
    ref="vtableRef"
    style="height: 1440px"
    :options="options"
    :events="events"
    :records="data" />
</template>
<script lang="ts" setup>
import { onMounted, ref, shallowRef, nextTick } from 'vue';
import {
  XVListTable,
  type ListTableEvents,
  type ListTableOptions,
} from '@xnebula/vtable';
const vtableRef = ref<InstanceType<typeof XVListTable>>();
onMounted(() => {
  console.log(vtableRef.value?.readAttribute('autoFillWidth'));
  const vtableInstance = vtableRef.value?.getInstance();
  console.log(vtableInstance?.getTheme());
});
let newRecords: any[] = [];
const options = shallowRef<ListTableOptions>({
  // hierarchyExpandLevel: 'Infinity',
  // 默认样式
  customCellStyle: [
    // 行不存在高亮提示
    {
      id: 'delete',
      style: {
        bgColor: '#f40806',
      },
    },
    // 新增行高亮提示
    {
      id: 'create',
      style: {
        bgColor: '#68c239',
      },
    },
    // 行数据被修改高亮提示
    {
      id: 'update',
      style: {
        bgColor: '#fbcb01',
      },
    },
  ],
  // customCellStyleArrangement: [
  //   {
  //     cellPosition: {
  //       col: 1,
  //       row: 3,
  //     },
  //     customStyleId: 'delete',
  //   },
  // ],
  columns: [
    {
      field: 'order', // 数据源字段
      title: 'Index', // 列标题
      width: 'auto',
      tree: true,
      fieldFormat(rec) {
        return rec['order']; // 数据源字段
      },
    },
    {
      field: 'name', // 数据源字段
      title: 'Name', // 列标题
      width: 'auto',
      fieldFormat(rec) {
        return rec['name']; // 数据源字段
      },
    },
    {
      field: 'cccode', // 数据源字段
      title: 'CCode', // 列标题
      width: 'auto',
      fieldFormat(rec) {
        return rec['cccode']; // 数据源字段
      },
    },
    {
      field: 'value', // 数据源字段
      title: 'Value', // 列标题
      width: 'auto',
      fieldFormat(rec) {
        return rec['value']; // 数据源字段
      },
    },
    {
      field: 'desc', // 数据源字段
      title: 'Desc', // 列标题
      width: 'auto',
      fieldFormat(rec) {
        return rec['desc']; // 数据源字段
      },
    },
    {
      field: 'type', // 数据源字段
      title: 'Type', // 列标题
      width: 'auto',
      fieldFormat(rec) {
        return rec['type']; // 数据源字段
      },
    },
  ],
  widthMode: 'standard',
});
const props = {
  rowKey: 'id',
  children: 'children',
  sortKey: 'order',
  sortType: 'asc', // asc升序 desc降序
};
// 拉平数据
const flatData = (records: Record<string, any>[]) => {
  const recordObj: Record<string, Object> = {};
  const recordList: Record<string, any>[] = [];
  const recordSort: any[] = [];
  let row = 1;

  const dealChildren = (items: Array<Record<string, any>>, _parent: any) => {
    items.forEach((record) => {
      const _record = Object.assign({}, record);
      _record['row'] = row; // 标记数据行
      _record['_parent'] = _parent; // 标记数据行
      recordObj[`item_${_record[props['rowKey']]}`] = _record;
      recordObj[`sort_${_record[props['sortKey']]}`] = _record;
      recordList.push(_record);
      recordSort.push(_record[props['sortKey']]);
      ++row;
      if (record[props['children']] && record[props['children']] !== 0) {
        dealChildren(record[props['children']], record[props['rowKey']]);
      }
    });
  };
  records.forEach((record) => {
    const _record = Object.assign({}, record);
    _record['row'] = row; // 标记数据行
    recordObj[`item_${_record[props['rowKey']]}`] = _record;
    recordObj[`sort_${_record[props['sortKey']]}`] = _record;
    recordList.push(_record);
    recordSort.push(_record[props['sortKey']]);
    ++row;
    if (record[props['children']] && record[props['children']] !== 0) {
      dealChildren(record[props['children']], record[props['rowKey']]);
    }
  });
  return {
    recordObj,
    recordList,
    recordSort,
  };
};

// 重新构建数据结构
const constructNewRecords = (record: any, parent?: any): void => {
  const findParent = (
    records: Array<Record<string, any>>,
    _record: any,
    _parent: any,
  ) => {
    const len = records.length;
    if (len !== 0 && records[len - 1][props['rowKey']] === _parent) {
      if (!records[len - 1][props['children']]) {
        records[len - 1][props['children']] = [];
      }
      const idx = records[len - 1][props['children']].findIndex(
        (i: any) => i[props['rowKey']] === _record[props['rowKey']],
      );
      if (idx === -1) {
        records[len - 1][props['children']].push(_record);
      }
    } else if (
      len !== 0 &&
      records[len - 1][props['rowKey']] !== _parent &&
      records[len - 1][props['children']] &&
      records[len - 1][props['children']].length !== 0
    ) {
      findParent(records[len - 1][props['children']], _record, _parent);
    } else {
      return;
    }
  };

  if (!parent) {
    newRecords.push(record);
  } else {
    findParent(newRecords, record, parent);
  }
};

const countSort = (rSort: any, cSort: any) => {
  let recordSort: any[] = [];
  let temp: any[] = [];

  while (rSort.length !== 0) {
    const item = rSort.shift();

    let idx = cSort.findIndex((i: any) => i === item);
    // 不在cSort中
    if (idx === -1 && item) {
      if (cSort.length !== 0) {
        if (item < cSort[0]) {
          recordSort.push(item);
        }
      } else {
        recordSort.push(item);
      }

      // 检查cSort的第一个是否在rSort中，不在的话就先装载到recordSort中
      while (
        cSort.length !== 0 &&
        rSort.findIndex((i: any) => i === cSort[0]) === -1
      ) {
        const ite = cSort.shift();
        recordSort.push(ite);

        // 如果下一个cSort在rSort中有值
        if (rSort.findIndex((i: any) => i === cSort[0]) !== -1) {
          recordSort.push(item);
        }
      }
    }

    // 在cSort中，并且和cSort的第一个一样
    if (idx === 0 && item && item === cSort[0]) {
      cSort.shift();
      recordSort.push(item);
    }

    if (idx > 0) {
      while (idx >= 0) {
        temp.push(cSort.shift());
        --idx;
      }
      recordSort = recordSort.concat(temp);
      temp = [];
    }
  }

  if (rSort.length === 0 && cSort.length !== 0) {
    recordSort = recordSort.concat(cSort);
  }

  if (props['sortType'] === 'asc') {
    return recordSort;
  }

  if (props['sortType'] === 'desc') {
    return recordSort.reverse();
  }
};

// 清洗数据
const cleanRecord = (record: any) => {
  delete record['row'];
  Object.keys(record).forEach((key) => {
    if (
      props['rowKey'] !== key &&
      props['children'] !== key &&
      props['sortKey'] !== key &&
      '_parent' !== key &&
      '_dataType' !== key
    ) {
      if (typeof record[key] === 'string') {
        record[key] = '';
      }
    }
  });
  if (record[props['children']] && record[props['children']].length) {
    record[props['children']].forEach((child: any) => {
      child['_dataType'] = 'delete';
      cleanRecord(child);
    });
  }
  return record;
};

const findLast = (
  records: Array<Record<string, any>>,
  record: any,
  parent: any,
) => {
  const len = records.length;
  // 查找id是否在这层
  const idx = records.findIndex((item) => item[props['rowKey']] === parent);
  if (len !== 0 && idx !== -1) {
    if (!records[idx][props['children']]) {
      records[idx][props['children']] = [];
    }
    const childIdx = records[idx][props['children']].findIndex(
      (item: any) => item[props['rowKey']] === record[props['rowKey']],
    );
    // 判断不存在
    if (childIdx === -1) {
      records[idx][props['children']].push(record);
    }
  } else if (
    len !== 0 &&
    idx === -1 &&
    records[len - 1][props['children']] &&
    records[len - 1][props['children']].length !== 0
  ) {
    findLast(records[len - 1][props['children']], record, parent);
  } else {
    return;
  }
};

// 比较方法 compareRecords用于比较的数据,records为原始数据
const _execCompare = (compareRecords: any, records: any) => {
  const {
    recordObj: compareRecordObj, // 用于记录item_和sort_，数据完成了row和_parent的标记
    recordList: compareRecordList, // 以线性的List呈现recordObj
    recordSort: compareRecordSort,
  } = flatData(compareRecords);
  const { recordObj: _recordObj, recordSort: _recordSort } = flatData(records);
  const recordSort = countSort(_recordSort, compareRecordSort);

  // 根据recordSort返回纯净的数据结构，然后再次拉平
  const rebuildRecords: Record<string, any>[] = [];
  recordSort &&
    recordSort.forEach((key) => {
      // 如果原始数据中存在
      const recordItem: any = _recordObj[`sort_${key}`];
      if (recordItem) {
        if (!recordItem['_parent']) {
          recordItem[props['children']] = [];
          rebuildRecords.push(recordItem);
        } else {
          findLast(rebuildRecords, recordItem, recordItem['_parent']);
        }
      } else {
        const _compareRecordItem: any = compareRecordObj[`sort_${key}`];
        _compareRecordItem['_dataType'] = 'delete';
        const compareRecordItem = cleanRecord(_compareRecordItem); // 清洗这条数据

        if (!compareRecordItem['_parent']) {
          rebuildRecords.push(compareRecordItem);
        } else {
          // 找到最后一个节点的children末节点，往后添加
          findLast(
            rebuildRecords,
            compareRecordItem,
            compareRecordItem['_parent'],
          );
          // console.log(rebuildRecords);
        }
      }
    });
  const { recordObj, recordList } = flatData(rebuildRecords);
  const customCellStyleArrangement: Record<string, any>[] = [];
  const maxColumn = options?.value?.columns?.length ?? 0;
  console.log('用于比较的数据拉平');
  console.log(compareRecordObj);
  console.log(compareRecordList);
  console.log('原始数据拉平');
  console.log(recordObj);
  console.log(recordList);

  // 遍历原始数据与比较数据进行比较
  recordList.forEach((record) => {
    const compareRecordItem =
      compareRecordObj[`item_${record[props['rowKey']]}`];
    const recordItem = recordObj[`item_${record[props['rowKey']]}`];

    // 如果比较数据中有此数据
    if (compareRecordItem) {
      const _compareRecord: any = Object.assign({}, compareRecordItem);
      const _record: any = Object.assign({}, recordItem);
      delete _compareRecord[props['children']];
      delete _compareRecord['row'];
      delete _record[props['children']];
      delete _record['row'];
      delete _record['hierarchyState'];

      if (record['_dataType'] === 'delete') {
        // 说明数据被删除了
        customCellStyleArrangement.push({
          cellPosition: {
            range: {
              start: {
                col: 0,
                row: (recordObj as any)[`item_${record[props['rowKey']]}`][
                  'row'
                ],
              },
              end: {
                col: maxColumn,
                row: (recordObj as any)[`item_${record[props['rowKey']]}`][
                  'row'
                ],
              },
            },
          },
          customStyleId: 'delete',
        });

        // 用有修改的数据构建新的record
        const parent = _record['_parent'];
        constructNewRecords(_record, parent);
      } else if (JSON.stringify(_compareRecord) !== JSON.stringify(_record)) {
        // 如果不同说明数据有修改
        customCellStyleArrangement.push({
          cellPosition: {
            range: {
              start: {
                col: 0,
                row: (recordObj as any)[`item_${record[props['rowKey']]}`][
                  'row'
                ],
              },
              end: {
                col: maxColumn,
                row: (recordObj as any)[`item_${record[props['rowKey']]}`][
                  'row'
                ],
              },
            },
          },
          customStyleId: 'update',
        });

        // 用有修改的数据构建新的record
        const parent = _record['_parent'];
        if (parent !== undefined) {
          let parentObj: any = recordObj[`item_${parent}`];
          while (parentObj) {
            customCellStyleArrangement.push({
              cellPosition: {
                range: {
                  start: {
                    col: 0,
                    row: parentObj['row'],
                  },
                  end: {
                    col: maxColumn,
                    row: parentObj['row'],
                  },
                },
              },
              customStyleId: 'update',
            });
            if (parentObj['_parent']) {
              parentObj = recordObj[`item_${parentObj['_parent']}`];
            } else {
              parentObj = null;
            }
          }
          // console.log(parent);
        }
        constructNewRecords(_record, parent);
      } else {
        // 相同说明数据没有修改
        const parent = _record['_parent'];
        constructNewRecords(_record, parent);
      }
    } else {
      // 如果比较数据中没有此数据,说明这个数据是新增的
      customCellStyleArrangement.push({
        cellPosition: {
          range: {
            start: {
              col: 0,
              row: record['row'],
            },
            end: {
              col: maxColumn,
              row: record['row'],
            },
          },
        },
        customStyleId: 'create',
      });

      // 相同说明数据没有修改
      const parent = record['_parent'];
      constructNewRecords(record, parent);
    }
  });

  return {
    records: newRecords,
    customCellStyleArrangement,
  };
};

// 比较方法
const execCompare = (compareRecords: any) => {
  const vtableInstance = vtableRef.value?.getInstance();
  const records = vtableInstance?.records;
  console.log(records);
  newRecords = [];
  const result = _execCompare(compareRecords, records);
  // const result = _execCompare(records, compareRecords);
  return result;
  // const compareRecords = vtableInstance?.compareRecords(records);
  // console.log(compareRecords);
  // vtableInstance?.setRecords(compareRecords);
};

const events = shallowRef<ListTableEvents>({
  // CLICK_CELL: (args) => {
  //   console.log('click_cell:', args);
  // },
});

const data = shallowRef<Record<string, any>[]>([]);
let compareRecords: Record<string, any>[] = [];
data.value = [
  {
    id: 1,
    order: '1',
    name: 'Step1',
    cccode: '1',
    value: '',
    desc: 'Block',
    type: '',
    children: [],
  },
  {
    id: 2,
    order: '2',
    name: 'Step2',
    cccode: '2',
    value: '',
    desc: 'Block',
    type: '',
    children: [
      {
        id: 21,
        order: '2.1',
        name: 'P2.1',
        cccode: '',
        value: '2.1',
        desc: 'Item',
        type: 'U4',
        children: [
          {
            id: 211,
            order: '2.1.1',
            name: 'P2.1.1',
            cccode: '',
            value: '2.1.1',
            desc: 'Item',
            type: 'U4',
          },
          {
            id: 212,
            order: '2.1.2',
            name: 'P2.1.2',
            cccode: '',
            value: '2.1.2',
            desc: 'Item',
            type: 'U4',
          },
          {
            id: 214,
            order: '2.1.4',
            name: 'P2.1.4',
            cccode: '',
            value: '2.1.4',
            desc: 'Item',
            type: 'U4',
          },
        ],
      },
      {
        id: 22,
        order: '2.2',
        name: 'P2.2',
        cccode: '',
        value: '2.2',
        desc: 'Item',
        type: 'U4',
      },
    ],
  },
  {
    id: 3,
    order: '3',
    name: 'Step###',
    cccode: '3',
    value: '',
    desc: 'Block',
    type: '',
    children: [
      {
        id: 31,
        order: '3.1',
        name: 'P3.1',
        cccode: '',
        value: '3.1',
        desc: 'Item',
        type: 'U4',
      },
    ],
  },
  {
    id: 4,
    order: '4',
    name: 'Step4',
    cccode: '4',
    value: '',
    desc: 'Block',
    type: '',
    children: [
      //     {
      //       id: 41,
      //       order: '4.1',
      //       name: 'P4.1',
      //       cccode: '',
      //       value: '4.1',
      //       desc: 'Item',
      //       type: 'U4',
      //     },
      //     {
      //       id: 42,
      //       order: '4.2',
      //       name: 'P4.2',
      //       cccode: '',
      //       value: '4.2',
      //       desc: 'Item',
      //       type: 'U4',
      //     },
    ],
  },
  // {
  //   id: 5,
  //   order: '5',
  //   name: 'Step5',
  //   cccode: '5',
  //   value: '',
  //   desc: 'Block',
  //   type: '',
  //   children: [],
  // },
  {
    id: 6,
    order: '6',
    name: 'Step6',
    cccode: '6',
    value: '',
    desc: 'Block',
    type: '',
    children: [],
  },
  {
    id: 7,
    order: '7',
    name: 'Step7',
    cccode: '7',
    value: '',
    desc: 'Block',
    type: '',
    children: [],
  },
  {
    id: 8,
    order: '8',
    name: 'Step8',
    cccode: '8',
    value: '',
    desc: 'Block',
    type: '',
    children: [
      {
        id: 81,
        order: '8.1',
        name: 'P8.1',
        cccode: '',
        value: '8.1',
        desc: 'Item',
        type: 'U4',
      },
      {
        id: 82,
        order: '8.2',
        name: 'P8.2',
        cccode: '',
        value: '8.2',
        desc: 'Item',
        type: 'U4',
      },
      {
        id: 83,
        order: '8.3',
        name: 'P8.3',
        cccode: '',
        value: '8.3',
        desc: 'Item',
        type: 'U4',
      },
    ],
  },
];
// 比较数据
compareRecords = [
  // {
  //   id: 1,
  //   order: '1',
  //   name: 'Step1',
  //   cccode: '1',
  //   value: '',
  //   desc: 'Block',
  //   type: '',
  //   children: [],
  // },
  {
    id: 2,
    order: '2',
    name: 'Step2',
    cccode: '2',
    value: '',
    desc: 'Block',
    type: '',
    children: [
      {
        id: 21,
        order: '2.1',
        name: 'P2.1',
        cccode: '',
        value: '2.1',
        desc: 'Item',
        type: 'U4',
        children: [
          {
            id: 212,
            order: '2.1.2',
            name: 'P2.1.2',
            cccode: '',
            value: '2.1.2',
            desc: 'Item',
            type: 'U4',
          },
          {
            id: 213,
            order: '2.1.3',
            name: 'P2.1.3',
            cccode: '',
            value: '2.1.3',
            desc: 'Item',
            type: 'U4',
          },
          {
            id: 214,
            order: '2.1.4',
            name: 'P2.1.4#####',
            cccode: '',
            value: '2.1.4',
            desc: 'Item',
            type: 'U4',
          },
        ],
      },
      {
        id: 22,
        order: '2.2',
        name: 'P2.2',
        cccode: '',
        value: '2.2',
        desc: 'Item',
        type: 'U4',
      },
      {
        id: 23,
        order: '2.3',
        name: 'P2.3',
        cccode: '',
        value: '2.3',
        desc: 'Item',
        type: 'U4',
      },
    ],
  },
  {
    id: 3,
    order: '3',
    name: 'Step3',
    cccode: '3',
    value: '',
    desc: 'Block',
    type: '',
    children: [],
  },
  // {
  //   id: 4,
  //   order: '4',
  //   name: 'Step4',
  //   cccode: '4',
  //   value: '',
  //   desc: 'Block',
  //   type: '',
  //   children: [
  //     {
  //       id: 41,
  //       order: '4.1',
  //       name: 'P4.1',
  //       cccode: '',
  //       value: '4.1',
  //       desc: 'Item',
  //       type: 'U4',
  //     },
  //     {
  //       id: 42,
  //       order: '4.2',
  //       name: 'P4.2',
  //       cccode: '',
  //       value: '4.2',
  //       desc: 'Item',
  //       type: 'U4',
  //     },
  //   ],
  // },
  {
    id: 5,
    order: '5',
    name: 'Step5',
    cccode: '5',
    value: '',
    desc: 'Block',
    type: '',
    children: [],
  },
  {
    id: 6,
    order: '6',
    name: 'Step6',
    cccode: '6',
    value: '',
    desc: 'Block',
    type: '',
    children: [],
  },
  {
    id: 7,
    order: '7',
    name: 'Step7',
    cccode: '7',
    value: '',
    desc: 'Block',
    type: '',
    children: [
      {
        id: 71,
        order: '7.1',
        name: 'P7.1',
        cccode: '',
        value: '7.1',
        desc: 'Item',
        type: 'U4',
      },
    ],
  },
  {
    id: 8,
    order: '8',
    name: 'Step8',
    cccode: '8',
    value: '',
    desc: 'Block',
    type: '',
    children: [
      {
        id: 82,
        order: '8.2',
        name: 'P8.2######',
        cccode: '',
        value: '8.2',
        desc: 'Item',
        type: 'U4',
      },
      {
        id: 83,
        order: '8.3',
        name: 'P8.3',
        cccode: '',
        value: '8.3',
        desc: 'Item',
        type: 'U4',
      },
      {
        id: 84,
        order: '8.4',
        name: 'P8.4',
        cccode: '',
        value: '8.4',
        desc: 'Item',
        type: 'U4',
      },
    ],
  },
];
// fetch('https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/company_struct.json')
//   .then((res) => res.json())
//   .then((records) => {
//     data.value = records;
//   });

nextTick(() => {
  const { customCellStyleArrangement, records } = execCompare(compareRecords);
  console.log({ customCellStyleArrangement, records });
  data.value = records;
  options.value = {
    ...options.value,
    customCellStyleArrangement: customCellStyleArrangement as any[],
  };
});
</script>
