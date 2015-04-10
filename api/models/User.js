var User = {
    attributes: {
        username  : { type: 'string', unique: true, minLength: 3 },
        email     : { type: 'email',  unique: true },
        access    : { type: 'string', defaultsTo: 'user' },
        passports : { collection: 'Passport', via: 'user' },
    },

    validationMessages: {
        email: {
            required: 'Email обязателен.',
            unique: 'Email кем-то занят.',
            email: 'Email не валиден.',
        },
        username: {
            required: 'Имя пользователя обязательно.',
            unique: 'Имя пользователя кем-то занято.',
            minLength: 'Имя пользователя не короче 3 символов.',
        }
    }
};

module.exports = User;
