/**
 * Политики
 * (методы, которые вызываются ПЕРЕД переходом на страницу)
 *
 * http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports.policies = {
    // вдруг уже аутентифицирован?
    '*': ['rememberMe'],

    // работать с профилем может только аутентифицированный пользователь
    ProfileController: {
        '*' : ['redirect', 'authenticated'],
    },

    SettingsController: {
        '*' : ['redirect', 'authenticated'],
    },

    // Облигации, работа с фильрами
    BondsController: {
        'updateFilter': ['rememberMe', 'authenticated'],
    },

    // Админка акций
    SharesController: {
        'editorPage': ['rememberMe', 'authenticated', 'isSharesFiller'],
        //
        'favorites':     ['rememberMe', 'authenticated'],
        'getFavorites':  ['rememberMe', 'authenticated'],
    },

    // Админка
    AdminController: {
        '*': ['rememberMe', 'authenticated', 'isAdmin'],
    },

};
