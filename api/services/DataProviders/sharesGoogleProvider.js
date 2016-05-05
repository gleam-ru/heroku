var Q = require('q');
var moment = require('moment');
var ddf = 'DD.MM.YYYY';
var me = {};

me.parser = require('./sharesGoogleParser');
me.params = me.parser.params;

// получает json-ифицированые данные от гугла
me.parse = function() {
    return me.parser.getFullData();
};

// Промис
//
// сохраняет данные в БД
// пример данных:
// {name, code, cols: [{param.serverName: value}]}
me.saveToDB = function(shares) {
    var not_updated = [];
    return Q()
        .then(me.parse)
        .then(function(parsed) {
            return Q.all(_.map(parsed, function(p) {
                return Share.update({code: p.code}, {google: p.cols})
                    .then(function(updated) {
                        if (!updated || !updated.length) {
                            not_updated.push(p.code);
                        }
                        return updated;
                    })
                    ;
            }));
        })
        .then(function(saved) {
            console.warn('not_updated shares from google:', not_updated.length, not_updated);
            return Statistics.findOrCreate({name: 'sharesGoogleSaveToDB'}, {name: 'sharesGoogleSaveToDB'})
                .then(function(stat) {
                    stat.data = new Date();
                    return stat.save();
                })
                .then(function(stat) {
                    return saved; // да, я отправляю сохраненные акции, а не статистику
                })
                ;
        })
        .catch(console.error)
        ;
};


// получает данные из БД, промис
me.getFromDB = function() {
    console.warn('write some code here');
    // return Q();
    return me.parse();
};


module.exports = me;
