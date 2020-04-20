const { fusebox } = require('fuse-box');

const fuse = fusebox({
  entry: 'examples/index.tsx',
  target: 'browser',
  devServer: true,
  webIndex: {
    template: 'public/index.html',
  },
  compilerOptions: {
    jsxFactory: 'Sourc.h',
  },
  hmr: true,
});

fuse.runDev({
});
