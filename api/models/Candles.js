/**
* Candles.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

    attributes: {
        type   : {type: 'string', required: true}, // share/.../

        share  : {model: 'Share', required: true}, // owner

        data   : {type: 'array', defaultsTo: []}, //{o:'',h:'',l:'',c:'',d:'',v:''},

    },


    //  ╦ ╦╔═╗╔═╗╦╔═╔═╗
    //  ╠═╣║ ║║ ║╠╩╗╚═╗
    //  ╩ ╩╚═╝╚═╝╩ ╩╚═╝╝

    beforeCreate: function (candles, next) {
        saveLastCandle(candles, next);
    },

    beforeUpdate: function (candles, next) {
        saveLastCandle(candles, next);
    }
};


/**
 * Сохраняю крайнюю свечу (вчерашнюю), чтобы удобнее было считать проценты
 *
 */
function saveLastCandle(candles, next) {
    if (candles.type !== 'share history 1d') {
        console.warn('bad type');
        return next(null, candles);
    }

    return Q()
        .then(function() {
            return Share.findOne({id: candles.share});
        })
        .then(function(share) {
            if (!share) {
                console.warn('no share found...');
                return;
            }
            share.lastCandle = _.last(candles.data);
            console.warn('last candle: ', share.name, share.lastCandle);
            return share.save();
        })
        .then(function() {
            return candles;
        })
        .nodeify(next)
        ;
}
