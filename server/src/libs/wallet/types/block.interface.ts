import { Tx } from './tx.interface';

export interface Block {
  hash: string;
  height: number;
  time: number;
  tx: Tx[];
}
