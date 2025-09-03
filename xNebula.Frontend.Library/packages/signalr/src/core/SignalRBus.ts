import mitt from 'mitt';
import type { SignalRConfig } from './SignalRConfig';

export class SignalRBus {
  config?: SignalRConfig;
  emitter;
  constructor(_config?: SignalRConfig) {
    //初始化配置
    this.config = _config;
    this.emitter = mitt();
  }
  emit(methodName: string, message: any) {
    this.emitter.emit(methodName, message);
  }
  on(methodName: string, callback: (message: any) => void) {
    this.emitter.on(methodName, callback);
    //取消订阅的回调
    const unsubscribe = () => this.emitter.off(methodName, callback);
    return unsubscribe;
  }
  off(methodName: string, callback?: (message: any) => void) {
    this.emitter.off(methodName, callback);
  }
  clear() {
    this.emitter.all.clear();
  }
}
