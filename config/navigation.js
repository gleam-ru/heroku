module.exports.navigation = [
    {
        name     : "Профиль",
        href     : "/me",
        canSee   : ["admin", "user"],
        children : [
            {
                name     : "Выйти",
                href     : "/logout",
            }
        ],
    },
    {
        name     : "Авторизация",
        href     : "/login",
        canSee   : ["ghost"],
        children : [
            {
                name: "Регистрация",
                href: "/register",
                canSee: ["ghost"]
            }
        ],
    },
    {
        name     : "Видит админ",
        href     : "/",
        canSee   : ["admin"],
    },
    {
        name     : "Сервисы",
        children : [
            {
                name     : "Первый",
            },
            {
                name     : "Второй",
            },
        ]
    },
    {
        name     : "Текущий",
        href     : "/current",
    }
];
