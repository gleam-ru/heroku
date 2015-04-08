module.exports.passport = {
    allStrategies: {
        passReqToCallback: true,
    },

    local: {
        usernameField: 'identifier',
        successRedirect: '/me',
        failureRedirect: '/login',
        failureFlash: true,
    }
};
