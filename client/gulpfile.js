'use strict';
//载入外挂
const gulp = require( 'gulp' );

//var browserSync = require( 'browser-sync' ).create();
//var reload = browserSync.reload;

const jshint = require( 'gulp-jshint' );      //js格式检查
const less = require( 'gulp-less' );             //less 编译

const rename = require( 'gulp-rename' );
const uglify = require( 'gulp-uglify' );           //js压缩
const minifyCSS = require( 'gulp-minify-css' );           //css压缩
const del = require( 'del' );               //清空数据
const minimg = require ('gulp-imagemin');                  //图片压缩
const notify = require('gulp-notify');             //消息通知
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');

const runSequence = require( 'run-sequence' );
const cache = require('gulp-cache');

const svgSprite = require("gulp-svg-sprite"); //整合svg

const revCollector = require('gulp-rev-collector');// 路径替换
const rev = require('gulp-rev'); // 为文件添加MD5后缀
const minifyHTML   = require('gulp-minify-html');
const glob = require( 'glob' );
const path = require( 'path' );
const sourcemaps = require( 'gulp-sourcemaps' );

// 编译后文件位置
const DISTJSPATH = 'public/asserts/js/';
const DISTCSSPATH = 'public/asserts/css/';
const DISTIMGPATH = 'public/asserts/images/';
const DISTSVGPATH = 'public/asserts/svg/';
const DISTFONTICONPATH = 'public/asserts/font_icon/';
const DISTVENDORPATH = 'public/vendor/';

// 引用映射文件位置
const REVPATH = './rev/';

const noNeedOfCompressInVendor = [ 'angular', 'jquery', 'ui-bootstrap-angular' ];

// svg-sprite config
const svgSpriteConfig = {
    dest : 'svg',
    shape : {
        id : {
            separator : 'icon'
        }
    },
    mode : {
    /*
        css : {     // Activate the «css» mode
            render : {
                css : true  // Activate CSS output (with default options)
            }
        },
    */
        symbol : true
    }
};

var vendors = glob.sync( './vendor/*' ).map( function( vendorsDir ){
    return path.basename( vendorsDir );
});

var vendorTasks = [];

vendors.forEach( function( vendorName ){

    vendorTasks.push( 'copy:js_vendors_' + vendorName );

    if( noNeedOfCompressInVendor.indexOf( vendorName ) !== -1 ){
        gulp.task( 'copy:js_vendors_' + vendorName, function(){
            return gulp.src([
                './vendor/' + vendorName + '/*.js',
                './vendor/' + vendorName + '/*.map'
            ])
            .pipe( gulp.dest( DISTVENDORPATH ) );
        });
    }else{
        gulp.task( 'copy:js_vendors_' + vendorName, function(){
            return gulp.src([
                './vendor/' + vendorName + '/' + vendorName + '.js',
                './vendor/' + vendorName + '/!(' + vendorName + ').js'
            ], { base : './' } )
            .pipe( concat( vendorName + '.min.js' ) )
            .pipe( sourcemaps.init() )
            .pipe( uglify() )
            .pipe( rev() )
            .pipe( sourcemaps.write( './' ) )
            .pipe( gulp.dest( DISTVENDORPATH ) )
            .pipe( rev.manifest( REVPATH + 'jsMap.json', {
                base : REVPATH,
                merge : true
            }) )
            .pipe( gulp.dest( REVPATH ) );
        });

    }
});

// vendor目录下js文件拷贝
gulp.task( 'copy:js_vendor', function( cb ){
    var len = vendorTasks.length;

    if( typeof vendorTasks[len-1] === 'function' ){
        vendorTasks = vendorTasks.slice( 0, len-1 );
    }

    if( vendorTasks.length > 0 ){
        vendorTasks.push( cb );
        runSequence.apply( this, vendorTasks );
    }else{
        cb();
    }
});

gulp.task( 'copy:css_vendor', function(){
        return gulp.src( './vendor/**/*.css' )
            .pipe( gulp.dest( DISTVENDORPATH ) ); 
});

// 拷贝文件或者文件夹任务
gulp.task( 'copy', [ 'copy:js_vendor', 'copy:css_vendor' ], function(){
    console.log( '完成拷贝' );
});

// svg图标处理
gulp.task('icon:svg', function(){
    return gulp.src( './svg/**/*' )
        .pipe( svgSprite( svgSpriteConfig ) )
        .pipe( gulp.dest( DISTSVGPATH ) )
})

// 字体图标处理
gulp.task( 'icon:font_icon', function(){
    return gulp.src([
            './font_icon/**/*'
        ])
        .pipe( gulp.dest( DISTFONTICONPATH ) );
});

// icon任务，处理图标
gulp.task( 'icon', [ 'icon:font_icon', 'icon:svg' ], function(){
    console.log( "icon任务执行完毕" );
});

// 图片任务
gulp.task('images',function(){
    return gulp.src('./images/**/*')
        .pipe(minimg({optimizationLeva:3,progressive:true, interlaced: true}))
        .pipe( rev() )
        .pipe(gulp.dest(DISTIMGPATH))
        .pipe( rev.manifest( "imagesMap.json" ) )
        .pipe( gulp.dest( REVPATH ) );
});

// 编译less文件，注意依赖images任务，以便处理less文件中对图片的引用
gulp.task( 'css:less', [ 'images' ], function() {
    return gulp.src( [ REVPATH + 'imagesMap.json', './less/**/*.less' ] )
        .pipe( revCollector() )
        .pipe( less() )
        .pipe( autoprefixer() )
        .pipe( minifyCSS() )
        .pipe( rev() )
        .pipe(gulp.dest(DISTCSSPATH))
        .pipe( rev.manifest( REVPATH + 'cssMap.json', {
            base : REVPATH,
            merge : true
        }) )
        .pipe( gulp.dest( REVPATH ) );
});

// css 任务
gulp.task( 'css', [ 'css:less' ], function(){
    console.log( "css任务执行完毕" );
});

var modules = glob.sync( './modules/*' ).map( function( modulesDir ){
    return path.basename( modulesDir );
});

var moduleTasks = [],
    moduleReplaceTasks = [];

// 连接并编译modules目录下各个子目录内的js文件
modules.forEach( function( moduleName ){
    gulp.task( 'js:modules_' + moduleName, function(){
        return gulp.src([
            'modules/' + moduleName + '/js/' + moduleName + '.js',
            'modules/' + moduleName + '/js/!(' + moduleName + ').js',
        ])
        .pipe( jshint() )
        .pipe( jshint.reporter( 'default', { verbose : 'true' } ) )
        .pipe( concat( moduleName + '.min.js' ) )
        .pipe( sourcemaps.init() )
        .pipe( rev() )
        .pipe( sourcemaps.write( './' ) )
        .pipe( gulp.dest( DISTJSPATH + '/modules' ) )
        .pipe(rev.manifest( REVPATH + "jsMap.json", {       //- 生成一个rev-manifest.json
            base : REVPATH,
            merge : true
        }))         
        .pipe(gulp.dest( REVPATH ) );
    });

    gulp.task( 'replace:modules_' + moduleName, function(){
        return gulp.src([
            REVPATH + 'jsMap.json',
            REVPATH + 'cssMap.json',
            REVPATH + 'imagesMap.json',
           './modules/' + moduleName + '/views/*.html'
        ])
        .pipe( revCollector() )
        .pipe( minifyHTML({
            empty : true,
            spare : true
        }) )
        .pipe( gulp.dest( './public/modules/' + moduleName ) );
    });

    moduleTasks.push( 'js:modules_' + moduleName );

    moduleReplaceTasks.push( 'replace:modules_' + moduleName );
});

// 编译modules文件夹下的js文件(操作内容：文件压缩，文件hash)
gulp.task( 'js:modules', function( cb ){
    var len = moduleTasks.length;
    // 防止重复执行任务的时候总是往moduleTasks末尾追加回调函数
    if( typeof moduleTasks[len-1] === 'function' ){
        moduleTasks = moduleTasks.slice( 0, len-1 );
    }
    if( moduleTasks.length > 0 ){
        moduleTasks.push( cb );
        runSequence.apply( this, moduleTasks );
    }else{
        cb();
    }
});

var components = glob.sync( './components/*' ).map( function( componentsDir ){
    return path.basename( componentsDir );
});

var componentTasks = [],
    componentReplaceTasks = [];

// 连接并编译components目录下各个子目录内的js文件
components.forEach( function( componentName ){
    gulp.task( 'js:components_' + componentName, function(){
        return gulp.src([
            './components/' + componentName + '/js/**/*'
        ])
        .pipe( concat( componentName + '.min.js' ) )
        .pipe( rev() )
        .pipe( gulp.dest( DISTJSPATH + '/components' ) )
        .pipe(rev.manifest( REVPATH + "jsMap.json", {       //- 生成一个rev-manifest.json
            base : REVPATH,
            merge : true
        }))         
        .pipe(gulp.dest( REVPATH ) );
    });

    gulp.task( 'replace:components_' + componentName, function(){
        return gulp.src([
            REVPATH + 'jsMap.json',
            REVPATH + 'cssMap.json',
            REVPATH + 'imagesMap.json',
            './components/' + componentName + '/views/*.html'
        ])
        .pipe( revCollector() )
        .pipe( minifyHTML({
            empty : true,
            spare : true
        }) )
        .pipe( gulp.dest( './public/components' + componentName ) );
    });

    componentTasks.push( 'js:components_' + componentName );

    componentReplaceTasks.push( 'replace:components_' + componentName );
});

// 编译components文件夹下的js文件(操作内容：文件压缩，文件hash)
gulp.task( 'js:components', function( cb ){
    var len = componentTasks.length;
    // 防止重复执行任务的时候总是往componentTasks末尾追加回调函数
    if( typeof componentTasks[len-1] === 'function' ){
        componentTasks = componentTasks.slice( 0, len-1 );
    }
    if( componentTasks.length > 0 ){
        componentTasks.push( cb );
        runSequence.apply( this, componentTasks );
    }else{
        cb();
    }
});

// js 任务
gulp.task( 'js', function( cb ){
    runSequence( 'js:components', 'js:modules', cb );
});

// 实时刷新浏览器
/*
gulp.task( 'livereload', function() {
    browserSync.init({
        open : false,
        server : {
            baseDir : './',
            index : './index.html'
        }
    });
});
*/
//gulp.watch( ['views/**/*', DISTJSPATH + '**/*', DISTCSSPATH + '**/*'], { cwd : './'}, reload );

// 清理编译dist目录下js文件
gulp.task( 'clean:js', function() {
    return del([
        DISTJSPATH + '**/*'
    ])
    .then( function( paths ){
        //console.log( '删除js文件或文件夹:\n', paths.join( '\n' ) );
    });
});

// 清理public/asserts目录下css文件
gulp.task( 'clean:css', function() {
    del([
        DISTCSSPATH + '**/*'
    ] )
    .then( function( paths ){
        //console.log( '删除css文件或文件夹:\n', paths.join( '\n' ) );
    });
});

// 清理public/asserts目录下的svg目录
gulp.task( 'clean:svg', function() {
    del([
        DISTSVGPATH + '**/*'
    ] )
    .then( function( paths ){
        //console.log( '删除svg文件夹:\n', paths.join( '\n' ) );
    });
});

// 清理public/asserts目录下的font_icon目录
gulp.task( 'clean:font_icon', function() {
    del([
        DISTFONTICONPATH + '**/*'
    ] )
    .then( function( paths ){
        //console.log( '删除font_icon文件夹:\n', paths.join( '\n' ) );
    });
});

// 清理public/asserts目录下的images目录
gulp.task( 'clean:images', function(){
    del([
        DISTIMGPATH + '**/*'
    ] )
    .then( function( paths ){
        //console.log( '删除images文件夹:\n', paths.join( '\n' ) );
    });
});

// 清理public/asserts目录下的vendor目录
gulp.task( 'clean:vendor', function(){
    del([
        DISTVENDORPATH + '**/*'
    ] )
    .then( function( paths ){
        //console.log( '删除vendor文件夹:\n', paths.join( '\n' ) );
    });
});

// 清理rev/目录下的引用映射文件
gulp.task( 'clean:rev', function(){
    del([
        REVPATH + '**/*'
    ] )
    .then( function( paths ){
        //console.log( '删除引用映射文件:\n', paths.join( '\n' ) );
    });
});

// 清理所有编译生成的文件
gulp.task( 'clean', function( cb ) {
    runSequence( [ 'clean:css', 'clean:js', 'clean:svg', 'clean:font_icon', 'clean:images', 'clean:vendor', 'clean:rev' ], cb );
});


// 替换modules目录里的html模板文件中的css与js,images引用
gulp.task( 'replace:modules', function( cb ){

    var len = moduleReplaceTasks.length;

    if( typeof moduleReplaceTasks[ len-1 ] === 'function' ){
        moduleReplaceTasks = moduleReplaceTasks.slice( 0, len-1 );
    }
    if( moduleReplaceTasks.length > 0 ){
        moduleReplaceTasks.push( cb );
        runSequence.apply( this, moduleReplaceTasks );
    }else{
        cb();
    }
    //return gulp.src( [ REVPATH + 'jsMap.json', REVPATH + 'cssMap.json', REVPATH + 'imagesMap.json', './modules/**/views/*.html' ], { base : './' } )
    //    .pipe( revCollector() )
    //    .pipe( minifyHTML({
    //        empty : true,
    //        spare : true
    //    }) )
    //    .pipe( gulp.dest( './public/' ) );
});

// 替换components目录里的html模板文件中的css与js,images引用
gulp.task( 'replace:components', function( cb ){

    var len = componentReplaceTasks.length;

    if( typeof componentReplaceTasks[len-1] === 'function' ){
        componentReplaceTasks = componentTasks.slice( 0, len-1 );
    }

    if( componentReplaceTasks.length > 0 ){
        componentReplaceTasks.push( cb );
        runSequence.apply( this, componentReplaceTasks );
    }else{
        cb();
    }

    //return gulp.src( [ REVPATH + 'jsMap.json', REVPATH + 'cssMap.json', REVPATH + 'imagesMap.json', './components/**/views/*.html' ], { base: './' } )
    //    .pipe( revCollector() )
    //    .pipe( minifyHTML({
    //        empty : true,
    //        spare : true
    //    }) )
    //    .pipe( gulp.dest( './public/' ) );
});

// 根据map文件替换文件引用
gulp.task( 'replace', function( cb ){
    runSequence( 'replace:components', 'replace:modules', cb );
});

// 监控用户js文件变更
gulp.task( 'watch:js_modules', function(){
    return gulp.watch( [
        './modules/**/js/**/*',
    ], [ 'js:modules' ] );
});

// 监控js库文件变更
gulp.task( 'watch:js_components', function(){
    return gulp.watch( [
        './components/**/js/**/*'
    ], [ 'js:components' ] );
});

// 监控js文件变更
gulp.task( 'watch:js', [ 'watch:js_modules', 'watch:js_components' ], function(){
});

// 监控less文件变更
gulp.task( 'watch:css_less', function(){
    return gulp.watch( [
        './less/**/*'
    ], [ 'css:less' ] );
});

// 监控css文件变更
gulp.task( 'watch:css', [ 'watch:css_less' ], function(){
});

// 监控images文件变更
gulp.task( 'watch:images', function(){
    return gulp.watch( [
        './images/**/*'
    ], [ 'images' ] );
});

// 监控vendor文件夹变更
gulp.task( 'watch:vendor', function(){
    return gulp.watch( [
        './vendor/**/*'
    ], [ 'copy:vendor' ] );
});

// 监控拷贝文件
gulp.task( 'watch:copy', [ 'watch:vendor' ], function(){
});

// 监控rev文件变更
gulp.task( 'watch:rev', function(){
    return gulp.watch( [
        './rev/**/*'
    ], [ 'replace' ] );
});

// 监控变更任务 
gulp.task( 'watch', function( cb ){
    runSequence( 'watch:copy', 'watch:images', 'watch:css', 'watch:js', 'watch:rev' );
});

// 定义默认任务,开发过程中主要调用的任务
gulp.task( 'default', function( cb ) {
    runSequence( 'clean', 'copy', [ 'js', 'css' ], 'replace', 'watch', cb );
});

/*
gulp.task('cleanCache', function(done){
    return cache.clearAll(done);
})
*/
