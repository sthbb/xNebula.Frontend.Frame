import {
  isAnyCharacter,
  isDelimiter,
  isSpaceOrNewline,
  isDigit0Value,
  isLetterValue,
  isKeyword,
  isValueCheck,
  isString,
} from './type.js';
import { typeEnum } from './enum.js';

let tempToken = '';

// 判断单个字符的类型
export const judge = (s, last) => {
  // 判断单个界符,例如:<>
  if (tempToken === '' && isDelimiter(s)) {
    return {
      key: typeEnum['delimiter']['key'],
      value: s,
      type: typeEnum['delimiter']['type'],
    };
  } else if (isSpaceOrNewline(s) || last) {
    // 最后一个字符，专门用于处理没有闭合界符的情况
    if (last && !!s && !isSpaceOrNewline(s)) {
      tempToken += s;
    }
    // 判断单个空格,换行符,制表符等,例如:\f\n\r\t\v
    const v = tempToken;

    if (v && isDigit0Value(v)) {
      // 判断是整数,例如:0,33
      tempToken = '';
      return {
        key: typeEnum['int']['key'],
        value: v,
        type: typeEnum['int']['type'],
      };
    } else if (v && isKeyword(v)) {
      // 判断是否是关键字
      tempToken = '';
      return {
        key: typeEnum['keyword']['key'],
        value: v,
        type: typeEnum['keyword']['type'],
      };
    } else if (v && isLetterValue(v)) {
      // 判断是大写字母和数字组合,例如:Aa1
      tempToken = '';
      return {
        key: typeEnum['order']['key'],
        value: v,
        type: typeEnum['order']['type'],
      };
    } else if (v && isValueCheck(v)) {
      // 判断是否是值判断,例如:[Aa1]
      tempToken = '';
      return {
        key: typeEnum['check']['key'],
        value: v,
        type: typeEnum['check']['type'],
      };
    } else if (v && tempToken) {
      tempToken += s;
    } else {
      console.log(`else    ${v}`);
    }
  } else if (!last && isAnyCharacter(s)) {
    // 判断是任意字符
    tempToken += s;

    // 判断是否是字符串,例如:'任何字符串'
    if (tempToken && isString(tempToken)) {
      const v = tempToken;
      tempToken = '';
      return {
        key: typeEnum['string']['key'],
        value: v,
        type: typeEnum['string']['type'],
      };
    }
  } else {
    return;
  }
  // console.log(s);
};
