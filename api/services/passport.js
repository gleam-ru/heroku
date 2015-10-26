var validator = require('validator');
var passport  = require('passport');



// создаем сессию для пользователя
passport.login = function(req, res, user, cb) {
    if (!user) return cb(new Error('user not found'));
    return Q.resolve()
        .then(function() {
            return User
                .findOne({id: user.id})
                .populateAll()
        })
        .then(function(user) {
            if (!user) {
                throw new Error('user not found - 2')
            }
            return Q.ninvoke(req, 'login', user)
                .then(function() {
                    res.locals.user = user;
                    return user;
                })

        })
        .then(function(user) {
            return Q.ninvoke(passport.rememberme, 'issue', user)
                .then(function(token) {
                    res.cookie(sails.config.passport.rememberme.key, token, { path: '/', httpOnly: true, maxAge: 604800000 });
                })
        })
        .nodeify(cb);
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
    User
        .findOne(id)
        .populate('roles')
        .exec(cb);
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
        User
            .findOne(query)
            .populateAll()
            .then(function(user) {
                if (!user) {
                    if (isEmail) {
                        throw new Error('Неправильный почтовый адрес');
                    }
                    else{
                        throw new Error('Неправильное имя пользователя');
                    }
                }
                var user_passport = _.find(user.passports, {strategy: 'local'})
                if (!user_passport) {
                    console.error('bad user:', user);
                    throw new Error('У пользователя не установлен пароль, авторизация невозможна');
                }
                return Q
                    .ninvoke(user_passport, 'validatePassword', password)
                    .then(function(res) {
                        if (!res) {
                            throw new Error('Неправильный пароль');
                        }
                        return user;
                    })
            })
            .nodeify(cb)
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
function userByPassport(req, _passport, _user, done) {
    if (req.isAuthenticated()) {
        // пользователь аутентифицирован -> привязка.
        return attachPassportToExistingUser(_passport, req.user.id, function(err, user) {
            if (err) return done(err);
            req.flash('info', 'Аккаунт '+_passport.strategy+' успешно привязан.');
            return done(err, user);
        });
    }
    async.waterfall([
        // ищу паспорт
        function(asyncCb) {
            Passport.findOne({
                strategy   : _passport.strategy,
                identifier : String(_passport.identifier),
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
                        user       : user.id,
                    }, function(err) {
                        if (err) {
                            console.error('unable to create passport ('+_passport.strategy+' auth)', err);
                            return asyncCb(err);
                        }
                        req._just_registered = true;
                        console.info('New '+_passport.strategy+' user! ID: '+user.id);
                        asyncCb(null, user);
                    });
                });
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

//
// Для привязки нескольких провайдеров к одной учетной записи
// done(err, user)
function attachPassportToExistingUser(_passport, _user_id, done) {
    Passport.findOne({
        strategy   : _passport.strategy,
        identifier : _passport.identifier,
    }, function(err, found) {
        if (err) return done(err);
        if (found) return done(new Error('Предоставленный идентификатор ('+_passport.strategy+') уже используется'));
        Passport.findOrCreate({
            user       : _user_id,
            strategy   : _passport.strategy,
        }, {
            user       : _user_id,
            strategy   : _passport.strategy,
            identifier : _passport.identifier,
        }, function(err) {
            if (err) {
                console.error('attachPassportToExistingUser trouble:', err);
                return done(err);
            }
            console.info('User '+_user_id+' has attached '+_passport.strategy);
            return User.findOne(_user_id, done);
        });
    });
}




//  ╦  ╦╦╔═
//  ╚╗╔╝╠╩╗
//   ╚╝ ╩ ╩
var VKontakteStrategy  = require('passport-vkontakte').Strategy;
passport.use(new VKontakteStrategy(sails.config.passport.strategies.vkontakte,
    function(req, accessToken, refreshToken, profile, done) {
        userByPassport(req, {
            strategy   : 'vkontakte',
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
passport.use(new GoogleStrategy(sails.config.passport.strategies.google,
    function(req, accessToken, refreshToken, profile, done) {
        userByPassport(req, {
            strategy   : 'google',
            identifier : profile.id,
        }, {
            username   : profile.displayName+' (g_'+profile.id+')',
            email      : profile.emails[0].value
        },
        done);
    }
));



//  ╦ ╦╔═╗╔╗╔╔╦╗╔═╗═╗ ╦
//  ╚╦╝╠═╣║║║ ║║║╣ ╔╩╦╝
//   ╩ ╩ ╩╝╚╝═╩╝╚═╝╩ ╚═
var YandexStrategy = require('passport-yandex').Strategy;
passport.use(new YandexStrategy(sails.config.passport.strategies.yandex,
    function(req, accessToken, refreshToken, profile, done) {
        userByPassport(req, {
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
passport.use(new MailruStrategy(sails.config.passport.strategies.mailru,
    function(req, accessToken, refreshToken, profile, done) {
        userByPassport(req, {
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
passport.use(new TwitterStrategy(sails.config.passport.strategies.twitter,
    function(req, accessToken, refreshToken, profile, done) {
        userByPassport(req, {
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
passport.use(new FacebookStrategy(sails.config.passport.strategies.facebook,
    function(req, accessToken, refreshToken, profile, done) {
        userByPassport(req, {
            strategy   : 'facebook',
            identifier : profile.id,
        }, {
            username   : profile.displayName+' (f_'+profile.id+')',
        },
        done);
    }
));





module.exports = passport;
