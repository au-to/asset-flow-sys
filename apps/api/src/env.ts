import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnvFile } from 'node:process';

const envCandidates = [
  resolve(__dirname, '../../../.env'),
  resolve(__dirname, '../.env'),
];

for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    loadEnvFile(envPath);
    break;
  }
}
