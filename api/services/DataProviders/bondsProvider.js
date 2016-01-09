var importer = require('./bondsImporter')

var me = {};


me.init = function(cb) {
    return me
        // .hardUpdate()
        .softUpdate()
        .nodeify(cb)
}


me.all = function() {
    return Q
        .resolve()
        .then(function() {
            var cached = cache.get('bonds');
            return cached;
        })
        .then(function(cached) {
            if (!cached) {
                console.warn('обновляю кэш облигаций не по расписанию!')
                return me.softUpdate();
            }
            else {
                return cached;
            }
        })
}



// обновляет из базы
me.softUpdate = function() {
    console.log('softUpdate');
    return me
        .fetchFromDB()
        .then(me.cache)
}



// парс + сохранение + апдейт
// cb(err, updated)
me.hardUpdate = function() {
    console.log('hardUpdate');
    return Q
        .ninvoke(importer, 'process')
        .then(me.cache)
        .catch(function(err) {
            console.error('bonds hard update error', err, err.stack)
        })
}





// забирает данные из базы
me.fetchFromDB = function() {
    console.log('fetchFromDB');
    return Q.resolve()
        .then(function() {
            return Statistics.findOne({name: 'bondsUpdatedAt'})
        })
        .then(function(stat) {
            return Bond
                .find()
                .where({
                    dead: false,
                    updatedAt: {'>=': stat.data},
                })
        })
}



// кэширует указанные облигации
me.cache = function(bonds) {
    var b = _(bonds)
        .compact()
        .map(calculate)
        .map(format)
        .value()
    if (!b.length) {
        console.warn('Просьба закэшировать странные (пустые) облигации...')
    }
    cache.set('bonds', b);
    console.info('bonds cache updated:', b.length);
    return b;
}



//  ╔═╗  ╦═╗  ╦  ╦  ╦  ╔═╗  ╔╦╗  ╔═╗
//  ╠═╝  ╠╦╝  ║  ╚╗╔╝  ╠═╣   ║   ║╣
//  ╩    ╩╚═  ╩   ╚╝   ╩ ╩   ╩   ╚═╝
//

// рассчет динамических ключей облигации
// на основании сохраненных
function calculate(bond) {
    var now = moment();
    var flashback = sails.config.app.providers.bonds.flashback;

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
        var indayCandles = bond.indayCandles || [];
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
        var candles = bond.dailyCandles || [];
        var pastCandle = candles[candles.length - 1 - i++];
        while (pastCandle && i < flashback) {
            var possibleBid = pastCandle.bid.l || pastCandle.bid.o || pastCandle.bid.h;
            if (possibleBid) {
                if (now - (moment(pastCandle.d, ddf)) < ((flashback + 3) * 1000*60*60*24)) {
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
        bond.percent_woRT = 0;
        bond.percent_woRTCT = 0;
    }
    else {

        var buy_price  = bond.rate * (bond.bid / 100) + bond.nkd;

        // полученные в будущем купоны (штук)
        var futureCps = Math.ceil(bond.expiresIn / bond.cpDur);
        // (по аналогии с nkd) - купонный доход, который будет выплачен при погашении
        var kd = futureCps * bond.cpVal;
        var sell_price = bond.rate + kd;

        var taxes = 0.13; // 13% ндс
        var partOfYear = bond.expiresIn / 365;

        // налоги по разнице между покупкой и продажей
        var taxes_rate = (bond.bid < 100) ? (1 - 0.01 * bond.bid) * bond.rate * taxes : 0;
        // налоги по купону
        var taxes_cp = kd * taxes;

        bond.percent = (sell_price / buy_price - 1) / partOfYear * 100;
        // withoutRateTaxes
        bond.percent_woRT = ((sell_price - taxes_rate) / buy_price - 1) / partOfYear * 100;
        // withoutRateTaxes and CouponTaxes
        bond.percent_woRTCT = ((sell_price - taxes_rate - taxes_cp) / buy_price - 1) / partOfYear * 100;
    }

    return bond;
}


// приводит облигацию к виду, который ожидает клиент
function format(bond) {
    bond.endDate = moment(bond.endDate, ddf).format(ddf);
    bond.cpDate  = moment(bond.cpDate, ddf).format(ddf);
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
        'percent_woRT',
        'percent_woRTCT',
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
        bond.percent_woRT,
        bond.percent_woRTCT,
        bond.risk,
    ];
}




module.exports = me;
