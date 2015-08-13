var me = {};

// пакует всю собранную информацию в дейли свечу.
// TODO: переделать текущую логику
// (просто ставит последнюю свечу в качестве дневной)
me.bondsNewDay = function(done) {
    if (typeof done !== 'function') done = function() {};
    var date = new Date();
    provider.bonds.fetchFromDB(function(err, bonds) {
        function iterator(bond, cb) {
            var existingStore = bond.getStore();
            var store = _.clone(existingStore);
            if (!Array.isArray(store.dailyCandles)) store.dailyCandles = [];

            if (store.indayCandles && store.indayCandles.length > 0) {
                var open  = store.indayCandles[0];
                var close = store.lastCandle;

                var daily = {
                    bid       : createCandle(open.bid, open.bid, open.bid, close.bid),
                    ask       : createCandle(open.ask, open.ask, open.ask, close.ask),
                    // в теории, эти данные не меняются в течение дня
                    date      : date,
                    nkd       : open.nkd,
                    cpDate    : open.cpDate,
                    dur       : open.dur,
                    state     : open.state,
                    expiresIn : open.expiresIn,
                };

                // устанавливаю макс/мин значения у дейли свечи
                _.each(store.indayCandles, function(candle) {
                    // bid
                    if (candle.bid) {
                        if (candle.bid > daily.bid.h) {
                            daily.bid.h = candle.bid;
                        }
                        if (candle.bid < daily.bid.l) {
                            daily.bid.l = candle.bid;
                        }
                    }
                    // ask
                    if (candle.ask) {
                        if (candle.ask > daily.ask.h) {
                            daily.ask.h = candle.ask;
                        }
                        if (candle.ask < daily.ask.l) {
                            daily.ask.l = candle.ask;
                        }
                    }
                });
            }
            // удаляю дневные данные
            store.indayCandles = [];
            if (daily) {
                store.dailyCandles.push(daily)
            }

            bond.setStore(store);
            bond.save(cb);
        }
        async.eachSeries(bonds, iterator, function(err) {
            if (err) console.error(err);
            else console.info('Bonds: daily candles created');
            return done(err);
        });
    });
}

module.exports = me;


function createCandle(h, l, o, c) {
    return {
        h: h,
        l: l,
        o: o,
        c: c,
    }
}
