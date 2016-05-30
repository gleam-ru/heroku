/**
 * Вкладка с основными данными тикера
 *
 */

module.exports = function(resolve) {
    System.importAll({
        _raw: [
        ]
    })
    .then(function() {
        return {
            template: [
                '<div>',


                    '<h3>Ссылки</h3>',

                    '<kv-editor',
                        'class="link"',
                        'v-for="i in links"',
                        ':value.sync="i.value"',
                        ':key.sync="i.key"',
                        ':modified.sync="i.modified"',
                        '@remove="removeLink(i)"',
                        '>',
                    '</kv-editor>',

                    '<button',
                        'class="g-btn type_midnight size_small"',
                        'type="submit"',
                        '@click="addLink()"',
                        '>',
                        'Добавить',
                    '</button>',
                    '<button',
                        'class="g-btn type_midnight size_small"',
                        ':class="{invisible: !linksModified && linksSaved}"',
                        'type="submit"',
                        '@click="saveLinks"',
                        '>',
                        'Сохранить',
                    '</button>',

                    Jade.els.separator(),

                    '<h3>Форумы</h3>',

                    '<kv-editor',
                        'class="forum"',
                        'v-for="i in forums"',
                        ':value.sync="i.value"',
                        ':key.sync="i.key"',
                        ':modified.sync="i.modified"',
                        '@remove="removeForum(i)"',
                        '>',
                    '</kv-editor>',

                    '<button',
                        'class="g-btn type_midnight size_small"',
                        'type="submit"',
                        '@click="addForum()"',
                        '>',
                        'Добавить',
                    '</button>',
                    '<button',
                        'class="g-btn type_midnight size_small"',
                        ':class="{invisible: !forumsModified && forumsSaved}"',
                        'type="submit"',
                        '@click="saveForums"',
                        '>',
                        'Сохранить',
                    '</button>',


                '</div>',
            ].join(' '),
            //
            //
            //
            props: [],
            data: function() {
                return {
                    //
                    rest: window.updatehref,
                    //

                    links: ticker.links || [],
                    linksModified: false,
                    linksSaved: true,

                    forums: ticker.forums || [],
                    forumsModified: false,
                    forumsSaved: true,

                };
            },
            watch: {
                links: {
                    deep: true,
                    handler: function (val, oldVal) {
                        this.linksModified = _.some(this.links, 'modified');
                    },
                },
                forums: {
                    deep: true,
                    handler: function (val, oldVal) {
                        this.forumsModified = _.some(this.forums, 'modified');
                    },
                },
                linksSaved: function(saved) {
                    var vm = this;
                    if (!saved) {
                        return;
                    }
                    _.each(vm.links, function(i) {
                        i.modified = false;
                    });
                },
            },
            computed: {
            },
            //
            //
            //
            methods: {
                addLink: function(i) {
                    this.links.push({});
                    this.linksSaved = false;
                },
                removeLink: function(i) {
                    this.links.$remove(i);
                    this.linksSaved = false;
                },
                saveLinks: function() {
                    var vm = this;
                    vm.save({links: vm.links}, function() {
                        vm.linksSaved = true;
                    });
                },

                addForum: function(i) {
                    this.forums.push({});
                    this.forumsSaved = false;
                },
                removeForum: function(i) {
                    this.forums.$remove(i);
                    this.forumsSaved = false;
                },
                saveForums: function() {
                    var vm = this;
                    vm.save({forums: vm.forums}, function() {
                        vm.forumsSaved = true;
                    });
                },
                save: function(data, next) {
                    var vm = this;

                    if (!next) {
                        next = function() {};
                    }

                    $(vm.$el).mask();

                    var url = this.rest;
                    if (!url) {
                        return next('не знаю куда сохранять');
                    }
                    if (!data) {
                        return next('не знаю что сохранять');
                    }
                    $.post(url, {
                        msg: data,
                    })
                    .done(function() {
                        return next();
                    })
                    .error(function(err) {
                        return next(err);
                    })
                    .always(function() {
                        $(vm.$el).unmask();
                    })
                    ;
                }
            },
            compiled: function() {
            },
            ready: function() {
                window.tu = this;
                var vm = this;
            }
        };
    })
    .then(resolve)
    ;
};
