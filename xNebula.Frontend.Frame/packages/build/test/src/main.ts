/*
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-06 11:50:43
 * @Description: ******
 */

import init from './pages';

init('#app');

const click = document.getElementById('click');
if (click) {
  click.onclick = () => {
    fetch('/api/locale/login', {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.error(err);
      });
    fetch('/api/frame/client/i18n', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.error(err);
      });
  };
}
