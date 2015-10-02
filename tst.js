var _ = require('lodash');

var arr_0 = [
    {id: 1, name: 'qwe_1'},
    {id: 2, name: 'qwe_2'},
    {id: 3, name: 'qwe_3'},
    {id: 4, name: 'qwe_4'},
]



var found = _.find(arr_0, {id: 3});
found.name = 'asd';

console.log(arr_0);
