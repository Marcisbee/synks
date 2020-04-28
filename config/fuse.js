const { fusebox, sparky } = require('fuse-box');

class Context {
  isProduction;
  getConfig = () =>
    fusebox({
      entry: '../examples/index.tsx',
      target: 'browser',
      devServer: true,
      webIndex: {
        template: '../examples/public/index.html',
      },
      compilerOptions: {
        jsxFactory: 'Synks.h',
      },
      watcher: {
        include: '../src'
      },
      hmr: true,
    })
}

const { task } = sparky(Context);

task('default', async (ctx) => {
  const fuse = ctx.getConfig();
  await fuse.runDev({
    bundles: {
      distRoot: '../.temp',
    },
  });
});
