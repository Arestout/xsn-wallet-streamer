import { logger } from '../../../utils/logger';
import { IRpcClient } from '../rpcClient/rpcClient.interface';
import { IBlockProcessor } from '../blockProcessor/blockProcessor.interface';

export class WalletStreamer {
  private blockHeight: number;
  private rpcClient: IRpcClient;
  private blockProcessor: IBlockProcessor;

  public constructor(rpcClient: IRpcClient, blockProcessor: IBlockProcessor) {
    this.rpcClient = rpcClient;
    this.blockProcessor = blockProcessor;
  }

  public async start(): Promise<void> {
    try {
      const INITIAL_TIMEOUT = 60000; // 1 min
      setTimeout(async () => await this.pingWallet(), INITIAL_TIMEOUT);
    } catch (error) {
      logger.error(error);
    }
  }

  private async pingWallet(): Promise<void> {
    const RETRY_TIMEOUT = 5000;
    try {
      const result = await this.rpcClient.ping();

      if (result?.error == null) {
        await this.getBlockchainInfo();
        return;
      }
    } catch (error) {
      logger.error(error);
    }

    setTimeout(async () => await this.pingWallet(), RETRY_TIMEOUT);
  }

  private async getBlockchainInfo(): Promise<void> {
    const RETRY_TIMEOUT = 2000;
    try {
      const result = await this.rpcClient.getBlockchainInfo();

      if (result) {
        const { headers, blocks } = result;

        // check if wallet is synchronized
        if (headers === blocks) {
          this.blockHeight = headers;
          return await this.streamData(this.blockHeight);
        }
      }
    } catch (error) {
      logger.error(error);
    }

    setTimeout(async () => await this.getBlockchainInfo(), RETRY_TIMEOUT);
  }

  private async streamData(height: number): Promise<void> {
    try {
      const blockHash = await this.rpcClient.getBlockHash(String(height));

      if (blockHash && blockHash !== 'Block height out of range') {
        const block = await this.rpcClient.getBlockByHash(blockHash);
        await this.blockProcessor.process(block);
        logger.info(`Block ${this.blockHeight} has been processed`);
        this.blockHeight += 1;
      }
    } catch (error) {
      logger.error(error);
    }

    const TIMEOUT_BETWEEN_BLOCKS = 10000; // 10s
    setTimeout(async () => await this.streamData(this.blockHeight), TIMEOUT_BETWEEN_BLOCKS);
  }
}
