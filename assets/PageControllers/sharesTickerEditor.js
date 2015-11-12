$(document).ready(function() {
    window.href = '/services/shares/'+ticker.id+'/update';


    // var defaultFields = [
    //     {
    //         id    : 1,
    //         key   : 'income',
    //         value : 'выручка',
    //     }, {
    //         id    : 2,
    //         key   : 'profit',
    //         value : 'прибыль',
    //     }
    // ];

    window.qwe = new VueTabs({
        el: '#tabs',
        data: {
            tabs: [
                {
                    name      : 'Основное',
                    alias     : 'general',
                    component : 'tab_general',
                    active    : false,
                }, {
                    name      : 'Дивиденды',
                    alias     : 'divs',
                    component : 'tab_divs',
                    active    : false,
                }, {
                    name      : 'Полезности',
                    alias     : 'useful',
                    component : 'tab_useful',
                    active    : false,
                }, {
                    name      : 'Отчетность',
                    alias     : 'reports',
                    component : 'tab_reports',
                    active    : false,
                }, {
                    name      : 'Инфо',
                    alias     : 'info',
                    component : 'tab_info',
                    active    : false,
                // }, {
                //     name      : 'Другое',
                //     component : '',
                //     active    : false,
                }
            ]
        },
        components: {
            tab_info    : tab_info(),
            tab_divs    : tab_divs(),
            tab_useful  : tab_useful(),
            tab_general : tab_general(),
            tab_reports : tab_reports(),
        },
    });



});



var tab_info = function() {
    return {
        template: '#info',
        data: function() {
            var info = {};
            info.id = ticker.id;
            info.mfd_id = ticker.mfd_id;
            info.candlesCount = ticker.info.candlesCount;
            info.lastDailyDate = ticker.info.lastDay;
            info.lastIndayDate = ticker.info.lastCandle.date ? ticker.info.lastCandle.date : '...';
            info.indayCount = ticker.info.indayCount ? ticker.info.indayCount : 0;
            return {
                info: info,
                ticker: ticker,
            }
        },
    }
}

var tab_divs = function() {
    return {
        template: '#divs',
        data: function() {
            return {
                modified: false,
                divs: ticker.divs || [],
                keys: _(ticker.divs)
                    .map(function(d) {
                        return _.keys(d);
                    })
                    .flatten()
                    .uniq()
                    .sortByValues(['year', 'closed', 'value', 'currency', 'comment'])
                    .value()
            }
        },
        methods: {
            changed: function() {
                console.log('event')
                this.modified = true;
            },
            save: function() {
                var vm = this;
                if ($(vm.$el).hasClass('disabled')) {
                    return false;
                }
                mp.confirm('Сохранение невозможно отменить. Продолжить?', function() {
                    $('.share_divs_save_btn').disable();
                    console.log(vm.divs);
                    $.post(href, {
                        message: {
                            key   : 'ticker.divs',
                            value : vm.divs,
                        }
                    })
                    .done(function() {
                        vm.modified = false;
                    })
                    .fail(function(err){
                        console.error(err);
                        mp.alert('шо-то пошло не так... см ошибку в консоли');
                    })
                    .always(function() {
                        $('.share_divs_save_btn').enable();
                    });
                })
            },
            add: function() {
                $.smoothScroll(0);
                var vm = this;
                vm.modified = true;
                var added = {};
                _.each(vm.keys, function(key) {
                    added[key] = '';
                });
                vm.divs.splice(0, 0, added);
            },
            del: function(idx) {
                var vm = this;
                vm.modified = true;
                vm.divs.$remove(idx);
            },
        },
    }
}

var tab_useful = function() {
    return {
        template: '#useful',
        data: function() {
            return {
                forums: ticker.forums || [],
                links: ticker.links || [],
            }
        },
        methods: {
            addForum: function() {
                var vm = this;
                var maxId = _(vm.forums)
                    .map(function(forum) {
                        return parseInt(forum.id.replace('forum_', ''));
                    })
                    .max();
                if (maxId < 0) maxId = 0;
                vm.forums.push({
                    id: 'forum_'+(1 * maxId + 1),
                    key: '',
                    value: '',
                });
            },
            removeForum: function(id) {
                var forum_index = _.findIndex(this.forums, function(forum) {
                    return forum.id == id;
                });
                this.forums.$remove(forum_index);
            },
            addLink: function() {
                var vm = this;
                var maxId = _(vm.links)
                    .map(function(link) {
                        return parseInt(link.id.replace('link_', ''));
                    })
                    .max();
                if (maxId < 0) maxId = 0;
                vm.links.push({
                    id: 'link_'+(1 * maxId + 1),
                    key: '',
                    value: '',
                });
            },
            removeLink: function(id) {
                var link_index = _.findIndex(this.links, function(link) {
                    return link.id == id;
                });
                this.links.$remove(link_index);
            },
        },
        components: {
            'kv-editor'   : kvEditor(),
        },
        created: function() {
            var vm = this;
            this.$on('kv-editor-removed', function(child) {
                var id = child.editor_id;
                if (child.prop === 'ticker.forums') {
                    vm.removeForum(id)
                }
                else if (child.prop === 'ticker.links') {
                    vm.removeLink(id);
                }
            });
        },
    }
}

var tab_general = function() {
    return {
        template: '#general',
        data: function() {
            return {
                branches: branches,
            }
        },
        methods: {
        },
        components: {
            'prop-editor' : propEditor(),
            'sel-editor'  : selEditor(),
        },
        created: function() {
        },
    }
}

var tab_reports = function() {
    return {
        template: '#reports',
        data: function() {
            return {
                reports: ticker.reports || {fields:[], data: []},
                reportWindow: initReportWindow(this),
            }
        },
        computed:  {
            no_reports: function() {
                return this.reports.data.length === 0;
            }
        },
        methods: {
            //
            // Параметры
            //
            addField: function() {
                var vm = this;
                var maxId = _(vm.reports.fields)
                    .map(function(field) {
                        return field.id;
                    })
                    .max();
                if (maxId < 0) maxId = 0;
                vm.reports.fields.push({
                    id    : 1 + 1 * maxId,
                    key   : '',
                    value : '',
                });
            },
            removeField: function(id) {
                var vm = this;
                var index = _.findIndex(vm.reports.fields, function(field) {
                    return field.id == id;
                });
                vm.reports.fields.$remove(index);
            },

            //
            // Отчеты
            //
            addReport: function() {
                var maxId = _.max(this.reports.data, function(report) {
                    return report.id;
                });
                if (!maxId || maxId < 0) {
                    maxId = 0;
                }
                else {
                    maxId = maxId.id;
                }
                this.reportWindow.show(this.reports.fields, {
                    id: 1 + 1 * maxId,
                });
            },
            editReport: function(report) {
                this.reportWindow.show(this.reports.fields, report);
            },
            removeReport: function(report) {
                var vm = this;
                $.post(href, {
                    message: {
                        key    : 'ticker.reports.data',
                        remove : true,
                        value  : {id: report.id},
                    }
                })
                .done(function() {
                    var idx = _.findIndex(vm.reports.data, {id: report.id});
                    vm.reports.data.$remove(idx);
                })
                .error(function(err){
                    console.error(err);
                    mp.alert('шо-то пошло не так... см ошибку в консоли');
                });
            },

            //
            // Методы для "детей" (окно отчетов)
            //
            reportSaved: function(report) {
                var vm = this;
                var idx = _.findIndex(vm.reports.data, {id: report.id});
                if (idx !== -1) {
                    vm.reports.data.$set(idx, report)
                }
                else {
                    vm.reports.data.push(report);
                }
            },
        },
        components: {
            'kv-editor'   : kvEditor(),
        },
        created: function() {
            var vm = this;

            vm.$on('kv-editor-removed', function(child) {
                var id = child.editor_id;
                if (child.prop === 'ticker.reports.fields') {
                    vm.removeField(id)
                }
            });

            vm.$on('kv-editor-saved', function(child) {
                var id = child.editor_id;
                if (child.prop === 'ticker.reports.fields') {
                    var index = _.findIndex(vm.reports.fields, function(field) {
                        return field.id == id;
                    });
                    vm.reports.fields.$set(index, {
                        id: id,
                        key: child.key_orig,
                        value: child.value_orig,
                    });
                }
            });
        },
    }
}



var propEditor = function() {
    return {
        template: '#propEditor',
        paramAttributes: ['prop', 'href', 'ph'],

        data: function() {
            return {
                prop_orig: '',
                prop_text: '',
            }
        },
        computed: {
            prop_is_modified: function() {
                if (this.prop_orig === undefined && this.prop_text === '') {
                    return false;
                }
                return this.prop_text !== this.prop_orig;
            },
        },
        methods: {
            sendData: function() {
                var vm = this;

                var el = $(vm.$el);
                if (el.hasClass('disabled')) {
                    return false;
                }
                el.disable();

                $.post(href+vm.href, {
                    message: {
                        key   : vm.prop,
                        value : vm.prop_text,
                    }
                })
                .done(function() {
                    vm.prop_orig = vm.prop_text;
                    vm.setOrig(vm.prop_text);
                    el.enable();
                });
            },
            getOrig: function() {
                var orig = window;
                var path = this.prop.split('.');
                while (path.length) {
                    orig = orig[path.shift()];
                }
                return orig;
            },
            setOrig: function(value) {
                var orig = window;
                var path = this.prop.split('.');
                while (path.length) {
                    orig = orig[path.shift()];
                }
                orig = value;
            }
        },
        compiled: function() {
            var vm = this;
            if (typeof vm.href === 'undefined') vm.href = '';
            vm.prop_orig = vm.getOrig();
            vm.prop_text = vm.getOrig();
        },
    };
}

var kvEditor = function() {
    return {
        template: '#kvEditor',
        paramAttributes: ['editor_id', 'prop', 'href', 'key', 'value', 'key_ph', 'value_ph'],

        data: function() {
            return {
                key_orig: '',
                key_text: '',
                value_orig: '',
                value_text: '',
            }
        },
        computed: {
            key_is_modified: function() {
                if (this.key_orig === undefined && this.key_text === '') {
                    return false;
                }
                return this.key_text !== this.key_orig;
            },
            value_is_modified: function() {
                if (this.value_orig === undefined && this.value_text === '') {
                    return false;
                }
                return this.value_text !== this.value_orig;
            },
            kv_is_modified: function() {
                return this.key_is_modified || this.value_is_modified;
            },
        },
        methods: {
            sendData: function() {
                var vm = this;

                var el = $(vm.$el);
                if (el.hasClass('disabled')) {
                    return false;
                }
                el.disable();

                $.post(href+vm.href, {
                    message: {
                        key   : vm.prop,
                        value : {
                            id    : vm.editor_id,
                            key   : vm.key_text,
                            value : vm.value_text,
                        },
                    }
                })
                .done(function() {
                    vm.key_orig   = vm.key_text;
                    vm.value_orig = vm.value_text;
                    vm.setOrig(vm.key_text, vm.value_text);
                    vm.$dispatch('kv-editor-saved', vm);
                    el.enable();
                });
            },

            removeData: function() {
                var vm = this;

                $.post(href+vm.href, {
                    message: {
                        key    : vm.prop,
                        remove : true,
                        value  : {
                            id : vm.editor_id,
                        },
                    }
                })
                .done(function() {
                    vm.key_orig   = vm.key_text;
                    vm.value_orig = vm.value_text;
                    vm.setOrig(vm.key_text, vm.value_text);
                    vm.$dispatch('kv-editor-removed', vm);
                });

            },

            getOrig: function() {
                var orig = window;
                var path = this.prop.split('.');
                while (path.length) {
                    var new_orig = orig[path.shift()];
                    if (!new_orig) new_orig = {};
                    orig = new_orig;
                }
                return orig;
            },
            setOrig: function(key, value) {
                var orig = window;
                var path = this.prop.split('.');
                while (path.length) {
                    var new_orig = orig[path.shift()];
                    if (!new_orig) new_orig = {};
                    orig = new_orig;
                }

                orig[key] = value;
            }
        },
        compiled: function() {
            var vm = this;
            if (typeof vm.href === 'undefined') vm.href = '';
            vm.key_orig = vm.key;
            vm.key_text = vm.key;
            vm.value_orig = vm.value;
            vm.value_text = vm.value;
        },
    };
}

var selEditor = function() {
    return {
        template: '#selEditor',
        paramAttributes: ['prop', 'model', 'href', 'ph'],

        data: function() {
            return {
                orig: '',
                curr: '',
            }
        },
        computed: {
            is_modified: function() {
                if (this.orig === undefined && this.curr === '') {
                    return false;
                }
                return this.curr !== this.orig;
            },
        },
        methods: {
            sendData: function() {
                var vm = this;
                var selected = _.find(vm.model, {name: vm.curr});

                var el = $(vm.$el);
                if (el.hasClass('disabled')) {
                    return false;
                }
                el.disable();

                $.post(href+vm.href, {
                    message: {
                        key   : vm.prop,
                        value : selected.value,
                    }
                })
                .done(function() {
                    vm.orig = vm.curr;
                    vm.setOrig(vm.curr);
                    el.enable();
                });
            },
            getOrig: function() {
                var orig = window;
                var path = this.prop.split('.');
                while (path.length) {
                    orig = orig[path.shift()];
                }
                return orig;
            },
            setOrig: function(value) {
                var orig = window;
                var path = this.prop.split('.');
                while (path.length) {
                    var new_orig = orig[path.shift()];
                    if (!new_orig) new_orig = {};
                    orig = new_orig;
                }
                orig = value;
            }
        },
        compiled: function() {
            var vm = this;
            if (typeof vm.href === 'undefined') vm.href = '';

            vm.model = [{
                value: 0,
                name: vm.ph,
            }].concat(_.map(vm.model, function(sel) {
                return {
                    value: sel.id,
                    name: sel.name,
                }
            }));

            var orig = vm.getOrig() ? vm.getOrig().id : 0;
            var found = _.find(vm.model, {value: orig});
            if (!found) {
                console.error('smth went wrong...')
                found = {};
            }
            vm.orig = found.name;
            vm.curr = found.name;
        },
    };
}



var initReportWindow = function(parent) {
    return new Vue({
        el: '#report',
        data: function() {
            return {
                id     : 0,
                name   : '',
                from   : '',
                to     : '',
                fields : [],
                data   : {},
                // тот, кто будет получать уведомления о сохранении
                parent : parent,
            }
        },
        computed: {
            bad_name: function() {
                return !this.name || this.name.length < 1;
            },
            bad_period: function() {
                return !this.from || !this.to || moment(this.from, 'YYYY-MM-DD') > moment(this.to, 'YYYY-MM-DD');
            },
        },
        methods: {
            show: function(fields, report) {
                var vm = this;
                if (report) {
                    vm.id     = report.id;
                    vm.name   = report.name;
                    vm.from   = report.from;
                    vm.to     = report.to;
                    vm.fields = fields;
                    vm.data   = {};
                }

                if (report.data) {
                    var temp = {};
                    _.each(fields, function(field) {
                        temp[field.key] = report.data[field.key];
                    })
                    vm.data = _.clone(temp);
                }
                $.magnificPopup.open({
                    modal: true,
                    items: {
                        src: $(vm.$el),
                        type: 'inline',
                    },
                });
            },
            save: function() {
                var vm = this;

                var el = $(vm.$el);
                if (el.hasClass('disabled')) {
                    return false;
                }
                el.disable();

                var report = {
                    id: vm.id,
                    name: vm.name,
                    from: vm.from,
                    to: vm.to,
                    data: vm.data,
                }

                $.post(href, {
                    message: {
                        key   : 'ticker.reports.data',
                        value : report,
                    }
                })
                .done(function() {
                    vm.parent.reportSaved(report);
                    vm.close();
                })
                .error(function(err){
                    console.error(err);
                    mp.alert('шо-то пошло не так... см ошибку в консоли');
                })
                .always(function() {
                    el.enable();
                });
            },
            cancel: function() {
                this.close();
            },
            close: function() {
                $.magnificPopup.close();
            },

            getLastReport: function() {
                var vm = this;
                return vm.parent.reports.data[vm.parent.reports.data.length - 1] || {};
            },
            setLastPeriod: function() {
                var vm    = this;
                var last = vm.getLastReport();
                vm.name   = last.name;
                vm.from   = last.from;
                vm.to     = last.to;
            },
            setLastResults: function() {
                var vm    = this;
                var last = vm.getLastReport();

                var temp = {};
                if (last.data) {
                    _.each(vm.fields, function(field) {
                        temp[field.key] = last.data[field.key] || '';
                    });
                }
                vm.data = _.clone(temp);
            },
        },
        ready: function() {
            var vm = this;

            $(vm.$$.dp_from).pickmeup({
                date: vm.from,
                format: 'Y-m-d',
                view: 'years',
                position: 'bottom',
                change: function(date) {
                    vm.from = date;
                },
            });

            $(vm.$$.dp_to).pickmeup({
                date: vm.to,
                format: 'Y-m-d',
                view: 'years',
                position: 'bottom',
                change: function(date) {
                    vm.to = date;
                },
            });
        },
        beforeDestroy: function() {
            var vm = this;
            $(vm.$$.dp_from).pickmeup('destroy');
            $(vm.$$.dp_to).pickmeup('destroy');
        },
        compiled: function() {
        },
    });
}
