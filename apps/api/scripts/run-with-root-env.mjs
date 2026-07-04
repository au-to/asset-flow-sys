import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvFile } from 'node:process';
import { spawnSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const rootEnv = resolve(here, '../../../.env');
const localEnv = resolve(here, '../.env');

if (existsSync(rootEnv)) {
  loadEnvFile(rootEnv);
} else if (existsSync(localEnv)) {
  loadEnvFile(localEnv);
}

const commandArgs = process.argv.slice(2);
if (commandArgs.length === 0) {
  console.error('Usage: node run-with-root-env.mjs <command> [args...]');
  process.exit(1);
}

const [command, ...args] = commandArgs;
const result = spawnSync(command, args, {
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
