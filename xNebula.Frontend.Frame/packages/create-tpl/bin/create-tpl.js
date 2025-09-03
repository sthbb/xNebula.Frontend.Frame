#!/usr/bin/env node

import process from 'node:process';

import('../dist/cli.js').then((cli) => {
  cli.run().catch((e) => {
    console.error(e);
    process.exit(1);
  });
});
