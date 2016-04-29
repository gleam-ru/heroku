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
    console.warn('write some code here');
    return Q();
};


// получает данные из БД, промис
me.getFromDB = function() {
    console.warn('write some code here');
    // return Q();
    return me.parse();
};


module.exports = me;
