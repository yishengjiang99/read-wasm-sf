const { execSync } = require("child_process");

var NODEJS = 1;

var EMCC = '~/grepawk3/emsdk/upstream/emscripten/emcc'; //'/usr/lib/emsdk_portable/emscripten/master/emcc' 


var compile_all =
    `emcc read.c \
    --preload-file file.sf2 \
    -s TOTAL_MEMORY=560mb \
    -s ASSERTIONS=1 \
    -s USE_ES6_IMPORT_META=0 \
    -s MODULARIZE=1 \
    -s EXPORT_ES6=1 \
    -s EXTRA_EXPORTED_RUNTIME_METHODS='[ "FS","cwrap"]' \
    -o read.js`;

console.log(compile_all);
process.stderr.write(execSync(compile_all).toString());


// compile_all =
//     `emcc cacheADSR.c -s ALLOW_MEMORY_GROWTH=1 \
//     -fsanitize=address \
//     --pre-js preloadfiles.js --post-js post.js\
//     -s ASSERTIONS=1 \
//     -s TOTAL_MEMORY=360mb \
//     -s EXTRA_EXPORTED_RUNTIME_METHODS='[ "FS","cwrap"]' -o bitmapsf.js`;


// process.stdout.write(execSync(compile_all).toString());