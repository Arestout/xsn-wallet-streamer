import { DB } from '../../database';

DB.createCollection('addresses', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['telegram_id', 'addresses'],
      properties: {
        telegram_id: {
          bsonType: 'string',
          description: 'must be a string and is required',
        },
        addresses: {
          bsonType: ['string'],
          description: 'address should be a string',
        },
      },
    },
  },
});
