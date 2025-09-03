import { SignalRBus } from './SignalRBus';
import { SignalRClient } from './SignalRClient';
import {
  SignalRMessage,
  type SignalRMessageEntity,
  type SignalRPluginMessageEntity,
} from './SignalRMessage';
import type { SignalRConfig } from './SignalRConfig';

export class SignalRChannel {
  config?: SignalRConfig;
  bus: SignalRBus;
  client: SignalRClient;
  constructor(_config?: SignalRConfig) {
    //初始化配置
    this.config = _config;
    this.bus = new SignalRBus(this.config);
    this.client = new SignalRClient(this.config);
    this.client.methodCallback = (message) => {
      const entity = SignalRMessage.parse2MessageEntity(message);
      this.bus.emit(entity.methodName, message);
    };

    //开始建立连接
    if (this.config?.autoStart ?? true) {
      this.client.start();
    }
  }

  /**
   * 服务端方法调用
   * @param serverMethodName 服务端方法名
   * @param args 服务端方法参数
   * @returns
   */
  invokeMethod(serverMethodName: string, args: any) {
    return this.client.invokeMethod(serverMethodName, args);
  }

  //针对分组进行监听和消息发送
  /**
   * 启动服务监听
   * @param groupName 分组名
   * @param methodName 方法名
   * @returns
   */
  startServiceMonitorListener(groupName: string, methodName: string) {
    return this.client.autoStartServiceMonitorListener(groupName, methodName);
  }
  /**
   * 停止服务监听
   * @param groupName 分组名
   * @param methodName 方法名
   * @returns
   */
  stopServiceMonitorListener(groupName: string, methodName: string) {
    return this.client.autoStopServiceMonitorListener(groupName, methodName);
  }
  /**
   * 发送消息sendMessage
   * @param groupName 分组名
   * @param methodName 方法名
   * @param messageBody 消息体
   * @returns
   */
  sendMessage(groupName: string, methodName: string, messageBody: string) {
    return this.invokeMethod(
      SignalRMessage.SEND_MESSAGE_METHOD,
      `${groupName}${SignalRMessage.GROUP_SPLIT}${methodName}${SignalRMessage.HEAD_SPLIT}${messageBody}`,
    );
  }
  /**
   * 发送消息实体
   * @param entity 消息实体
   * @returns
   */
  sendMessageEntity(entity: SignalRMessageEntity) {
    return this.sendMessage(entity.groupName, entity.methodName, entity.body);
  }

  //针对插件化进行监听和消息发送
  /**
   * 启动插件服务监听
   * @param pName pName
   * @param gName gName
   * @param methodName 方法名
   * @returns
   */
  startPluginServiceMonitorListener(
    pName: string,
    gName: string,
    methodName: string,
  ) {
    return this.startServiceMonitorListener(
      `${pName}${SignalRMessage.PNAME_GNAME_SPLIT}${gName}`,
      methodName,
    );
  }
  /**
   * 停止插件服务监听
   * @param pName pName
   * @param gName gName
   * @param methodName 方法名
   * @returns
   */
  stopPluginServiceMonitorListener(
    pName: string,
    gName: string,
    methodName: string,
  ) {
    return this.stopServiceMonitorListener(
      `${pName}${SignalRMessage.PNAME_GNAME_SPLIT}${gName}`,
      methodName,
    );
  }
  /**
   * 发送插件消息sendPluginMessage
   * @param pName pName
   * @param gName gName
   * @param methodName 方法名
   * @param messageBody 消息体
   * @returns
   */
  sendPluginMessage(
    pName: string,
    gName: string,
    methodName: string,
    messageBody: string,
  ) {
    return this.sendMessage(
      `${pName}${SignalRMessage.PNAME_GNAME_SPLIT}${gName}`,
      methodName,
      messageBody,
    );
  }
  /**
   * 发送插件消息实体
   * @param entity 插件消息实体
   * @returns
   */
  sendPluginMessageEntity(entity: SignalRPluginMessageEntity) {
    return this.sendPluginMessage(
      entity.pName,
      entity.gName,
      entity.methodName,
      entity.body,
    );
  }

  /**
   * 设置方法回调的监听
   * @param methodName 方法名
   * @param callback 回调函数
   * @param oneListener 针对同一个方法名是否只有一个监听函数
   * @returns
   */
  on(
    methodName: string,
    callback: (message: string) => void,
    oneListener: boolean = true,
  ) {
    //只有一个监听函数
    if (oneListener) {
      this.bus.off(methodName);
    }
    const unsubscribe = this.bus.on(methodName, callback);
    return unsubscribe;
  }

  /**
   * 取消方法回调的监听
   * @param methodName 方法名
   * @param callback 回调函数
   * @returns
   */
  off(methodName: string, callback?: (message: string) => void) {
    return this.bus.off(methodName, callback);
  }

  /**
   * 将消息字符串转换为消息实体
   * @param message 消息字符串
   * @returns 消息实体
   */
  parse2MessageEntity(message: string): SignalRMessageEntity {
    return SignalRMessage.parse2MessageEntity(message);
  }

  /**
   * 将插件消息字符串转换为插件消息实体
   * @param message 插件消息字符串
   * @returns 插件消息实体
   */
  parse2PluginMessageEntity(message: string): SignalRPluginMessageEntity {
    return SignalRMessage.parse2PluginMessageEntity(message);
  }
}
