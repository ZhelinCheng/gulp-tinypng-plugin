'use strict';
const through = require('through2');
const gutil = require('gulp-util');
const mkdirp = require('mkdirp');
const rmdir = require('rmdir');
const request = require('request');
const path = require('path');
//const inspect = require('util').inspect;
const fs = require('fs');
const PluginError = gutil.PluginError;
let AUTH_TOKEN;

const PLUGIN_NAME = 'gulp-tinypng-plugin';
const TEMP_DIR = '.gulp/tinypng/';

class Handle {
    cleanTemp() {
        rmdir('.gulp/tinypng', (err, dirs, files) => {
            mkdirp('.gulp/tinypng', (err) => {
                if (err) {
                    console.error('Error creating temp folder');
                }
            });
        });
    }

    download(uri, filename, complete) {
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
            fs.readFile(TEMP_DIR + filename, function (err, data) {
                if (err) {
                    console.log('Read file error!\n', err);
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
            }, (error, response, body) => {
                if (error) {
                    gutil.log('[error] : ' + PLUGIN_NAME + ': \n', error);
                    return;
                }

                results = JSON.parse(body);
                if (results.output && results.output.url) {
                    handle.download(results.output.url, filename, function () {
                        fs.readFile(TEMP_DIR + filename, function (err, data) {
                            if (err) {
                                gutil.log('[error] :  ' + PLUGIN_NAME + ' - ', err);
                            }
                            cb(data);
                        });
                    });
                } else {
                    gutil.log('[error] : ' + PLUGIN_NAME + ' - ', results.message);
                }

            });
        }
    }

    RandomNum(Min, Max) {
        let Range = Max - Min;
        let Rand = Math.random();
        let num = Min + Math.floor(Rand * Range);
        return num;
    }
}

let handle = new Handle();

// Plugin level function (dealing with files)
function gulpPrefixer(parameter) {
    parameter.cache = parameter.cache || true;

    if (parameter.key instanceof Object) {
        parameter.key = parameter.key[handle.RandomNum(0, parameter.key.length)]
    }

    AUTH_TOKEN = new Buffer('api:' + parameter.key).toString('base64');
    if (!parameter.key) {
        throw PluginError(PLUGIN_NAME, "Missing prefix text!");
    }
    parameter.key = new Buffer(parameter.key); // allocate ahead of time

    if (!fs.existsSync(TEMP_DIR) || !parameter.cache) {
        handle.cleanTemp()
    }
    // Creating a stream through which each file will pass
    let stream = through.obj(function (file, enc, callback) {
        if (file.isNull()) {
            this.push(file); // Do nothing if no contents
            return callback();
        }

        if (file.isBuffer()) {
            handle.tinypng(file, function (data) {
                file.contents = data;
                this.push(file);
                gutil.log(PLUGIN_NAME + ': [compressing]', gutil.colors.green('✔ ') + file.relative + gutil.colors.gray(' (done)'));
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
}

module.exports = gulpPrefixer;