import { inject, type App } from 'vue';
import { SignalRChannel } from './SignalRChannel';
import type { SignalRConfig } from './SignalRConfig';

export const SIGNALR_CHANNEL_KEY = Symbol('SIGNALR_CHANNEL_KEY');

export default {
  install(app: App<unknown>, options?: SignalRConfig) {
    const channel = new SignalRChannel(options);
    app.provide(SIGNALR_CHANNEL_KEY, channel);
  },
  useSignalRChannel(): SignalRChannel {
    const channel = inject<SignalRChannel>(SIGNALR_CHANNEL_KEY);
    if (channel === null || channel === undefined) {
      throw new Error('SignalR未安装');
    }
    return channel;
  },
};
