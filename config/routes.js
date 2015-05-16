module.exports.routes = {

    //
    // Main page
    //
    'get /': 'Main',



    //
    // Profile page
    //
    'get /me': 'Profile',

    // Settings
    'get /settings': 'Settings',

    // Auth
    'get /login'         : 'Auth',
    'get /logout'        : 'Auth.logout',
    'get /auth/vk'       : 'Auth.vk',
    'get /auth/google'   : 'Auth.google',
    'get /auth/yandex'   : 'Auth.yandex',
    'get /auth/mailru'   : 'Auth.mailru',
    //---
    'post /auth/:action' : 'Auth.action', // 'login', 'register'



    //
    // Services
    //
    'get /services': 'Services',

    // Bonds
    'get /services/bonds'               : 'Bonds',
    'get /services/bonds/all'           : 'Bonds.bonds',
    'get /services/bonds/filters'       : 'Bonds.filters',
    'get /services/bonds/additional'    : 'Bonds.additional',
    //---
    'post /services/bonds/updateFilter' : 'Bonds.updateFilter',



    //
    // About page
    //
    'get /about': 'About',

    // статистика сайта
    'get /about/statistics': 'About.statistics',

    // обратная связь
    'get /about/feedback': 'About.feedback',





    //  ╔╦╗╔═╗╔═╗╔╦╗
    //   ║ ║╣ ╚═╗ ║
    //   ╩ ╚═╝╚═╝ ╩
    'get /403': {response: 'forbidden'},
    'get /404': {response: 'notFound'},
    'get /500': {response: 'serverError'},

    'get /test': 'Main.test',

};
