import { validateEnv, checkNodeVersion } from './utils/validateEnv';
import { RpcClient } from './libs/wallet/rpcClient/rpcClient';
import { WALLET } from './config/index';

checkNodeVersion();
validateEnv();

const rpcClient = new RpcClient(WALLET);
