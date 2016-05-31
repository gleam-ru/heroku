/**
 * Authentication Controller
 *
 * This is merely meant as an example of how your Authentication controller
 * should look. It currently includes the minimum amount of functionality for
 * the basics of Passport.js to work.
 */

var AuthController = {

    index: function (req, res) {
        // авторизирован? иди в профиль.
        if (req.isAuthenticated()) return res.redirect('/settings');
        var strategies = sails.config.passport.strategies;
        var providers = _.keys(strategies);
        providers = _.map(providers, function(provider) {
            var strategy = strategies[provider];
            return {
                provider: provider,
                name: strategy.name,
                href: strategy.callbackURL,
                icon: strategy.icon,
            }
        });
        var data = req.flash('form');
        return res.render('auth', {
            title: 'Вход на сайт',
            errors: req.flash('error'),
            form: data[0] || {},
            providers: providers,
        });
    },

    //  ╔═╗╔═╗╔╦╗
    //  ║ ╦║╣  ║
    //  ╚═╝╚═╝ ╩

    logout: function (req, res) {
        passport.logout(req, res);
        return res.redirect('/auth');
    },

    //
    // login strategies
    //

    addStrategy: function(req, res) {
        var strategy = req.param('strategy');
        if (!sails.config.passport.strategies[strategy]) {
            console.warn('обращение к несуществующей стратегии:', strategy);
            return res.redirect('/auth');
        }
        passport.authenticate([strategy], function(err, user) {
            if (err || !user) {
                console.error(strategy+' auth error', err, user);
                return AuthController.tryAgain(req, res, err);
            }
            if (req.isAuthenticated()) {
                // осуществлялась привязка нового провайдера
                // к существующему пользователю
                return res.redirect(sails.config.passport.fillCredentials);
            }

            passport.login(req, res, user, function(err) {
                if (err) return AuthController.tryAgain(req, res, err);
                if (!user.username || !user.email || req._just_registered) {
                    // только что зарегистрирован или отсутствуют требуемые поля
                    req.flash('info', 'Пожалуйста, заполните информацию о себе.')
                    return res.redirect(sails.config.passport.fillCredentials);
                }
                return res.redirect(sails.config.passport.successRedirect);
            });
        })(req, res);
    },

    removeStrategy: function(req, res) {
        var strategy = req.param('strategy');
        var referer = req.get('referer');
        Passport.findOne({
            user: req.user.id,
            strategy: strategy,
        }, function(err, p) {
            if (err) return res.send(500);
            if (p) {
                return p.destroy(function(err) {
                    if (err) return res.send(500);
                    return res.redirect(referer || '/settings');
                });
            }
            return AuthController.registered(req, res);
        });
    },



    //  ╔═╗╔═╗╔═╗╔╦╗
    //  ╠═╝║ ║╚═╗ ║
    //  ╩  ╚═╝╚═╝ ╩

    action: function (req, res) {
        var action = req.param('action');

        // LOGIN
        if (!action || action == 'login') {
            passport.authenticate(['local'], function (err, user, challenges) {
                if (err || !user) {
                    // ошибка или оправдание - показать пользователю
                    var errorText = err || challenges;
                    return AuthController.tryAgain(req, res, errorText);
                }
                // аутентификация успешна
                passport.login(req, res, user, function(err) {
                    if (err) return AuthController.tryAgain(req, res, err);
                    if (!user.username || !user.email) {
                        // отсутствуют требуемые поля
                        req.flash('info', 'Пожалуйста, заполните информацию о себе.')
                        return res.redirect(sails.config.passport.fillCredentials);
                    }
                    return res.redirect(sails.config.passport.successRedirect);
                });
            })(req, res);
        }

        // REGISTER
        else if (action == 'register') {
            var email = req.param('email');
            var username = req.param('username');
            var password = req.param('password');

            // minLength от Waterline всегда пропускает 0 символов... -_-
            if (!username || !password)
                return AuthController.tryAgain(req, res, new Error('Все поля обязательны для заполнения'));

            var created = [];
            return Q.resolve()
                .then(function() {
                    return Q.all([
                        User.create({
                            username: username,
                            email: email,
                        }).populateAll(),
                        Role.findOne({name: 'user'}),
                    ])
                })
                .spread(function(user, role) {
                    user.roles.add(role.id);
                    user.save();
                    return user;
                })
                .then(function(user) {
                    created.push(user);
                    return Passport.create({
                        user     : user.id,
                        strategy : 'local',
                        password : password,
                    })
                    .then(function(passport) {
                        created.push(passport);
                        return user;
                    })
                })
                .then(function(user) {
                    console.info('New local user! ID:', user.id, user.email);
                    // аутентифицируем пользователя
                    passport.login(req, res, user, function(err) {
                        if (err) return AuthController.tryAgain(req, res, err);
                        return res.redirect(sails.config.passport.fillCredentials);
                    });
                })
                .catch(function(err) {
                    console.error('Ошибка при регистрации. Откат.');
                    console.info('user cred:', email, username, password);
                    return Q.all(_.map(created, function(inst) {
                        return Q.resolve()
                            .then(function() {
                                console.log('destroy:', inst);
                                inst.destroy();
                            })
                    }))
                    .then(function() {
                        return AuthController.tryAgain(req, res, err);
                    })
                })
        }
        // WTF?!
        else {
            // dafuq s dat?!
            console.error('auth controller, unrecognized action:', action);
            return res.redirect('/');
        }
    },



    //  ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
    //  ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
    //  ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝

    // возвращает на предыдущую страницу, но теперь с ошибками.
    // сохраняет заполненные данные
    tryAgain: function(req, res, errors) {
        // сообщения об ошибке
        if (errors) {
            if (!Array.isArray(errors)) {
                log.warn('tryAgain', errors || errors.message);
                errors = [errors];
            }
            var flashes = [];
            _.each(errors, function(err) {
                if (!err.Errors) {
                    // ошибка, но не от валидации...
                    flashes.push(err.message || err);
                }
                else {
                    _.each(err.Errors, function(trouble) {
                        _.each(trouble, function(instance) {
                            flashes.push(instance.message);
                        });
                    });
                }
            });
            req.flash('error', flashes);
        }

        // данные, чтобы форма восстановила свои данные
        req.flash('form', req.body);

        // вьюшки должны уметь показывать error & form
        var referer = req.get('referer');
        res.redirect(referer || '/');
    },

};

module.exports = AuthController;
