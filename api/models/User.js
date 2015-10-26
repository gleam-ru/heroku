var User = {
    attributes: {
        username  : { type: 'string', unique: true, minLength: 3 },
        email     : { type: 'email',  unique: true },
        access    : { type: 'string', defaultsTo: 'user' },
        roles     : { collection: 'Role', via: 'users' },

        passports : { collection: 'Passport', via: 'user' },

        createdAt : {type: 'date'},
    },

    beforeCreate: function (user, next) {
        user.createdAt = new Date();
        next(null, user);
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
    },

};

module.exports = User;
