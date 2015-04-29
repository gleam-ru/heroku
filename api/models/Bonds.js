/**
* Bonds.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var jsonpack = require('jsonpack');

module.exports = {

    attributes: {
        // статика (приходит из парса)
        name           : {type: 'string'},
        num            : {type: 'alphanumeric'},
        rate           : {type: 'float'},
        cpVal          : {type: 'float'},
        cpDur          : {type: 'integer'},
        endDate        : {type: 'date'},
        // динамика:
        additional     : {type: 'text', defaultsTo: 'candles^^^$0|@]]'}, // {candles:[]}
        // вынес для более быстрой работы
        lastCandle     : {type: 'json'},
        // время апдейта (чтобы быстро выловить все облиги крайнего парса)
        updatedAt      : {type: 'datetime', index: true},


        // a-la push
        newData: function(bond, next) {
            var additional = jsonpack.unpack(this.additional);
            var candle = this.lastCandle;

            additional.candles.push(candle);
            this.additional = jsonpack.pack(additional);
            this.updatedAt = bond.updatedAt;

            return this.save(next);
        },

        getCurrent: function() {
            var res = _.clone(this);
            delete res.additional;
            _.extend(res, this.lastCandle);
            // console.log('qweeeee', this.lastCandle);
            delete res.lastCandle;
            return res;
        },
    },

};
