/**
 * SettingsController
 *
 * Страничка с настройками пользователя:
 *   - смена своих данный
 *   - привязка других регистраций
 *
 */

module.exports = {
    index: function(req, res) {
        var strategies = sails.config.passport.strategies;
        var providers = _.keys(strategies);
        providers = _.map(providers, function(provider) {
            var strategy = strategies[provider];
            return {
                provider: provider,
                name: strategy.name,
                href: strategy.callbackURL,
                icon: strategy.icon,
            }
        });

        Passport.find({user: req.user.id}, function(err, passports) {
            if (err) {
                console.error(err);
                return res.send(500);
            }
            var attachedProviders = _.map(passports, function(p) {
                var idx = _.findIndex(providers, {provider: p.strategy});
                if (idx !== -1) {
                    return providers.splice(idx, 1);
                }
            });
            attachedProviders = _(attachedProviders).flatten().compact().value();

            return res.render('settings', {
                info       : req.flash('info'),
                errors     : req.flash('error'),
                attachable : providers,
                attached   : attachedProviders,
                username   : req.user.username,
                email      : req.user.email,
            });
        });
    },


    update: function(req, res) {
        var username     = req.param('username');
        var email        = req.param('email');
        var new_password = req.param('new_password');
        async.waterfall([
            function(next) {
                User.findOne(req.user.id, next);
            },
            function(user, next) {
                user.username = username;
                user.email = email;
                user.save(next);
            },
            function(user, next) {
                if (!new_password) next();
                Passport.findOne({
                    user: req.user.id,
                    strategy: 'local',
                }, next);
            },
            function(passport, next) {
                if (!next) return passport(); // особенности waterfall
                passport.password = new_password;
                passport.save(next);
            },
        ], function(errors) {
            if (errors) {
                var flashes = [];
                _([errors]).flatten().each(function(err) {
                    if (!err.Errors) {
                        // ошибка, но не от валидации...
                        flashes.push(err.message || err);
                    }
                    else {
                        _(err.Errors).each(function(trouble) {
                            _(trouble).each(function(instance) {
                                flashes.push(instance.message);
                            });
                        });
                    }
                });
                req.flash('error', flashes);
            }
            else {
                req.flash('info', 'Данные успешно обновлены!');
            }
            return res.redirect('/settings');
        });
    },


};
