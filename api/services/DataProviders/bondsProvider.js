var moment = require('moment');
var parser = require('./bondsParser.js');
var me = {};

// установка дефолтных значений
me.init = function(cb) {
    async.series([
        // получение из базы
        me.updateCurrent,
        // получение из парса
        // me.update,
    ], cb)
}

// получает список облигаций с текущими значениями
me.get = function(cb) {
    var bonds = cache.get('bonds');
    if (typeof cb !== 'function') {
        // нет колбека. Ну нет, так нет. Возвращаю то, что есть.
        return bonds || [];
    }
    if (!bonds) {
        console.warn('Кэш запрошен, но не создан. Создаю.');
        return me.updateCurrent(cb);
    }
    else {
        return cb(null, bonds);
    }
}

// парс + сохранение + апдейт
// cb(err, updated)
me.update = function(cb) {
    if (typeof cb !== "function") cb = function() {};
    async.waterfall([
        parser.parse,
        saveBonds,
        me.updateCurrent,
    ], function(err) {
        if (err) console.error(err);
        return cb(err, me.get());
    });
}


// обновляет cache.set('bonds') значениями из базы
// cb(err, updated)
// TODO: Q-style
me.updateCurrent = function(cb) {
    if (typeof cb !== 'function') cb = function() {};
    me.fetchFromDB(function(err, bonds) {
        if (err) return cb(err);
        var results = [];
        _.each(bonds, function(bond) {
            results.push(calculate(bond));
        });
        results = _.map(results, format);
        cache.set('bonds', results);
        console.info('current bonds updated:', results.length);
        return cb(err, results);
    });
}

// забирает данные из базы
// cb(err, res)
me.fetchFromDB = function(cb) {
    Statistics.findOne({name: 'bondsUpdatedAt'}, function(err, stat) {
        if (err || !stat || !stat.data) return cb(err || 'no stat data');
        var lastDate = stat.data;
        Issuer
            .find()
            .where({
                type: 'bond',
                updatedAt: {'>=': lastDate},
            })
            .exec(cb);
    });
}


//  ╔═╗  ╦═╗  ╦  ╦  ╦  ╔═╗  ╔╦╗  ╔═╗
//  ╠═╝  ╠╦╝  ║  ╚╗╔╝  ╠═╣   ║   ║╣
//  ╩    ╩╚═  ╩   ╚╝   ╩ ╩   ╩   ╚═╝

// сохраняет парс в базу
// cb(err)
function saveBonds(bondsArr, cb) {
    var now = new Date();
    bondsArr = _(bondsArr)
        .map(beforeCreate)
        .compact()
        .value();
    bondsArr.shuffle();
    function iterator(bond, callback) {
        var issuer = {
            type: 'bond',
            path: bond.num,
        };
        Issuer.findOrCreate(issuer, issuer, function(err, issuer) {
            if (err) {
                console.error(err);
                return callback(err);
            }

            var existingStore = issuer.getStore();
            var store = _.clone(existingStore);
            store.general = existingStore.general || {
                name      : bond.name,
                num       : bond.num,
                rate      : bond.rate,
                cpVal     : bond.cpVal,
                cpDur     : bond.cpDur,
                endDate   : bond.endDate,
            };

            store.lastCandle = {
                // dynamic from parse
                bid            : bond.bid,
                ask            : bond.ask,
                nkd            : bond.nkd,
                cpDate         : bond.cpDate,
                dur            : bond.dur,
                state          : bond.state,
                // dynamic from calculations (больше места на диске, но быстрее)
                expiresIn      : bond.expiresIn,
                // cpYie          : bond.cpYie,
                // price          : bond.price,
                // percent        : bond.percent,
                // percentWTaxes  : bond.percentWTaxes,
            };

            if (!Array.isArray(store.indayCandles)) store.indayCandles = [];
            if (!Array.isArray(store.dailyCandles)) store.dailyCandles = [];
            if (existingStore.lastCandle) {
                store.indayCandles.push(existingStore.lastCandle);
            }

            issuer.setStore(store);

            return issuer.save(callback);
        });
    }
    return async.eachSeries(bondsArr, iterator, function(err) {
        if (err) return cb(err);
        Statistics.findOne({
            name: 'bondsUpdatedAt',
        }, function(err, statistics) {
            if (err) return cb(err);
            statistics.data = now;
            return statistics.save(cb);
        });
    });
}



// дописываем рассчитанные значения в облигацию
function beforeCreate(bond) {
    // вечных облигаций не бывыает
    if (!bond.endDate) return;

    bond.endDate = moment(bond.endDate, 'DD.MM.YYYY');
    bond.cpDate  = moment(bond.cpDate,  'DD.MM.YYYY');

    bond.rate    = parseFloat(bond.rate);   // номинал
    bond.cpVal   = parseFloat(bond.cpVal);  // размер купона
    bond.cpDur   = parseFloat(bond.cpDur);  // длительность купона
    bond.nkd     = parseFloat(bond.nkd);    // НКД
    bond.bid     = parseFloat(bond.bid);    // предложение

    if(!bond.bid || bond.bid <= 0) bond.bid = '';
    if(!bond.ask || bond.ask <= 0) bond.ask = '';

    // дней до погашения
    bond.expiresIn = bond.endDate.diff(moment(), 'days');

    // должны бы уже выплатить... не следим.
    if (!bond.expiresIn || bond.expiresIn < 0) return;

    // приводим даты к виду, ожидаемому базой
    bond.endDate   = bond.endDate.toDate();//.getTime();
    bond.cpDate    = bond.cpDate.toDate();//.getTime();

    return bond;
}


// рассчет динамических ключей облигации
// на основании сохраненных
function calculate(_bond) {
    var now = moment();
    var flashback = 3; // last 3 days to restore missed bids

    var store = _bond.getStore();
    var bond = {};
    _.extend(bond, {id: _bond.id});
    _.extend(bond, store.general);
    _.extend(bond, store.lastCandle);

    // купонный доход
    if (bond.cpDur <= 0) {
        // облигация без купона
        bond.cpYie = 0;
    }
    else {
        bond.cpYie = (bond.cpVal / bond.rate) * (365 / bond.cpDur);
    }

    // предложение (%%) по облигации
    // попытка узнать предложение, которое было в течение текущего дня
    if (!bond.bid) {
        var indayCandles = store.indayCandles || [];
        for (var i = indayCandles.length - 1; i >= 0; i--) {
            if (indayCandles[i].bid) {
                bond.bid = indayCandles[i].bid;
                break;
            }
        }
    }

    // предложения за сегодня отсутствуют,
    // надо проверить - а были ли в предыдущие дни?
    //
    if (!bond.bid) {
        var i = 0;
        var candles = store.dailyCandles || [];
        var pastCandle = candles[candles.length - 1 - i++];
        while (pastCandle && i < flashback) {
            var possibleBid = pastCandle.bid.l || pastCandle.bid.o || pastCandle.bid.h;
            if (possibleBid) {
                if (now - (moment(pastCandle.date)) < ((flashback + 3) * 1000*60*60*24)) {
                    bond.bid = possibleBid;
                }
                break;
            }
            pastCandle = candles[candles.length - 1 - i++];
        }
    }

    // настоящая цена
    bond.price = bond.rate * bond.bid / 100 + bond.nkd;

    // ваще неликвид...
    if (!bond.bid) {
        bond.percent = 0;
    }
    else {
        bond.percent = ((bond.rate + bond.nkd + bond.rate * bond.cpYie * bond.expiresIn / 365) / bond.price - 1) * 365 / bond.expiresIn * 100;
    }
    // Процентная ставка по облигации с учетом налога 13%
    bond.percentWTaxes = bond.percent * 0.87;

    return bond;
}


//
function format(bond) {
    bond.endDate = moment(bond.endDate).format('DD.MM.YYYY');
    bond.cpDate  = moment(bond.cpDate).format('DD.MM.YYYY');
    var nums = [
        'rate',
        'cpVal',
        'cpDur',
        'bid',
        'ask',
        'nkd',
        'dur',
        'expiresIn',
        // 'cpYie', // ОЧЕНЬ приличные потери в точности
        'price',
        'percent',
        'percentWTaxes',
    ];
    _.each(nums, function(num) {
        bond[num] = bond[num] ? (1 * bond[num].toFixed(2)) : '';
    });

    return [
        bond.id,
        bond.name,
        bond.num,
        bond.rate,
        bond.cpVal,
        bond.cpDur,
        bond.endDate,
        bond.bid,
        bond.ask,
        bond.nkd,
        bond.cpDate,
        bond.state,
        bond.expiresIn,
        bond.cpYie,
        bond.price,
        bond.percent,
        bond.percentWTaxes,
    ];
}


module.exports = me;
