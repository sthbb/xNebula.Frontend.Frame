import { typeEnum } from './enum.js';

// 将单行tokens转换为文本
const tokensToString = (tokens = []) => {
  let arr = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token['key'] === 'blank') {
      arr.push(' ');
    } else {
      arr.push(token['value']);
    }
  }
  return arr.join('');
};

export const getRenderListByTokens = (tokens = []) => {
  let renderList = [];
  let members = [];
  const blankToken = {
    // 空格填充
    key: typeEnum['blank']['key'],
    value: '&nbsp;',
    type: typeEnum['blank']['type'],
  };
  let deep = 0; // 做为layer的索引，与layer配合记录list的个数
  let level = []; // 用于记录每层成员个数"<L n"中的n;
  let line = 1; // 累加记录当前处理的行
  let posLine = null; // 父节点当前行
  let parentLineList = [];
  let rangeMap = {};
  let layer = []; // 通过索引记住每一层list里面包含的代码行数line
  let lineTree = [];

  tokens.forEach((token, index) => {
    if (token.value === '<') {
      if (members.length > 0) {
        const item = {
          members,
          line,
          text: tokensToString(members),
        };
        if (posLine) {
          // 从后往前收集父节点
          parentLineList.unshift(line);
          rangeMap[`line_${line}`] = {
            line: posLine,
            from: posLine + 1,
            to: posLine + level[level.length - 1],
            num: level[level.length - 1],
            isExpand: true,
            parentNode: true,
            deep,
          };
          posLine = null;
        }

        renderList.push(item);

        // 预处理下一行
        line++;
        members = [];
        let i = 0;
        while (deep !== 0 && i !== deep) {
          // 每多一个层级加2个空格
          members.unshift(blankToken);
          members.unshift(blankToken);
          ++i;
        }
        members.push(token);
      } else {
        let i = 0;
        while (deep !== 0 && i !== deep) {
          // 每多一个层级加2个空格
          members.unshift(blankToken);
          members.unshift(blankToken);
          ++i;
        }
        members.push(token);
      }
    }

    if (token.key === 'keyword') {
      members.push(token);
    }

    if (token.key === 'int') {
      posLine = line;
      const num = parseInt(token.value);

      if (level.length !== 0) {
        level[level.length - 1] = level[level.length - 1] - 1;
      }
      level.push(num);

      // console.log(`add ${level}`);

      if (num) {
        ++deep;
        if (!layer[deep - 1]) {
          layer[deep - 1] = [];
        }
        layer[deep - 1].push(line);
      }
      members.push(blankToken);
      members.push(token);

      // 如果最后一行是<L N 这样的
      if (tokens.length - 1 === index) {
        if (members.length > 0) {
          const item = {
            members,
            line,
            text: tokensToString(members),
          };
          if (posLine) {
            // 从后往前收集父节点
            parentLineList.unshift(line);
            if (num !== 0) {
              rangeMap[`line_${line}`] = {
                line: posLine,
                from: posLine + 1,
                to: posLine + level[level.length - 1],
                num: level[level.length - 1],
                isExpand: true,
                parentNode: true,
                deep,
              };
            } else {
              // 如果是0，就不认为是L的那种父节点结构
              rangeMap[`line_${line}`] = {
                line: posLine,
                from: posLine,
                to: posLine + level[level.length - 1],
                parentNode: false,
                deep: deep + 1,
              };
            }

            posLine = null;
          }

          renderList.push(item);
        }
      }
    }

    if (
      token.key === 'check' ||
      token.key === 'order' ||
      token.key === 'string'
    ) {
      members.push(blankToken);
      members.push(token);
    }

    if (token.value === '>') {
      if (level[level.length - 1] !== 0) {
        level[level.length - 1] = level[level.length - 1] - 1;
      }

      // 子节点
      rangeMap[`line_${line}`] = {
        line,
        from: line,
        to: line,
        parentNode: false,
        deep: deep + 1,
      };

      members.push(token);
      const item = {
        members,
        line,
        text: tokensToString(members),
      };
      renderList.push(item);

      // 预处理下一行
      line++;
      members = [];
      if (level[level.length - 1] === 0) {
        level.pop();
        --deep;
        while (level.length && level[level.length - 1] === 0) {
          --deep;
          level.pop();
        }
        // console.log(`remove ${level}`);
      }
    }
  });

  // console.log(renderList);
  // console.log(parentLineList);
  // console.log(rangeMap);

  // 修复每行from与to的细节
  let maxLine = 0;
  parentLineList &&
    parentLineList.forEach((_line, index) => {
      const lineItem = rangeMap[`line_${_line}`];
      if (index === 0) {
        maxLine = lineItem['to']; // 记录最大行数
      } else if (index === parentLineList.length - 1) {
        rangeMap[`line_1`]['to'] = maxLine;
      } else {
        const fromLine = lineItem['from'];
        const toLine = lineItem['to'];
        let countTo = _line;
        for (let i = fromLine; i <= toLine; i++) {
          if (!rangeMap[`line_${i}`]) {
            ++countTo;
          } else {
            if (rangeMap[`line_${i}`]) {
              countTo = rangeMap[`line_${i}`]['to'];
            }
          }
        }
        rangeMap[`line_${_line}`]['to'] = countTo;
        while (rangeMap[`line_${countTo}`]) {
          rangeMap[`line_${_line}`]['to'] = rangeMap[`line_${countTo}`]['to'];
          countTo = 0;
        }
      }
    });

  // 层关系转树关系
  const layerToTree = (_layer) => {
    const lineMap = {};
    _layer.forEach((items) => {
      items.forEach((_line) => {
        lineMap[`line_${_line}`] = {
          line: _line,
          parentNode: true,
          children: [],
        };
      });
    });

    while (_layer.length !== 0) {
      const last = _layer[_layer.length - 1] ? _layer[_layer.length - 1] : null;
      const secondLast = _layer[_layer.length - 2]
        ? _layer[_layer.length - 2]
        : null;

      if (last && secondLast) {
        last.forEach((_line) => {
          const parents = secondLast.filter((l) => l < _line);
          const parent = parents[parents.length - 1];
          const children = lineMap[`line_${_line}`];
          const rangeItem = rangeMap[`line_${_line}`];
          if (rangeItem) {
            for (let i = rangeItem['from']; i <= rangeItem['to']; i++) {
              const cld = rangeMap[`line_${i}`];
              if (
                cld &&
                cld['parentNode'] === true &&
                cld['deep'] === rangeItem['deep'] + 1
              ) {
                if (lineMap[`line_${i}`]) {
                  children['children'].unshift(lineMap[`line_${i}`]);
                }
              }
              if (
                cld &&
                cld['parentNode'] === false &&
                cld['deep'] === rangeItem['deep'] + 1
              ) {
                children['children'].unshift(cld);
              }
            }
          }
          lineMap[`line_${parent}`]['children'].push(children);
          delete lineMap[`line_${line}`];
        });
        _layer.pop();
      } else {
        const _line = last ? last[0] : null;
        if (_line) {
          const rangeItem = rangeMap[`line_${_line}`];
          if (rangeItem) {
            const clds = [];
            for (let i = rangeItem['from']; i <= rangeItem['to']; i++) {
              const cld = rangeMap[`line_${i}`];
              if (
                cld &&
                cld['parentNode'] === false &&
                cld['deep'] === rangeItem['deep'] + 1
              ) {
                clds.push(cld);
              }
            }
            lineMap[`line_${_line}`]['children'].forEach((c) => {
              clds.push(c);
            });
            lineMap[`line_${_line}`]['children'] = clds;
          }
          _layer.pop();
        }
      }
    }
    return [lineMap[`line_1`]];
  };
  // console.log(_layer);
  lineTree = layerToTree(layer);
  // console.log("tree: ", lineTree);

  return {
    renderList,
    rangeMap,
    lineTree,
  };
};
