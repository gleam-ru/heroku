var importer = require('./sharesImporter.js');
var me = {};

var type     = sails.config.app.providers.shares.type;
var cacheKey = sails.config.app.providers.shares.cache;



// установка дефолтных значений
me.init = function(cb) {
    async.series([
        // импорт отсутствующих эмитентов (есть в конфиге, но нет в базе)
        // или тех эмитентов, у которых более 4 пропущенных месяцев свечей
        // importer.process,
        // проверяю данные из базы на "целостность" (наличие всех свечек)
        // при необходимости - докачиваю
        // importer.fixMissedCandles,
        // кэширую все
        me.createCache,
        //
    ], cb);
}



// получает всех тикеров
// {ticker: {}, ticker: {}}
me.all = function(cb) {
    var data = cache.get(cacheKey);
    if (typeof cb !== 'function') {
        return data;
    }
    if (data) {
        return cb(null, data);
    }
    console.warn('Обновляю кэш не по расписанию!!!');
    return me.createCache(cb);
}



// получает конкретного тикера
me.get = function(mfd_id, cb) {
    var cached = cache.get(cacheKey);
    var data = cached ? cached[mfd_id] : undefined;
    if (typeof cb !== 'function') {
        // нет колбека. Ну нет, так нет. Возвращаю то, что есть.
        return data;
    }
    if (cached && data) {
        return cb(null, data);
    }
    else if (!cached) {
        console.warn('Кэш запрошен, но не создан.');
    }
    else if (!data) {
        console.warn('Запрошен эмитент, которого нет в кэше:', mfd_id);
    }
    else {
        console.warn('ЯННП');
    }

    // а запрошенный тикер вообще есть?
    Issuer.count({
        type: type,
        path: mfd_id,
    }, function(err, count) {
        if (err) return cb(err);
        if (count < 1) {
            console.warn('А кто-то урл-ами балуется... запрошен несуществующий тикер:', mfd_id);
            return cb(null, {});
        }
        console.info('Обновляю кэш не по расписанию!!!');
        me.createCache(function(err, cached) {
            if (err) return cb(err);
            data = cached ? cached[mfd_id] : undefined;
            if (!data) {
                console.error('Что-то пошло сильно не так...', 'v0x9cv80xc09');
            }
            return cb(null, data);
        });
    });
}



// TODO: может жрать много оперативки
// (не течет, просто жрет)
// cb(err, res)
me.createCache = function(cb) {
    Issuer.find({
        type: type,
    }, function(err, shares) {
        if (err) return cb(err);
        var cached = {};

        _.each(shares, function(issuer) {
            var store = issuer.getStore();
            store.general.href = store.general.ticker || store.general.mfd_id;
            cached[store.general.mfd_id] = {
                id: issuer.id,
                general: store.general,
                candles: store.dailyCandles,
                lastCandle: store.lastCandle,
            }
        });
        cache.set(cacheKey, cached);
        console.info('current shares updated:', _.keys(cached).length);
        cb(null, cached);
    });
}



module.exports = me;
