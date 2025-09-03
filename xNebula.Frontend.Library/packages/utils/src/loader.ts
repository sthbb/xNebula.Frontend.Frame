/*
 * @Author: Huangjs
 * @Date: 2024-03-04 12:22:07
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-05 15:51:44
 * @Description: ******
 */

function injectStyle(cssText: string) {
  const style = document.createElement('style');
  style.appendChild(document.createTextNode(cssText));
  (document.head || document.getElementsByTagName('head')[0]).appendChild(
    style,
  );
}
function loadAndInjectStyle(href: string) {
  return fetch(href)
    .then((response) => response.text())
    .then((text) => injectStyle(text));
}

export function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementsByTagName('script');
    if (Array.from(existing).some((script) => script.src === src)) {
      // 已经加载过该 script，直接 resolve
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    (document.head || document.getElementsByTagName('head')[0]).appendChild(
      script,
    );
  });
}
export function loadStyle(href: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementsByTagName('link');
    if (Array.from(existing).some((link) => link.href === href)) {
      // 已经加载过该 style，直接 resolve
      resolve();
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    // 加载并执行完成后 resolve
    link.onload = () => resolve();
    link.onerror = (e) => reject(e);
    (document.head || document.getElementsByTagName('head')[0]).appendChild(
      link,
    );
  });
}

export const importJs = loadScript;

export const importCss = function importCss(href: string, inject?: boolean) {
  if (inject) {
    return loadAndInjectStyle(href);
  }
  return loadStyle(href);
};

export const injectCss = injectStyle;
