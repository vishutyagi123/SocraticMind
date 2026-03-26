/**
 * @param {import('knex').Knex} knex
 */
export function up(knex) {
  return knex.schema
    .createTable('fingerprint_snapshots', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.uuid('user_id').notNullable(); // No FK here due to microservices!
      table.uuid('interview_id').nullable();
      table.decimal('conceptual_depth', 5, 2).defaultTo(0);
      table.decimal('confidence_accuracy', 5, 2).defaultTo(0);
      table.decimal('consistency', 5, 2).defaultTo(0);
      table.decimal('technical_accuracy', 5, 2).defaultTo(0);
      table.decimal('surface_knowledge', 5, 2).defaultTo(0);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.index('user_id');
    })
    .createTable('jd_coverage', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.uuid('user_id').notNullable();
      table.uuid('interview_id').nullable();
      table.string('jd_title', 255).nullable();
      table.string('topic', 255).notNullable();
      table.decimal('coverage_pct', 5, 2).defaultTo(0);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.index('user_id');
    })
    .createTable('learning_progress', (table) => {
        table.uuid('id').primary().defaultTo(knex.fn.uuid());
        table.uuid('user_id').notNullable();
        table.string('topic', 255).notNullable();
        table.decimal('mastery_level', 5, 2).defaultTo(0);
        table.integer('sessions_count').defaultTo(0);
        table.string('status', 20).defaultTo('needs_work'); // 'needs_work', 'in_progress', 'mastered'
        table.timestamp('last_session_at').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.unique(['user_id', 'topic']);
        table.index('user_id');
    });
}

/**
 * @param {import('knex').Knex} knex
 */
export function down(knex) {
  return knex.schema
    .dropTableIfExists('learning_progress')
    .dropTableIfExists('jd_coverage')
    .dropTableIfExists('fingerprint_snapshots');
}
