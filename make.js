const { execSync } = require("child_process");
const { readFileSync, writeFile, existsSync } = require("fs");

// var compile_all =
//     `emcc read.c \
//     --preload-file file.sf2 \
//     -s TOTAL_MEMORY=212mb \
//     -s ASSERTIONS=1 \
//     -s USE_ES6_IMPORT_META=0 \
//     -s MODULARIZE=1 \
//     -s EXPORT_ES6=1 \
//     -s EXTRA_EXPORTED_RUNTIME_METHODS='[ "FS","cwrap"]' \
//     -o read.js`;
// console.log(compile_all);
// process.stderr.write(execSync(compile_all).toString());
// var compile_node =
//     `emcc read.c \
//     -s TOTAL_MEMORY=600mb \
//     -s INITIAL_MEMORY=300mb \
//     -s EXTRA_EXPORTED_RUNTIME_METHODS='["cwrap","addOnInit"]' \
//     -o readnode.js`;

// console.log(compile_node);
// process.stderr.write(execSync(compile_node).toString());

require("child_process").execSync(
  `emcc go.c \
  --js-library libcall.js \
    --preload-file file.sf2 \
    -s ASSERTIONS=1 \
    -g4 \
    -fsanitize=address \
    -s TOTAL_MEMORY=500mb \
    -s ERROR_ON_UNDEFINED_SYMBOLS=0 \
    -s ABORTING_MALLOC=0 \
    -s EXPORTED_FUNCTIONS='["_malloc","_initWithPreload","_rfff","_trackInfo"]' \
    -s EXTRA_EXPORTED_RUNTIME_METHODS='["writeArrayToMemory","cwrap","addOnInit"]' \
    --source-map-base /fff/ \
    -o go.js`
);
