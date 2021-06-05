import { RABBITMQ_HOST } from './../../config/index';

export const config = {
  vhosts: {
    lsgwaoxk: {
      connection: {
        url: RABBITMQ_HOST,
        heartbeat: 10,
        socketOptions: {
          timeout: 10000,
        },
      },
      exchanges: ['transactions_exchange'],
      queues: ['transactions_queue'],
      bindings: ['transactions_exchange[whale_transaction] -> transactions_queue', 'transactions_exchange[burn_transaction] -> transactions_queue'],
      publications: {
        whale_transaction: {
          vhost: 'lsgwaoxk',
          exchange: 'transactions_exchange',
          routingKey: 'whale_transaction',
        },
        burn_transaction: {
          vhost: 'lsgwaoxk',
          exchange: 'transactions_exchange',
          routingKey: 'burn_transaction',
        },
      },
    },
  },
};
