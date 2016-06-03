module.exports = function(resolve) {
    System.importAll({
    })
    .then(function(imported) {

        return {
            template: [
                '<div class="my-select">',
                    '<select v-model="selected">',
                        '<option',
                            'v-for="i in values"',
                            'value="{{i.value || i}}"',
                            '>',
                            '{{i.name || i.value || i}}',
                        '</option>',
                    '</select>',
                '</div>',
            ].join(' '),
            props: {
                values: {
                    type: Array,
                    required: true
                },
                selected: {
                    required: false,
                },
            },
            data: function() {
                return {};
            },
            ready: function() {
            }
        };
    })
    .then(resolve)
    ;
};
