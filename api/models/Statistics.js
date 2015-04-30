/**
* Statistics.js
*
* Служебная информация о сервере.
* Например:
*   - аптайм
*   - последнее время парса
*   - количество чего-либо
*   - ...
*/

module.exports = {

    attributes: {
        name: {type: 'alphanumeric', required: true, unique: true},
        data: {type: 'json', defaultsTo: {}},
    }

};

