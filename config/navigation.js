module.exports.navigation = [

    //
    // login/register
    //
    {
        name     : "Профиль",
        href     : "/me",
        canSee   : ["admin", "user"],
        children : [
            {
                name     : "Настройки",
                href     : "/settings",
            },
            {
                name     : "Выйти",
                href     : "/logout",
            },
        ],
    },
    {
        name     : "Войти",
        href     : "/login",
        canSee   : ["ghost"],
    },

    //
    // Сервисы
    //
    {
        name     : "Сервисы",
        href     : "/services",
        children : [
            {
                name     : "Облигации",
                href     : "/services/bonds",
            },
        ]
    },

    //
    // About
    //
    {
        name     : "О проекте",
        href     : "/about",
        children : [
            {
                name     : "Статистика",
                href     : "/about/statistics",
            },
            {
                name     : "Связаться с автором",
                href     : "/about/feedback",
            },
        ]
    },

    //
    // dev
    //
    {
        name     : "GO",
        href     : "/services/bonds",
        canSee   : ["admin"],
    },
];
