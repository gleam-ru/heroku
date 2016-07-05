$(document).ready(function() {
    System.importAll({
        twf: '/Components/TWF/index.js',
        //
        _data: {
            fav: '/API/shares/favorites',
        },
    })
    .then(function(imported) {
        window.imp = imported;
        window.vm = new Vue({
            el: '#vue',
            template: [
                '<div>',
                    '<TWF',
                        ':saveas="\'shares/filters\'"',
                        ':info="info"',
                        ':rows="rows"',
                        ':columns="columns"',
                        ':filters="filters"',
                        '>',
                    '</TWF>',
                '</div>',
            ].join(' '),
            components: {
                'twf': imported.twf,
            },
            data: {
                info: shares.info,
                rows: createRows(shares.rows, imported._data.fav),
                columns: createColumns(shares.params),
                filters: us.filters || [],
            }
        });
    })
    .catch(function(err) {
        console.error(err);
        mp.alert('Что-то пошло не так!');
    })
    ;
});


function createColumns(params) {
    var defaultColumns = [];

    // admin
    if (hasRoles(['admin', 'shares-filler'])) {
        defaultColumns.push({
            vueTitle: 'Admin',
            data: '__adm',
            notHideable: true,
            bVisible: true,
            className: "buttonColumn",
            render: function(a, b, row, pos) {
                return [
                    '<a class="inTableIcon"',
                        'href="'+href+'/'+row.id+'/edit" ',
                        '>',
                        Jade.els.roundIcon('fa-paw'),
                    '</a>',
                ].join(' ');
            },
        });
    }

    defaultColumns.push({
        vueTitle: 'Moex',
        data: '__moex',
        notHideable: true,
        bVisible: true,
        className: "buttonColumn",
        render: function(a, b, row, pos) {
            if (row.code) {
                return [
                    '<a class="inTableIcon"',
                        'title="MOEX" ',
                        'href="http://moex.com/ru/issue.aspx?code='+row.code+'"',
                        'target=_blank',
                        '>',
                        Jade.els.roundIcon('fa-area-chart'),
                    '</a>',
                ].join(' ');
            }
            else {
                return Jade.els.roundIcon('fa-area-chart', true);
            }
        },
    });

    defaultColumns.push({
        vueTitle: 'Site',
        data: '__site',
        notHideable: true,
        bVisible: true,
        className: "buttonColumn",
        render: function(a, b, row, pos) {
            if (row.site) {
                return [
                    '<a class="inTableIcon"',
                        'href="'+row.site+'" ',
                        'target=_blank',
                        '>',
                        Jade.els.roundIcon('fa-external-link'),
                    '</a>',
                ].join(' ');
            }
            else {
                return Jade.els.roundIcon('fa-external-link', true);
            }
        },
    });

    defaultColumns.push({
        vueTitle: 'Forums',
        data: '__forums',
        notHideable: true,
        bVisible: true,
        className: "buttonColumn",
        render: function(a, b, row, pos) {
            if (_.keys(row.forums).length) {
                return [
                    '<span class="inTableIcon tt tt_interactive tt_html cur-p"',
                        'title="',
                            '<ul><p>Полезные форумы:</p>',
                                _.map(row.forums, function(f) {
                                        return {
                                            name: f.key,
                                            href: f.value,
                                        };
                                    })
                                    .map(function(f) {
                                        return '<li><a target=\'_blank\' href=\''+f.href+'\'>'+f.name+'</a></li>';
                                    })
                                    .join(''),
                            '</ul>',
                        '"',
                    '>',
                        Jade.els.roundIcon('fa-comments'),
                    '</span>',
                ].join(' ');
            }
            else {
                return Jade.els.roundIcon('fa-comments', true);
            }
        },
    });

    defaultColumns.push({
        vueTitle: 'Links',
        data: '__links',
        notHideable: true,
        bVisible: true,
        className: "buttonColumn",
        render: function(a, b, row, pos) {
            if (_.keys(row.links).length) {
                return [
                    '<span class="inTableIcon tt tt_interactive tt_html cur-p"',
                        'title="',
                            '<ul><p>Полезные ссылки:</p>',
                                _.map(row.links, function(l) {
                                        return {
                                            name: l.key,
                                            href: l.value,
                                        }
                                    })
                                    .map(function(l) {
                                        return '<li><a target=\'_blank\' href=\''+l.href+'\'>'+l.name+'</a></li>';
                                    })
                                    .join(''),
                            '</ul>',
                        '"',
                    '>',
                        Jade.els.roundIcon('fa-paperclip'),
                    '</span>',
                ].join(' ');
            }
            else {
                return Jade.els.roundIcon('fa-paperclip', true);
            }
        },
    });

    defaultColumns.push({
        vueTitle: 'Add',
        data: '__add',
        bVisible: true,
        className: "buttonColumn",
        render: function(a, b, row, pos) {
            return [
                '<a class="inTableIcon"',
                    'title="Добавить в портфель"',
                    'href="#"',
                    '>',
                    Jade.els.roundIcon('fa-plus'),
                '</a>',
            ].join(' ');
        },
        handler: function() {
            mp.alert(messages.not_implemented);
        },
    });


    defaultColumns.push({
        vueTitle: 'Favorites',
        data: '__favorites',
        bVisible: true,
        notHideable: true,
        className: "buttonColumn",
        render: function(a, b, row, pos) {
            if (row._favorite) {
                return [
                    '<a class="inTableIcon"',
                        'title="Удалить из избранного"',
                        'href="#"',
                        '>',
                        Jade.els.roundIcon('fa-heart'),
                    '</a>',
                ].join(' ');
            }
            else {
                return [
                    '<a class="inTableIcon"',
                        'title="Добавить в избранное"',
                        'href="#"',
                        '>',
                        Jade.els.roundIcon('fa-heart-o'),
                    '</a>',
                ].join(' ');
            }
        },
        handler: function(item, dtCell, dtColumn, dtTable) {
            if (!hasRoles(['user'])) {
                mp.alert('Чтобы добавить акцию в избранное нужно авторизироваться в системе.');
            }

            if (item._favorite && item._favorite.id) {
                // акция уже в избранном
                mp.confirm('Акция <b>'+item.name+'</b> будет удалена из избранного', function() {
                    var msg = {
                        share: item.id,
                        remove: true,
                    };
                    $.post('/API/shares/favorites', {msg: msg})
                        .done(function(removed) {
                            console.log('done (remove):', msg, removed);
                            if (removed && removed.length) {
                                item._favorite = null;
                                dtCell.invalidate();
                            }
                            else {
                                deh();
                            }
                        })
                        .fail(deh)
                        ;

                });
                return;
            }

            var popup = $([
                '<div class="white-popup add-to-favorites">',
                    '<h3>',
                        'Добавить акцию в избранное',
                    '</h3>',
                    '<div class="content">',
                        '<p>',
                            'Название: ',
                            '<b>'+item.name+'</b>',
                        '</p>',
                        '<p>',
                            'Причина добавления: ',
                            '<textarea class="reason" rows="4" placeholder="может быть пустой"></textarea>',
                        '</p>',
                    '</div>',
                '</div>',
            ].join(''));

            var btns = $('<div class="row"></div>');
                var ok = $(Jade.els.button('OK'));
                    ok.bind('click', function() {
                        var popup = $(this).closest('.add-to-favorites');
                        var reason = popup.find('textarea').val();
                        popup.mask();
                        var msg = {
                            share: item.id,
                            reason: reason,
                        };
                        $.post('/API/shares/favorites', {msg: msg})
                            .always(function() {
                                popup.unmask();
                            })
                            .done(function(saved) {
                                console.log('done:', msg, saved);
                                item._favorite = saved;
                                dtCell.invalidate();
                                $.magnificPopup.close();
                            })
                            .fail(deh)
                            ;
                    });
                var cancel = $(Jade.els.button('Отмена'));
                    cancel.bind('click', function() {
                        $.magnificPopup.close();
                    });
                btns.append(ok);
                btns.append(cancel);
            popup.append(btns);

            $.magnificPopup.open({
                items: {
                    src: popup,
                    type: 'inline'
                },
                modal: true,
            });
        },
    });

     defaultColumns.push({
        title: 'Code',
        data: 'code',
        filter: 'string',
        bVisible: true,
        notHideable: true,
        sClass: 'sharesCodeColumn',
    });

    defaultColumns.push({
        title: 'Name',
        data: 'name',
        filter: 'string',
        bVisible: true,
        notHideable: true,
        render: function(name, dunno, data) {
            return '<a href="/services/shares/'+data.href+'">'+name+'</a>';
        }
    });

    defaultColumns.push({
        title: 'Отрасль',
        data: 'branch',
        filter: 'string',
        bVisible: true,
        notHideable: true,
        render: function(branch, dunno, data) {
            if (!branch) {
                return '';
            }
            return '<a href="/services/shares/branch/'+data.branchId+'">'+branch+'</a>';
        }
    });

    defaultColumns.push({
        title: 'Изменение за день',
        data: 'calculated_dayPercent',
        filter: 'number',
        bVisible: true,
        notHideable: false,
        render: function(value, dunno, data) {
            return value;
            if (value >= 0) {
                return '+'+value+'%';
            }
            else {
                return value+'%';
            }
        }
    });

    defaultColumns.push({
        title: 'Price',
        data: 'QuoteLast',
        filter: 'number',
        bVisible: true,
    });

    return defaultColumns.concat(_.cMap(params, function(p) {
        if (_.findIndex(defaultColumns, {data: p.serverName}) + 1) {
            return;
        }
        return {
            title: p.title_ru+
                '<span class="tt" title="'+p.desc+'">'+
                    Jade.els.roundIcon('fa-question')+
                '</span>',
            vueTitle: p.title_ru,
            vueTooltip: p.desc_ru,
            data: p.serverName,
            filter: p.filter || p.type || 'number',
            bVisible: false,
        };
    }));
}

function createRows(shares, favorites) {
    return _.map(shares, function(s) {
        var branch = _.find(branches, {id: s.branch});
        var favorite = _.find(favorites, {id: s.id});
        var row = _.extend({}, s, s.google, {
            branch: branch && branch.name,
            branchId: branch && branch.id,
            _favorite: favorite && favorite._favorite,
        });
        if (s.indayCandle && s.lastCandle) {
            var fr = s.lastCandle.c;
            var to = s.indayCandle.c;
            var price = fr;
            row.calculated_dayPercent = (((to / price) - 1) * 100).toFixed(2);
        }
        delete row.google;
        return row;
    });
}
