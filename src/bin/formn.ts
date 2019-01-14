#!/usr/bin/env node

import * as yargs from 'yargs';
import * as path from 'path';

const baseDir      = `${process.cwd()}/`;
let   settingsFile = `${baseDir}connections.json`;

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
      .default('c', settingsFile)
      .describe('c', 'Connections JSON file defining data sources.');
  })
  .argv;

class Test {
  print(name: string): void {
    console.log(name);
  }
}

const t = new Test();

// This is the command (generate, etc.).
const command = argv._[0];

console.log(argv);

if (command === 'generate' || command === 'g') {
  const entDir = argv._[1];

  if (path.isAbsolute(argv.c as string))
    settingsFile = path.resolve(argv.c as string);
  else
    settingsFile = path.resolve(baseDir + argv.c);

  console.log(`Generate entities and write to ${entDir}.`);
  console.log(`Connections file ${settingsFile}.`);
}

