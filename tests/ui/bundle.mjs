// AI-assisted: Cursor Grok 4.7, reviewed by C
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const esbuildPath = process.env.ESBUILD_MAIN;
if (!esbuildPath) throw new Error('Set ESBUILD_MAIN to esbuild lib/main.js');
const esbuild = await import(pathToFileURL(esbuildPath).href);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const runtime = path.join(root, 'tests/ui/mocks/runtime.ts');
const empty = path.join(root, 'tests/ui/mocks/empty.ts');

await esbuild.build({
  absWorkingDir: root,
  entryPoints: ['tests/ui/preview.ts'],
  bundle: true,
  outfile: 'tests/ui/preview-bundle.js',
  format: 'esm',
  platform: 'browser',
  plugins: [{
    name: 'stub-core',
    setup(build) {
      build.onResolve({ filter: /(?:^|[/\\])core[/\\]index(?:\.ts)?$|(?:^|[/\\])core[/\\]types(?:\.ts)?$|(?:^|[/\\])app[/\\]context(?:\.ts)?$/ }, (args) => {
        const spec = args.path.replaceAll('\\', '/');
        if (spec.includes('core/index')) return { path: runtime };
        return { path: empty };
      });
    },
  }],
});
console.log('preview bundle ready');
