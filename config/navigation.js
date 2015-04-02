module.exports.navigation = [
    {
        name     : "Главная",
        href     : "/",
        access   : "",
        children : [],
    },
    {
        name     : "Видит админ",
        href     : "/",
        access   : "admin",
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
