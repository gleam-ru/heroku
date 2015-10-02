module.exports.bootstrap = function(cb) {


    // MODULES
    global.Q        = require('q');
    global.moment   = require('moment');
    global.fs       = require('fs-extra');
    global.jf       = require('jsonfile');




    if (process.env.I_AM_HEROKU) {
        sails.config.amazon.s3.key    = process.env.AMAZON_S3_KEY;
        sails.config.amazon.s3.secret = process.env.AMAZON_S3_SECRET;
    }


    // создаем нужные директории
    var fs = require('fs-extra');
    if (!fs.existsSync(sails.config.app.dataDir)) {
        fs.mkdirSync(sails.config.app.dataDir);
    }

    /*
    return Q.resolve()
        .then(function() {
            var result = {};
            return Passport.find()
                .then(function(passports) {
                    result.Passport = _.map(passports, function(el) {
                        return el;
                    });
                    return result;
                })
        })
        .then(function(result) {
            return User.find()
                .then(function(users) {
                    result.User = _.map(users, function(el) {
                        return el;
                    });
                    return result;
                })
        })
        .then(function(result) {
            return UserSettings.find()
                .then(function(us) {
                    result.UserSettings = _.map(us, function(el) {
                        return el;
                    });
                    return result;
                })
        })
        .then(function(result) {
            jf.writeFileSync('migration.json', result);
            return;
        })
        .nodeify(cb)
    //*/

    /*
    return Q.resolve()
        .then(function() {
            return Q.resolve()
                .then(function() {
                    return User.destroy();
                })
                .then(function() {
                    return Passport.destroy();
                })
                .then(function() {
                    return UserSettings.destroy();
                })
        })
        .then(function() {
            return jf.readFileSync('migration.json');
        })
        .then(function(r) {
            var tasks = [];
            _.each(r.User, function(u) {
                var task = Q.resolve()
                    .then(function() {
                        var _u = _.clone(u);
                        delete _u.id;
                        if (!_u.email) {
                            delete _u.email;
                        }
                        return User
                            .create(_u)
                            .then(function(created) {
                                u._id = created.id;
                                return;
                            })
                    })
                tasks.push(task)
            })
            return Q
                .all(tasks)
                .then(function() {
                    return r;
                })
        })
        .then(function(r) {
            var passportsToCreate = _.map(r.Passport, function(p) {
                var _p = _.clone(p);
                delete _p.id;
                _p.user = _.find(r.User, {id: p.user})._id;
                return _p;
            })
            return Passport
                .create(passportsToCreate)
                .then(function() {
                    return r;
                })
        })
        .then(function(r) {
            var usToCreate = _.map(r.UserSettings, function(us) {
                var _us = _.clone(us);
                delete _us.id;
                var found = _.find(r.User, {id: us.user});
                if (found) {
                    _us.user = found._id;
                }
                else {
                    console.log('not found', us.user);
                    return;
                }
                return _us;
            })
            return UserSettings
                .create(usToCreate)
                .then(function() {
                    return r;
                })
        })
        .then(function(r) {
            console.log('migration completed')
            return;
        })
        .nodeify(cb)

    //*/



    // TODO: сделать покрасиввее
    if (!sails.config.heroku) {
        async.series([
            // filler.process,
            provider.init,
            cache.init,
            // cron.init,
        ],
        function(err) {
            // if (err) return cb(err);
            if (err) {
                console.error('bootstrap:', err, err.message, err.stack);
            }
            // provider.bonds.update();
            // dbTasks.bondsNewDay();
            cb();
        });
        return;
    }
    else {
        cb();
        async.series([
            filler.process,
            provider.init,
            cache.init,
            cron.init,
        ],
        function(err) {
            if (err) {
                console.error('Bootstrap failed', err);
            }
            console.log("i'm listening, my master...")
            console.log("i'm listening, my master...")
            console.log("i'm listening, my master...")
            console.log("i'm listening, my master...")
            console.log("i'm listening, my master...")
        });
        return;
    }

};
