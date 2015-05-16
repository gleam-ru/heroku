/**
 * policies/redirect.js
 *
 * Пускает авторизированных,
 * отправляет неавторизированных на страницу
 * входа
 *
 */
module.exports = function (req, res, cb) {
    if (req.isAuthenticated()) {
        return cb();
    }
    else {
        return res.redirect('/auth');
    }
};
