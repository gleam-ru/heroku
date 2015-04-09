/**
 * policies/rememberMe.js
 *
 * Производит авторизацию по токену в куках
 * с использоватием стратегии remember-me
 *
 */

module.exports = function (req, res, cb) {
    if (req.isAuthenticated()) return cb();

    var key = sails.config.passport.rememberme.key;
    var token = req.cookies[key];
    if (token) {
        return passport.authenticate('remember-me', function(err, user) {
            if (err || !user) {
                console.error('remember-me verify:', err);
                return passport.logout(req, res, cb);
            }
            return passport.login(req, res, user, cb)
        })(req, res, cb)
    }
    else {
        return cb();
    }
};
