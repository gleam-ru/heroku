var path               = require('path');
var url                = require('url');
var validator          = require('validator');
var passport           = require('passport');
var LocalStrategy      = require('passport-local').Strategy;
var RememberMeStrategy = require('passport-remember-me').Strategy;



// создаем сессию для пользователя
passport.login = function(req, res, user, cb) {
    if (!user) return cb(new Error('user not found'));

    req.login(user, function(err) {
        if (err) {
            console.error('unable to log in user:', user.id, err);
            return cb(err);
        }
        res.locals.user = user;
        return cb();
    });
};


// дропаем сессию для пользователя
passport.logout = function(req, res, cb) {
    req.logout();
    res.locals.user = {};
    res.clearCookie(sails.config.passport.rememberme.key);
    if (cb) return cb();
};



// Так написано в доках
passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});
// Так написано в доках-2
passport.deserializeUser(function(id, cb) {
    User.findOne(id)
        .exec(function(err, user) {
            cb(err, user);
        });
});





//  ███████╗████████╗██████╗  █████╗ ████████╗███████╗ ██████╗ ██╗███████╗███████╗
//  ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝██╔════╝██╔════╝ ██║██╔════╝██╔════╝
//  ███████╗   ██║   ██████╔╝███████║   ██║   █████╗  ██║  ███╗██║█████╗  ███████╗
//  ╚════██║   ██║   ██╔══██╗██╔══██║   ██║   ██╔══╝  ██║   ██║██║██╔══╝  ╚════██║
//  ███████║   ██║   ██║  ██║██║  ██║   ██║   ███████╗╚██████╔╝██║███████╗███████║
//  ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝ ╚═════╝ ╚═╝╚══════╝╚══════╝
// глобальные опции для всех стратегий
passport.options = sails.config.passport.allStrategies || {};



//  ╦  ╔═╗╔═╗╔═╗╦
//  ║  ║ ║║  ╠═╣║
//  ╩═╝╚═╝╚═╝╩ ╩╩═╝
var opts = _.extend(passport.options, sails.config.passport.local);
var auth = function(req, identifier, password, cb) {
    var isEmail = validator.isEmail(identifier);
    var query = {};
    if (isEmail) {
        query.email = identifier;
    }
    else {
        query.username = identifier;
    }
    User.findOne(query, function (err, user) {
        if (err) return cb(err);
        if (!user) {
            if (isEmail)
                msg = 'Неправильный почтовый адрес';
            else
                msg = 'Неправильное имя пользователя';
            return cb(new Error(msg), null);
        }
        Passport.findOne({
            protocol : 'local',
            user     : user.id,
        }, function (err, passport) {
            if (err) return cb(err);
            if (!passport) {
                return cb(new Error('У пользователя не установлен пароль, авторизация невозможна'), false);
            }
            else {
                passport.validatePassword(password, function (err, res) {
                    if (err) {
                        return cb(err);
                    }
                    if (!res) {
                        return cb(new Error('Неправильный пароль'), false);
                    } else {
                        return cb(null, user);
                    }
                });
            }
        });
    });
};
passport.use(new LocalStrategy(opts, auth));



//  ╦═╗╔═╗╔╦╗╔═╗╔╦╗╔╗ ╔═╗╦═╗  ╔╦╗╔═╗
//  ╠╦╝║╣ ║║║║╣ ║║║╠╩╗║╣ ╠╦╝  ║║║║╣
//  ╩╚═╚═╝╩ ╩╚═╝╩ ╩╚═╝╚═╝╩╚═  ╩ ╩╚═╝
passport.rememberme = {};
passport.rememberme.opts = _.extend(passport.options, sails.config.passport.rememberme);
// login по токену
passport.rememberme.verify = function(token, cb) {
    //Ищем пользователя с этим token'ом
    var query = {
        protocol: "rememberme",
        token: token,
    };
    Passport.findOne(query, function(err, passport) {
        if (err || !passport) return cb(err || 'passport not found');
        User.findOne({
            id: passport.user
        }, function(err, user) {
            if (err) return cb(err);
            if (!user) {
                // отправили токен, который есть в базе, но не ведет на пользователя
                return passport.destroy(function(err) {
                    return cb(err || 'corrupted passport');
                });
            }
            passport.activateToken(function(err) {
                if (err) return cb(err);
                cb(null, user);
            });
        });
    });
};
// даем новый токен
passport.rememberme.issue = function(user, cb) {
    // удаляем все токены данного пользователя
    Passport.destroy({
        user: user.id,
        protocol: 'rememberme'
    })
    .exec(function(err) {
        if (err) return cb(err);
        // и даем ему новый
        var token = require('crypto').randomBytes(32).toString('hex');
        Passport.create({
            user: user.id,
            protocol: 'rememberme',
            token: token
        }, function(err, passport) {
            if (err) return cb(err);
            return cb(null, token);
        });
    });
};
passport.use(new RememberMeStrategy(opts, passport.rememberme.verify, passport.rememberme.issue));



module.exports = passport;
