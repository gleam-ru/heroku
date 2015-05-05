var moment = require('moment');
var parser = require('./bondsParser.js');
var me = {
    current: []
};

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
        log.debug('Кэш запрошен, но не создан. Создаю.');
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
        if (err) log.error(err);
        return cb(err, me.get());
    });
}


// обновляет me.current значениями из базы
// cb(err, updated)
// TODO: Q-style
me.updateCurrent = function(cb) {
    if (typeof cb !== 'function') cb = function() {};
    Statistics.findOne({name: 'bondsUpdatedAt'}, function(err, stat) {
        if (err || !stat || !stat.data) return cb(err);
        var lastDate = stat.data;
        Bonds.find({updatedAt: lastDate}).exec(function(err, bonds) {
            if (err) return cb(err);
            var results = [];
            _.each(bonds, function(bond) {
                results.push(bond.getCurrent());
            });
            cache.set('bonds', results);
            log.verbose('current bonds updated:', results.length);
            return cb(err, results);
        });
    });
}


//  ╔═╗  ╦═╗  ╦  ╦  ╦  ╔═╗  ╔╦╗  ╔═╗
//  ╠═╝  ╠╦╝  ║  ╚╗╔╝  ╠═╣   ║   ║╣
//  ╩    ╩╚═  ╩   ╚╝   ╩ ╩   ╩   ╚═╝

// сохраняет парс в базу
// cb(err)
function saveBonds(bondsArr, cb) {
    var now = moment();
    function iterator(bond, callback) {
        // текущее время
        _.extend(bond, {updatedAt: now});
        return Bonds.findOne({name: bond.name, num: bond.num}, function(err, found) {
            if (err) log.error(err);
            // рассчитанные значения
            bond = prepare(bond);
            if (!bond) return callback();
            if (found) {
                // уже существует значит просто добавляем новое значение
                return found.newData(bond, callback);
            }
            else {
                // создаем
                return Bonds.create(bond, callback);
            }
        });
    }
    return async.eachSeries(bondsArr, iterator, function(err) {
        if (err) return cb(err);
        Statistics.findOrCreate({
            name: 'bondsUpdatedAt',
        }, {
            name: 'bondsUpdatedAt',
        }, function(err, statistics) {
            if (err) return cb(err);
            statistics.data = now.toDate();
            return statistics.save(cb);
        });
    });
}

// подготавливает данные
function prepare(data) {
    var bond = calculate(data);
    if (!bond) return;
    return {
        name               : bond.name,
        num                : bond.num,
        rate               : bond.rate,
        cpVal              : bond.cpVal,
        cpDur              : bond.cpDur,
        endDate            : bond.endDate,
        updatedAt          : bond.updatedAt,
        lastCandle: {
            // dynamic from parse
            bid            : bond.bid,
            ask            : bond.ask,
            nkd            : bond.nkd,
            cpDate         : bond.cpDate,
            dur            : bond.dur,
            state          : bond.state,
            // dynamic from calculations (больше места на диске, но быстрее)
            expiresIn      : bond.expiresIn,
            cpYie          : bond.cpYie,
            price          : bond.price,
            percent        : bond.percent,
            percentWTaxes  : bond.percentWTaxes,
        }
    }
}


// дописываем рассчитанные значения в облигацию
function calculate(item) {
    var bond = _.clone(item);
    // вечных облигаций не бывыает
    if (!bond.endDate) return;

    bond.endDate = moment(bond.endDate, 'DD.MM.YYYY');
    bond.cpDate  = moment(bond.cpDate,  'DD.MM.YYYY');

    bond.rate    = parseFloat(bond.rate);   // номинал
    bond.cpVal   = parseFloat(bond.cpVal);  // размер купона
    bond.cpDur   = parseFloat(bond.cpDur);  // длительность купона
    bond.nkd     = parseFloat(bond.nkd);    // НКД
    bond.bid     = parseFloat(bond.bid);    // предложение

    // облигации, для которых нет предложения, стоят 100% от номинала
    if(!bond.bid || bond.bid <= 0) {
        bond.bid = 100;
    }

    // облигации, для которых нет спроса, не стоят ничего
    if(!bond.ask || bond.ask <= 0) {
        bond.ask = 0;
    }

    // дней до погашения
    bond.expiresIn = bond.endDate.diff(bond.updatedAt, 'days');

    // должны бы уже выплатить... не следим.
    if (!bond.expiresIn || bond.expiresIn < 0) return;

    // купонный доход
    if (bond.cpDur <= 0) {
        // облигация без купона
        bond.cpYie = 0;
    }
    else {
        bond.cpYie = (bond.cpVal / bond.rate) * (365 / bond.cpDur);
    }

    // настоящая цена
    bond.price = bond.rate * bond.bid / 100 + bond.nkd;
    // Процентная ставка по облигации
    bond.percent = ((bond.rate + bond.nkd + bond.rate * bond.cpYie * bond.expiresIn / 365) / bond.price - 1) * 365 / bond.expiresIn * 100;
    // Процентная ставка по облигации с учетом налога 13%
    bond.percentWTaxes = bond.percent * 0.87;

    // приводим даты к виду, ожидаемому базой
    bond.endDate   = bond.endDate.toDate();//.getTime();
    bond.cpDate    = bond.cpDate.toDate();//.getTime();
    bond.updatedAt = bond.updatedAt.toDate();//.getTime();

    return bond;
}



module.exports = me;
