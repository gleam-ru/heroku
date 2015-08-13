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
        href     : "/auth",
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
            {
                name     : "Акции",
                href     : "/services/shares",
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
                name     : "Обсуждение",
                href     : "/about/feedback",
            },
            {
                name     : "Поддержать проект",
                href     : "/about/donation",
            },
        ]
    },

    //
    // ОдминЪка
    //
    {
        name     : "Админка",
        href     : "/adm",
        canSee   : ["admin"],
    },
];
