const esbuild = require('esbuild');
const { nodeExternalsPlugin } = require('esbuild-node-externals');

esbuild.build({
    entryPoints: ['src/test-gen/index.ts'],
    bundle: true,
    minify: true,
    platform: 'node',
    sourcemap: true,
    outfile: 'lib/@qutilz/test-gen.js',
    plugins: [nodeExternalsPlugin()],
}).catch((_) => process.exit(1));
