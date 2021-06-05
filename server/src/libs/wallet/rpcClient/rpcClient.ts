import request from 'request';
import { Block } from '../types/block.interface';
import { Tx } from '../types/tx.interface';
import { IRpcClient } from './rpcClient.interface';
import { BlockchainInfo } from '../types/blockchain-info.interface';

export class RpcClient implements IRpcClient {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  private async getData(method: string, params: any[] = []): Promise<any> {
    const options = {
      url: this.url,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
      }),
    };

    const makeRequest = new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (error) {
          console.error('An error has occurred: ', error);
          return reject(error);
        }

        resolve(JSON.parse(body));
      });
    });

    let timeoutHandle: NodeJS.Timeout;

    const timeoutPromise = new Promise<never>((resolve, reject) => {
      timeoutHandle = setTimeout(() => reject(new Error('Timeout error')), 5000);
    });

    return Promise.race([makeRequest, timeoutPromise])
      .then(result => {
        clearTimeout(timeoutHandle);
        return result;
      })
      .catch(error => {
        throw error;
      });
  }

  public async ping(): Promise<Record<string, string | null>> {
    const data = await this.getData('ping');

    return data;
  }

  public async getBlockHash(height: string): Promise<string> {
    const data = await this.getData('getblockhash', [Number(height)]);

    if (data?.error?.code === -8) {
      return 'Block height out of range';
    }

    if (data?.error?.code === -5) {
      throw new Error('Block not found');
    }

    return data.result;
  }

  public async getBlockByHash(hash: string): Promise<Block> {
    const verbosity = 2;
    const data = await this.getData('getblock', [hash, verbosity]);

    if (data?.error?.code === -5) {
      throw new Error('Block not found');
    }

    return data.result;
  }

  public async getBlockchainInfo(): Promise<BlockchainInfo> {
    const data = await this.getData('getblockchaininfo');

    return data.result;
  }

  public async getRawTransaction(txId: string): Promise<Tx> {
    const data = await this.getData('getrawtransaction', [txId, 1]);

    if (data?.error?.code === -5) {
      throw new Error('Transaction not found');
    }

    return data.result;
  }
}
