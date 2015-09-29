/**
 * SharesController
 *
 * @description :: Server-side logic for managing shares
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    index: function(req, res) {
        var data = {
            title: 'Акции',
            shares: {
                rows: [],
            },
        }

        provider.shares.getSharesTable()
            .then(function(shares) {
                if (!shares) {
                    console.warn('Возвращен пустой список акций. Вероятно какие-то проблемы с кэшем...');
                }
                data.shares.rows = shares;
            })
            .then(function() {
                res.render('services/shares/shares', data);
            })
    },

    ticker: function(req, res) {
        var href = req.param('href');

        var getShare;
        // MONGO!!!
        if (href.length === 24) {
            getShare = provider.shares.getById;
        }
        else {
            getShare = provider.shares.getByCode;
        }

        getShare(href)
            .then(function(share) {
                if (!share) {
                    throw new Error('404');
                }
                return res.render('services/shares/ticker', {
                    ticker: {
                        id: share.id,
                        name: share.name,
                        site: share.site,
                    },
                    tickerForums: share.forums || [],
                    tickerLinks: share.links || [],
                });
            })
            .catch(function(err) {
                if (err.message === '404') {
                    return res.render('404', {
                        msg: 'Тикер <b>'+href+'</b> не найден',
                    });
                }
                else {
                    return res.serverError(err);
                }
            })
    },

    getTickerData: function(req, res) {
        var id = req.param('id');
        provider.shares.getById(id)
            .then(function(share) {
                if (!share) {
                    return res.send(404);
                }
                return res.send(share);

            })
            .catch(res.serverError);
    },



    //  ╔═╗╔╦╗╔╦╗╦╔╗╔
    //  ╠═╣ ║║║║║║║║║
    //  ╩ ╩═╩╝╩ ╩╩╝╚╝

    editorPage: function(req, res) {
        var id = req.param('id');
        var data = {};

        provider.shares.getById(id)
            .then(function(share) {
                if (!share) {
                    console.log(id)
                    throw new Error('404');
                }
                data.ticker = {
                    id           : share.id,
                    name         : share.name,
                    branch       : share.branch,
                    code         : share.code,
                    site         : share.site,
                    shares_count : share.shares_count,
                    forums       : share.forums,
                    links        : share.links,
                    reports      : share.reports,
                    info         : {
                        mfd_id       : share.mfd_id,
                        candlesCount : share.dailyCandles.length,
                        lastDay      : '00000000000000000',
                        lastCandle   : _.last(share.dailyCandles),
                        indayCount   : share.indayCandles.length,
                    }
                }
            })
            .then(function() {
                return Branch.find();
            })
            .then(function(branches) {
                data.branches = branches;
            })
            .then(function() {
                console.log(data.ticker)
                return res.render('services/shares/editor', data)
            })
            .catch(function(err) {
                if (err.message === '404') {
                    return res.render('404', {
                        msg: 'Тикер <b>'+href+'</b> не найден',
                    });
                }
                else {
                    return res.serverError(err);
                }
            })
    },

    updateGeneral: function(req, res) {
        var id = req.param('id');
        var message = req.param('message');

        Share
            .findOne({id: id})
            .then(function(share) {
                if (!share) {
                    throw new Error('404');
                }
                console.warn(message)

                if (!message.key) {
                    console.warn('SharesController.updateGeneral получено сообщение без ключа!', message);
                }
                else if (message.key === 'ticker.code') {
                    share.code = message.value;
                }
                else if (message.key === 'ticker.site') {
                    share.site = message.value;
                }
                else if (message.key === 'ticker.branch') {
                    share.branch = message.value;
                }
                else if (message.key === 'ticker.shares_count') {
                    share.shares_count = parseInt(message.value) || 0;
                }
                else if (message.key === 'ticker.forums') {
                    var forum = message.value;

                    console.log('shares adminig:', share.name);
                    if (message.remove) {
                        _.remove(share.forums, {id: forum.id});
                        console.log('forum removed:', forum);
                    }
                    else {
                        var found = _.find(share.forums, {id: forum.id});
                        if (found) {
                            _.extend(found, forum);
                        }
                        else {
                            // TODO: этого быть тут не должно...
                            if (!share.forums) {
                                share.forums = [];
                            }
                            share.forums.push(forum);
                        }
                        console.log('forum upd:', forum);
                    }
                }
                else if (message.key === 'ticker.links') {
                    var link = message.value;

                    console.log('shares adminig:', share.name);
                    if (message.remove) {
                        _.remove(share.links, {id: link.id});
                        console.log('link removed:', link);
                    }
                    else {
                        var found = _.find(share.links, {id: link.id});
                        if (found) {
                            _.extend(found, link);
                        }
                        else {
                            // TODO: этого быть тут не должно...
                            if (!share.links) {
                                share.links = [];
                            }
                            share.links.push(link);
                        }
                        console.log('link upd:', link);
                    }
                }
                else if (message.key === 'ticker.reports.fields') {
                    var field = message.value;

                    if (message.remove) {
                        var removed = _.remove(share.reports.fields, {id: field.id});
                        console.log('field removed:', removed);
                    }
                    else {
                        var found_field = _.find(share.reports.fields, {id: field.id});
                        if (!found_field) {
                            share.reports.fields.push(field);
                            console.log('field added:', field);
                        }
                        else {
                            if (found_field.key != field.key) {
                                console.log('field key modified:', found_field.key, '->', field.key);
                                _.each(share.reports.data, function(report) {
                                    report.data[field.key] = report.data[found_field.key];
                                    delete report.data[found_field.key];
                                });
                                found_field.key = field.key;
                            }
                            if (found_field.value != field.value) {
                                console.log('field value modified:', found_field.value, '->', field.value);
                                found_field.value = field.value;
                            }
                        }
                    }
                }
                else if (message.key === 'ticker.reports.data') {
                    var report = message.value;

                    console.log('shares adminig:', share.name);
                    if (message.remove) {
                        var removed = _.remove(share.reports.data, {id: report.id});
                        console.log('report removed:', removed);
                    }
                    else {
                        var found_report = _.find(share.reports.data, {id: report.id});
                        if (!found_report) {
                            share.reports.data.push(report);
                            console.log('report added:', report);
                        }
                        else {
                            console.log('report modified');
                            console.log('old:', found_report);
                            _.extend(found_report, report);
                            console.log('new:', found_report);
                        }
                    }
                }
                return share.save();
            })
            .then(function(share) {
                console.info('share updated', share.site);
                return res.ok();
            })
            .catch(function(err) {
                if (err.message === '404') {
                    return res.notFound();
                }
                else {
                    return res.serverError(err);
                }
            })
    },





};

