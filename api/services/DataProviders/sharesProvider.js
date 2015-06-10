var moment = require('moment');
var parser = require('./sharesParser.js');
var importer = require('./sharesImporter.js');
var me = {};
var type = sails.config.app.providers.shares.type;
var cacheKey = sails.config.app.providers.shares.cache;

// установка дефолтных значений
me.init = function(cb) {
    async.series([
        // кидаю в базу данные из файлов (если в бд их нет)
        importer.process,
        // кэширую все
        me.createCache,
        // получение из базы
        // me.updateCurrent,
        // получение из парса
        me.update,
    ], cb);
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
            cached[issuer.path] = {
                id: issuer.id,
                general: store.general,
                candles: store.dailyCandles,
                lastCandle: store.lastCandle,
            }
        });
        cache.set(cacheKey, cached);
        cb(null, cached);
    });
}

// получает все акции
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

// получает конкретного тикера из акций
me.get = function(ticker, cb) {
    var cached = cache.get(cacheKey);
    var data = cached ? cached[ticker] : undefined;
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
        console.warn('Запрошен эмитент, которого нет в кэше:', ticker);
    }
    else {
        console.warn('ЯННП');
    }

    // а запрошенный тикер вообще есть?
    Issuer.count({
        type: type,
        path: ticker,
    }, function(err, count) {
        if (err) return cb(err);
        if (count < 1) {
            console.warn('А кто-то урл-ами балуется... запрошен несуществующий тикер:', ticker);
            return cb(null, {});
        }
        console.info('Обновляю кэш не по расписанию!!!');
        me.createCache(function(err, cached) {
            if (err) return cb(err);
            data = cached ? cached[ticker] : undefined;
            if (!data) {
                console.error('Что-то пошло сильно не так...', 'v0x9cv80xc09');
            }
            return cb(null, data);
        });
    });
}

// парс + сохранение + апдейт кэша
// cb(err, list)
me.update = function(cb) {
    async.series([
        me.fixMissedCandles,
    ], function(err) {
        if (err) console.error('Ошибка при обновлении акций', err);
        return cb(err, me.all());
    });
}

// дополняет базу недостающими свечками
// cb(err)
me.fixMissedCandles = function(cb) {
    var now = moment();
    if (typeof cb !== 'function') cb = function() {};
    async.waterfall([
        // вычисляю первую пропущенную дату и список "битых" тикеров
        function(next) {
            Issuer.find({
                type: type,
            }, function(err, tickers) {
                if (err) return next(err);
                var firstMissedDate = moment();
                var tickerMfdIds = [];
                _.each(tickers, function(ticker) {
                    var store = ticker.getStore();
                    var candles = store.dailyCandles;
                    var lastSaved = candles[candles.length - 1];
                    var lastDate = moment(lastSaved.date, 'YYYY-MM-DD');

                    if ((now - lastDate) > 86400000) { // >1 day
                        var mfd_id = store.general.mfd_id;
                        if (!mfd_id) {
                            console.warn('У акции', store.general.name, 'отсутствуют некоторые свечи и не привязан mfd_id');
                        }
                        else {
                            tickerMfdIds.push(mfd_id);
                        }
                        var lastMissedDate = lastDate.add(1, 'days');
                        if (lastMissedDate < firstMissedDate) {
                            firstMissedDate = lastMissedDate;
                        }
                    }
                });
                if (tickerMfdIds.length === 0) {
                    return next('Все свечки актуальны');
                }
                console.info('Missed candles!', 'date:', firstMissedDate.format('DD.MM.YYYY'), 'tkrs:', tickerMfdIds);
                next(null, firstMissedDate, tickerMfdIds, tickers);
            })
        },
        // получаю пропущенные данные из парсера
        function(date, tickers_to_parse, tickers, next) {
            parser.getFromDate(date, tickers_to_parse, function(err, parsed) {
                if (err) return next(err);
                console.log('parsed', _.keys(parsed).length, 'shares candles');
                next(null, parsed, tickers);
            });
        },
        // пишу спаршенные данные в "базу"
        function(parsed, tickers, next) {
            var modified = [];
            _.each(tickers, function(ticker) {
                var ticker_store  = ticker.getStore();
                var ticker_parsed = parsed[ticker_store.general.name];
                if (ticker_parsed) {
                    // парсер получил данные по этому тикеру
                    // мержу свечи
                    var candles_existing = ticker_store.dailyCandles;
                    var candles_parsed   = ticker_parsed.candles;

                    // удаляю из парса уже существующие свечи
                    var lastExisting = candles_existing[candles_existing.length - 1];
                    var i = _.findIndex(candles_parsed, function(cp) {
                        return cp.date === lastExisting.date;
                    });
                    candles_parsed.splice(0, i + 1);

                    // сохраняю измененные данные об эмитенте
                    ticker_store.dailyCandles = candles_existing.concat(candles_parsed);
                    ticker_store.indayCandles = [];
                    ticker_store.lastCandle = {};
                    ticker.setStore(ticker_store);
                    modified.push(ticker);
                }
            });
            console.log('modified', modified.length, 'shares');
            next(null, modified);
        },
        // обновляю дату изменения в базе об измененных тикерах
        function(tickers, next) {
            async.each(tickers, function(t, done) {
                t.save(done);
            }, next);
        },
    ], function(err) {
        if (err === 'Все свечки актуальны') {
            return cb();
        }
        else if (!err) {
            console.info('Пропущенные свечки восстановлены');
            cb();
        }
        else {
            cb(err);
        }
    });
}


module.exports = me;


// получает список дат, для которых отсутствуют свечи
function getMissedDates(ticker) {
    var missedDates = [];
    var store = ticker.getStore();
    var candles = store.dailyCandles;
    var lastSaved = candles[candles.length - 1];
    var date = moment(lastSaved.date, 'YYYY-MM-DD');
    var now = moment();
    if (date > now) return [];
    while ((now - date) > 86400) { // 1 day
        missedDates.push(date.format('YYYY-MM-DD'));
        date = date.add(1, 'days')
    }
    return missedDates;
}
