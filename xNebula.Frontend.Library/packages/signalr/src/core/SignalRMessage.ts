//SignalRMessage
export class SignalRMessage {
  //头部标志符号
  static HEAD_SPLIT = '$';
  //分组标志符号
  static GROUP_SPLIT = '|';
  //PNAME_GNAME分隔标志符
  static PNAME_GNAME_SPLIT = '^';
  //发送消息的方法名
  static SEND_MESSAGE_METHOD = 'SendMessage';

  //是否相同分组
  static isSameGroup(groupName: string, message: string): boolean {
    //判断是否相同分组
    const _gindex = message.indexOf(SignalRMessage.GROUP_SPLIT);
    const _groupName = message.substring(0, _gindex);
    return groupName === _groupName;
  }

  static parse2MessageEntity(message: string): SignalRMessageEntity {
    const _headIndex = message.indexOf(SignalRMessage.HEAD_SPLIT);
    const _head = message.substring(0, _headIndex);
    const _groupIndex = _head.indexOf(SignalRMessage.GROUP_SPLIT);
    const _groupName = _head.substring(0, _groupIndex);
    const _methodName = _head.substring(_groupIndex + 1);
    const _body = message.substring(_headIndex + 1);
    return {
      groupName: _groupName,
      methodName: _methodName,
      body: _body,
    } as SignalRMessageEntity;
  }

  static parse2PluginMessageEntity(
    message: string,
  ): SignalRPluginMessageEntity {
    const _headIndex = message.indexOf(SignalRMessage.HEAD_SPLIT);
    const _head = message.substring(0, _headIndex);
    const _groupIndex = _head.indexOf(SignalRMessage.GROUP_SPLIT);
    const _groupName = _head.substring(0, _groupIndex);

    const _pNameIndex = _groupName.indexOf(SignalRMessage.PNAME_GNAME_SPLIT);
    const _pName = _groupName.substring(0, _pNameIndex);
    const _gName = _groupName.substring(_pNameIndex + 1);

    const _methodName = _head.substring(_groupIndex + 1);
    const _body = message.substring(_headIndex + 1);
    return {
      pName: _pName,
      gName: _gName,
      methodName: _methodName,
      body: _body,
    } as SignalRPluginMessageEntity;
  }
}

type SignalRMessageEntity = {
  //groupName
  groupName: string;
  //methodName
  methodName: string;
  //body
  body: string;
};
type SignalRPluginMessageEntity = {
  //pName
  pName: string;
  //gName
  gName: string;
  //methodName
  methodName: string;
  //body
  body: string;
};
export { type SignalRMessageEntity, type SignalRPluginMessageEntity };
