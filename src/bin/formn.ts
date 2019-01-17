#!/usr/bin/env node

import * as yargs from 'yargs';

import { CLIModelGenerator } from '../lib/';

const argv = yargs
  .strict()
  .usage('Usage: $0 <command>')
  .demandCommand(1, 1)
  .command(['generate', 'g'], 'Generate entity models.', yargs => {
    return yargs
      .demandCommand(1, 1)
      .positional('entity-dir', {
        describe: 'Directory in which entity models shall be saved.',
        type: 'string'
      })

      .alias('c', 'connections-file')
      .nargs('c', 1)
      .default('c', './connections.json')
      .describe('c', 'Connections JSON file defining data sources.')

      .alias('f', 'flavor')
      .nargs('f', 1)
      .default('f', 'mysql')
      .describe('f', 'Database flavor.');
  })
  .argv;

// This is the command (generate, etc.).
const command = argv._[0];

if (command === 'generate' || command === 'g') {
  const connFile = argv.c as string;
  const flavor   = argv.f as string;
  const entDir   = argv._[1];
  const modelGen = new CLIModelGenerator();

  modelGen
    .generateModels(connFile, entDir, flavor)
    .catch(err => {
      console.error('Error generating models.');
      console.error(err);
    });
}

