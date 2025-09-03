/*
 * @Author: Huangjs
 * @Date: 2024-03-06 16:31:37
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-19 13:25:00
 * @Description: ******
 */

const originalAddEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function (type, listener, options) {
  const hasOptions = typeof options === 'object' && options !== null;
  originalAddEventListener.call(this, type, listener, {
    passive: true,
    capture: hasOptions ? options.capture : false,
  });
};
