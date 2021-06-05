import { Message } from './message.interface';
import { BrokerAsPromised } from 'rascal';

export interface IRabbitMqProducer {
  sendMessage(message: Message): Promise<void>;
  getBroker(): Promise<BrokerAsPromised>;
}
