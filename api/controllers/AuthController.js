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
        if (req.isAuthenticated()) return res.redirect('/me');
        var data = req.flash('form');
        return res.render('auth', {
            errors: req.flash('error'),
            form: data[0] || {},
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

    strategies: function(req, res) {
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
                // осуществляется привязка нового провайдера к существующему пользователю
                return AuthController.attached(req, res);
            }

            passport.login(req, res, user, function(err) {
                if (err) return AuthController.tryAgain(req, res, err);
                if (!user.username || !user.email) {
                    // redirect to
                    // Пожалуйста, заполните информацию о себе
                    // TODO: fc_key
                }
                return res.redirect(sails.config.passport.successRedirect);
            });
        })(req, res);
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
                    res.redirect('/me');
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

            User.create({
                username: username,
                email: email,
            }, function(err, user) {
                if (err) return AuthController.tryAgain(req, res, err);
                Passport.create({
                    user     : user.id,
                    strategy : 'local',
                    password : password,
                }, function(err) {
                    if (err) {
                        // что-то пошло не так
                        return user.destroy(function(err_1) {
                            if (err_1) console.error('unable to destroy user:', err_1);
                            return AuthController.tryAgain(req, res, err);
                        });
                    }
                    console.info('New local user! ID: '+user.id);
                    // аутентифицируем пользователя
                    passport.login(req, res, user, function(err) {
                        if (err) return AuthController.tryAgain(req, res, err);
                        res.redirect('/me');
                    });
                });
            });
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
        if (!Array.isArray(errors)) {
            log.warn('tryAgain', errors.message);
            errors = [errors];
        }

        var flashes = [];
        _(errors).each(function(err) {
            if (!err.Errors) {
                // ошибка, но не от валидации...
                flashes.push(err.message || err);
            }
            else {
                _(err.Errors).each(function(trouble) {
                    _(trouble).each(function(instance) {
                        flashes.push(instance.message);
                    });
                });
            }
        });
        req.flash('error', flashes);
        //*/

        // данные, чтобы форма восстановила свои данные
        req.flash('form', req.body);

        // вьюшки должны уметь показывать error & form
        var referer = req.get('referer');
        res.redirect(referer || '/');
    },


    attached: function(req, res) {
        var referer = req.get('referer');
        req.flash('results', 'oke');
        return res.redirect(referer || '/');
    },

};

module.exports = AuthController;
