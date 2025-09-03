/*
 * @Author: Huangjs
 * @Date: 2022-10-26 11:23:47
 * @LastEditors: Huangjs
 * @LastEditTime: 2022-11-21 09:08:16
 * @Description: ******
 */
export const lookup = <T extends Record<string, any>>(
  data: T[],
  condition: (d: T) => boolean,
  subKey: string = 'children',
) => {
  const newData: T[] = [];
  const cycle = (_data: T[]) => {
    _data.forEach((d) => {
      if (condition(d)) {
        newData.push({ ...d });
      }
      if (d[subKey]) {
        cycle(d[subKey]);
      }
    });
  };
  cycle(data);
  return newData;
};

export const linkedLookup = <T extends Record<string, any>>(
  data: T[],
  condition: (d: T) => boolean,
  subKey: string = 'children',
) => {
  const newData: T[] = [];
  const cycle = (_data: T[]) => {
    let find = false;
    for (let i = 0; i < _data.length; i++) {
      const d = _data[i];
      newData.push({ ...d });
      if (condition(d) || cycle(d[subKey] || [])) {
        find = true;
        break;
      } else {
        newData.pop();
      }
    }
    return find;
  };
  cycle(data);
  return newData;
};
