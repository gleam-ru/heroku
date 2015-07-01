var importer = require('./sharesImporter.js');
var me = {};

var type     = sails.config.app.providers.shares.type;
var cacheKey = sails.config.app.providers.shares.cache;



// установка дефолтных значений
me.init = function(cb) {
    async.series([
        // импорт отсутствующих эмитентов (есть в конфиге, но нет в базе)
        // или тех эмитентов, у которых более 4 месяцев пропущенных свечей
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
// cb(err, res)
me.get = function(id, cb) {
    var cached = cache.get(cacheKey);
    var data = cached ? cached[id] : undefined;
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
        console.warn('Запрошен эмитент, которого нет в кэше! ID:', id);
    }
    else {
        console.warn('ЯННП');
    }

    // а запрошенный тикер вообще есть?
    Issuer.count({
        id: id,
    }, function(err, count) {
        if (err) return cb(err);
        if (count < 1) {
            console.warn('А кто-то урл-ами балуется... запрошен несуществующий тикер! ID:', id);
            return cb(null, {});
        }
        console.warn('Обновляю кэш не по расписанию!!!');
        me.createCache(function(err, cached) {
            if (err) return cb(err);
            data = cached ? cached[id] : undefined;
            if (!data) {
                console.error('Что-то пошло сильно не так...');
            }
            return cb(null, data);
        });
    });
}


// cb(err, res);
me.getByHref = function(href, cb) {
    var cached = me.all();
    var found = _.find(cached, function(v, k) {
        return href === v.general.ticker_code;
    });
    if (typeof cb !== 'function') {
        return found;
    }
    if (cached) {
        return cb(null, found);
    }
    // не было кэша? оО
    // Создаю и ищу в нем
    console.warn('Обновляю кэш не по расписанию!!! (2)');
    async.waterfall([
        me.createCache,
        function(cached, next) {
            next(null, _.find(cached, function(v, k) {
                return href === v.general.ticker_code;
            }));
        }
    ], cb)
}



// TODO: может жрать много оперативки
// (не течет, просто жрет)
// cb(err, res)
me.createCache = function(cb) {
    Issuer.find({
        type: type,
    }, function(err, shares) {
        if (err) return cb(err);
        _.each(shares, me.cache);
        var cached = cache.get(cacheKey);
        console.info('current shares updated:', _.keys(cached).length);
        cb(null, cached);
    });
}

me.cache = function(issuer) {
    var cached = cache.get(cacheKey) || {};

    var store = issuer.getStore();
    store.general.href = store.general.ticker_code || issuer.id;
    cached[issuer.id] = {
        id: issuer.id,
        general: store.general,
        reports: store.reports,
        candles: store.dailyCandles,
        lastCandle: store.lastCandle,
        indayCandles: store.indayCandles,
    }

    cache.set(cacheKey, cached);
}



module.exports = me;
