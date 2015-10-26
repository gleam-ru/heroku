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
            })
    },






    // обновление данных пользователя
    updateUserData: function(req, res) {
        var data = req.param('message');
        if (data.type === 'userrole') {
            return Q.resolve()
                .then(function() {
                    return User.findOne({id: data.id}).populate('roles')
                })
                .then(function(user) {
                    _.each(user.roles, function(existingRole) {
                        user.roles.remove(existingRole.id);
                    })
                    return user.save();
                })
                .then(function(user) {
                    return Role
                        .find({name: data.value})
                        .then(function(roles) {
                            _.each(roles, function(role) {
                                user.roles.add(role.id);
                            })
                            return user.save();
                        })
                })
                .then(res.ok)
                .catch(res.serverError)
        }
        else {
            console.warn('POST вникуда...');
        }
    },
};

