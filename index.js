module.exports = applyTransform;

var through = require('through2');
var applySourceMap = require('vinyl-sourcemaps-apply');
var myTransform = require('tang');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var merge = require('merge');

function applyTransform(options) {
  options = options || {};

  function transform(file, encoding, cb) {
    if (file.isNull()) return cb(null, file);
    if (file.isStream()) return cb(new PluginError('angular-test-utils', 'Streaming not supported'));

    var result;
    var src = file.contents.toString('utf8');

    var transformOptions = merge({
      sourceMap: !!file.sourceMap,
      sourceFileName: file.path,
      appendSourceMapComment: !file.sourceMap
    }, options);

    try {
      result = myTransform(src, transformOptions);
    }
    catch (err) {
      return cb(new PluginError('angular-test-utils', err));
    }

    file.contents = new Buffer(result.code);

    // apply source map to the chain
    if (file.sourceMap && transformOptions.sourceMap && !transformOptions.appendSourceMapComment) {
      applySourceMap(file, result.map);
    }

    this.push(file);
    cb();
  }

  return through.obj(transform);
}