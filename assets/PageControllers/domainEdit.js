$(document).ready(function() {
    System.importAll({
        // select: '/Components/Select.js',
    })
    .then(function(imported) {

        window.vm = new Vue({
            el: '#vue',
            template: [
                '<div>',
                    '<table>',
                        '<tr>',
                            '<th',
                                'v-for="h in headers"',
                                ':class="{hidden: hidden.indexOf(h) !== -1}"',
                                '>',
                                '{{h}}',
                            '</th>',
                        '</tr>',
                        '<tr v-for="(rowIndex, row) in rows">',
                            '<td',
                                'v-for="h in headers"',
                                ':class="{hidden: hidden.indexOf(h) !== -1}"',
                                '>',
                                '<span v-if="editingIdx !== rowIndex">',
                                    '{{row[h]}}',
                                '</span>',
                                '<input',
                                    'v-else',
                                    'v-model="row[h]"',
                                    '/>',
                            '</td>',
                            '<td v-if="editingIdx !== rowIndex">',
                                '<span @click="editingIdx = rowIndex">',
                                    Jade.els.roundIcon('fa-edit'),
                                '</span>',
                            '</td>',
                            '<td v-else>',
                                '<span @click="save(rowIndex)">',
                                    Jade.els.roundIcon('fa-save'),
                                '</span>',
                            '</td>',
                            '<td>',
                                '<span @click="remove(rowIndex)">',
                                    Jade.els.roundIcon('fa-remove'),
                                '</span>',
                            '</td>',
                        '</tr>',
                    '</table>',
                    '<span @click="rows.push({})">',
                        Jade.els.button('Добавить'),
                    '</span>',
                '</div>',
            ].join(' '),
            data: {
                hidden: ['id', 'createdAt', 'updatedAt'],
                rows: rows,
                headers: [],
                editingIdx: null,
                table: _.last(window.location.pathname.split('/')),
            },
            methods: {
                post: function(msg, cb) {
                    cnt.mask();
                    $.post('/API/domain', {msg: msg})
                    .done(function(data){
                        return cb(null, data);
                    })
                    .fail(cb)
                    .always(function() {
                        cnt.unmask();
                    })
                    ;
                },
                save: function(rowIndex) {
                    var vm = this;
                    var row = vm.rows[rowIndex];
                    delete row.createdAt;
                    delete row.updatedAt;
                    if (!row) {
                        return;
                    }
                    var msg = {
                        table: vm.table,
                        row: row,
                    };
                    console.debug(msg);
                    vm.post(msg, function() {
                        vm.editingIdx = null;
                    });
                },
                remove: function(rowIndex) {
                    var vm = this;
                    var row = vm.rows[rowIndex];
                    if (!row) {
                        return;
                    }
                    var msg = {
                        table: vm.table,
                        row: row,
                        remove: true,
                    };
                    mp.confirm('Вы уверены, что хотите удалить запись?', function() {
                        console.debug(msg);
                        vm.post(msg, function() {
                            vm.rows.$remove(row);
                        });
                    });
                },
            },
            ready: function() {
                var vm = this;
                // vm.rows = _.map(vm.rows, function(row) {
                //     delete row.createdAt;
                //     delete row.updatedAt;

                // })
                if (vm.rows.length > 0) {
                    vm.headers = _.keys(_.first(vm.rows));
                }

            },
        });
    })
    .catch(function(err) {
        console.error(err);
        mp.alert('Что-то пошло не так!');
    })
    ;
});
