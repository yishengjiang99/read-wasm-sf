require("child_process").execSync(
    `emcc go.c \
    -s ABORTING_MALLOC=0 \
    -s EXPORTED_FUNCTIONS='["_malloc"]' \
    -s EXTRA_EXPORTED_RUNTIME_METHODS='["cwrap","addOnInit"]' \
    -o go.js`);