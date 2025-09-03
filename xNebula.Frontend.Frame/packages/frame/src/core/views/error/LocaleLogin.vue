<!--
 * @Author: Huangjs
 * @Date: 2022-10-25 18:01:58
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-24 10:43:27
 * @Description: ******
-->
<template>
  <el-result
    icon="info"
    :title="t('Frame', 'error.loginTitle')"
    :sub-title="loginDesc">
    <template #extra>
      <p class="tip" v-for="(message, i) in messages" :key="i">
        {{ message }}
      </p>
      <el-button type="primary" @click="login">{{
        t('Frame', 'error.login')
      }}</el-button>
    </template>
  </el-result>
</template>

<script setup lang="ts">
import { i18n as useI18n } from '@@/i18n';
import { getLocaleToken } from '@@/api';

defineOptions({
  name: 'notFound',
  inheritAttrs: false,
});
const { postLogin } = withDefaults(
  defineProps<{
    postLogin?: (o: any) => Promise<void>;
  }>(),
  {
    postLogin: () => () => Promise.resolve(),
  },
);
const { t } = useI18n();
const login = () => {
  return getLocaleToken().then((data) => {
    postLogin(data);
  });
};
const loginDesc =
  '本地开发模式, 代理的本地系统既没有配置 Portal 插件, 也没有配置 Sso 插件, 在此进行登录, 该登录需要你在项目根目录的 package.json 内配置一个有效的 token';
const messages: string[] = [];
messages.push('注意: ');
messages.push(
  '如果你的 token 来源一个主系统(配置了 Portal 插件, 拥有登录页和平台首页的系统), 请去发布该主系统的服务器上找到该系统的配置文件(即 /publish/data/FRAME/appsettings.json), 把配置内对应的 Token 项下的 AppKey, AppSecret, RsaPublicKey, Issuer, Audience 值拷贝到自己代理的本地系统下的 appsettings.json 内对应的配置中, Issuer 和 Audience 两项都填写: wuxixinxiang.com',
);
messages.push(
  '如果你的 token 来源一个子系统(配置了 Sso 插件, 需要通过 Sso 登录的系统), 除了上述方式外, 你还可以去该子系统对应的主系统内(进入子系统后点击右上角门户即可进入对应的主系统), 进入 [门户管理 - 客户端管] 页面, 找到该子系统的配置, 点击编辑, 查看授权信息, 把 App Key, App Secrect, RSA_PUBLIC_KEY(RSA_PUBLIC_KEY 拷贝要去头: -----BEGIN PUBLIC KEY-----, 去尾: -----END PUBLIC KEY-----, 只要中间部分)的值拷贝到代理的本地系统下的 appsettings.json 内对应的配置中，同时 Issuer 和 Audience  两项都填写: wuxixinxiang.com',
);
messages.push('只有通过以上方式得到的 token, 才可能是一个有效的 token');
</script>
<style lang="scss" scoped>
.tip {
  width: 920px;
  font-size: 12px;
  color: var(--el-color-error);
  text-align: left;
}
</style>
