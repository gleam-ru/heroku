var moment = require('moment');
var parser = require('./sharesParser.js');
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
        .nodeify(cb)
}




// заполняет пропущенные свечи отдельным запросом для каждого эмитента
me.fixMissedCandles_individual = function() {
    console.log('individual fix missed candles');

    var now = moment();
    return Q.resolve()
        .then(function() {
            console.log('get all shares from db...')
            return Share
                .find({dead: false})
        })
        .then(function(shares) {
            var tasks = [];
            _.each(shares, function(share) {
                var candles_existing = share.dailyCandles;
                var lastSaved = _.last(candles_existing);
                var lastDate = lastSaved ? moment(lastSaved.d, 'DD.MM.YYYY') : moment(new Date(1900, 1, 1));
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
                            share.dailyCandles = mergeCandles(candles_existing, candles_parsed);
                            share.indayCandles = [];
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
}


// дополняет базу недостающими свечками
me.fixMissedCandles = function(shares) {
    console.log('fix missed candles');

    var now = moment();
    return Q.resolve()
        .then(function() {
            if (shares && shares.length) {
                return shares;
            }
            else {
                return Share.find({dead: false});
            }
        })
        .then(function(shares) {
            var firstMissedDate = moment();
            var shareMfdIds = [];

            _.each(shares, function(share) {
                var candles = share.dailyCandles;
                var lastSaved = _.last(candles);
                var lastDate = lastSaved ? moment(lastSaved.d, 'DD.MM.YYYY') : moment(new Date(1900, 1, 1));

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
            console.info('Missed candles!', 'date:', firstMissedDate.format('DD.MM.YYYY'), 'count:', shareMfdIds.length);
            return {
                from: firstMissedDate,
                ids: shareMfdIds,
                shares: shares,
            };
        })
        .then(function(results) {
            return Q
                .ninvoke(parser, 'getByDate', results.from, results.ids)
                .then(function(parsed) {
                    console.log('parsed', _.keys(parsed).length, 'shares candles');
                    return {
                        shares: results.shares,
                        parsed: parsed,
                    }
                })
        })
        .then(function(results) {
            var modified = [];
            _.each(results.shares, function(share) {
                var parsed = results.parsed[share.name];
                if (!parsed) {
                    return;
                }
                // мержу свечи
                var candles_existing = share.dailyCandles;
                var candles_parsed   = parsed.candles;

                // сохраняю измененные данные об эмитенте
                share.dailyCandles = mergeCandles(candles_existing, candles_parsed);
                share.indayCandles = [];
                modified.push(share);
            });
            return modified;
        })
        .then(function(modified) {
            console.log('modified', modified.length, 'shares');
            Q.all(_.map(modified, function(share) {
                return share.save()
            }))
        })
        .catch(function(err) {
            if (err.originalError === 'candles_are_good') {
                return Q.resolve();
            }
            else {
                console.error('err in sharesImporter');
                throw err;
            }
        })
}


//  ╔═╗  ╦═╗  ╦  ╦  ╦  ╔═╗  ╔╦╗  ╔═╗
//  ╠═╝  ╠╦╝  ║  ╚╗╔╝  ╠═╣   ║   ║╣
//  ╩    ╩╚═  ╩   ╚╝   ╩ ╩   ╩   ╚═╝


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
