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
    }

};
