/**
* Branch.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*
*
* "сектора" (filler._branches)
*/

module.exports = {

    attributes: {
        name   : {type: 'string', required: true, unique: true},

        shares : {
            collection: 'share',
            via: 'branch'
        },
    },

};

