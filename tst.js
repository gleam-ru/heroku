var _ = require('lodash');
var moment = require('moment');

var Q        = require('q');
Q.series = function(list) {
    var done = Q();
    var results = [];

    _.each(list, function(fn) {
        done = done.then(function() {
            return fn();
        })
        results.push(done)
    })

    return Q.all(results);
}

function fooWithDelay(i) {
    return Q()
        .delay(1000)
        .then(function() {
            console.log(i)
            return i;
        })
}

var arr_0 = [
    {id: 1, name: 'qwe_1'},
    {id: 2, name: 'qwe_2'},
    {id: 3, name: 'qwe_3'},
    {id: 4, name: 'qwe_4'},
]

var foos = _.map(arr_0, function(item) {
    return function() {
        return fooWithDelay(item);
    }
})

Q.series(foos)
    .tap(console.log)
    .done()

