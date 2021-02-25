const express = require('express');
const app = express();
app.use("/", express.static());
const fs_1 = require("fs");
const httpsTLS = {
    key: fs_1.readFileSync(process.env.PRIV_KEYFILE),
    cert: fs_1.readFileSync(process.env.CERT_FILE),
};
require("https").createServer(httpsTLS, app).listen(443);

// const Module = require("./readnode.js");
// let toBuffer = require("typedarray-to-buffer")

// let api;
// async function initSFReader(filename = "file.sf2") {
//     await new Promise(resolve => {
//         Module.addOnInit(resolve);
//     })
//     const ff = require('fs').readFileSync(filename);
//     const p = Module._malloc(ff.byteLength);
//     Module.HEAP8.set(ff, p);
//     Module._read_sf(p, ff.byteLength);
//     api = {
//         loadSound: Module.cwrap("load_sound", '', ['number', 'number', 'number', 'number', 'number']),
//         ...Module
//     }
//     return api;
// }

// function loadSound(presetId, midi, velocity, duration) {
//     if (!api) {
//         initSFReader();
//     }
//     console.log("sss")
//     const n = 48000 * duration;
//     const ptr = Module._malloc(n * 4);
//     api.loadSound(ptr, presetId, midi, velocity, n); //._load_sound(ptr, presetId, midi, velocity, n);
//     const r = new Float32Array(Module.HEAPF32.buffer, ptr, n);
//     Module._free(ptr);
//     return toBuffer(r);
// }
// module.exports = {
//     initSFReader,
//     loadSound
// }
