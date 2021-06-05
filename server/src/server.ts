import { validateEnv, checkNodeVersion } from './utils/validateEnv';
import { RpcClient } from './libs/wallet/rpcClient/rpcClient';
import { WALLET } from './config/index';
import { rabbitMqProducer } from './libs/rabbitmq/rabbitmq.producer';
import { BlockProcessor } from './libs/wallet/blockProcessor/blockProcessor';

checkNodeVersion();
validateEnv();

const rpcClient = new RpcClient(WALLET);
const blockProcessor = new BlockProcessor(rabbitMqProducer, rpcClient);
