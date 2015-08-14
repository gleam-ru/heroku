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
            var me = this;
            // console.log('read issuer file', this.id);
            var store;
            if (this.path) {
                var fullPath = path(root, this.type, this.path);
                try {
                    store = jf.readFileSync(fullPath);
                }
                catch (err) {
                    console.warn('bad issuer-s store. EXTERMINATE!!!', me)
                    Issuer.destroy({id: me.id}, function(){})
                }
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
    // TODO: deprecated?
    // beforeUpdate: function (issuer, next) {
    //     ensureStoreFile(issuer, next);
    // },

};

function ensureStoreFile(issuer, next) {
    if (fs.existsSync(path(root, issuer.type, issuer.path))){
        return next();
    }

    var fullPath = path(root, issuer.type);
    mkdirp.sync(fullPath);
    var filePath = path(fullPath, issuer.path);
    var defaultStore = {};
    if (issuer.type === 'share') {
        defaultStore = {
            general: {
                mfd_id : ticker.id,
                name   : ticker.name,
            },
            dailyCandles: [],
            indayCandles: [],
            lastCandle: {},
            reports: {
                fields: [],
                data: [],
            }
        };
    }
    jf.writeFileSync(filePath, defaultStore);
    if (sails.config.dev !== true) {
        s3.uploadFile(filePath, next);
    }
    else {
        next();
    }
}
