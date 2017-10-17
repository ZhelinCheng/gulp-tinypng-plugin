// through2 is a thin wrapper around node transform streams
const through = require('through2');
const gutil = require('gulp-util');
const mkdirp = require('mkdirp');
const rmdir = require('rmdir');
const request = require('request');
const path = require('path');
const inspect = require('util').inspect;
const fs = require('fs');

const PluginError = gutil.PluginError;
let AUTH_TOKEN;

// Consts
const PLUGIN_NAME = 'gulp-tinypng-plugin';
const TEMP_DIR = '.gulp/tinypng/';

class handle {
    cleanTemp () {
        rmdir('.gulp/tinypng', (err, dirs, files) => {
            mkdirp('.gulp/tinypng', (err) => {
                if (err) {
                    console.error('Error creating temp folder');
                }
            });
        });
    }

    download (uri, filename, complete) {
        request.head(uri, (err, res, body) => {
            request({
                url: uri,
                strictSSL: false
            })
                .pipe(fs.createWriteStream(TEMP_DIR + filename))
                .on('close', function () {
                    complete();
                });
        });
    }

    tinypng(file, cb) {
        let results, filename;
        filename = path.basename(file.path);
        if (fs.existsSync(TEMP_DIR + filename)) {
            console.log(2222);
            fs.readFile(TEMP_DIR + filename, function (err, data) {
                if (err) {
                    console.log('Read file error!\n', err)
                    return false;
                }
                cb(data);
            })
        } else {
            request({
                url: 'https://api.tinypng.com/shrink',
                method: 'POST',
                strictSSL: false,
                headers: {
                    'Accept': '*/*',
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + AUTH_TOKEN
                },
                body: file.contents
            },  (error, response, body) => {
                if (!error) {
                    results = JSON.parse(body);
                    if (results.output && results.output.url) {
                        Handle.download(results.output.url, filename, function () {
                            fs.readFile(TEMP_DIR + filename, function (err, data) {
                                if (err) {
                                    gutil.log('[error] :  gulp-tinypng - ', err);
                                }
                                cb(data);
                            });
                        });
                    } else {
                        gutil.log('[error] : gulp-tinypng - ', results.message);
                    }
                }
            });
        }
    }
}

let Handle = new handle();

// Plugin level function (dealing with files)
function gulpPrefixer(parameter) {
    AUTH_TOKEN = new Buffer('api:' + parameter.key).toString('base64');
    if (!parameter.key) {
        throw PluginError(PLUGIN_NAME, "Missing prefix text!");
    }
    parameter.key = new Buffer(parameter.key); // allocate ahead of time

    if(!fs.existsSync(TEMP_DIR) || !parameter.cache){
        Handle.cleanTemp()
    }
    // Creating a stream through which each file will pass
    let stream = through.obj(function (file, enc, callback) {
        if (file.isNull()) {
            this.push(file); // Do nothing if no contents
            return callback();
        }

        if (file.isBuffer()) {
            Handle.tinypng(file, function (data) {
                file.contents = data;
                this.push(file);
                gutil.log('gulp-tingpng: [compressing]', gutil.colors.green('✔ ') + file.relative + gutil.colors.gray(' (done)'));
                return callback();
            }.bind(this));
        }

        if (file.isStream()) {
            throw PluginError(PLUGIN_NAME, "Stream is not supported");
            return callback();
        }
    });

    // returning the file stream
    return stream;
};

module.exports = gulpPrefixer;