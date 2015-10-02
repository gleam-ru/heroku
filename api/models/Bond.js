/**
* Bond.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

    attributes: {
        name          : {type: 'string'},
        num           : {type: 'string', required: true},
        rate          : {type: 'float'},
        cpVal         : {type: 'float'},
        cpDur         : {type: 'float'},
        endDate       : {type: 'string'},

        bid           : {type: 'float'},
        ask           : {type: 'float'},
        nkd           : {type: 'float'},
        state         : {type: 'string'},
        cpDate        : {type: 'string'},
        expiresIn     : {type: 'integer'},

        bid_candle    : {type: 'json', defaultsTo: {o:'',h:'',l:'',c:'',d:''}},
        ask_candle    : {type: 'json', defaultsTo: {o:'',h:'',l:'',c:'',d:''}},
        indayCandles  : {type: 'array', defaultsTo: []},
        dailyCandles  : {type: 'array', defaultsTo: []},
    },



    beforeCreate: format,
    beforeUpdate: format,

};

function format(bond, next) {
    // вечных облигаций не бывыает
    if (!bond.endDate) {
        return next('forever_bond');
    }

    bond.endDate = moment(bond.endDate, 'DD.MM.YYYY');
    bond.cpDate  = moment(bond.cpDate,  'DD.MM.YYYY');

    bond.rate    = parseFloat(bond.rate);   // номинал
    bond.cpVal   = parseFloat(bond.cpVal);  // размер купона
    bond.cpDur   = parseFloat(bond.cpDur);  // длительность купона
    bond.nkd     = parseFloat(bond.nkd);    // НКД
    bond.bid     = parseFloat(bond.bid);    // предложение

    if(!bond.bid || bond.bid <= 0) bond.bid = '';
    if(!bond.ask || bond.ask <= 0) bond.ask = '';

    // дней до погашения
    bond.expiresIn = bond.endDate.diff(moment(), 'days');

    // должны бы уже выплатить... не следим.
    if (!bond.expiresIn || bond.expiresIn < 0) {
        return next('stale_bond');
    }

    // приводим даты к виду, ожидаемому базой
    bond.endDate   = bond.endDate.format('DD.MM.YYYY');
    bond.cpDate    = bond.cpDate.format('DD.MM.YYYY');

    return next();
}
