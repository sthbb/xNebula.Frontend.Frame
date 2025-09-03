export default {
  // _mu_ 是书写菜单的多语言, 不需要用做菜单的页面就不需要写进去
  // 按照以下格式填写, 会自动生成的菜单多语言 Key（当然你也可以改为其他的, 但是你要到菜单管理去配置对应上）
  _mu_: {
    _: 'Template Menu', // 一级菜单名称, 生成的菜单 key 是 PluginTpl._mu_._
    {{^useLCP}}
    text: 'Text Page', // 二级菜单(页面)名称, 生成的菜单 key 是 PluginTpl._mu_.text
    {{/useLCP}}
    {{#useLCP}}
    table: 'Table Page', // 二级菜单(页面)名称, 生成的菜单 key 是 PluginTpl._mu_.table
    {{/useLCP}}
  },
  {{^useLCP}}
  text_no: 'no',
  text_ok: 'ok',
  text_message: 'No Data',
  {{/useLCP}}
  {{#useLCP}}
  table_seq: 'Seq',
  table_id: 'ID',
  table_kind: 'Kind',
  table_event: 'Event',
  btn_query: 'Query',
  {{/useLCP}}
};
