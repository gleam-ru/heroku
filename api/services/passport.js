var path               = require('path');
var url                = require('url');
var validator          = require('validator');
var passport           = require('passport');



// создаем сессию для пользователя
passport.login = function(req, res, user, cb) {
    if (!user) return cb(new Error('user not found'));

    req.login(user, function(err) {
        if (err) {
            console.error('unable to log in user:', user.id, err);
            return cb(err);
        }
        res.locals.user = user;
        // даем ему токен
        passport.rememberme.issue(user, function(err, token) {
            if (err) {
                console.error('unable to give token:', err);
                return cb(err);
            }
            res.cookie(sails.config.passport.rememberme.key, token, { path: '/', httpOnly: true, maxAge: 604800000 });
            return cb();
        });
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



//  ╦  ╔═╗╔═╗╔═╗╦
//  ║  ║ ║║  ╠═╣║
//  ╩═╝╚═╝╚═╝╩ ╩╩═╝
var LocalStrategy      = require('passport-local').Strategy;
passport.use(new LocalStrategy(sails.config.passport.local,
    function(identifier, password, cb) {
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
                strategy : 'local',
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
    }
));



//  ╦═╗╔═╗╔╦╗╔═╗╔╦╗╔╗ ╔═╗╦═╗  ╔╦╗╔═╗
//  ╠╦╝║╣ ║║║║╣ ║║║╠╩╗║╣ ╠╦╝  ║║║║╣
//  ╩╚═╚═╝╩ ╩╚═╝╩ ╩╚═╝╚═╝╩╚═  ╩ ╩╚═╝
var RememberMeStrategy = require('passport-remember-me').Strategy;
passport.rememberme = {};
// login по токену
passport.rememberme.verify = function(token, cb) {
    //Ищем пользователя с этим token'ом
    var query = {
        strategy : "rememberme",
        token    : token,
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
        user     : user.id,
        strategy : 'rememberme'
    })
    .exec(function(err) {
        if (err) {
            console.error('unable destroy rememberme passport for user_id:', user.id, err)
            return cb(err);
        }
        // и даем ему новый
        var token = require('crypto').randomBytes(32).toString('hex');
        Passport.create({
            user     : user.id,
            strategy : 'rememberme',
            token    : token
        }, function(err) {
            if (err) {
                console.error('unable to give token:', err);
                return cb(err);
            }
            return cb(null, token);
        });
    });
};
passport.use(new RememberMeStrategy(sails.config.passport.rememberme, passport.rememberme.verify, passport.rememberme.issue));



//
// Алгоритм работы с другими провайдерами схож:
// 1) аутентифицируем
// 2) смотрим - вдруг у нас уже есть
// 2.1) если есть - отдаем его
// 2.2) если нет, то создаем юзера, а на его основе - паспорт
// 3) вы восхитительны!
//
// Для алгоритма, описанного выше, написан более-менее "общий" метод:
// (получает или создает)
// done(err, user)
function userByPassport(_passport, _user, done) {
    async.waterfall([
        // ищу паспорт
        function(asyncCb) {
            Passport.findOne({
                strategy   : _passport.strategy,
                identifier : _passport.identifier,
            }, asyncCb);
        },
        // ищу пользователя паспорта
        //
        // либо (passport, cb)
        // либо (cb)
        function(passport, asyncCb) {
            // создаю паспорт, если не создан
            // в человеческом понимании это равносильно if (!passport)
            if (!asyncCb) {
                asyncCb = passport;
                User.create(_user, function(err, user) {
                    if (err) {
                        console.error('unable to create user ('+_passport.strategy+' auth)', err);
                        return asyncCb(err);
                    }
                    Passport.create({
                        strategy   : _passport.strategy,
                        identifier : _passport.identifier,
                        user: user.id,
                    }, function(err) {
                        if (err) {
                            console.error('unable to create passport ('+_passport.strategy+' auth)', err);
                            return asyncCb(err);
                        }
                        console.info('New '+_passport.strategy+' user! ID: '+user.id);
                        asyncCb(null, user);
                    });
                })
            }
            else {
                User.findOne(passport.user, asyncCb);
            }
        }
    ], function(err, user) {
        if (err) {
            console.error('userByPassport trouble:', err);
        }
        done(err, user);
    });
}





//  ╦  ╦╦╔═
//  ╚╗╔╝╠╩╗
//   ╚╝ ╩ ╩
var VKontakteStrategy  = require('passport-vkontakte').Strategy;
passport.use(new VKontakteStrategy(sails.config.passport.vk,
    function(accessToken, refreshToken, profile, done) {
        userByPassport({
            strategy   : 'vk',
            identifier : profile.id,
        }, {
            username   : profile.displayName+' (v_'+profile.id+')',
        },
        done);
    }
));



//  ╔═╗╔═╗╔═╗╔═╗╦  ╔═╗
//  ║ ╦║ ║║ ║║ ╦║  ║╣
//  ╚═╝╚═╝╚═╝╚═╝╩═╝╚═╝
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
passport.use(new GoogleStrategy(sails.config.passport.google,
    function(accessToken, refreshToken, profile, done) {
        userByPassport({
            strategy   : 'google',
            identifier : profile.id,
        }, {
            username   : profile.displayName+' (g_'+profile.id+')',
            email      : profile.emails[0].value
        },
        done);
    }
));

module.exports = passport;



//  ╦ ╦╔═╗╔╗╔╔╦╗╔═╗═╗ ╦
//  ╚╦╝╠═╣║║║ ║║║╣ ╔╩╦╝
//   ╩ ╩ ╩╝╚╝═╩╝╚═╝╩ ╚═
var YandexStrategy = require('passport-yandex').Strategy;
passport.use(new YandexStrategy(sails.config.passport.yandex,
    function(accessToken, refreshToken, profile, done) {
        userByPassport({
            strategy   : 'yandex',
            identifier : profile.id,
        }, {
            username   : profile.displayName+' (y_'+profile.id+')',
            email      : profile.emails[0].value
        },
        done);
    }
));



//  ╔╦╗╔═╗╦╦  ╦═╗╦ ╦
//  ║║║╠═╣║║  ╠╦╝║ ║
//  ╩ ╩╩ ╩╩╩═╝╩╚═╚═╝
var MailruStrategy = require('passport-mailru').Strategy;
passport.use(new MailruStrategy(sails.config.passport.mailru,
    function(accessToken, refreshToken, profile, done) {
        userByPassport({
            strategy   : 'mailru',
            identifier : profile.id,
        }, {
            username   : profile.displayName+' (m_'+profile.id+')',
            email      : profile.emails[0].value
        },
        done);
    }
));



//  ╔╦╗╦ ╦╦╔╦╗╔╦╗╔═╗╦═╗
//   ║ ║║║║ ║  ║ ║╣ ╠╦╝
//   ╩ ╚╩╝╩ ╩  ╩ ╚═╝╩╚═
var TwitterStrategy = require('passport-twitter').Strategy;
passport.use(new TwitterStrategy(sails.config.passport.twitter,
    function(accessToken, refreshToken, profile, done) {
        userByPassport({
            strategy   : 'twitter',
            identifier : profile.id,
        }, {
            username   : profile.displayName+' (t_'+profile.id+')',
        },
        done);
    }
));



//  ╔═╗╔═╗╔═╗╔═╗╔╗ ╔═╗╔═╗╦╔═
//  ╠╣ ╠═╣║  ║╣ ╠╩╗║ ║║ ║╠╩╗
//  ╚  ╩ ╩╚═╝╚═╝╚═╝╚═╝╚═╝╩ ╩
var FacebookStrategy = require('passport-facebook').Strategy;
passport.use(new FacebookStrategy(sails.config.passport.facebook,
    function(accessToken, refreshToken, profile, done) {
        userByPassport({
            strategy   : 'facebook',
            identifier : profile.id,
        }, {
            username   : profile.displayName+' (f_'+profile.id+')',
        },
        done);
    }
));






module.exports = passport;
