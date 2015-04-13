var winston = require('winston');
var dir = './logs/';


//  ╔╦╗╦═╗╔═╗╔╗╔╔═╗╔═╗╔═╗╦═╗╔╦╗╔═╗
//   ║ ╠╦╝╠═╣║║║╚═╗╠═╝║ ║╠╦╝ ║ ╚═╗
//   ╩ ╩╚═╩ ╩╝╚╝╚═╝╩  ╚═╝╩╚═ ╩ ╚═╝

// пишем все в консольку (вырубить при релизе!)
var _console = new (winston.transports.Console)({
    level: 'silly',
    colorize: true,
});


// файлик-свалка
var _fileGlobal = new (winston.transports.File)({
    level: 'warn',
    filename: dir+'/everything.log',
    json: false,
});

// логи парсера
var _fileParser = new (winston.transports.File)({
    level: 'info',
    filename: dir+'/everything.log',
});



//  ╦  ╔═╗╔═╗╔═╗╔═╗╦═╗╔═╗
//  ║  ║ ║║ ╦║ ╦║╣ ╠╦╝╚═╗
//  ╩═╝╚═╝╚═╝╚═╝╚═╝╩╚═╚═╝

// default
winston.loggers.add('logger', {
    transports: [
        _console,
        _fileGlobal,
    ]
});
var logger = winston.loggers.get('logger');

// parser
winston.loggers.add('parser', {
    transports: [
        _console,
        _fileParser,
    ]
});


// настройки стандарных логов sails (ну они же уже есть во фреймворке)
module.exports.log = {
    level: 'warn', // default level
    colors: false, // убираем "цветастость" (криво логгируется)
    custom: logger, // собственно, сам логгер
};

