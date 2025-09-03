// 判断单个界符,例如:<>
export const isDelimiter = (char) => /(<|>)/.test(char);
// 判断单个空格,换行符,制表符等,例如:\f\n\r\t\v
export const isSpaceOrNewline = (char) => /\s/.test(char);
// 判断是任意字符
export const isAnyCharacter = (char) => /.*/.test(char);
// 判断是否是关键字
export const isKeyword = (keyword) =>
  /^(L|B|BOOLEAN|A|J|I8|I1|I2|I4|F8|F4|U8|U1|U2|U4)$/.test(keyword);
// 判断是否是值判断,例如:[Aa1]
export const isValueCheck = (value) => /^\[[A-Za-z0-9]+\]$/.test(value);
// 判断是整数,例如:0,33
export const isDigit0Value = (value) => /^[0-9]+$/.test(value);
// 判断是大写字母和数字组合,例如:Aa1
export const isLetterValue = (value) => /^[A-Za-z0-9]+$/.test(value);
// 判断是否是字符串,例如:'任何字符串'
export const isString = (char) => /^'.*'$/.test(char);
