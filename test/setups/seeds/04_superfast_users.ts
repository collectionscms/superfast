import { Knex } from 'knex';
import { getHelpers } from '../../../src/api/database/helpers/index.js';

export const seed = async (database: Knex): Promise<void> => {
  const helpers = getHelpers(database);

  return await database('collections_users').insert([
    {
      name: 'Michael Schumacher',
      email: 'michael@collections.dev',
      password: 'password',
      is_active: true,
      api_key: '1111-2222-3333',
      role_id: 1,
      created_at: helpers.date.writeTimestamp(new Date().toISOString()),
      updated_at: helpers.date.writeTimestamp(new Date().toISOString()),
    },
  ]);
};
