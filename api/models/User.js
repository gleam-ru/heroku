var User = {
    attributes: {
        username  : { type: 'string', unique: true },
        email     : { type: 'email',  unique: true },
        access    : { type: 'string', defaultsTo: 'user' },
        passports : { collection: 'Passport', via: 'user' },
    },
};

module.exports = User;
