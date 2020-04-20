const { fusebox, sparky } = require('fuse-box');

class Context {
  isProduction;
  getConfig = () =>
    fusebox({
      entry: this.isProduction
        ? 'src/index.ts'
        : 'examples/index.tsx',
      target: 'browser',
      devServer: !this.isProduction,
      webIndex: this.isProduction
        ? false
        : {
          template: 'public/index.html',
        },
      compilerOptions: {
        jsxFactory: 'Synks.h',
      },
      hmr: !this.isProduction,
    })
}

const { task, rm } = sparky(Context);

task('default', async (ctx) => {
  const fuse = ctx.getConfig();
  await fuse.runDev();
});
