/**
* Bond.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

    attributes: {
        branch          : {model: 'branch'},
        name            : {type: 'string'},
        code            : {type: 'string', unique: true},
        site            : {type: 'string'},
        mfd_id          : {type: 'integer', unique: true, required: true},

        candlesHistory  : {model: 'candles'},
        lastCandle      : {type: 'json', defaultsTo: {o:'',h:'',l:'',c:'',d:'',v:''}},

        shares_count    : {type: 'integer', defaultsTo: 0},
        forums          : {type: 'array', defaultsTo: []},
        links           : {type: 'array', defaultsTo: []},

        divs            : {type: 'array', defaultsTo: []},
        divs_comment    : {type: 'string'},

        reports         : {type: 'json', defaultsTo: {
            fields : [],
            data   : [],
        }},

        // данные, полученные из гуглофинансов
        google: {type: 'json', defaultsTo: {}},


        // не существующие ныне компании
        dead          : {type: 'boolean', defaultsTo: false},
        die: function() {
            this.dead = true;
            return this.save();
        },

        getDailyCandles: function() {
            var candles = _.find(this.candles, {type: 'daily'});
            return candles ? candles : [];
        },
    },


    // получает данные за исключением указанных.
    //
    getAllWithoutCandles: function() {
        var attrs = getAttrs(this, [
            'dead',
            'reports',
            'divs',
            'candles',
            'lastCandle',
            'mfd_id',
            'shares_count',
            ]);

        console.time('share: getAllWithoutCandles');
        return Q()
            .then(function() {
                return Share.find({
                    where: {
                        dead: false,
                    },
                    select: attrs,
                })
                ;
            })
            .then(function(shares) {
                console.timeEnd('share: getAllWithoutCandles');
                return shares;
            })
            ;
    },



    // обновляю кэш после сохранения
    afterUpdate: function(updated, next) {
        provider.shares.cache(updated);
        next();
    },

};


var getAttrs = function(model, exclude) {
    var attrs = _.keys(model.attributes);
    attrs = _.filter(attrs, function(i) {
        if (!exclude) {
            exclude = [];
        }
        if (typeof model.attributes[i] !== 'object') {
            return false;
        }
        return exclude.indexOf(i) === -1;
    });
    return attrs;
}
