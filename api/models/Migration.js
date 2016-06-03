module.exports = {

    attributes: {
        name: {type: 'string', required: true, unique: true},
        data: {type: 'json', defaultsTo: {}},
    }

};

