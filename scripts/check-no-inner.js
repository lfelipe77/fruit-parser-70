#!/usr/bin/env node

import { glob } from 'glob';
import { readFileSync } from 'fs';

const patterns = ['src/**/*.{ts,tsx,js,jsx}'];
const forbidden = ['!inner', '%21inner'];

async function checkFiles() {
  const files = await glob(patterns);
  let violations = 0;

  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    for (const pattern of forbidden) {
      if (content.includes(pattern)) {
        console.error(`❌ Found forbidden pattern "${pattern}" in ${file}`);
        violations++;
      }
    }
  }

  if (violations > 0) {
    console.error(`\n💥 Found ${violations} forbidden pattern(s). Build failed.`);
    process.exit(1);
  } else {
    console.log('✅ No forbidden patterns found');
  }
}

checkFiles().catch(console.error);