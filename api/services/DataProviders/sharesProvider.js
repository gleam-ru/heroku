// var moment = require('moment');
// var parser = require('./bondsParser.js');
var importer = require('./sharesImporter.js');
var me = {};
var cacheKey = sails.config.app.providers.shares.cache;

// установка дефолтных значений
me.init = function(cb) {
    async.series([
        importer.process,
        me.createCache,
        // получение из базы
        // me.updateCurrent,
        // получение из парса
        // me.update,
    ], cb)
}

// cb(err, res)
me.createCache = function(cb) {
    importer.provideData(function(err, data) {
        if (err) return cb(err);
        cache.set(cacheKey, data);
        return cb(err, data);
    });
}

me.get = function(cb) {
    var data = cache.get(cacheKey);
    if (typeof cb !== 'function') {
        // нет колбека. Ну нет, так нет. Возвращаю то, что есть.
        return data || [];
    }
    if (!data) {
        console.warn('Кэш запрошен, но не создан. Создаю.');
        return me.createCache(cb);
    }
    else {
        return cb(null, data);
    }
}

module.exports = me;
