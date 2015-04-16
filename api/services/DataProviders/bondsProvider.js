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
    var now = new Date();
    function iterator(item, callback) {
        _.extend(item, {createdAt: now});
        return Bonds.create(item).exec(callback);
    }
    return async.eachSeries(bondsArr, iterator, cb);
}

module.exports = me;
