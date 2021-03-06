"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var _url = _interopRequireDefault(require("url"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * 处理include标签，将include的内容替换成真实内容
 * @param {工作目录} cwd 
 */
var INCLUDE_REG = /<include\s+(.*\s)?src\s*=\s*"(\S+)".*><\/include>/g;

function _default(cwd) {
  return function (req, res, next) {
    var pathname = _url["default"].parse(req.originalUrl).pathname;

    fs.readFile(sysPath.join(cwd, pathname), 'utf8', function (err, data) {
      if (err) {
        next(err);
      } else {
        var content = data.toString();
        content = content.replace(INCLUDE_REG, function ($0, $1, $2, $3) {
          try {
            return fs.readFileSync(sysPath.join(cwd, _url["default"].resolve(pathname, $2)), 'utf8');
          } catch (err) {
            error(err.message);
            return '';
          }
        });
        res.type('html').send(Buffer.from(content, 'utf8'));
      }
    });
  };
}