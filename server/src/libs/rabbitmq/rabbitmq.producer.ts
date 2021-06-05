import { logger } from '../../utils/logger';
import { Message } from './types/message.interface';
import { IRabbitMqProducer } from './types/rabbitmq.interface';

import Broker, { BrokerAsPromised } from 'rascal';
import { config } from './configFile';

const { BrokerAsPromised: BrokerPromisified } = Broker;

class RabbitMqProducer implements IRabbitMqProducer {
  private broker: BrokerAsPromised;
  private isReady = false;

  public async sendMessage(message: Message): Promise<void> {
    try {
      await this.broker.publish(message.type, message);
    } catch (error) {
      logger.error(error);
    }
  }

  public async getBroker(): Promise<BrokerAsPromised> {
    if (!this.isReady) {
      await this.init();
      this.isReady = true;
    }

    return this.broker;
  }

  private async init(): Promise<void> {
    this.broker = await BrokerPromisified.create(config);
    this.broker.on('error', (err, { vhost, connectionUrl }) => {
      logger.error('Broker error', err, vhost, connectionUrl);
    });
  }
}

export const rabbitMqProducer = new RabbitMqProducer();
