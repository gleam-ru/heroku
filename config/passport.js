module.exports.passport = {

    // TODO: fc_key
    fillCredentials: '/me/settings',

    local: {
        usernameField: 'identifier',
        successRedirect: '/me',
        failureRedirect: '/login',
        failureFlash: true,
    },

    rememberme: {
        key: 'token',
    },

    // https://vk.com/dev/auth_sites
    vk: {
        clientID: '4918582', // docs call it 'APP ID'
        clientSecret: 'JlEHf1Vir4vCPfrqIf6n',
        callbackURL: '/auth/vk',
        successRedirect: '/me',
        failureRedirect: '/login',
    },
};
