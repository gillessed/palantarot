import yargs, { exit } from 'yargs';

const argv = yargs
  .option('runs', {
    alias: 'r',
    type: 'number',
    default: 100,
  })
  .option('bots', {
    alias: 'b',
    type: 'string',
  })
  .options('out', {
    alias: 'f',
    type: 'string',
  }).argv;

console.log('Tarot bot simulator');

if (argv.bots == null) {
  console.log('Missing args: bots');
  exit(1, new Error('Missing args: bots'));
}

if (argv.out == null) {
  console.log('Missing args: out');
  exit(1, new Error('Missing args: out'));
}
