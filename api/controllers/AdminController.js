/**
 * AdminController
 *
 * @description :: Server-side logic for managing admins
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    index: function(req, res) {
        return res.render('admin/index', {
            title: 'adm'
        });
    },

    domains: function(req, res) {
        return res.render('admin/domains', {
            title: 'Редактирование доменов',
        });
    },

    edit_domain: function(req, res) {
        var domain = req.param('domain');
        var Model = sails.models[domain];

        if (!Model) {
            return res.notFound('Model: '+domain);
        }

        return Q()
            .then(function() {
                return Model.find();
            })
            .then(function(rows) {
                return res.render('admin/domainEdit', {
                    title: 'Редактирование таблицы: '+domain,
                    rows: rows,
                });
            })
            .catch(res.serverError)
            ;

    },

    update_domain_record: function(req, res) {
        var msg = req.param('msg');
        console.debug(msg);

        if (!msg) {
            return res.badRequest('msg');
        }

        var Model = sails.models[msg.table];
        if (!Model) {
            return res.badRequest('model');
        }

        if (!msg.row) {
            return res.badRequest('msg.row');
        }
        var rec = msg.row;

        if (msg.remove) {
            if (!rec.id) {
                return res.badRequest('drop id is required');
            }
            return Model.destroy({id: rec.id}).then(function(dropped) {
                console.debug('dropped', msg.table, dropped);
                return res.ok();
            });
        }

        if (!rec.id) {
            return Model.create(rec).then(function(created) {
                console.debug('created', msg.table, created);
                return res.ok();
            });
        }

        return Model.update({id: rec.id}, rec).then(function(updated) {
            console.debug('updated', msg.table, updated);
            return res.ok();
        });
    },

    // страница со списком пользователей
    all_users: function(req, res) {
        var data = {
            title: 'Список пользователей',
        };
        User
            .find()
            .populate('roles')
            .then(function(users) {
                data.users = users;
            })
            .then(function() {
                return res.render('admin/users', data);
            })
            .catch(res.serverError)
    },

    // страница редактирования пользователя
    userEditor: function(req, res) {
        var id = req.param('id');
        var data = {
            title: 'Редактирование пользователя',
        };
        Q.resolve()
            .then(function() {
                return User
                    .findOne({id: id})
                    .populate('roles')
            })
            .then(function(user) {
                if (!user) {
                    throw new Error('404');
                }
                data.user = user;
                return Role.find();
            })
            .then(function(roles) {
                data.roles = _.map(roles, function(role) {
                    if (_.findIndex(data.user.roles, {name: role.name}) !== -1) {
                        role.selected = true;
                    }
                    else {
                        role.selected = false;
                    }
                    return role;
                })
            })
            .then(function() {
                return res.render('admin/user', data);
            })
            .catch(function(err) {
                console.warn('not good')
                if (err.message === '404') {
                    return res.notFound();
                }
                else {
                    return res.serverError(err);
                }
            })
    },

    // запуск парсера
    bonds_reparse: function (req, res) {
        provider.bonds.hardUpdate();
        req.flash('info', 'парьсим, насяйнике!');
        return res.render('admin/index', {
            info: req.flash('info'),
        });
    },
    // обновить кэш облигаций данными из базы
    bonds_cache: function(req, res) {
        provider.bonds.softUpdate();
        req.flash('info', 'смотрю базу');
        return res.render('admin/index', {
            info: req.flash('info'),
        });
    },

    // обновить кэш акций данными из базы
    shares_cache: function(req, res) {
        provider.shares.cacheAll()
            .then(function(shares) {
                req.flash('info', 'Кэш акций обновлен: '+shares.length);
                return res.render('admin/index', {
                    info: req.flash('info'),
                });
            })
    },

    shares_dropCache: function(req, res) {
        provider.shares.dropCached()
            .then(function(dropped) {
                req.flash('info', 'dropped: '+dropped.join('\n'));
                return res.render('admin/index', {
                    info: req.flash('info'),
                });
            })
    },

    shares_updateInday: function(req, res) {
        provider.shares.updateIndayCandles()
            .then(function() {
                req.flash('info', 'updated');
                return res.render('admin/index', {
                    info: req.flash('info'),
                });
            });
    },






    // обновление данных пользователя
    updateUserData: function(req, res) {
        var data = req.param('message');
        console.info('data', data);
        if (data.type === 'userrole') {
            return Q.resolve()
                .then(function() {
                    return User.findOne({id: data.id}).populate(['roles']);
                })
                .then(function(user) {
                    console.debug('user', user);
                    _.each(user.roles, function(existingRole) {
                        user.roles.remove(existingRole.id);
                    });
                    return user;
                })
                .then(function(user) {
                    return Role
                        .find({name: data.value})
                        .then(function(roles) {
                            _.each(roles, function(role) {
                                user.roles.add(role.id);
                            });
                            return user.save();
                        });
                })
                .then(res.ok)
                .catch(res.serverError)
                ;
        }
        else {
            console.warn('POST вникуда...');
        }
    },


    // бекап базы
    mongodump: function(req, res) {
        req.connection.setTimeout(10 * 60 * 1000);

        var backup = require('mongodb-backup');

        res.writeHead(200, {
            'Content-Type': 'application/x-tar' // force header for tar download
        });

        var conn = sails.config.connections[sails.config.models.connection];
        // var conn = sails.config.connections['mongolab'];
        var uri = 'mongodb://'+conn.user+':'+conn.password+'@'+conn.host+':'+conn.port+'/'+conn.database;

        console.info('backing up:', uri);

        backup({
            uri: uri,
            // uri: 'mongodb://root:root@<dbdomain>.mongolab.com:<dbport>/<dbdatabase>', // mongodb://<dbuser>:<dbpassword>@<dbdomain>.mongolab.com:<dbport>/<dbdatabase>
            // collections: ['user'], // save this collection only
            stream: res, // send stream into client response
            callback: function(err, data) {
                if (err) {
                    console.error(err);
                    return res.serverError(err);
                }
            }
        });
    },

    // восстанавливаю бд.
    // Ждет стрим.
    mongorestore: function(req, res) {
        req.connection.setTimeout(10 * 60 * 1000);

        console.info('uploading');
        var file = req.file('file');

        return Q.nbind(file.upload, file)({
                maxBytes: 1024000000, //upload limit
                dirname: '',
            })
            .then(function(uploaded) {
                fs.renameSync(uploaded[0].fd, '.tmp/uploads/tar.tar');
            })
            .then(function() {
                var restore  = require('mongodb-restore');

                var conn = sails.config.connections[sails.config.models.connection];
                var uri = 'mongodb://'+conn.user+':'+conn.password+'@'+conn.host+':'+conn.port+'/'+conn.database;

                console.info('restoring');

                restore({
                    uri: uri, // mongodb://<dbuser>:<dbpassword>@<dbdomain>.mongolab.com:<dbport>/<dbdatabase>
                    stream: fs.createReadStream('.tmp/uploads/tar.tar'), // send this stream into db
                    callback: function(err) { // callback after restore
                        console.log('done', err, arguments);
                        if (err) {
                            throw err;
                        }
                        else {
                            return res.ok();
                        }
                    },
                    drop: true,
                });
            })
            .catch(function(err) {
                return res.serverError(err);
            })
            ;
    },



    updateAllCandles: function(req, res) {
        var importer = require('../services/DataProviders/SharesImporter');

        importer.totalUpdate()
            .then(function() {
                return res.send({msg: 'ok'});
            })
            .catch(function(err) {
                return res.serverError(err);
            })
            ;

    }


};

