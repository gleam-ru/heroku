var Q = require('q');
var moment = require('moment');
var ddf = 'DD.MM.YYYY';
var me = {};

var parser = require('./sharesGoogleParser');
var params = parser.params;

// получает json-ифицированые данные от гугла
me.parse = function() {
    return parser.getFullData();
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
    return Q();
};


module.exports = me;
