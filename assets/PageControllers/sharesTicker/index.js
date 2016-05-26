$(document).ready(function() {
    System.importAll({
        vtabs : '/Components/Tabs.js',
        // components:
        // sel     : '/PageControllers/sharesTickerEditor/sel-editor.js',
        // tabs:
        chart : '/PageControllers/sharesTicker/tab-chart.js',
        div   : '/PageControllers/sharesTicker/tab-div.js',
        _raw: [ // not working here :( (reason: techan)
            // '/bower_components/d3/d3.js',
            // '/bower_components/techan/dist/techan.js',
            // '/bower_components/nvd3/build/nv.d3.js',
            // '/css/sharesTickerPlot.css',
        ]
    })
    .then(function(imported) {

        window.App = new Vue({
            el: '#shares',
            components: {
                'v-tabs': imported.vtabs,
            },
            template: [
                '<div>',
                    '<v-tabs :tabs="tabs"></v-tabs>',
                '</div>',
            ].join(' '),
            data: function() {
                return {
                    tabs: [
                        {url: '/chart',    cmp: imported.chart,    title: 'Цена'},
                        {url: '/div',      cmp: imported.div,      title: 'Дивиденды'},
                    ],
                };
            },
        });

    })
    .catch(function(err) {
        console.error(err);
        mp.alert('Что-то пошло не так!');
    })
    ;
});
