#!/usr/bin/env node
/**
 * Validates Maestro flow files for CI (structure + referenced runFlow files).
 * Full device E2E still runs via `pnpm test:e2e` locally or nightly workflow.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const flowsDir = resolve(process.cwd(), '.maestro');

function listYamlFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      return listYamlFiles(fullPath);
    }
    return entry.endsWith('.yaml') || entry.endsWith('.yml') ? [fullPath] : [];
  });
}

function parseAppId(content) {
  const match = content.match(/^appId:\s*(.+)$/m);
  return match?.[1]?.trim();
}

function parseRunFlowRefs(content) {
  const refs = [];
  const regex = /file:\s*(.+)$/gm;
  let match = regex.exec(content);
  while (match) {
    refs.push(match[1].trim());
    match = regex.exec(content);
  }
  return refs;
}

const files = listYamlFiles(flowsDir);
if (files.length === 0) {
  console.error('No Maestro flow files found in .maestro/');
  process.exit(1);
}

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const appId = parseAppId(content);
  if (!appId) {
    console.error(`${file}: missing appId`);
    process.exit(1);
  }

  for (const ref of parseRunFlowRefs(content)) {
    const refPath = join(flowsDir, ref);
    try {
      statSync(refPath);
    } catch {
      console.error(`${file}: missing runFlow reference ${ref}`);
      process.exit(1);
    }
  }
}

console.log(`Validated ${files.length} Maestro flow file(s).`);
