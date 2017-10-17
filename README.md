# [gulp](https://github.com/ZhelinCheng/gulp-tinypng-plugin)-tinypng-plugin

> Minify PNG  using [tinypng](https://tinypng.com/)
> Reference resources [gulp-tinypng](https://github.com/creativeaura/gulp-tinypng)

## Install

Install with [npm](https://npmjs.org/package/gulp-tinypng-plugin)

```
npm install --save-dev gulp-tinypng-plugin
```


## Example

```js
var gulp = require('gulp');
var tinypng = require('gulp-tinypng');

gulp.task('tinypng', function () {
	gulp.src('src/**/*.png')
		.pipe(tinypng({
            key : 'API_KEY'
            cache : true
        }))
		.pipe(gulp.dest('compressed_images'));
});
```


## API

### tinypng(options)

`key`: API_KEY

`cache`: Open cache

## License

MIT
