/**
* Эмитенты
*
* модель со связанным json файлом
*
*/
var path = require('path').join;
var jf = require('jsonfile');
var mkdirp = require('mkdirp');

var root = sails.config.app.dataDir;

module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,

    attributes: {
        type  : {type: 'string', required: true}, // share/bond/fx/...
        path  : {type: 'string', unique: true}, // path to JSON file

        // получает данные, подставляя дополнительные из json
        getFullData: function() {
            console.log('read issuer file', this.id);
            if (this.path) {
                var fullPath = path(root, this.type, this.path);
                this.additional = jf.readFileSync(fullPath);
            }
            return this;
        },

        update: function(next) {
            console.log('update issuer file', this.id);
            if (this.path) {
                var fullPath = path(root, this.type, this.path);
                jf.writeFileSync(fullPath, this.additional);
            }

            return this.save(next);
        }
    },



    beforeCreate: function (issuer, next) {
        if (issuer.path) {
            var fullPath = path(root, issuer.type);
            mkdirp.sync(fullPath);
            jf.writeFileSync(path(fullPath, issuer.path), {});
        }
        next();
    },

};
