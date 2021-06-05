import { Block } from '../types/block.interface';

export interface IBlockProcessor {
  process(block: Block): Promise<void>;
}
