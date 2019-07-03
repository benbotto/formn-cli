#!/usr/bin/env node

import * as yargs from 'yargs';

import { CLIModelGenerator, CLIMigrator } from '../lib/';

const argv = yargs
  .strict()
  .usage('Usage: $0 <command>')

  // Generic options.
  .alias('c', 'connections-file')
  .nargs('c', 1)
  .default('c', './connections.json')
  .describe('c', 'Connections JSON file defining data sources.')

  .alias('f', 'flavor')
  .nargs('f', 1)
  .default('f', 'mysql')
  .describe('f', 'Database flavor.')

  .demandCommand(1, 1)
  // Generate.
  .command(['generate', 'g'], 'Generate entity models.', yargs => {
    return yargs
      .demandCommand(1, 1)
      .positional('entity-dir', {
        describe: 'Directory in which entity models shall be saved.',
        type: 'string'
      })
  })

  // Migrate.
  .command(['migrate', 'm'], 'Migrate a database.', yargs => {
    return yargs
      // Generic migrate options.
      .alias('m', 'migrations-dir')
      .nargs('m', 1)
      .default('m', 'migrations')
      .describe('m', 'Directory in which migration scripts are stored.')

      .demandCommand(1, 1)
      .command('create <migration-name>', 'Create a new migration.', yargs => {
        return yargs
          .positional('migration-name', {
            description: 'The name of the migration.  It will be prefixed with a timestamp.',
            type: 'string'
          })
      })
      .command('up', 'Run all new migrations.')
      .command('down', 'Undo the most recent migration.')
      .command('run <migration-script>', 'Run a script.', yargs => {
        return yargs
          .positional('migration-script', {
            description: 'A script file to run.',
            type: 'string'
          })
      });
  })
  .argv;

// This is the command (generate, etc.).
const command = argv._[0];

// Generic options.
const connFile = argv.c as string;
const flavor   = argv.f as string;

if (command === 'generate' || command === 'g') {
  const entDir   = argv._[1];
  const modelGen = new CLIModelGenerator();

  modelGen
    .generateModels(connFile, flavor, entDir)
    .catch(err => {
      console.error('Error generating models.');
      console.error(err);
    });
}
else if (command === 'migrate' || command === 'm') {
  const migCommand = argv._[1];
  const migDir     = argv.m as string;
  const migrator   = new CLIMigrator(connFile, flavor, migDir);

  switch (migCommand) {
    case 'create':
      const migName = argv.migrationName as string;

      console.log(`Creating migration: "${migName}"`);

      migrator
        .create(migName)
        .catch(console.error);

      break;

    case 'up':
      console.log(`Migrating up.`);

      migrator
        .up()
        .catch(console.error);

      break;
    case 'down':
      console.log(`Migrating down.`);

      migrator
        .down()
        .catch(console.error);

      break;
    case 'run':
      const migScript = argv.migrationScript as string;

      console.log(`Running migration script: "${migScript}"`);

      migrator
        .run(migScript)
        .catch(console.error);

      break;
  }
}

