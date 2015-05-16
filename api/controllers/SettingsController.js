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
                attachable : providers,
                attached   : attachedProviders,
            });
        });
    },


};
