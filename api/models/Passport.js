var bcrypt = require('bcryptjs');

// Hash a passport password.
function hashPassword (passport, next) {
    if (passport.password) {
        bcrypt.hash(passport.password, 10, function (err, hash) {
            // passport.password = hash;
            next(err, passport);
        });
    } else {
        next(null, passport);
    }
}



var Passport = {
    attributes: {
        user: { model: 'User', required: true },

        // Required field: Protocol
        strategy: { type: 'alphanumeric', required: true },

        // Local strategy
        password: { type: 'string', minLength: 3 },
        validatePassword: function(password, cb) {
            bcrypt.compare(password, this.password, cb);
        },

        // Remember Me strategy
        token:  { type: 'string' },
        activateToken: function(cb) {
            if (this.strategy == 'rememberme') {
                return this.destroy(cb);
            }
            return cb(new Error('wrong strategy'));
        },

        // vk strategy
        identifier: { type: 'string' },
    },


    validationMessages: {
        password: {
            required: 'Пароль обязателен.',
            minLength: 'Пароль не короче 3 символов.',
        },
    },


    //  ╦ ╦╔═╗╔═╗╦╔═╔═╗
    //  ╠═╣║ ║║ ║╠╩╗╚═╗
    //  ╩ ╩╚═╝╚═╝╩ ╩╚═╝╝

    beforeCreate: function (passport, next) {
        hashPassword(passport, next);
    },

    beforeUpdate: function (passport, next) {
        hashPassword(passport, next);
    }
};

module.exports = Passport;
