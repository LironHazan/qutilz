const esbuild = require('esbuild');
const { nodeExternalsPlugin } = require('esbuild-node-externals');

esbuild.build({
    entryPoints: ['src/reporter/reporter.ts'],
    bundle: true,
    minify: true,
    platform: 'node',
    sourcemap: true,
    outfile: 'lib/@qutilz/reporter.js',
    plugins: [nodeExternalsPlugin()],
}).catch((_) => process.exit(1));
