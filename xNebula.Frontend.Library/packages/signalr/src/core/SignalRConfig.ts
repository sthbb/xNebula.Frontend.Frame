//SignalRConfig
import type { IHttpConnectionOptions } from '@microsoft/signalr';

interface SignalRConfig extends IHttpConnectionOptions {
  url?: string;
  autoStart?: boolean;
}

export type { SignalRConfig };
