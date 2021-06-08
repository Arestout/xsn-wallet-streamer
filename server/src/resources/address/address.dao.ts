export interface IAddressDao {
  add(address: string): Promise<void>;
}

export class AddressDao implements IAddressDao {
  public async add(address: string): Promise<void> {
    return;
  }
}
