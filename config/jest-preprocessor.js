const { transform } = require('sucrase');

module.exports = {
  process(src, path) {
    const result = transform(src, {
      filePath: path,
      sourceMapOptions: {
        compiledFilename: path.replace(/.*\//, ''),
      },
      transforms: ['typescript', 'imports'],
    });

    return { code: result.code, map: result.sourceMap };
  }
};
