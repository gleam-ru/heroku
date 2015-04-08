var path           = require('path');
var url            = require('url');
var validator      = require('validator');
var passport       = require('passport');
var LocalStrategy  = require('passport-local').Strategy;



// инит паспорта (делает доступными стратегии, сессии и прочую чепуху)
passport.init = function(req, res, cb) {
    // Initialize Passport
    passport.initialize()(req, res, function () {
        // Use the built-in sessions
        passport.session()(req, res, function () {
            // Make the user available throughout the frontend
            res.locals.user = req.user;
            cb();
        });
    });
}




//  ███████╗████████╗██████╗  █████╗ ████████╗███████╗ ██████╗ ██╗███████╗███████╗
//  ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝██╔════╝██╔════╝ ██║██╔════╝██╔════╝
//  ███████╗   ██║   ██████╔╝███████║   ██║   █████╗  ██║  ███╗██║█████╗  ███████╗
//  ╚════██║   ██║   ██╔══██╗██╔══██║   ██║   ██╔══╝  ██║   ██║██║██╔══╝  ╚════██║
//  ███████║   ██║   ██║  ██║██║  ██║   ██║   ███████╗╚██████╔╝██║███████╗███████║
//  ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝ ╚═════╝ ╚═╝╚══════╝╚══════╝

// Добавляет стратегии в паспорт
passport.loadStrategies = function() {
    // глобальные опции для всех стратегий
    var options = sails.config.passport.allStrategies || {};

    // добавляем локальную стратегию в паспорт
    passport.use(
        new LocalStrategy(
            _.extend(options, sails.config.passport.local),
            localStrategy
        )
    );
}



//  ╦  ╔═╗╔═╗╔═╗╦
//  ║  ║ ║║  ╠═╣║
//  ╩═╝╚═╝╚═╝╩ ╩╩═╝
var localStrategy = function(req, identifier, password, cb) {
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
}



module.exports = passport;
