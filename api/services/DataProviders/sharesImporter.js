var moment   = require('moment');
var parser   = require('./sharesParser.js');
var me = {};

var type        = sails.config.app.providers.shares.type;
var limitations = sails.config.app.providers.shares.parserLimitations; // если попросить слишком много данных сразу, то мфд выкинет по таймауту

me.process = function(cb) {
    Q.resolve()
        .then(function() {
            return me.fixMissedCandles_individual();
        })
        .then(function(shares) {
            return me.fixMissedCandles(shares);
        })
        .then(function() {
            return me.updateIndayCandles();
        })
        .catch(function(err) {
            console.error('shares importer error!')
            console.error(err, err.stack)
        })
        .nodeify(cb)
        ;
};


// полное обновление всех свечек с отбрасыванием старых
me.totalUpdate = function() {
    var now = moment();
    return Q()
        .then(function() {
            return Share.find({dead: false});
        })
        .then(function(shares) {
            console.info('удаляю все исторические свечи: share history 1d');
            return Q()
                .then(function() {
                    return Candles.destroy({
                        type: 'share history 1d',
                    });
                })
                .then(function() {
                    return shares;
                })
                ;
        })
        .then(function(shares) {
            var tasks = [];
            _.each(shares, function(share) {
                var mfd_id = share.mfd_id;

                if (!mfd_id) {
                    console.warn('У акции', share.name, 'отсутствует много свечей и не привязан mfd_id');
                    return;
                }

                //
                if (sails.config.app.providers.shares.timeToForget < (now - moment(share.updatedAt))) {
                    console.info('"забываем" эмитента:', share.name);
                    tasks.push(Q.resolve()
                        .then(function() {
                            share.die();
                            return;
                        }))
                        ;
                    return;
                }

                tasks.push(
                    Q.ninvoke(parser, 'getTicker', mfd_id)
                    .then(function(candles_parsed) {
                        return Candles.create({
                            type: 'share history 1d',
                            share: share,
                            data: candles_parsed,
                        });
                    })
                    .then(function(createdCandles) {
                        share.candlesHistory = createdCandles;
                        var lastCandle = _.last(createdCandles.data);
                        if (lastCandle) {
                            share.lastCandle = lastCandle;
                        }
                        share.save();
                    })
                );
            });
            return Q
                .all(tasks)
                .then(function() {
                    return shares;
                })
                ;
        })
        ;
};

// дропаю существующие и создаю новые свечи
// с загрузкой с мфд
me.forceUpdateCandles = function(shares) {
    console.log('force update candles');

    var now = moment();
    return Q.resolve()
        .then(function() {
            if (!shares || !shares.length) {
                return [];
            }
            return shares;
        })
        .then(function(shares) {
            var tasks = [];
            _.each(shares, function(share) {
                var task = Q();
                var mfd_id = share.mfd_id;
                if (!mfd_id) {
                    console.warn('У акции', share.name, '(code:', share.code, ') не привязан mfd_id');
                    return;
                }
                if (now - moment(share.updatedAt) > sails.config.app.providers.shares.timeToForget) {
                    console.info('"забываем" эмитента:', share.name);
                    tasks.push(share.die);
                    return;
                }
                if (!share.candlesHistory) {
                    console.warn('У акции', share.name, '(code:', share.code, ') отсутствует candlesHistory');
                    task = task.then(function() {
                        return Candles.destroy({
                            type: 'share history 1d',
                            share: share.id,
                        });
                    })
                    .then(function() {
                        return Candles.create({
                            type: 'share history 1d',
                            share: share.id,
                        });
                    })
                    .then(function(history) {
                        share.candlesHistory = history;
                    })
                    ;
                }

                task = task.then(function() {
                    return Q.ninvoke(parser, 'getTicker', mfd_id)
                })
                .then(function(candles_parsed) {
                    var merged = mergeCandles([], candles_parsed);
                    share.candlesHistory.data = merged;
                    share.lastCandle = _.last(merged);
                    return share.save()
                        .then(function() {
                            return share;
                        })
                        ;
                })
                ;

                tasks.push(task);
            });
            return Q
                .all(tasks)
                .then(function(shares) {
                    return shares;
                })
                ;
        });
};

// заполняет пропущенные свечи отдельным запросом для каждого эмитента
me.fixMissedCandles_individual = function() {
    console.log('individual fix missed candles');

    var now = moment();
    return Q.resolve()
        .then(function() {
            console.log('get all shares from db...');
            return Share.find({dead: false}).populateAll();
        })
        .then(function(shares) {
            var tasks = [];
            _.each(shares, function(share) {
                var candles_existing = share.candlesHistory && share.candlesHistory.data || [];
                var lastSaved = _.last(candles_existing);
                var lastDate = lastSaved ? moment(lastSaved.d, ddf) : moment(new Date(1900, 1, 1));
                if ((now - lastDate) < limitations.time) {
                    return;
                }
                var mfd_id = share.mfd_id;
                if (!mfd_id) {
                    console.warn('У акции', share.name, 'отсутствует много свечей и не привязан mfd_id');
                    return;
                }
                else if (now - moment(share.updatedAt) < sails.config.app.providers.shares.timeToForget) {
                    tasks.push(Q
                        .ninvoke(parser, 'getTicker', mfd_id)
                        .then(function(candles_parsed) {
                            var merged = mergeCandles(candles_existing, candles_parsed);
                            _.extend(share.candlesHistory, {data: merged});
                            share.lastCandle = _.last(merged);
                            return share.save();
                        }))
                    return;
                }
                else {
                    console.info('"забываем" эмитента:', share.name)
                    tasks.push(Q.resolve()
                        .then(function() {
                            share.die();
                            return;
                        }))
                    return;
                }
            });
            return Q
                .all(tasks)
                .then(function() {
                    return shares;
                })
        })
};


// дополняет базу недостающими свечками
me.fixMissedCandles = function(shares) {
    console.log('fix missed candles');
    console.log('fix missed candles 2', shares);

    var accum = {};

    var now = moment();
    return Q.resolve()
        .then(function() {
            if (shares && shares.length) {
                return shares;
            }
            else {
                console.log('find all shares');
                return Share.find({dead: false}).populateAll();
            }
        })
        .then(function(shares) {
            var firstMissedDate = moment();
            var shareMfdIds = [];

            console.log('formatting list-to-download');
            _.each(shares, function(share) {
                var candles = share.candlesHistory && share.candlesHistory.data || [];
                var lastSaved = _.last(candles);
                var lastDate = lastSaved ? moment(lastSaved.d, ddf) : moment(new Date(1900, 1, 1));

                var range = now - lastDate;
                if (range > limitations.time) {
                    // придется докачать слишком много отсутствующих данных
                    // в этом случае мфд выкинет по таймауту
                    // поэтому нужно немного изменить "стиль" получения данных
                    // (просить по одному эмитенту)
                    // по-умолчанию это происходит при старте сервера (me.init -> me.fixMissedCandles_individual)
                    console.warn('У акции', share.name, 'отсутствует много свечей!!! (они не будут докачаны)');
                }
                // TODO: проверить корректность работы
                else if (range > 172800000) { // >2 days - данные не сразу появляются на мфд
                    var mfd_id = share.mfd_id;
                    if (!mfd_id) {
                        console.warn('У акции', share.name, 'отсутствуют некоторые свечи и не привязан mfd_id');
                    }
                    else {
                        shareMfdIds.push(mfd_id);
                    }
                    var lastMissedDate = lastDate.add(1, 'days');
                    if (lastMissedDate < firstMissedDate) {
                        firstMissedDate = lastMissedDate;
                    }
                }
            });
            if (shareMfdIds.length === 0) {
                throw new Error('candles_are_good');
            }
            console.info('Missed candles!', 'date:', firstMissedDate.format(ddf), 'count:', shareMfdIds.length);

            accum.from = firstMissedDate;
            accum.ids = shareMfdIds;
            accum.shares = shares;
            return accum;
        })
        .then(function() {
            return Q
                .ninvoke(parser, 'getByDate', accum.from, accum.ids)
                .then(function(parsed) {
                    console.log('parsed', _.keys(parsed).length, 'shares candles');
                    accum.parsed = parsed;
                    return accum;
                })
                ;
        })
        .then(function() {
            var modified = [];
            _.each(accum.shares, function(share) {
                var parsed = accum.parsed[share.name];
                if (!parsed) {
                    return;
                }
                // мержу свечи
                var candles_existing = share.candlesHistory && share.candlesHistory.data || [];
                var candles_parsed   = parsed.candles;

                // сохраняю измененные данные об эмитенте
                share.candlesHistory.data = mergeCandles(candles_existing, candles_parsed);
                modified.push(share);
            });
            return modified;
        })
        .then(function(modified) {
            console.log('modified', modified.length, 'shares');
            Q.series(_.map(modified, function(share) {
                return share.save();
            }))
        })
        .catch(function(err) {
            if (err.originalError === 'candles_are_good') {
                return Q.resolve();
            }
            else {
                console.error('err in sharesImporter', err, err.stack);
                throw err;
            }
        })
};


me.updateIndayCandles = function() {
    console.log('updateIndayCandles');
    var accum = {};
    return Q.resolve()
        .then(function() {
            console.log('updateIndayCandles:getSharesList');
            return Share.find({
                    where: {
                        dead: false,
                    },
                    select: ['name', 'mfd_id', 'indayCandle'],
                });
        })
        .then(function(shares) {
            accum.shares = shares;
            var ids = _.map(shares, 'mfd_id');
            // console.log('updateIndayCandles:', ids);
            return Q.ninvoke(parser, 'getInday', ids);
        })
        .then(function(parsed) {
            console.log('updateIndayCandles:formatParsedShares');
            accum.tasks = [];
            var task;
            _.each(parsed, function(data, name) {
                data.indayCandle = {
                    d: moment().format(ddf),
                    o: 0,
                    h: 0,
                    l: 0,
                    c: 0,
                    v: 0,
                };
                _.extend(data.indayCandle, _.last(data.candles));
                data.indayCandle.v = 0;
                _.each(data.candles, function(candle) {
                    if (data.indayCandle.h < candle.h) {
                        data.indayCandle.h = candle.h;
                    }
                    if (data.indayCandle.l > candle.l) {
                        data.indayCandle.l = candle.l;
                    }
                    data.indayCandle.v += candle.v;
                });
                task = Q.resolve()
                    .then(function() {
                        var originalShare = _.find(accum.shares, {name: name});
                        originalShare.indayCandle = data.indayCandle;
                        return originalShare.save();
                    })
                    .catch(function(err) {
                        console.error('updateIndayCandles:saving error!');
                        console.error(err, err.stack);
                    });
                accum.tasks.push(task);
            });
        })
        .then(function() {
            console.log('updateIndayCandles:saving');
            return Q.all(accum.tasks);
        })
        .then(function(updated) {
            console.log('updateIndayCandles:done');
            accum = null;
            return updated;
        })
        .catch(function(err) {
            console.error('sharesImporter:updateIndayCandles error!');
            console.error(err, err.stack);
        });
};

//  ╔═╗  ╦═╗  ╦  ╦  ╦  ╔═╗  ╔╦╗  ╔═╗
//  ╠═╝  ╠╦╝  ║  ╚╗╔╝  ╠═╣   ║   ║╣
//  ╩    ╩╚═  ╩   ╚╝   ╩ ╩   ╩   ╚═╝


// "умный" конкат - дописывает только несуществующие свечи
function mergeCandles(_old, _new) {
    var maxExistingDate = _(_old)
        .map(function(c) {
            return moment(c.d, ddf);
        })
        .max()
        ;

    var neededCandles = [];
    _.each(_new, function(c) {
        var date = moment(c.d, ddf);
        if (maxExistingDate && maxExistingDate >= date) {
            return;
        }
        if (moment().format(ddf) === c.d) {
            // сегодняшние свечи - битые.
            return;
        }
        neededCandles.push(c);
    });

    neededCandles = _.sortBy(neededCandles, function(c) {
        return moment(c.d, ddf).unix();
    });


    return _old.concat(neededCandles);
}



module.exports = me;
