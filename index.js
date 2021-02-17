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
    const metaquery =
        console.log("loading " + note);
    const { _malloc, _free, load_sound, HEAPF32 } = api;
    const n = duration * 48000 + 4 + 2;
    const buffer = _malloc(n * Float32Array.BYTES_PER_ELEMENT);
    console.log('ptr' + buffer);
    api.load_sound(buffer, presetId, note, 120, n);

    //    const [pitchRatio, sampleRate, attack, hold, decay, sustain, release, lpf_cf, lpf_q, ...sound] = new Float32Array(HEAPF32.buffer, buffer, n);
    const r = new Float32Array(HEAPF32.buffer, buffer, n);

    _free(buffer);
    return r; //new Float32Array(Module.HEAPF32.buffer, resPtr, n)
}

const ctx = new AudioContext({ sampleRate: 31000 });

for (let i = 0; i < 88; i++) {
    const button = document.createElement("button");
    button.innerHTML = `${i}`;
    let t0;

    button.onmousedown = () => {

    };
    document.body.append(button);
}

function play(preset, midi) {
    let vel = !t0 ? 50 : (performance.now() - t0) / 100;
    t0 = performance.now();


    loadSF(0, i, 55, 1).then(sound => {
        const ab = new AudioBuffer({ numberOfChannels: 1, length: sound.length, sampleRate: 31000 });
        ab.copyToChannel(sound, 0);
        //  console.log(Math.sqrt(sound.reduce((sum, v) => sum += v * v, 0) / 31000));
        const abs = new AudioBufferSourceNode(ctx, { buffer: ab })
            //  const g = new GainNode(ctx);
            // g.gain.exponentialRampToValueAtTime(sustain / 2, Math.pow(2, decay / 12000));
        abs.connect(ctx.destination);



        abs.start();

    });
}