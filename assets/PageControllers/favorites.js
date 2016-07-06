$(document).ready(function() {
    System.importAll({
        //
        _data: {
            fav: '/API/shares/favorites',
        },
    })
    .then(function(imported) {
        function fix(val) {
            var symbols = -Math.log10(val) + 7;
            symbols = symbols < 0 ? 0 : symbols > 10 ? 10 : symbols;
            return val.toFixed(symbols);
        }


        Vue.component('tile', Vue.extend({
            props: ['item'],
            computed: {
                percent: function() {
                    return (100 * (-1 + this.item.indayCandle.c / this.item.lastCandle.c)).toFixed(2);
                },
                priceDiff: function() {
                    return (this.item.indayCandle.c - this.item.lastCandle.c).toFixed(2);
                },
                price: function() {
                    return this.item.indayCandle.c;
                },
                href: function() {
                    return '/services/shares/'+(this.item.code || this.item.id);
                },
            },
            template: [
                '<div class="w-portfolio-item order_1 naming webdesign">',
                    '<div class="w-portfolio-item-h">',
                        '<div class="item">',
                            '<div class="head">',
                                '<span class="code">{{item.code}}</span>',
                                '<div class="at-right" :class="{green: percent > 0, red: percent < 0}">',
                                    '<span class="price">{{price}}<i class="fa fa-rub"></i></span>',
                                    '<span>',
                                        '<span class="price-diff">{{priceDiff}}<i class="fa fa-rub"></i></span>',
                                        '/',
                                        '<span class="percent">{{percent}}<i class="fa fa-percent"></i></span>',
                                    '</span>',
                                '</div>',
                            '</div>',
                            '<div class="center">',
                                '<p class="name">',
                                    '<i v-if="item._favorite.msg" class="tt fa fa-comment-o" title="{{item._favorite.msg}}"></i>',
                                    '<a href="{{href}}">{{item.name}}</a>',
                                '</p>',
                                '<ul class="forums">',
                                    '<li>Обсуждения:</li>',
                                    '<li v-for="i in item.forums"><a target="_blank" href="{{i.value}}">{{i.key}}</a></li>',
                                '</ul>',
                                '<ul class="links">',
                                    '<li>Ссылки:</li>',
                                    '<li v-for="i in item.links"><a target="_blank" href="{{i.value}}">{{i.key}}</a></li>',
                                '</ul>',
                            '</div>',
                            '<div class="footer">',
                                '<ul class="buttons">',
                                    '<li class="tt" title="Убрать из избранного">',
                                        '<a href="#" @click="remove">',
                                            Jade.els.roundIcon('fa-trash'),
                                        '</a>',
                                    '</li>',
                                    '<li class="tt" title="Work In Progress">',
                                        '<a href="#"@click="showCalculator">',
                                            Jade.els.roundIcon('fa-calculator'),
                                        '</a>',
                                    '</li>',
                                    '<li class="tt" title="Сайт компании">',
                                        '<a target="_blank" href="{{item.site}}" :class="{disabled: !item.site}">',
                                            Jade.els.roundIcon('fa-external-link-square'),
                                        '</a>',
                                    '</li>',
                                    '<li class="tt" title="График изменения цены">',
                                        '<a target="_blank" href="{{href}}#!/chart">',
                                            Jade.els.roundIcon('fa-line-chart'),
                                        '</a>',
                                    '</li>',
                                    '<li class="tt" title="График дивидендов">',
                                        '<a target="_blank" href="{{href}}#!/div">',
                                            Jade.els.roundIcon('fa-bar-chart'),
                                        '</a>',
                                    '</li>',
                                '</ul>',
                            '</div>',
                            // '<div class="w-portfolio-item-meta">',
                            //     '<h2 class="w-portfolio-item-title">Single Project</h2>',
                            //     '<i class="fa fa-mail-forward"></i>',
                            // '</div>',
                        '</div>',
                    '</div>',
                '</div>',
            ].join(' '),
            methods: {
                showCalculator: function() {
                    var html = '<pre>'+JSON.stringify(this.item, null, 4)+'</pre>';
                    $.magnificPopup.open({
                        items: {
                            src: [
                                '<div class="white-popup share-favorite-calculator">',
                                    html,
                                '</div>',
                            ].join(''),
                            type: 'inline'
                        },
                    });
                },
                remove: function() {
                    var vm = this;
                    mp.confirm('Акция <b>'+vm.item.name+'</b> будет удалена из избранного', function() {
                        var msg = {
                            share: vm.item.id,
                            remove: true,
                        };

                        cnt.mask();
                        $.post('/API/shares/favorites', {msg: msg})
                            .always(function() {
                                cnt.unmask();
                            })
                            .done(function(removed) {
                                console.log('done (remove):', msg, removed);
                                if (removed && removed.length) {
                                    vm.$emit('remove');
                                }
                                else {
                                    deh();
                                }
                            })
                            .fail(deh)
                            ;
                    });
                },
            },
        }));

        window.vm = new Vue({
            el: '#vue',
            template: [
                '<div class="w-portfolio columns_4">',
                    '<div class="w-portfolio-h">',
                        '<div class="w-portfolio-list">',
                            '<div class="w-portfolio-list-h">',
                                '<p class="comment" v-if="!favorites.length">',
                                    'Отсутствуют избранные акции.',
                                    '<br />',
                                    'Добавить акцию в избранное можно на странице <a target="_blank" href="/services/shares"><i class="fa fa-link"></i>Сервисы / акции</a> ',
                                    '<br />',
                                    'Или странице с акцией (например: <a target="_blank" href="/services/shares/gazp"><i class="fa fa-link"></i>GAZP</a>)',
                                '</p>',
                                '<div v-else>',
                                    '<tile v-for="i in favorites" :item="i" @remove="favorites.$remove(i)"></tile>',
                                '</div>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
            ].join(' '),
            data: {
                favorites: imported._data.fav || [],
            },
            ready: function() {
                initTT();
            },
        });
    })
    .catch(deh)
    ;
});
