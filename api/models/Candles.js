/**
* Candles.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

    attributes: {
        type   : {type: 'string', required: true}, // daily/inday/last

        share  : {model: 'Share', required: true}, // owner

        data   : {type: 'array', defaultsTo: []}, //{o:'',h:'',l:'',c:'',d:'',v:''},

    }
};

