module.exports.passport = {

    // TODO: fc_key
    fillCredentials: '/me/settings',
    successRedirect: '/me',

    local: {
        usernameField: 'identifier',
        successRedirect: '/me',
        failureRedirect: '/auth',
        failureFlash: true,
    },

    rememberme: {
        key: 'token',
    },

    // https://vk.com/dev/auth_sites
    vkontakte: {
        clientID: '4918582', // docs call it 'APP ID'
        clientSecret: 'JlEHf1Vir4vCPfrqIf6n',
        callbackURL: '/auth/vkontakte',
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

    // https://apps.twitter.com/app/8316700/keys
    twitter: {
        consumerKey: '6V7MpAjnQMuSymHUdGaWtkgsJ',
        consumerSecret: 'rZGwWkyqFpAnPefWmD2VYO71qof9gJu9PU15JhseJEHFSc6gz5',
        // дурак, не умеет множественные :(
        callbackURL: '/auth/twitter',
    },

    // https://developers.facebook.com/apps
    facebook: {
        clientID: '853548804699571',
        clientSecret: '000899e62b01222984723c31c90eeb42',
        callbackURL: '/auth/facebook',
        enableProof: false
    },
};
