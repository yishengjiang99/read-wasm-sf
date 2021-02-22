const Module = require("./readnode.js");

let api;
async function initSFReader(filename = "file.sf2") {
    await new Promise(resolve => {
        Module.addOnInit(resolve);
    })
    const ff = require('fs').readFileSync(filename);
    const p = Module._malloc(ff.byteLength);
    Module.HEAP8.set(ff, p);
    Module._read_sf(p, ff.byteLength);
    api = {
        loadSound: Module.cwrap("load_sound", '', ['number', 'number', 'number', 'number', 'number']),
        ...Module
    }
    return api;
}

function loadSound(presetId, midi, velocity, duration) {
    if (!api) {
        initSFReader();
    }
    console.log("sss")
    const n = 48000 * duration;
    const ptr = Module._malloc(n * 4);
    api.loadSound(ptr, presetId, midi, velocity, n); //._load_sound(ptr, presetId, midi, velocity, n);
    const r = new Float32Array(Module.HEAPF32.buffer, ptr, n).buffer;
    Module._free(ptr);
    return r;
}
module.exports = {
    initSFReader,
    loadSound
}