export const $t = (key) => {
  // debugger;
  if (
    window.xNebula &&
    window.xNebula.i18n &&
    window.xNebula.i18n.global &&
    window.xNebula.i18n.global.t
  ) {
    return window.xNebula.i18n.global.t(key);
  } else {
    return key;
  }
};

export const $stringFormat = function () {
  let str = arguments[0];
  for (let i = 1; i < arguments.length; i++) {
    let regexp = new RegExp('\\{' + (i - 1) + '\\}', 'gi');
    str = str.replace(regexp, arguments[i]);
  }
  return str;
};
