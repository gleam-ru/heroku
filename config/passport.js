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

    // https://console.developers.google.com/project/calcium-adapter-447/apiui/credential?authuser=0
    google: {
        clientID: '63880045882-73cm3lsd32d4clglkom8fsq65m6rnujp.apps.googleusercontent.com',
        clientSecret: 'mqA16-hvRSWbpEf6XdIjfUfC',
        callbackURL: '/auth/google',
        // https://developers.google.com/identity/protocols/OAuth2UserAgent
        // https://developers.google.com/+/api/oauth#login-scopes
        scope: [
            'profile',
            'email',
        ],
    },
};
