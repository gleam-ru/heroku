/**
* Эмитенты
*
* модель со связанным json файлом
*
*/
var path = require('path').join;
var fs = require('fs-extra');
var jf = require('jsonfile');
var mkdirp = require('mkdirp');

var root = sails.config.app.dataDir;

module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,

    attributes: {
        // share/bond/fx/...
        type  : {type: 'string', required: true},
        // path to JSON file
        path  : {type: 'string', required: true, unique: true},

        // получает данные, подставляя дополнительные из json
        getStore: function() {
            // console.log('read issuer file', this.id);
            var store = {};
            if (this.path) {
                var fullPath = path(root, this.type, this.path);
                store = jf.readFileSync(fullPath);
            }
            return store;
        },

        setStore: function(store) {
            // console.log('update issuer file', this.id);
            if (this.path) {
                var fullPath = path(root, this.type, this.path);
                jf.writeFileSync(fullPath, store);
            }
        }
    },



    beforeCreate: function (issuer, next) {
        ensureStoreFile(issuer, next);
    },
    beforeUpdate: function (issuer, next) {
        ensureStoreFile(issuer, next);
    },

};

function ensureStoreFile(issuer, next) {
    if (fs.existsSync(path(root, issuer.type, issuer.path))){
        return next();
    }

    var fullPath = path(root, issuer.type);
    mkdirp.sync(fullPath);
    var filePath = path(fullPath, issuer.path);
    jf.writeFileSync(filePath, {});
    if (sails.config.dev !== true) {
        s3.uploadFile(filePath, next);
    }
    else {
        next();
    }
}
