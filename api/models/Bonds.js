/**
* Bonds.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

    attributes: {
        // приходит из парса
        name           : {type: 'string'},
        num            : {type: 'alphanumeric'},
        bid            : {type: 'float'},
        ask            : {type: 'float'},
        cpVal          : {type: 'float'},
        nkd            : {type: 'float'},
        cpDur          : {type: 'integer'},
        cpDate         : {type: 'date'},
        rate           : {type: 'float'},
        endDate        : {type: 'date'},
        dur            : {type: 'integer'},
        state          : {type: 'alphanumeric'},

        // дополнено мной
        expiresIn      : {type: 'integer'},
        cpYie          : {type: 'float'},
        price          : {type: 'float'},
        percent        : {type: 'float'},
        percentWTaxes  : {type: 'float'},

        // и при самом создании
        createdAt      : {type: 'datetime'},
    },



    //  ╦ ╦╔═╗╔═╗╦╔═╔═╗
    //  ╠═╣║ ║║ ║╠╩╗╚═╗
    //  ╩ ╩╚═╝╚═╝╩ ╩╚═╝

    beforeValidate: function (bond, cb) {
        format(bond);
        insertCalculated(bond);
        cb(null, bond);
    },

};

// приводим типы, ставим "пре_дефолтные значения"
function format(bond) {
    bond.endDate = moment(bond.endDate, 'DD.MM.YYYY').toDate(); // дата погашения
    bond.cpDate  = moment(bond.cpDate, 'DD.MM.YYYY').toDate(); // дата погашения
    bond.rate    = parseFloat(bond.rate);   // номинал
    bond.cpVal   = parseFloat(bond.cpVal);  // размер купона
    bond.cpDur   = parseFloat(bond.cpDur);  // длительность купона
    bond.nkd     = parseFloat(bond.nkd);    // НКД
    bond.bid     = parseFloat(bond.bid);    // предложение

    // облигации, для которых нет предложения, стоят 100% от номинала
    if(!bond.bid || bond.bid <= 0) {
        bond.bid = 100;
    }

    // облигации, для которых нет спроса, не стоят ничего
    if(!bond.ask || bond.ask <= 0) {
        bond.ask = 0;
    }
}

// дополняет облигацию рассчитанными данными
var moment = require('moment');
function insertCalculated(bond) {
    // дней до погашения
    bond.expiresIn = daysBetweenDates(bond.endDate, bond.createdAt);
    // не храним "истекшие" облигации
    if (bond.expiresIn === 0) {
        bond = undefined;
        return;
    }

    // купонный доход
    if (bond.cpDur <= 0) {
        // облигация без купона
        bond.cpYie = 0;
    }
    else {
        bond.cpYie = (bond.cpVal / bond.rate) * (365 / bond.cpDur);
    }

    // настоящая цена
    bond.price = bond.rate * bond.bid / 100 + bond.nkd;
    // Процентная ставка по облигации
    bond.percent = ((bond.rate + bond.nkd + bond.rate * bond.cpYie * bond.expiresIn / 365) / bond.price - 1) * 365 / bond.expiresIn * 100;
    // Процентная ставка по облигации с учетом налога 13%
    bond.percentWTaxes = bond.percent * 0.87;
}


// Расчет разницы (дни) между датами
function daysBetweenDates(date1, date2) {
    var diff = (date1 - date2) / 86400000;
    return Math.ceil(diff);
}
