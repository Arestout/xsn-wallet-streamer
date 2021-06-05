import { validateEnv, checkNodeVersion } from './utils/validateEnv';
import { WalletStreamer } from './libs/wallet/walletStreamer/walletStreamer';
import { RpcClient } from './libs/wallet/rpcClient/rpcClient';
import { WALLET } from './config/index';
import { rabbitMqProducer } from './libs/rabbitmq/rabbitmq.producer';
import { BlockProcessor } from './libs/wallet/blockProcessor/blockProcessor';
import { logger } from './utils/logger';

checkNodeVersion();
validateEnv();

const rpcClient = new RpcClient(WALLET);
const blockProcessor = new BlockProcessor(rabbitMqProducer, rpcClient);

const walletStreamer = new WalletStreamer(rpcClient, blockProcessor);
walletStreamer
  .start()
  .then(() => logger.info('Wallet streaming started successfully'))
  .catch(error => logger.error(error));

rabbitMqProducer
  .getBroker()
  .then(broker => {
    process
      .on('SIGINT', async () => {
        logger.error('SIGINT');
        await broker.shutdown().then(() => {
          process.exit();
        });
      })
      .on('SIGTERM', async () => {
        logger.error('SIGTERM');
        await broker.shutdown().then(() => {
          process.exit();
        });
      })
      .on('unhandledRejection', async (reason, p) => {
        logger.error(`${reason}, 'Unhandled Rejection at Promise', ${JSON.stringify(p)}`);
        await broker.shutdown().then(() => {
          process.exit(-1);
        });
      })
      .on('uncaughtException', async err => {
        logger.error(`${err}, 'Uncaught Exception thrown'`);
        await broker.shutdown().then(() => {
          process.exit(-2);
        });
      });
  })
  .catch(error => logger.error(error));
