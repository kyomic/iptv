import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts'], // 或 'src/index.ts'
  format: ['cjs', 'esm'],
  dts: false,
  clean: true,
  outDir: 'dist',
  banner: {
    js: '#!/usr/bin/env node',
  },
  outExtension({ format }) {
    return format === 'esm' ? { js: '.mjs' } : { js: '.cjs' };
  },
});