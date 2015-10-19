/**
 * AdminController
 *
 * @description :: Server-side logic for managing admins
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    index: function (req, res) {
        return res.render('admin', {
            title: 'adm'
        });
    },


    // запуск парсера
    bonds_reparse: function (req, res) {
        provider.bonds.hardUpdate();
        req.flash('info', 'парьсим, насяйнике!');
        return res.render('admin', {
            info: req.flash('info'),
        });
    },
    // обновить кэш облигаций данными из базы
    bonds_cache: function (req, res) {
        provider.bonds.softUpdate();
        req.flash('info', 'смотрю базу');
        return res.render('admin', {
            info: req.flash('info'),
        });
    },

    // обновить кэш акций данными из базы
    shares_cache: function(req, res) {
        provider.shares.cacheAll()
            .then(function(shares) {
                req.flash('info', 'Кэш акций обновлен: '+shares.length);
                return res.render('admin', {
                    info: req.flash('info'),
                });
            })
    },

    shares_dropCache: function(req, res) {
        provider.shares.dropCached()
            .then(function(dropped) {
                req.flash('info', 'dropped: '+dropped.toString());
                return res.render('admin', {
                    info: req.flash('info'),
                });
            })
    },

    shares_updateInday: function(req, res) {
        provider.shares.updateIndayCandles()
            .then(function() {
                req.flash('info', 'updated');
                return res.render('admin', {
                    info: req.flash('info'),
                });
            })
    },
};

