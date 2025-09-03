<!--
 * @Author: Huangjs
 * @Date: 2021-05-10 15:55:29
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-05 12:14:14
 * @Description: ******
-->

## @xnebula/user-select

选择用户组件，任选一种安装

npm install @xnebula/user-select

yarn add @xnebula/user-select

pnpm add @xnebula/user-select

## 使用方法

### 全局使用：在 main.ts 引入

```javascript
import UserSelect from '@xnebula/user-select';
import '@xnebula/user-select/index.css';
const app = createApp(App)；
app.use(UserSelect);
// 或者
// app.component('UserSelect', UserSelect);
```

### 局部使用：在 App.vue 引入

```html
<script setup lang="ts">
  import UserSelect from '@xnebula/user-select';
  import '@xnebula/user-select/index.css';
</script>
```

### 在 template 中使用

```html
<user-select
  is-multiple
  :selected-user="selectedUser"
  :request-org="requestOrg"
  :request-user="requestUser"
  @confirm="chooseUser"
  @cancel="cancelUser">
  <template #action>
    <el-button type="success" icon="Search" />
  </template>
</user-select>
```

## 参数说明

| 参数          | 说明                                                                | 类型                                    |
| ------------- | ------------------------------------------------------------------- | --------------------------------------- |
| is-multiple   | props: 是否多选                                                     | boolean 非必传                          |
| selected-user | props: 已选择的用户数组                                             | User[] 非必传                           |
| request-org   | props: 请求组织和部门数据的方法                                     | function():Promise<Org[]> 必传          |
| request-user  | props: 点击部门后获取对应用户数据的方法                             | function(P:Params):Promise<User[]> 必传 |
| confirm       | event: 选择用户后点击确认，得已选用户数据                           | function(data: User[]):void             |
| cancel        | event: 取消选择，关闭弹出框之后的处理                               | function():void                         |
| action        | solt: 触发弹出选择用户的按钮，无需注册事件，内部会自动注册click弹出 | 具名插槽 action                         |

## 示例

```html
<template>
  <header>Example UserSelect</header>
  <main>
    <el-input size="small" style="width: 240px" placeholder="请输入名称">
      <template #append>
        <user-select
          class="user-select"
          is-multiple
          :selected-user="selectedUser"
          :request-org="requestOrg"
          :request-user="requestUser"
          @confirm="chooseUser"
          @cancel="cancelUser">
          <template #action>
            <el-button type="success" icon="Search" />
          </template>
        </user-select>
      </template>
    </el-input>
    <el-button @click="del">delete</el-button>
  </main>
</template>

<script setup lang="ts">
  import type { User, Org, RequestUserParams } from '@xnebula/user-select';
  import { ref } from 'vue';
  import { orgData, userData } from './data';
  const orgKind = {
    //集团
    Group: 0,
    //公司
    Company: 1,
    //工厂
    Factory: 2,
    //部门
    Department: 3,
    //小组
    Team: 4,
    //其他
    Other: 5,
  };
  const getIcon = (data: any) => {
    if (data.IsPosition) {
      return 'iconfont icon-position';
    }
    if (data.IsPeople) {
      return 'iconfont icon-user';
    }
    if (data.OrgType == orgKind.Company) {
      return 'iconfont icon-gongsi';
    }
    if (data.OrgType == orgKind.Group || data.OrgType == orgKind.Factory) {
      return 'iconfont icon-company';
    }
    if (data.OrgType == orgKind.Department) {
      return 'iconfont icon-bumen';
    }
    if (data.OrgType == orgKind.Team) {
      return 'iconfont icon-xiaozu';
    }
  };
  const requestOrg = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mapData = (data: any): Org[] => {
          if (!Array.isArray(data)) {
            return data;
          }
          return data.map((org) => ({
            id: org.Id,
            label: org.Name,
            icon: getIcon(org),
            children: mapData(org.children),
            data: org,
          }));
        };
        resolve(mapData(orgData) || []);
      }, 1000);
    });
  };
  const selectedUser = ref<User[]>([
    {
      id: userData.data[0].ID,
      name: userData.data[0].NAME,
    },
    {
      id: userData.data[1].ID,
      name: userData.data[1].NAME,
    },
    {
      id: userData.data[3].ID,
      name: userData.data[3].NAME,
    },
  ]);
  const del = () => {
    selectedUser.value = selectedUser.value.slice(1);
  };
  const requestUser = (params: RequestUserParams) => {
    console.log(params);
    return new Promise((resolve) => {
      setTimeout(() => {
        const data: User[] = userData.data.map((data) => {
          let orgNames = [];
          try {
            if (data.OrgSettings) {
              orgNames = JSON.parse(data.OrgSettings).map(
                ({
                  fullName,
                  posName,
                }: {
                  fullName: string;
                  posName: string;
                }) => `${fullName}${posName ? `  ${posName}` : ''}`,
              );
            }
          } catch (e) {
            console.error('"OrgSettings" is not normal json.');
          }
          return {
            id: data.ID,
            code: data.CODE,
            account: data.ACCOUNT,
            name: data.NAME,
            orgNames,
            data,
          };
        });
        resolve({ data, total: userData.total });
      }, 1000);
    });
  };
  const chooseUser = (users: User[]) => {
    console.log(users);
  };
  const cancelUser = () => {
    console.log('cancel');
  };
</script>
```
