/**
* UserSettings.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
    attributes: {
        user: { model: 'User', required: true },
        page: { type: 'string', defaultsTo: '/', required: true },
        data: { type: 'json', defaultsTo: {}, required: true },

        version: { type: 'integer', defaultsTo: 0 },
    }
};
