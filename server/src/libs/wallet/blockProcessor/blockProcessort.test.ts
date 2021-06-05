import { BlockProcessor, MIN_WHALE_TRANSACTION_VALUE, WHALE_TRANSACTION_TYPE, BURN_TRANSACTION_TYPE, BURNED_COINS_ADDRESS } from './blockProcessor';

const rabbitMqProducerMock = {
  sendMessage: jest.fn(),
  getBroker: jest.fn(),
};

const MOCK_ADDRESS = 'Xi1BEVHFRYg1QQfrNJF8L9yXvREAADxCLk';

const blockMock = {
  hash: '267dba6892ab0d293e1a7c735733f1acf063005449243969fbf7b7b1eda9a161',
  height: 1680210,
  time: 1621891409,
  tx: [
    {
      txid: '7b4d648925d37bae23cb8b8867d9da40d670be1ad488ee07e46414954112c9a7',
      vout: [
        {
          value: 2542.5,
          n: 2,
          scriptPubKey: {
            type: 'pubkeyhash',
            addresses: [MOCK_ADDRESS],
          },
        },
      ],
      vin: [
        {
          txid: '00614cfdf1194922f7a3a01a7153e9a070b391fd2c8378b7bc61774d8922d405',
          vout: 0,
        },
      ],
    },
  ],
};

describe('BlockProcessor', () => {
  it('should not send a message to RabbitMQ', () => {
    const rpcClient = {
      ping: jest.fn(),
      getBlockchainInfo: jest.fn(),
      getBlockHash: jest.fn(),
      getBlockByHash: jest.fn(),
      getRawTransaction: jest.fn(),
    };
    const blockProcessor = new BlockProcessor(rabbitMqProducerMock, rpcClient);

    blockProcessor.process(blockMock);

    expect(rabbitMqProducerMock.sendMessage).toHaveBeenCalledTimes(0);
  });

  describe(`${WHALE_TRANSACTION_TYPE}`, () => {
    it(`should send a ${WHALE_TRANSACTION_TYPE} message to RabbitMQ if sender and receiver addresses are different`, async () => {
      const mockTransaction = {
        vout: [
          {
            value: 123,
            n: 0,
            scriptPubKey: {
              type: 'pubkeyhash',
              addresses: ['7fzRzUwiEgATm72XKdB1XGApZasRwsfFpZ'],
            },
          },
        ],
        vin: [],
        txid: '80db7b98fc3ce306ad637db98b45fce5b829369b1f2f369082ee0e46ed7eebb7',
      };
      const rpcClient = {
        ping: jest.fn(),
        getBlockchainInfo: jest.fn(),
        getBlockHash: jest.fn(),
        getBlockByHash: jest.fn(),
        getRawTransaction: jest.fn().mockResolvedValue(mockTransaction),
      };
      const blockProcessor = new BlockProcessor(rabbitMqProducerMock, rpcClient);
      blockMock.tx[0].vout[0].value = MIN_WHALE_TRANSACTION_VALUE;

      await blockProcessor.process(blockMock);

      expect(rabbitMqProducerMock.sendMessage).toHaveBeenCalledTimes(1);
      expect(rabbitMqProducerMock.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: WHALE_TRANSACTION_TYPE,
          transactionValue: MIN_WHALE_TRANSACTION_VALUE,
          transactionId: blockMock.tx[0].txid,
        }),
      );
    });

    it(`should not send a ${WHALE_TRANSACTION_TYPE} message to RabbitMQ if sender and receiver addresses are the same`, async () => {
      const mockTransaction = {
        vout: [
          {
            value: 123,
            n: 0,
            scriptPubKey: {
              type: 'pubkeyhash',
              addresses: [MOCK_ADDRESS],
            },
          },
        ],
        vin: [],
        txid: '80db7b98fc3ce306ad637db98b45fce5b829369b1f2f369082ee0e46ed7eebb7',
      };
      const rpcClient = {
        ping: jest.fn(),
        getBlockchainInfo: jest.fn(),
        getBlockHash: jest.fn(),
        getBlockByHash: jest.fn(),
        getRawTransaction: jest.fn().mockResolvedValue(mockTransaction),
      };
      const blockProcessor = new BlockProcessor(rabbitMqProducerMock, rpcClient);
      blockMock.tx[0].vout[0].value = MIN_WHALE_TRANSACTION_VALUE;

      await blockProcessor.process(blockMock);

      expect(rabbitMqProducerMock.sendMessage).toHaveBeenCalledTimes(0);
    });
  });

  describe(`${BURN_TRANSACTION_TYPE}`, () => {
    it(`should not send a ${BURN_TRANSACTION_TYPE} message to RabbitMQ`, async () => {
      const rpcClient = {
        ping: jest.fn(),
        getBlockchainInfo: jest.fn(),
        getBlockHash: jest.fn(),
        getBlockByHash: jest.fn(),
        getRawTransaction: jest.fn(),
      };
      const blockProcessor = new BlockProcessor(rabbitMqProducerMock, rpcClient);
      blockMock.tx[0].vout[0].value = 1;

      await blockProcessor.process(blockMock);

      expect(rabbitMqProducerMock.sendMessage).toHaveBeenCalledTimes(0);
    });

    it(`should send a ${BURN_TRANSACTION_TYPE} message to RabbitMQ`, async () => {
      const rpcClient = {
        ping: jest.fn(),
        getBlockchainInfo: jest.fn(),
        getBlockHash: jest.fn(),
        getBlockByHash: jest.fn(),
        getRawTransaction: jest.fn(),
      };
      const blockProcessor = new BlockProcessor(rabbitMqProducerMock, rpcClient);
      blockMock.tx[0].vout[0].scriptPubKey.addresses[0] = BURNED_COINS_ADDRESS;

      await blockProcessor.process(blockMock);

      expect(rabbitMqProducerMock.sendMessage).toHaveBeenCalledTimes(1);
      expect(rabbitMqProducerMock.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: BURN_TRANSACTION_TYPE,
          transactionValue: blockMock.tx[0].vout[0].value,
          transactionId: blockMock.tx[0].txid,
        }),
      );
    });
  });
});
