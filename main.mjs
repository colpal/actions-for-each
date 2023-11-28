#!/usr/bin/env node
import * as core from '@actions/core';
import { globby } from 'globby';

(async () => {
  const patterns = core.getMultilineInput('patterns', { required: true });
  const matches = await globby(patterns, {
    expandDirectories: false,
    gitignore: true,
    markDirectories: true,
    onlyFiles: false,
  });
  core.debug(JSON.stringify({ patterns, matches }, null, 2));
  core.setOutput('matches', matches);
})();
