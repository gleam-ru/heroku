module.exports.routes = {

    'get /': {view: 'index'},
    'get /profile': 'Profile.index',
    'get /me': 'Profile.index',

    /**
     * Необязательно... только чтобы посмотреть страницы
     */
    'get /403': {response: 'forbidden'},
    'get /404': {response: 'notFound'},
    'get /500': {response: 'serverError'},


    /**
     * Аутентификация/Регистрация
     */
    'get /login': 'AuthController.login',
    'get /logout': 'AuthController.logout',
    'get /register': 'AuthController.register',

    'post /auth/:action': 'AuthController.action', // 'login', 'register'

};
