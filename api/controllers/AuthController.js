/**
 * Authentication Controller
 *
 * This is merely meant as an example of how your Authentication controller
 * should look. It currently includes the minimum amount of functionality for
 * the basics of Passport.js to work.
 */

var AuthController = {

    //  ╔═╗╔═╗╔╦╗
    //  ║ ╦║╣  ║
    //  ╚═╝╚═╝ ╩

    login: function (req, res) {
        // авторизирован? иди в профиль.
        if (req.isAuthenticated()) return res.redirect('/me');
        // Render the `auth/login` view
        var data = req.flash('form');
        return res.render('auth/login', {
            errors: req.flash('error'),
            form: data[0] || {},
        });
    },

    logout: function (req, res) {
        passport.logout(req, res);
        res.redirect('/login')
    },

    register: function (req, res) {
        // авторизирован? иди в профиль.
        if (req.isAuthenticated()) return res.redirect('/me');
        return res.render('auth/register', {
            errors: req.flash('error')
        });
    },

    tryAgain: function(req, res, err) {
        console.error('auth error:', err);

        // сообщение об ошибке
        req.flash('error', err.message);
        // данные, чтобы форма восстановила свои данные
        req.flash('form', req.body);

        // редиректы в нужные места, в зависимости от действия
        // вьюшки должны уметь показывать error & form
        var action = req.param('action');
        if (!action || action == 'login') {
            res.redirect('/login');
        }
        else if (action == 'register') {
            res.redirect('/register');
        }
        else {
            res.redirect('/');
        }
    },



    //  ╔═╗╔═╗╔═╗╔╦╗
    //  ╠═╝║ ║╚═╗ ║
    //  ╩  ╚═╝╚═╝ ╩

    action: function (req, res) {
        passport.authenticate(['local'], function (err, user, challenges, statuses) {
            if (err || !user) {
                // ошибка или оправдание - показать пользователю
                var errorText = err || challenges;
                return AuthController.tryAgain(req, res, errorText);
            }

            // аутентификация успешна
            passport.login(req, res, user, function(err) {
                // даем токен пользователю
                passport.rememberme.issue(user, function(err, token) {
                    if (err) console.error('unable to give token:', err);
                    res.cookie(sails.config.passport.rememberme.key, token, { path: '/', httpOnly: true, maxAge: 604800000 });
                    return res.redirect('/me');
                });
            })
        })(req, res);
    }
};

module.exports = AuthController;
