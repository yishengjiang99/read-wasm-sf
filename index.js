import Module from './read.js';
let api;
let module;
export async function init() {
    const module = await Module();
    api = {
        init: module.cwrap("init_tsf", "", []),
        load_sound: module.cwrap("load_sound", "", ["number", "number", "number", "number", "number"]),
        ...module
    };
    api.init();
}
export async function loadSF(presetId, note, velocity, duration) {
    if (!api) {
        await init();
    }
    console.log("loading " + note);
    const { _malloc, _free, load_sound, HEAPF32 } = api;
    const n = duration * 48000;
    const buffer = _malloc(n * Float32Array.BYTES_PER_ELEMENT);
    console.log('ptr' + buffer);
    api.load_sound(buffer, presetId, note, 120, n);
    const res = new Float32Array(HEAPF32.buffer, buffer, n);
    _free(buffer);
    return res; //new Float32Array(Module.HEAPF32.buffer, resPtr, n)
}

const ctx = new AudioContext();

for (let i = 0; i < 88; i++) {
    const button = document.createElement("button");
    button.innerHTML = `${i + 21}`;
    let t0;

    button.onmousedown = () => {
        let vel = !t0 ? 50 : (performance.now() - t0) / 100;
        t0 = performance.now();
        loadSF(0, i + 21, vel, 0.25).then(buffer => {
            const ab = new AudioBuffer({ numberOfChannels: 1, length: 25 * 48000, sampleRate: 31000 });
            ab.copyToChannel(buffer, 0);

            const abs = new AudioBufferSourceNode(ctx, { buffer: ab })
            abs.connect(ctx.destination);
            abs.start();

        });
    };
    document.body.append(button);
}