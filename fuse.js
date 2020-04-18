const { fusebox } = require('fuse-box');

const fuse = fusebox({
  entry: 'src/index.tsx',
  target: 'browser',
  devServer: true,
  webIndex: {
    template: 'index.html',
  },
  compilerOptions: {
    jsxFactory: 'Radi.h',
  },
  hmr: true,
});

fuse.runDev({
});
