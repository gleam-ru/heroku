module.exports.routes = {

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗
    //  ╠═╝╠═╣║ ╦║╣ ╚═╗
    //  ╩  ╩ ╩╚═╝╚═╝╚═╝
    'get /': {view: 'index'},
    'get /me': 'Profile.index',
    'get /login': 'AuthController.login',
    'get /register': 'AuthController.register',





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
