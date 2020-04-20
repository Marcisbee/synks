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
        jsxFactory: 'Sourc.h',
      },
      hmr: !this.isProduction,
    })
}

const { task, rm } = sparky(Context);

task('default', async (ctx) => {
  const fuse = ctx.getConfig();
  await fuse.runDev();
});

task('build', async (ctx) => {
  rm('./dist');

  ctx.isProduction = true;
  const fuse = ctx.getConfig();
  await fuse.runProd({
    buildTarget: 'ES5',
    bundles: {
      app: { path: 'sourc.js' },
    },
    uglify: false,
  });
  await fuse.runProd({
    buildTarget: 'ES5',
    bundles: {
      app: { path: 'sourc.min.js' },
    },
    uglify: true,
  });
  await fuse.runProd({
    bundles: {
      app: { path: 'sourc.es.js' },
    },
    uglify: false,
  });
  await fuse.runProd({
    bundles: {
      app: { path: 'sourc.es.min.js' },
    },
    uglify: true,
  });
});
