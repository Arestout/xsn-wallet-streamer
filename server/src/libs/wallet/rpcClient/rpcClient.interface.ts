import { Block } from '../types/block.interface';
import { BlockchainInfo } from '../types/blockchain-info.interface';
import { Tx } from '../types/tx.interface';

export interface IRpcClient {
  ping(): Promise<Record<string, string | null>>;
  getBlockHash(height: string): Promise<string>;
  getBlockByHash(hash: string): Promise<Block>;
  getBlockchainInfo(): Promise<BlockchainInfo>;
  getRawTransaction(txId: string): Promise<Tx>;
}
