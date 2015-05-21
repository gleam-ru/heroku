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
        provider.bonds.update();
        req.flash('info', 'парьсим, насяйнике!');
        return res.render('admin', {
            info: req.flash('info'),
        });
    },
    // обновить кэш облигаций данными из базы
    bonds_cache: function (req, res) {
        provider.bonds.updateCurrent();
        req.flash('info', 'смотрю базу');
        return res.render('admin', {
            info: req.flash('info'),
        });
    },

};

