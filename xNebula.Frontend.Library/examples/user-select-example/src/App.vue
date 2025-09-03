<!--
 * @Author: Huangjs
 * @Date: 2024-01-31 17:51:41
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-05 12:12:28
 * @Description: ******
-->
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
import { ref } from 'vue';
import type { User, Org, RequestUserParams } from '@xnebula/user-select';
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
      const _data: User[] = userData.data.map((data) => {
        let orgNames = [];
        try {
          if (data.OrgSettings) {
            orgNames = JSON.parse(data.OrgSettings).map(
              ({ fullName, posName }: { fullName: string; posName: string }) =>
                `${fullName}${posName ? `  ${posName}` : ''}`,
            );
          }
        } catch (_e) {
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
      resolve({ data: _data, total: userData.total });
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

<style scoped>
header {
  line-height: 1.5;
  text-align: center;
}

main {
  margin-top: 16px;
  text-align: center;
}

.user-select :deep(.emit-button) {
  height: 30px;
  margin: 0 12px;
}
</style>
