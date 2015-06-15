var moment = require('moment');
var parser = require('./sharesParser.js');
var me = {};

var type        = sails.config.app.providers.shares.type;
var cacheKey    = sails.config.app.providers.shares.cache;
var limitations = sails.config.app.providers.shares.parserLimitations; // если попросить слишком много данных сразу, то мфд выкинет по таймауту
var bindings    = sails.config.app.providers.shares.mfd;




// установка дефолтных значений
me.init = function(cb) {
    async.series([
        // заполяет базу акциями из конфиг файла
        me.initialFill,
        // заполняю эмитентов, у которых отсутствует большое количество свечек (вероятно, они новые)
        // me.fixMissedCandles_individual,
        // проверяю данные из базы на "целостность" (наличие всех свечек)
        me.fixMissedCandles,
        // кэширую все
        me.createCache,
        // обновляю крайнюю свечу всех эмитентов
        // me.getLastCandle,
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


me.initialFill = function(cb) {
    // немного преобразую данные для удобства работы
    var mfd = _.map(bindings, function(v, k) {
        return {
            id: v,
            name: k,
        }
    });
    async.eachSeries(mfd, function(ticker, done) {
        // если тикер существует, то он выглядит так:
        var existing = {
            type: type,
            path: ticker.id,
        };
        Issuer.findOne(existing, function(err, found) {
            if (err) return done(err);
            if (found) return done();
            Issuer.create(existing, function(err, created) {
                if (err) return done(err);
                console.info('Эмитент создан!', ticker.id, ticker.name);
                created.setStore({
                    general: {
                        mfd_id : ticker.id,
                        name   : ticker.name,
                    },
                    dailyCandles: [],
                    indayCandles: [],
                    lastCandle: {},
                });
                created.save(done);
            });
        });
    }, cb)
}




// дополняет базу недостающими свечками
// cb(err)
me.fixMissedCandles = function(cb) {
    console.log('fix missed candles');
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
                    var lastDate = lastSaved ? moment(lastSaved.date, 'YYYY-MM-DD') : moment(new Date(1900, 1, 1));

                    var range = now - lastDate;
                    if (range > limitations.time) {
                        // придется докачать слишком много отсутствующих данных
                        // в этом случае мфд выкинет по таймауту
                        // поэтому нужно немного изменить "стиль" получения данных
                        // (просить по одному эмитенту)
                        // по-умолчанию это происходит при старте сервера (me.init -> me.fixMissedCandles_individual)
                        console.warn('У акции', store.general.name, 'отсутствует много свечей!!! (они не будут докачаны)');
                    }
                    else if (range > 86400000) { // >1 day
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
                return next(null, firstMissedDate, tickerMfdIds, tickers);
            })
        },
        // получаю пропущенные данные из парсера
        function(date, tickers_to_parse, tickers, next) {
            parser.getFromDate(date, tickers_to_parse, function(err, parsed) {
                if (err) return next(err);
                console.log('parsed', _.keys(parsed).length, 'shares candles');
                return next(null, parsed, tickers);
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

                    // сохраняю измененные данные об эмитенте
                    ticker_store.dailyCandles = mergeCandles(candles_existing, candles_parsed);
                    ticker_store.indayCandles = [];
                    ticker_store.lastCandle = {};
                    ticker.setStore(ticker_store);
                    modified.push(ticker);
                }
            });
            console.log('modified', modified.length, 'shares');
            return next(null, modified);
        },
        // обновляю дату изменения в базе об измененных тикерах
        function(tickers, next) {
            async.each(tickers, function(t, done) {
                t.save(done);
            }, next);
        },
    ], function(err) {
        if (!err) {
            console.info('Пропущенные свечки восстановлены');
            return cb();
        }
        else if (err === 'Все свечки актуальны') {
            return cb();
        }
        else {
            return cb(err);
        }
    });
}



// заполняет пропущенные свечи отдельным запросом для каждого эмитента
// cb(err)
// TODO: можно нефигово оптимизировать:
// (смотри место вызова и дважды не читай одни и те же файлы)
// но подразумевается, что этот метод отработает всего один раз...
me.fixMissedCandles_individual = function(cb) {
    var now = moment();
    console.log('individual fix missed candles');
    console.warn('Оптимизируй меня!');
    Issuer.find({
        type: type,
    }, function(err, tickers) {
        if (err) return cb(err);
        // получаю данные по "старым" отсутствующим свечам
        async.each(tickers, function(ticker, done) {
            var store = ticker.getStore();
            var candles_existing = store.dailyCandles;
            var lastSaved = candles_existing[candles_existing.length - 1];
            var lastDate = lastSaved ? moment(lastSaved.date, 'YYYY-MM-DD') : moment(new Date(1900, 1, 1));
            // только для "больших" отсутствующих кусков
            if ((now - lastDate) >= limitations.time) {
                var mfd_id = store.general.mfd_id;
                if (!mfd_id) {
                    console.warn('У акции', store.general.name, 'отсутствует много свечей и не привязан mfd_id');
                }
                else if (now - moment(ticker.updatedAt) > sails.config.app.providers.shares.getAgainTimeout) {
                    parser.getTicker(mfd_id, function(err, candles_parsed) {
                        if (err) return done(err);
                        store.dailyCandles = mergeCandles(candles_existing, candles_parsed);
                        store.indayCandles = [];
                        store.lastCandle = {};
                        ticker.setStore(store);
                        return ticker.save(done);
                    });
                    return;
                }
                else {
                }
            }
            return done();
        }, cb);
    })
}



//  ╔═╗  ╦═╗  ╦  ╦  ╦  ╔═╗  ╔╦╗  ╔═╗
//  ╠═╝  ╠╦╝  ║  ╚╗╔╝  ╠═╣   ║   ║╣
//  ╩    ╩╚═  ╩   ╚╝   ╩ ╩   ╩   ╚═╝


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

// "умный" конкат - дописывает только несуществующие свечи
function mergeCandles(_old, _new) {
    var lastExisting = _old[_old.length - 1] || {};
    var i = _.findIndex(_new, function(candle) {
        return candle.date === lastExisting.date;
    });
    _new.splice(0, i + 1);
    return _old.concat(_new);
}



module.exports = me;
