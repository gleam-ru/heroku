module.exports = function(resolve) {
    System.importAll({
        _raw: [
        ]
    })
    .then(function(imported) {
        return {
            template: [
                '<div class="filters-preview">',
                    '<h3>Сохраненные фильтры</h3>',
                    '<ul>',
                        '<li v-for="filter in filters">',
                            '<span @click="edit($index)" v-show="!isGhost">',
                                '<i class="fa fa-gear"></i>',
                            '</span>',
                            //
                            '<span class="filters-preview-text"',
                                ':class="{\'selected\' : $index === active}"',
                                '@click="select($index)"',
                                '>',
                                '{{filter.text}}',
                            '</span>',
                            //
                            '<span style="color: red;" @click="remove($index)" v-show="!isGhost">',
                                '<i class="fa fa-times"></i>',
                            '</span>',
                        '</li>',
                    '</ul>',
                    '<span @click="add" v-show="!isGhost" class="g-btn type_midnight size_small"><span>Добавить</span></span>',
                '</div>',
            ].join(' '),
            props: ['filters', 'active', 'editing'],
            data: function() {
                return {
                    isGhost: window.user.isGhost,
                };
            },
            methods: {
                select: function(idx) {
                    this.active = idx === this.active ? null : idx;
                },
                remove: function(idx) {
                    var filter = this.filters[idx];
                    this.filters.$remove(filter);
                    if (idx === this.editing) {
                        this.editing = null;
                    }
                    if (idx === this.active) {
                        this.active = null;
                    }
                },
                add: function() {
                    console.debug('im here');
                    this.$emit('addfilter');
                    // this.filters.push({
                    //     text: Math.random().toString(36).substring(5),
                    //     conditions: [],
                    // });
                },
                edit: function(idx) {
                    this.editing = idx === this.editing ? null : idx;
                },
            }
        };
    })
    .then(resolve)
    ;
};
