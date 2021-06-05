import { Block } from '../types/block.interface';
import { Tx, Vout, VoutResult } from '../types/tx.interface';
import { IRabbitMqProducer } from '../../rabbitmq/types/rabbitmq.interface';
import { IBlockProcessor } from './blockProcessor.interface';
import { IRpcClient } from '../rpcClient/rpcClient.interface';
import { Vin } from './../types/tx.interface';

export const BURNED_COINS_ADDRESS = 'XmPe9BHRsmZeThtYF34YYjdnrjmcAUn8bC';
export const MIN_WHALE_TRANSACTION_VALUE = 30_000;
export const WHALE_TRANSACTION_TYPE = 'whale_transaction';
export const BURN_TRANSACTION_TYPE = 'burn_transaction';

export class BlockProcessor implements IBlockProcessor {
  private rabbitMqProducer: IRabbitMqProducer;
  private rpcClient: IRpcClient;

  constructor(rabbitMqProducer: IRabbitMqProducer, rpcClient: IRpcClient) {
    this.rabbitMqProducer = rabbitMqProducer;
    this.rpcClient = rpcClient;
  }

  public async process(block: Block): Promise<void> {
    for (const transaction of block.tx) {
      for (const vout of transaction.vout) {
        const voutResult = await this.processVout(vout, transaction);

        if (voutResult) {
          const message = {
            headers: {
              event_id: Date.now().toString(),
              event_version: '1',
              event_name: voutResult.type,
              event_time: Date.now().toString(),
              producer: 'stakenet-wallet-streamer',
            },
            ...voutResult,
            transactionId: transaction.txid,
          };

          await this.rabbitMqProducer.sendMessage(message);
        }
      }
    }
  }

  private async processVout(vout: Vout, transaction: Tx): Promise<VoutResult | void> {
    if (vout?.scriptPubKey?.addresses) {
      const { value } = vout;
      const address = vout.scriptPubKey.addresses[0];

      if (address === BURNED_COINS_ADDRESS) {
        return {
          type: BURN_TRANSACTION_TYPE,
          transactionValue: value,
        };
      }

      if (value >= MIN_WHALE_TRANSACTION_VALUE) {
        // check if vin and vout addresses are the same.
        const isInternalTransaction = await this.processVin(transaction.vin, address);

        if (!isInternalTransaction) {
          return {
            type: WHALE_TRANSACTION_TYPE,
            transactionValue: value,
          };
        }
      }
    }
  }

  private async processVin(vins: Vin[], voutAddress: string): Promise<boolean> {
    for (const vin of vins) {
      const transaction = await this.rpcClient.getRawTransaction(vin.txid);
      const vout = transaction.vout.find(vout => vout.n === vin.vout);
      const vinAddress = vout.scriptPubKey.addresses[0];

      if (vinAddress === voutAddress) {
        return true;
      }
    }

    return false;
  }
}
