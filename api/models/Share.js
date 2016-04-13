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

        candles         : {collection: 'Candles', via: 'share'},

        // dailyCandles    : {type: 'array', defaultsTo: []},
        lastCandle      : {type: 'json', defaultsTo: {o:'',h:'',l:'',c:'',d:'',v:''}},
        // indayCandle     : {type: 'json', defaultsTo: {o:'',h:'',l:'',c:'',d:'',v:''}},


        shares_count    : {type: 'integer', defaultsTo: 0},
        forums          : {type: 'array', defaultsTo: []},
        links           : {type: 'array', defaultsTo: []},

        divs            : {type: 'array', defaultsTo: []},

        reports         : {type: 'json', defaultsTo: {
            fields : [],
            data   : [],
        }},


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


    // обновляю кэш после сохранения
    afterUpdate: function(updated, next) {
        provider.shares.cache(updated);
        next();
    },

};
