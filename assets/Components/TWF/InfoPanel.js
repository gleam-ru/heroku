module.exports = function(resolve) {
    System.importAll({
        _raw: [
        ]
    })
    .then(function() {
        return {
            template: [
                '<div class="additional">',
                    '<h3>Информация</h3>',
                    '<ul>',
                        '<li v-for="info in infos">',
                            '{{info.key}}',
                            ': ',
                            '{{info.value}}',
                        '</li>',
                    '</ul>',
                '</div>',
            ].join(''),
            props: ['infos'],
            data: function() {
                return {
                };
            },
        };
    })
    .then(resolve)
    ;
};
