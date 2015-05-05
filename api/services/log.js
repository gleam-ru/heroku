var log = sails.config.log.custom;

// хакаем консоль.
var util = require('util');
function formatArgs(args) {
    return [util.format.apply(util.format, Array.prototype.slice.call(args))];
}
console.log = function() {
    log.info.apply(log, formatArgs(arguments));
};
console.info = function() {
    log.info.apply(log, formatArgs(arguments));
};
console.warn = function() {
    log.warn.apply(log, formatArgs(arguments));
};
console.error = function() {
    log.error.apply(log, formatArgs(arguments));
};
console.debug = function() {
    log.debug.apply(log, formatArgs(arguments));
};

// дефолтный логгер, который можно будет вызывать log.*();
// ну или console.log();
module.exports = log;
