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
            // доп параметры не нужны
            delete res.additional;
            // крайняя свечка нужна
            _.extend(res, this.lastCandle);
            // удаляем ненужные (клиенту) ключи
            delete res.lastCandle;
            delete res.updatedAt;
            delete res.id;
            // форматируем нужные ключи
            res = format(res);
            return res;
        },
    },

};

// форматирует облигацию для datatables (там все туго с форматированием :(
function format(bond) {
    var moment = require('moment');
    bond.endDate = moment(bond.endDate).format('DD.MM.YYYY');
    bond.cpDate  = moment(bond.cpDate).format('DD.MM.YYYY');

    var nums = [
        'rate',
        'cpVal',
        'cpDur',
        'bid',
        'ask',
        'nkd',
        'dur',
        'expiresIn',
        'cpYie',
        'price',
        'percent',
        'percentWTaxes',
    ];
    _.each(nums, function(num) {
        bond[num] = 1 * bond[num].toFixed(2);
    });
    return bond;
}
