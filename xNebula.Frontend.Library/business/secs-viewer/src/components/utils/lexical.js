import { judge } from './judge';

export const getTokens = (code) => {
  const tokens = [];
  const len = typeof code === 'string' ? code.length : 0;
  let pos = 0;
  while (pos !== len && len !== 0) {
    const char = code[pos];
    ++pos;
    const token = judge(char, pos === len);
    if (token) {
      tokens.push(token);
    }
  }
  // console.log(code.length);
  // console.log(tokens);
  return tokens;
};
