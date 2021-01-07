import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';

// Fixes https://github.com/rollup/plugins/issues/287
const typescriptOverrides = {
  incremental: false,
  outDir: 'build',
  rootDir: 'src',
};

export default [
  {
    input: 'src/server.ts',
    output: {
      dir: 'build',
      format: 'es',
    },
    plugins: [
      typescript(typescriptOverrides)
    ]
  },
  {
    input: 'src/client.ts',
    output: {
      dir: 'build',
      format: 'es',
    },
    plugins: [
      typescript(typescriptOverrides),
      replace({
        '__ROLLUP_REPLACE_WITH_EMPTY_STRING__': '',
      })
    ]
  }
]
