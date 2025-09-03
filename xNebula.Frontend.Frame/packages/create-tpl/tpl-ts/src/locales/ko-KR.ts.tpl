export default {
  // _mu_ 是书写菜单的多语言, 不需要用做菜单的页面就不需要写进去
  // 按照以下格式填写, 会自动生成的菜单多语言 Key（当然你也可以改为其他的, 但是你要到菜单管理去配置对应上）
  _mu_: {
    _: '플러그인 템플릿', // 一级菜单名称, 生成的菜单 key 是 PluginTpl._mu_._
    {{^useLCP}}
    text: '텍스트 페이지', // 二级菜单(页面)名称, 生成的菜单 key 是 PluginTpl._mu_.text
    {{/useLCP}}
    {{#useLCP}}
    table: '표 페이지', // 二级菜单(页面)名称, 生成的菜单 key 是 PluginTpl._mu_.table
    {{/useLCP}}
  },
  {{^useLCP}}
  text_no: '음수 접두사',
  text_ok: '친밀함',
  text_message: '사용 가능한 데이터 없음',
  {{/useLCP}}
  {{#useLCP}}
  table_seq: '일련 번호',
  table_id: 'ID',
  table_kind: '종류',
  table_event: '이벤트',
  btn_query: '문서 등',
  {{/useLCP}}
};
