export interface Vout {
  value: number;
  n: number;
  scriptPubKey: scriptPubKey;
}

export interface VoutResult {
  type: string;
  transactionValue: number;
}

export interface Vin {
  txid: string;
  vout: number;
}

export interface Tx {
  vout: Vout[];
  vin: Vin[];
  txid: string;
}

interface scriptPubKey {
  type: string;
  addresses: string[];
}
