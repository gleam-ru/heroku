var LRU = require("lru-cache");
var options = {
    max: 500, // MB
    maxAge: 1000 * 60 * 60 * 30 // 1 month
};
var cache = LRU(options);

module.exports = cache;
