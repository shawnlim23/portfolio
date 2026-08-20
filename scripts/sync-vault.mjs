#!/usr/bin/env node
// Local-only step: copies publish:true notes from ~/vault/10-permanent into
// src/content/notes, which is committed to this repo as the deploy source of
// truth. Never run in CI — the vault is private and must never be checked out
// on a third-party build machine. If the vault isn't present (e.g. running on
// Cloudflare), this is a no-op that leaves already-committed notes untouched.
// Run locally before pushing: node scripts/sync-vault.mjs
import { readdir, readFile, writeFile, mkdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

const VAULT_PATH = process.env.VAULT_PATH ?? join(homedir(), 'vault');
const SOURCE_DIR = join(VAULT_PATH, '10-permanent');
const DEST_DIR = new URL('../src/content/notes/', import.meta.url).pathname;

function hasPublishFlag(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return false;
  return /^publish:\s*true\s*$/m.test(match[1]);
}

async function main() {
  const vaultPresent = await stat(SOURCE_DIR).then((s) => s.isDirectory()).catch(() => false);
  if (!vaultPresent) {
    console.log(`sync-vault: ${SOURCE_DIR} not found — skipping, using already-committed notes`);
    return;
  }

  await rm(DEST_DIR, { recursive: true, force: true });
  await mkdir(DEST_DIR, { recursive: true });

  const entries = await readdir(SOURCE_DIR, { withFileTypes: true });
  let copied = 0;

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    const raw = await readFile(join(SOURCE_DIR, entry.name), 'utf-8');
    if (!hasPublishFlag(raw)) continue;
    await writeFile(join(DEST_DIR, entry.name), raw, 'utf-8');
    copied++;
  }

  console.log(`sync-vault: copied ${copied} publish:true note(s) from ${SOURCE_DIR}`);
}

main();
