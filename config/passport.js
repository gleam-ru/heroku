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

    // https://oauth.yandex.ru/client/new
    yandex: {
        clientID: '04ab32011e954e189f0eae8045fd54d2',
        clientSecret: 'c28aaed874dc486c88dde7d3dabbf440',
        // дурак, не умеет множественные :(
        // https://oauth.yandex.ru/client/04ab32011e954e189f0eae8045fd54d2
        callbackURL: '/auth/yandex',
    },

    // http://api.mail.ru/sites/my/733695
    mailru: {
        clientID: '733695',
        clientSecret: 'ecb5e49555833c492b2abddcbddb2f0d',
        // дурак, не умеет множественные :(
        callbackURL: '/auth/mailru',
    },
};
