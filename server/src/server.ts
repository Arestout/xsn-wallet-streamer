import { validateEnv, checkNodeVersion } from './utils/validateEnv';
import { WalletStreamer } from './libs/wallet/walletStreamer/walletStreamer';
import { RpcClient } from './libs/wallet/rpcClient/rpcClient';
import { WALLET } from './config/index';
import { rabbitMqProducer } from './libs/rabbitmq/rabbitmq.producer';
import { BlockProcessor } from './libs/wallet/blockProcessor/blockProcessor';
import { logger } from './utils/logger';
import { BrokerAsPromised } from 'rascal';

checkNodeVersion();
validateEnv();

const rpcClient = new RpcClient(WALLET);
const blockProcessor = new BlockProcessor(rabbitMqProducer, rpcClient);

const walletStreamer = new WalletStreamer(rpcClient, blockProcessor);
walletStreamer
  .start()
  .then(() => logger.info('Wallet streaming started successfully'))
  .catch(error => logger.error(error));

let rabbitMQbroker: BrokerAsPromised;
rabbitMqProducer
  .getBroker()
  .then(broker => (rabbitMQbroker = broker))
  .catch(error => logger.error(error));

process
  .on('SIGINT', async () => {
    logger.error('SIGINT');
    await rabbitMQbroker.shutdown().then(() => {
      process.exit();
    });
  })
  .on('SIGTERM', async () => {
    logger.error('SIGTERM');
    await rabbitMQbroker.shutdown().then(() => {
      process.exit();
    });
  })
  .on('unhandledRejection', async (reason, p) => {
    logger.error(`${reason}, 'Unhandled Rejection at Promise', ${JSON.stringify(p)}`);
    await rabbitMQbroker.shutdown().then(() => {
      process.exit(1);
    });
  })
  .on('uncaughtException', async err => {
    logger.error(`${err}, 'Uncaught Exception thrown'`);
    await rabbitMQbroker.shutdown().then(() => {
      process.exit(2);
    });
  });
