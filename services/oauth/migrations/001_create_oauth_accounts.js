/**
 * @param {import('knex').Knex} knex
 */
export function up(knex) {
  return knex.schema.createTable('oauth_accounts', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('user_id').notNullable(); // UUID from Auth Service
    table.string('provider', 20).notNullable(); // 'google', 'github'
    table.string('provider_id', 255).notNullable();
    table.text('access_token').nullable();
    table.text('refresh_token').nullable();
    table.string('email', 255).nullable();
    table.jsonb('profile_data').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.unique(['provider', 'provider_id']);
    table.index('user_id');
  });
}

/**
 * @param {import('knex').Knex} knex
 */
export function down(knex) {
  return knex.schema.dropTableIfExists('oauth_accounts');
}
