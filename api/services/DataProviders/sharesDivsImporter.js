var Q = require('q');
var parser = require('./sharesDivsParser.js');
var me = {};

me.process = function() {
    return Q.resolve()
        .then(parser.parse)
        .then(me.massUpdateInDataBase)
}

me.massUpdateInDataBase = function(parsedList) {
    return Q.all(_.map(parsedList, me.updateInDataBase));
}

me.updateInDataBase = function(parsed) {
    return Q.resolve()
        .then(function() {
            return Share.findOne({code: parsed.code.toLowerCase()})
        })
        .then(function(share) {
            if (!share) {
                console.warn('not found parsed share! code:', parsed.code);
                return Q.resolve();
            }
            share.divs = parsed.divs;
            return share.save();
        })
        .then(function(saved) {
            if (saved) {
                console.log('saved!', parsed.code);
            }
            else {
                console.log('not saved!', parsed.code);
            }
        })
}

module.exports = me;
