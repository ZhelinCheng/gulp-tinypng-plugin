# [gulp](https://github.com/ZhelinCheng/gulp-tinypng-plugin)-tinypng-plugin

该插件增加了缓存功能，设置为`cache : true`，同时支持多个Key。

> Minify PNG  using [tinypng](https://tinypng.com/)
> Reference resources [gulp-tinypng](https://github.com/creativeaura/gulp-tinypng)

## Install

Install with [npm](https://npmjs.org/package/gulp-tinypng-plugin)

```bash
npm install --save-dev gulp-tinypng-plugin
```

## Example

```js
var gulp = require('gulp');
var tinypng = require('gulp-tinypng');

gulp.task('tinypng', function () {
    gulp.src('src/**/*.png')
        .pipe(tinypng({
            //key : 'API_KEY'
            key : ['API_KEY1', 'API_KEY2'，'...'],
            cache : true
        }))
        .pipe(gulp.dest('compressed_images'));
});
```

### tinypng(options)

`key`: API_KEY(String || Array)

`cache`: Open cache

## License

MIT
