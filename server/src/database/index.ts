import { MongoClient, Db } from 'mongodb';
const url = 'mongodb://localhost:27017';
const defaultDbname = 'test';

const client = new MongoClient(url, { useUnifiedTopology: true });

export let DB: Db;

export const connect = async (dbName: string = defaultDbname) => {
  const connection = await client.connect();
  DB = connection.db(dbName);
  return client;
};
