import { WalletStreamer } from './walletStreamer';

const blockProcessor = {
  process: jest.fn(),
};

jest.useFakeTimers();
describe('walletStreamer', () => {
  it('should not make a call for blockchain info if ping returns an error', async () => {
    const rpcClient = {
      ping: jest.fn().mockResolvedValue({ error: 'Wallet not ready' }),
      getBlockchainInfo: jest.fn(),
      getBlockHash: jest.fn(),
      getBlockByHash: jest.fn(),
      getRawTransaction: jest.fn(),
    };
    const walletStreamer = new WalletStreamer(rpcClient, blockProcessor);

    await walletStreamer.start();
    jest.runOnlyPendingTimers();

    expect(rpcClient.ping).toHaveBeenCalledTimes(1);
    expect(rpcClient.getBlockchainInfo).toHaveBeenCalledTimes(0);
  });

  // it('should make a call for blockchain info if ping returns an error', async () => {
  //   const rpcClient = {
  //     ping: jest.fn().mockResolvedValue({ error: null }),
  //     getBlockchainInfo: jest.fn().mockResolvedValue({ headers: 1, blocks: 1 }),
  //     getBlockHash: jest.fn().mockResolvedValue('hash'),
  //     getRawTransaction: jest.fn(),
  //     getBlockByHash: jest.fn().mockResolvedValue({
  //       hash: 'hash',
  //       height: 1,
  //       time: 1,
  //       tx: [],
  //     }),
  //   };
  //   const blockProcessor = {
  //     process: jest.fn(),
  //   };
  //   const walletStreamer = new WalletStreamer(rpcClient, blockProcessor);

  //   await walletStreamer.start();
  //   jest.runOnlyPendingTimers();

  //   expect(blockProcessor.process).toHaveBeenCalledTimes(1);
  // });
});
