import { cleanEnv, str } from 'envalid';

export function checkNodeVersion() {
  const nodeVersion = Number(process.versions.node.split('.')[0]);
  if (nodeVersion < 14) throw new Error(`App requires node.js version 14 and above`);
}

export function validateEnv() {
  cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'test', 'production'] }),
    RABBITMQ_HOST: str(),
  });
}
