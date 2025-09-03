<!--
 * @Author: Huangjs
 * @Date: 2022-10-25 14:30:25
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-24 10:17:50
 * @Description: ******
-->
<template>
  <div :class="cls('top-header')">
    <template v-if="preview">
      <div class="collapsed">
        <el-icon>
          <Collapsed />
        </el-icon>
      </div>
      <div :class="cls('menu-search')">
        <el-input class="search" :placeholder="t('Frame', 'layout.menuSearch')">
          <template #suffix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <el-icon v-if="!config?.hidePortal"><Portal /></el-icon>
      <el-icon v-if="config?.hasBigscreen"><Bigscreen /></el-icon>
      <el-icon><Fullscreen /></el-icon>
      <el-icon><Quesition /></el-icon>
      <el-icon><Locale /></el-icon>
      <div :class="cls('dropdown-user')">
        <span class="user">
          <el-avatar>
            <template #default>
              <el-icon><User /></el-icon>
            </template>
          </el-avatar>
          <span>{{ userName }}</span>
          <el-icon><CaretBottom /></el-icon>
        </span>
      </div>
    </template>
    <template v-else>
      <div
        :class="{
          collapsed: true,
          rotate: isCollapse,
        }">
        <el-icon @click="toggleCollapse">
          <Collapsed />
        </el-icon>
      </div>
      <div :class="cls('menu-search')">
        <el-input
          class="search"
          v-model="searchVal"
          :placeholder="t('Frame', 'layout.menuSearch')"
          @click="showSearch"
          clearable>
          <template #suffix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-dropdown
          ref="searchResult"
          :popper-class="cls('popper-search')"
          placement="bottom"
          trigger="click"
          :max-height="320"
          @command="jumpSearch">
          <span class="result" />
          <template #dropdown>
            <div class="empty" v-if="!searchMenus.length">
              {{ t('Frame', 'common.noData') }}
            </div>
            <template v-else>
              <el-dropdown-item
                v-for="item in searchMenus"
                :key="item.id"
                :command="item.path"
                divided>
                {{ t(item.i18nKey?.[0], item.i18nKey?.[1]) }}
              </el-dropdown-item>
            </template>
          </template>
        </el-dropdown>
      </div>
      <el-tooltip
        v-if="!config?.hidePortal"
        :popper-class="cls('popper-tooltip')"
        :content="t('Frame', 'layout.portal')">
        <el-icon @click="jumpPortal">
          <Portal />
        </el-icon>
      </el-tooltip>
      <el-tooltip
        v-if="config?.hasBigscreen"
        :popper-class="cls('popper-tooltip')"
        :content="t('Frame', 'layout.bigscreen')">
        <el-icon @click="jumpBigscreen">
          <Bigscreen />
        </el-icon>
      </el-tooltip>
      <el-tooltip
        :popper-class="cls('popper-tooltip')"
        :content="t('Frame', 'layout.fullscreen')">
        <el-icon @click="fullscreen">
          <Fullscreen v-if="!isFullscreen" />
          <ExitFullscreen v-else />
        </el-icon>
      </el-tooltip>
      <el-tooltip
        :popper-class="cls('popper-tooltip')"
        :content="t('Frame', 'layout.instruction')">
        <el-icon @click="openDoc"><Quesition /></el-icon>
      </el-tooltip>
      <el-dropdown :popper-class="cls('popper-locale')" @command="changeLang">
        <el-icon><Locale /></el-icon>
        <template #dropdown>
          <el-dropdown-item
            v-for="item in localeList"
            :class="{
              'is-active':
                item.value?.toLocaleLowerCase() === locale.toLocaleLowerCase(),
            }"
            :key="item.value"
            :command="item.value">
            {{ item.label }}
          </el-dropdown-item>
        </template>
      </el-dropdown>
      <el-dropdown
        :popper-class="cls('popper-user')"
        :class="cls('dropdown-user')"
        @command="handleUser">
        <span class="user">
          <el-avatar>
            <template #default>
              <el-icon><User /></el-icon>
            </template>
          </el-avatar>
          <span>{{ userName }}</span>
          <el-icon><CaretBottom /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="password">{{
              t('Frame', 'layout.updatePasssword')
            }}</el-dropdown-item>
            <el-dropdown-item command="theme">{{
              t('Frame', 'layout.themeSetting')
            }}</el-dropdown-item>
            <el-dropdown-item command="logout">{{
              t('Frame', 'layout.logout')
            }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-dialog
        :class="cls('update-password')"
        v-model="modalVisible"
        @closed="closeUpdatePassword"
        :title="t('Frame', 'layout.updatePasssword')"
        width="460"
        append-to-body
        :close-on-click-modal="false"
        :show-close="!needChangePassword"
        draggable>
        <el-form
          ref="formRef"
          label-width="auto"
          :model="formModel"
          :rules="rules">
          <el-form-item
            :label="t('Frame', 'layout.oldPassword')"
            prop="OldPassword">
            <el-input
              v-model="formModel.OldPassword"
              :disabled="confirmLoading"
              type="password"
              autocomplete="off"
              show-password
              clearable />
          </el-form-item>
          <el-form-item
            :label="t('Frame', 'layout.newPassword')"
            prop="NewPassword">
            <el-input
              v-model="formModel.NewPassword"
              :disabled="confirmLoading"
              type="password"
              autocomplete="off"
              show-password
              clearable />
          </el-form-item>
          <el-form-item
            :label="t('Frame', 'layout.confirmPassword')"
            prop="ConfirmPassword">
            <el-input
              v-model="formModel.ConfirmPassword"
              :disabled="confirmLoading"
              type="password"
              autocomplete="off"
              show-password
              clearable />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :loading="confirmLoading"
              @click="submitForm()">
              {{ t('Frame', 'button.confirm') }}
            </el-button>
            <el-button
              v-if="!needChangePassword"
              @click="modalVisible = false"
              :disabled="confirmLoading">
              {{ t('Frame', 'button.cancel') }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  onMounted,
  onUnmounted,
  shallowRef,
  ref,
  reactive,
  toRaw,
  computed,
  nextTick,
} from 'vue';
import { ElementPlus, Notification } from '@xnebula/components';
import {
  Collapsed,
  ExitFullscreen,
  Fullscreen,
  Quesition,
  Locale,
  Portal,
  Bigscreen,
} from '@@/icon';
import { i18n as useI18n } from '@@/i18n';
import { FixedPath, router as useRouter } from '@@/router';
import {
  lookup,
  isSameOrigin,
  joinRedirectQuery,
  checkPageInactivity,
  ssoFailed,
  IS_PROD,
} from '@@/utils';
import { useConfig, usePrefixCls } from '@@/hooks';
import { authority, collapse } from '@@/store';
import { updatePassword } from '@@/api';

const cls = usePrefixCls();
defineOptions({
  name: 'TopHeader',
});
const props = withDefaults(
  defineProps<{
    preview?: boolean;
    docUrl?: string;
  }>(),
  {
    preview: () => false,
    docUrl: () => '',
  },
);
// 获取登录信息中，当前是否需要弹出修改密码窗口
const needChangePassword = computed(() => {
  const origin = authority.auth.value.user.origin;
  // return true; // 用于测试为true的逻辑
  return origin ? origin.isChangePwd : false;
});
// 收起菜单逻辑
const { isCollapse, toggleCollapse } = collapse;
// 搜索菜单逻辑
const searchVal = ref('');
const searchMenus = computed<authority.AuthMenu[]>(() =>
  lookup(
    authority.auth.value.menus,
    (m) =>
      !!searchVal.value &&
      (!m.children || !m.children.length) &&
      t(m.i18nKey?.[0], m.i18nKey?.[1])
        .toLocaleLowerCase()
        .includes(searchVal.value.toLocaleLowerCase()),
  ),
);
const searchResult = shallowRef<ElementPlus.DropdownInstance>();
const showSearch = () => {
  searchResult.value?.handleOpen();
};
const jumpSearch = (path: string) => {
  router.push({ path });
};
// 跳转门户主页逻辑
const config = useConfig();
const router = useRouter();
const jumpPortal = () => {
  if (config?.value.isPortal) {
    router.push(FixedPath.portal);
  } else if (config?.value.isSso) {
    const portalUrl = config?.value.portalUrl;
    if (
      !portalUrl ||
      isSameOrigin(new URL(portalUrl), new URL(window.location.href))
    ) {
      ssoFailed();
    } else {
      window.location.href = `${portalUrl}/#${FixedPath.portal}`;
    }
  } else {
    window.alert(
      t('Frame', 'error.loginPlg', [
        !IS_PROD
          ? t('Frame', 'error.joinWord1')
          : t('Frame', 'error.joinWord2'),
        t('Frame', 'error.portal'),
      ]),
    );
  }
};
// 跳到大屏
const jumpBigscreen = () => {
  window.open(`${window.location.origin}/#${FixedPath.bigscreen}`, '_blank');
};
// 全屏逻辑
const isFullscreen = ref(false);
const fullscreen = () => {
  if (!document.fullscreenEnabled) {
    return;
  }
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.body.requestFullscreen();
  }
};
onMounted(() => {
  if (!props.preview) {
    document.onfullscreenchange = () => {
      isFullscreen.value = !!document.fullscreenElement;
    };
  }

  // 判断是否需要强制修改密码
  if (needChangePassword.value) {
    ElementPlus.ElMessage({
      type: 'error',
      message: t('Frame', 'layout.expiredPassword'),
    });
    modalVisible.value = true;
  }

  // 修改密码检查，与校验逻辑绑定
  if (config?.value.pwdConf) {
    bindRules();
  }
});
onUnmounted(() => {
  if (!props.preview) {
    document.onfullscreenchange = null;
  }
});
// 打开文档说明
const openDoc = () => {
  if (props.docUrl) {
    window.open(props.docUrl, '_blank');
  } else {
    ElementPlus.ElNotification({
      title: t('Frame', 'common.info'),
      type: 'warning',
      message: t('Frame', 'layout.noInstruction'),
    });
  }
};
// 切换多语言逻辑
const { t, locale, switchLocale, localeList } = useI18n();
const changeLang = (lang: string) => {
  switchLocale(lang);
  nextTick().then(() => {
    document?.querySelector<HTMLElement>('html')?.setAttribute('lang', lang);
  });
};

// 根据接口返回的密码策略，动态修改密码校验规则
const bindRules = () => {
  const { size: pwdMinLength = 1, strength: pwdStrength = [] } =
    config?.value.pwdConf || {};
  const digitRegStr = `\\d`; // 数字
  const digitLeastOne = `(?=.*[${digitRegStr}])`; //至少一个数字
  const lowercaseRegStr = `a-z`; // 小写字母
  const lowercaseLeastOne = `(?=.*[${lowercaseRegStr}])`; //至少一个小写字母
  const uppercaseRegStr = `A-Z`; // 大写字母
  const uppercaseLeastOne = `(?=.*[${uppercaseRegStr}])`; //至少一个大写字母
  // eslint-disable-next-line
  const specialRegStr = `!@#$%^&*()_+-=\\[\\]{};':"\\\|,.<>\\/?`; // 特殊字符
  const specialLeastOne = `(?=.*[${specialRegStr}])`; //至少一个特殊字符
  const pwdMaxLength = 20; // 密码最大长度
  const pwdStrengthStr: string[] = [];
  let regStr = '';
  let leastOneStr = '';

  if (pwdStrength.includes('digit')) {
    leastOneStr += digitLeastOne;
    pwdStrengthStr.push(t('Frame', 'layout.password.digit'));
  }
  regStr += digitRegStr;

  if (pwdStrength.includes('lowercase')) {
    leastOneStr += lowercaseLeastOne;
    pwdStrengthStr.push(t('Frame', 'layout.password.lowercase'));
  }
  regStr += lowercaseRegStr;

  if (pwdStrength.includes('uppercase')) {
    leastOneStr += uppercaseLeastOne;
    pwdStrengthStr.push(t('Frame', 'layout.password.uppercase'));
  }
  regStr += uppercaseRegStr;

  if (pwdStrength.includes('special')) {
    leastOneStr += specialLeastOne;
    pwdStrengthStr.push(t('Frame', 'layout.password.special'));
  }
  regStr += specialRegStr;

  // 新密码验证规则
  Array.isArray(rules.NewPassword)
    ? rules.NewPassword.push({
        validator: (_, value, callback) => {
          const len = value.length;
          // 检查长度
          if (len < pwdMinLength || len > pwdMaxLength) {
            callback(
              new Error(
                t('Frame', 'layout.rulePassword', [
                  pwdMinLength,
                  pwdMaxLength,
                  pwdStrengthStr.join(','),
                ]),
              ),
            );
          }

          // 检查是否合法
          const reg = new RegExp(
            `^${leastOneStr}[${regStr}]{${pwdMinLength},${pwdMaxLength}}$`,
            'g',
          );
          if (!reg.test(value)) {
            callback(
              new Error(
                t('Frame', 'layout.rulePassword', [
                  pwdMinLength,
                  pwdMaxLength,
                  pwdStrengthStr.join(','),
                ]),
              ),
            );
          }
          callback();
        },
        trigger: 'blur',
      })
    : '';
};

// 修改密码逻辑
const formModel = reactive({
  OldPassword: '',
  NewPassword: '',
  ConfirmPassword: '',
});
const rules = reactive<ElementPlus.FormRules<typeof formModel>>({
  OldPassword: [
    {
      required: true,
      message: t('Frame', 'layout.inputRequired', [
        t('Frame', 'layout.oldPassword'),
      ]),
      trigger: 'blur',
    },
  ],
  NewPassword: [
    {
      required: true,
      message: t('Frame', 'layout.inputRequired', [
        t('Frame', 'layout.newPassword'),
      ]),
      trigger: 'blur',
    },
    {
      validator: (_, value, callback) => {
        if (value === formModel.OldPassword) {
          callback(new Error(t('Frame', 'layout.samePassword')));
        }
        /* if (
          value &&
          !value.match(/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z_\W]{6,20}$/)
        ) {
          callback(new Error(t('Frame', 'layout.rulePassword')));
        } */
        callback();
      },
      trigger: 'blur',
    },
  ],
  ConfirmPassword: [
    {
      required: true,
      message: t('Frame', 'layout.inputRequired', [
        t('Frame', 'layout.confirmPassword'),
      ]),
      trigger: 'blur',
    },
    {
      validator: (_, value, callback) => {
        if (value && value !== formModel.NewPassword) {
          callback(new Error(t('Frame', 'layout.diffPassword')));
        }
        callback();
      },
      trigger: 'blur',
    },
  ],
});
const modalVisible = ref<boolean>(false);
const confirmLoading = ref<boolean>(false);
const formRef = shallowRef<ElementPlus.FormInstance>();
const closeUpdatePassword = () => {
  formRef.value?.resetFields();
  modalVisible.value = false;
};
const submitForm = () => {
  if (!formRef.value) return;
  confirmLoading.value = true;
  formRef.value.validate((valid) => {
    if (!valid) {
      confirmLoading.value = false;
      return;
    }
    updatePassword(toRaw(formModel)).then((o) => {
      confirmLoading.value = false;
      if (o) {
        closeUpdatePassword();
        logout();
      }
    });
  });
};
// 退出登录逻辑
const logout = () => {
  authority.delToken().then(() => {
    const redirectPath = window.location.hash.substring(1);
    if (config?.value.isSso) {
      const portalUrl = config?.value.portalUrl;
      if (
        !portalUrl ||
        isSameOrigin(new URL(portalUrl), new URL(window.location.href))
      ) {
        ssoFailed();
      } else {
        // 传入 _kill=1 为了删除门户系统的 localStorage
        const jq = joinRedirectQuery({
          key: config?.value.appKey || '',
          origin: IS_PROD ? '' : new URL(window.location.href).origin,
          redirect: redirectPath,
        });
        window.location.href = `${portalUrl}/#${FixedPath.login}?_kill=1&redirect=${encodeURIComponent(FixedPath.auth)}&${jq}`;
      }
    } else if (!config?.value.isPortal && IS_PROD) {
      window.alert(
        t('Frame', 'error.loginPlg', [
          t('Frame', 'error.joinWord2'),
          t('Frame', 'error.login'),
        ]),
      );
    } else {
      router.push({
        path: FixedPath.login,
        query: {
          redirect: redirectPath,
        },
      });
    }
  });
};
// 用户信息处理逻辑
const userName = computed(() => {
  const user = authority.auth.value.user;
  const lang = locale.value;
  return (
    (lang === 'en-US'
      ? user.userNameEn
      : lang === 'ko-KR'
        ? user.userNameKo
        : user.userName) || 'anonymous'
  );
});

const handleUser = (value: string) => {
  if (value === 'logout') {
    logout();
  } else if (value === 'password') {
    modalVisible.value = true;
  } else if (value === 'theme') {
    router.push(FixedPath.theme);
  }
};
// 检测用户是否操作
let stopCheckPageInactivity: () => void = () => {};
onMounted(() => {
  // 在 token 过期时间内无操作就会退出登录
  if (IS_PROD) {
    stopCheckPageInactivity = checkPageInactivity(
      +authority.auth.value.user.origin?.expires || 0,
      (inactivity) => {
        stopCheckPageInactivity();
        // 退出登录
        if (inactivity) {
          Notification({
            title: t('Frame', 'common.info'),
            type: 'warning',
            message: t('Frame', 'error.tokenExpiration'),
          });
          logout();
        }
      },
    );
  }
});
onUnmounted(() => {
  stopCheckPageInactivity();
});
</script>
