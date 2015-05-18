var LRU = require("lru-cache");
var options = {
    max: 500, // MB
    maxAge: 1000 * 60 * 60 * 30 // 1 month
};
var cache = LRU(options);

cache.init = function(cb) {
    provider.bonds.get();
    log.verbose('cache inited');
    if (cb) cb();
}

module.exports = cache;
