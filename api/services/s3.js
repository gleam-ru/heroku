var s3 = require('s3');
var me = {};

if (!sails.config.local || !sails.config.local.s3) {
    console.warn('Ключ для amazon_s3 отсутствует в local.js');
}
else {
    _.extend(sails.config.amazon.s3, sails.config.local.s3);
}

// me.client;
me.getClient = function() {
    if (!me.client) {
        me.client = s3.createClient({
            s3Options: {
                accessKeyId: sails.config.amazon.s3.key,
                secretAccessKey: sails.config.amazon.s3.secret,
            },
        });
    }
    return me.client;
}



// загружает файл на амазон
// cb(err)
me.uploadFile = function(src, cb) {
    var params = {
        localFile: src,
        s3Params: {
            Bucket: sails.config.amazon.s3.bucket,
            Key: src,
        }
    };

    var uploader = me.getClient().uploadFile(params);
    uploader.on('error', function(err) {
        console.error("unable to upload file:", src, err.stack);
        return cb(err);
    });
    uploader.on('end', function() {
        console.log("file uploaded to s3:", src);
        cb();
    });
}


// синхронизирует клиент с сервером (качает все файлы)
me.clientToServer = function(cb) {
    console.time('clientToServer')
    console.log('s3 clientToServer')
    if (!cb) cb = function(){};
    var params = {
        localDir: sails.config.amazon.s3.defaultDir,
        s3Params: {
            Bucket: sails.config.amazon.s3.bucket,
            Prefix: sails.config.amazon.s3.defaultDir,
        },
    };
    var uploader = me.getClient().uploadDir(params);
    // uploader.on('fileUploadStart', function(localFilePath, s3Key) {
    //     console.log("fileUploadStart", localFilePath, s3Key);
    // });
    uploader.on('end', function() {
        console.log("s3 uploading is complete");
        console.timeEnd('clientToServer')
        cb();
    });
    uploader.on('error', function(err) {
        console.error("unable to sync to amazon s3:", err.stack);
        console.timeEnd('serverToClient')
        cb(err);
    });
}

// синхронизирует клиент с сервером (качает все файлы)
me.serverToClient = function(cb) {
    console.time('serverToClient')
    console.log('s3 serverToClient')
    if (!cb) cb = function(){};
    var params = {
        localDir: sails.config.amazon.s3.defaultDir,
        s3Params: {
            Bucket: sails.config.amazon.s3.bucket,
            Prefix: sails.config.amazon.s3.defaultDir,
        },
    };
    var downloader = me.getClient().downloadDir(params);
    // downloader.on('fileDownloadStart', function(localFilePath, s3Key) {
    //     console.log("fileDownloadStart", localFilePath, s3Key);
    // });
    downloader.on('end', function() {
        console.log("s3 downloading is complete");
        console.timeEnd('serverToClient')
        cb();
    });
    downloader.on('error', function(err) {
        console.error("unable to sync from amazon d3:", err.stack);
        console.timeEnd('serverToClient')
        cb(err);
    });
}

module.exports = me;
