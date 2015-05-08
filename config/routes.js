module.exports.routes = {

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗
    //  ╠═╝╠═╣║ ╦║╣ ╚═╗
    //  ╩  ╩ ╩╚═╝╚═╝╚═╝
    'get /': 'Main.index',
    'get /me': 'Profile.index',
    'get /login': 'AuthController.login',
    'get /register': 'AuthController.register',

    'get /bonds': 'BondsController',
    'get /bonds/all': 'BondsController.bonds',
    'get /bonds/filters': 'BondsController.filters',
    'get /bonds/additional': 'BondsController.additional',
    'post /bonds/updateFilter': 'BondsController.updateFilter',






    //  ╔╦╗╔═╗╔═╗╔╦╗
    //   ║ ║╣ ╚═╗ ║
    //   ╩ ╚═╝╚═╝ ╩
    'get /403': {response: 'forbidden'},
    'get /404': {response: 'notFound'},
    'get /500': {response: 'serverError'},





    //  ╔═╗╔═╗╦
    //  ╠═╣╠═╝║
    //  ╩ ╩╩  ╩
    'get /logout': 'AuthController.logout',
    'post /auth/:action': 'AuthController.action', // 'login', 'register'



};
