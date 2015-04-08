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
        // Render the `auth/login` view
        var data = req.flash('form');
        res.render('auth/login', {
            errors: req.flash('error'),
            form: data[0] || {},
        });
    },

    logout: function (req, res) {
        req.logout();

        // mark the user as logged out for auth purposes
        req.session.authenticated = false;
        req.session.access = undefined;

        res.redirect('/login');
    },

    register: function (req, res) {
        res.view({
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

    action: function (request, response) {
        passport.init(request, response, function() {
            passport.authenticate('local', function (err, user, challenges, statuses) {
                if (err || !user) {
                    // ошибка или оправдание - показать пользователю
                    var errorText = err || challenges;
                    return AuthController.tryAgain(request, response, errorText);
                }

                request.login(user, function (req, res, err) {
                    if (err) return tryAgain(err);
                    // пишем все, что надо, в сессию (не забыть удалить при logout!!!)
                    request.session.authenticated = true;
                    request.session.access = user.access || 'user';

                    // и отправляем пользователя в профиль
                    response.redirect('/me');
                });
            })(request, response);
        });
    }
};

module.exports = AuthController;
