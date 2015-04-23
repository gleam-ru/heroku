var moment = require('moment');
var parser = require('./bondsParser.js');
var me = {
    current: []
};

// установка дефолтных значений
me.init = function(cb) {
    // заполнить current данынми из базы
    updateCurrent(function(err, updated) {
        console.log('bonds provider inited', updated.length);
        cb(err);
    });
}

// получает список облигаций с текущими значениями
me.get = function() {
    return me.current;
}

// парс + сохранение
// cb(err, updated)
me.update = function(cb) {
    if (typeof cb !== "function") cb = function() {};

    /// TODO: убрать
    /// Чтобы постоянно не парсить сайты-доноры придуманы костыли
    var jf = require('jsonfile');
    var flag = true;
    var file = './parsed.json';
    if (flag) {
        var json = jf.readFileSync(file);
        return saveBonds(json.parsed, function(err) {
            if (err) {
                log.error('Bonds saving has failed', err.message);
                return cb(err, me.get());
            }
            updateCurrent(function(err) {
                if (err) {
                    log.error('Updating bonds has failed', err);
                    return cb(err, me.get());
                }
                log.info('Bonds parsed, saved and updated');
                return cb(null, me.get());
            });
        });
    }
    ///-----

    parser.parse(function(err, parsed) {
        if (err)  {
            log.error('Bonds parsing has failed', err);
            return cb(err, me.get());
        }

        /// TODO: убрать
        if (!flag) {
            var json = {
                'parsed': parsed
            };
            jf.writeFileSync(file, json);
        }
        ///-----

        saveBonds(parsed, function(err) {
            if (err) {
                log.error('Bonds saving has failed', err.message, err);
                return cb(err, me.get());
            }
            updateCurrent(function(err) {
                if (err) {
                    log.error('Updating bonds has failed', err);
                    return cb(err, me.get());
                }
                log.info('Bonds parsed, saved and updated');
                return cb(null, me.get());
            });
        });
    });
}



//  ╔═╗  ╦═╗  ╦  ╦  ╦  ╔═╗  ╔╦╗  ╔═╗
//  ╠═╝  ╠╦╝  ║  ╚╗╔╝  ╠═╣   ║   ║╣
//  ╩    ╩╚═  ╩   ╚╝   ╩ ╩   ╩   ╚═╝

// обновляет me.current значениями из базы
// cb(err, updated)
// TODO: Q-style
function updateCurrent(cb) {
    if (typeof cb !== 'function') cb = function() {};
    Bonds.find().max('createdAt').exec(function(err, oldestBond) {
        if (err) return cb(err);
        if (!oldestBond.length) return cb(new Error('Oldest Bond not found'));
        var lastDate = oldestBond[0].createdAt;
        Bonds.find({createdAt: lastDate}).exec(function(err, bonds) {
            if (err) return cb(err);
            me.current = bonds;
            cb(err, bonds);
        });
    });
}

// сохраняет парс в базу
// cb(err)
function saveBonds(bondsArr, cb) {
    var now = moment();
    function iterator(item, callback) {
        _.extend(item, {createdAt: now});
        var bond = beforeValidate(item);
        if (!bond) return callback();
        return Bonds.create(bond).exec(callback);
    }
    return async.eachSeries(bondsArr, iterator, cb);
}

// орм... баги... входит в традицию -_-
// описываем хук beforeValidate тут
function beforeValidate(item) {
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
    bond.expiresIn = bond.endDate.diff(bond.createdAt, 'days');

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


    // приводим даты к таймштампу
    bond.endDate   = bond.endDate.toDate();//.getTime();
    bond.cpDate    = bond.cpDate.toDate();//.getTime();
    bond.createdAt = bond.createdAt.toDate();//.getTime();

    return bond;
}



module.exports = me;
