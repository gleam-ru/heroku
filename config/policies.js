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
        '*' : ['authenticated']
    }

};
