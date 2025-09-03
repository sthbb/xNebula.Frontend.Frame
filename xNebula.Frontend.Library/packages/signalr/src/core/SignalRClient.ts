import * as signalR from '@microsoft/signalr';
import { SignalRMessage } from './SignalRMessage';
import type { SignalRConfig } from './SignalRConfig';

//SignalRClient
class SignalRClient {
  //配置
  config?: SignalRConfig;
  //链路
  connection: signalR.HubConnection;
  //状态变化的回调,代替原有的bus机制
  stateChange?: (state: any) => void;
  //method回调,代替原有的bus机制
  methodCallback?: (message: string) => void;

  //方法的缓冲队列
  private methodQueue: { methodName: string; args: any }[] = [];
  private monitoringCache: {
    groupName: string;
    methodName: string;
  }[] = [];

  constructor(config?: SignalRConfig) {
    //初始化配置
    this.config = config;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { url, autoStart, ...restOptions } = config || {};
    //初始化连接和回调
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(url ?? 'signalr/hubs', { ...restOptions })
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect([
        0,
        2000,
        5 * 1000,
        10 * 1000,
        30 * 1000,
        60 * 1000,
        120 * 1000,
        120 * 1000,
        120 * 1000,
      ])
      .build();
    this.connection.onclose(this.handleOnClose.bind(this));
    this.connection.onreconnected(this.handleReconnected.bind(this));
  }

  //原始方法
  start() {
    return this.connection
      .start()
      .then(() => {
        this.handleOnConnected();
      })
      .catch((err) => {
        // console.error(err);
        return Promise.reject(err);
      });
  }

  stop() {
    return this.connection.stop().catch((err) => {
      // console.error(err);
      return Promise.reject(err);
    });
  }

  invokeMethod(serverMethodName: string, args: any) {
    return this.connection.invoke(serverMethodName, args).catch((err) => {
      // console.error(err);
      return Promise.reject(err);
    });
  }

  startServiceMonitorListener(groupName: string, methodName: string) {
    //加入分组
    this.invokeMethod('JoinGroup', groupName);
    //避免重复监听
    this.connection.off(methodName);
    this.connection.on(methodName, (message) => {
      //判断是否相同分组
      if (SignalRMessage.isSameGroup(groupName, message)) {
        //判断是否注册了回调函数
        if (this.methodCallback) {
          this.methodCallback(message);
        }
      }
    });
    console.log('Start Monitor');
  }

  stopServiceMonitorListener(groupName: string, methodName: string) {
    this.invokeMethod('LeaveGroup', groupName);
    this.connection.off(methodName);
    console.log('Stop Monitor');
  }

  //移除对应的监控项
  removeMonitor(groupName: string, methodName: string) {
    const _index = this.monitoringCache.findIndex(
      (c) => c.groupName === groupName && c.methodName === methodName,
    );
    if (_index >= 0) {
      this.monitoringCache.splice(_index, 1);
    }
  }

  //重连自动发送缓存函数调用&加入分组等方法
  autoInvokeMethod(methodName: string, args: any) {
    //如果当前已经连接则直接调用方法
    //若未连接则存入缓存队列
    //队列
    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      this.methodQueue.push({ methodName: methodName, args: args });
      return;
    }
    this.invokeMethod(methodName, args);
  }

  autoStartServiceMonitorListener(groupName: string, methodName: string) {
    //移除对应的元素
    this.removeMonitor(groupName, methodName);
    //加入元素
    this.monitoringCache.push({
      groupName: groupName,
      methodName: methodName,
    });
    //多当前未连结则直接返回
    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }
    //否则调用一次加入分组
    this.startServiceMonitorListener(groupName, methodName);
  }

  autoStopServiceMonitorListener(groupName: string, methodName: string) {
    //移除对应的元素
    this.removeMonitor(groupName, methodName);
    //多当前未连结则直接返回
    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }
    //否则调用一次
    this.stopServiceMonitorListener(groupName, methodName);
  }

  //事件处理
  handleOnConnected() {
    console.log('SignalR Connected');
    this.onStateChange();
  }
  handleOnClose(_error?: Error) {
    console.log('SignalR Closed');
    this.onStateChange();
  }
  handleReconnected(_connectionId?: string) {
    console.log('SignalR Reconnected');
    this.onStateChange();
  }

  //状态改变时
  onStateChange() {
    //确认状态是已经连接
    if (this.connection.state === signalR.HubConnectionState.Connected) {
      //订阅所有需要订阅monitor
      for (const monitor of this.monitoringCache) {
        this.startServiceMonitorListener(monitor.groupName, monitor.methodName);
      }
      //顺序调用并清除队列里的方法
      let _method2invoke = undefined;
      while ((_method2invoke = this.methodQueue.shift())) {
        this.invokeMethod(_method2invoke.methodName, _method2invoke.args);
      }
    }

    if (this.stateChange) {
      this.stateChange(this.connection.state);
    }
  }

  //销毁方法
  dispose() {
    //彻底清除所有的资源
    //请勿使用该对象
  }
}

export { SignalRClient };
