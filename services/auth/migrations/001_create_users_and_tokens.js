/**
 * @param {import('knex').Knex} knex
 */
export function up(knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.string('email', 255).unique().notNullable();
      table.string('password_hash', 255).nullable(); // null for OAuth-only users
      table.string('name', 255).notNullable();
      table.text('avatar_url').nullable();
      table.enum('role', ['student', 'instructor', 'admin']).defaultTo('student');
      table.boolean('is_verified').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('refresh_tokens', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('token_hash', 255).notNullable();
      table.uuid('token_family').notNullable();
      table.string('device_id', 255).nullable();
      table.jsonb('device_info').nullable();
      table.timestamp('expires_at').notNullable();
      table.timestamp('revoked_at').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());

      table.index('user_id');
      table.index('token_family');
    });
}

/**
 * @param {import('knex').Knex} knex
 */
export function down(knex) {
  return knex.schema
    .dropTableIfExists('refresh_tokens')
    .dropTableIfExists('users');
}
