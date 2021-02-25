import './go.js';

let sounds;
let procPort;
let trackInfo = {};
let renderFn;
let timer;

export async function init() {
    const mod = await Module();
    mod._initWithPreload();

    function mallocStruct(byteLength) {
        const ptr = mod._malloc(byteLength);
        const rr = mod.HEAPU8.buffer.slice(ptr, ptr + byteLength);
        const dv = new DataView(rr);

        return {
            ptr,
            dv
        };
    }
    sounds = new Array(16).fill(mallocStruct(40));
    renderFn = function() => {
        const output = mod._malloc(128 * Float32Array.BYTES_PER_ELEMENT);
        for (const { ptr, dv }
            of sounds) {
            mod._render(output, ptr, 128);
        }
    }
}

export function stagePreset(track, note) { //presetId, bankId, key, velocity) {
    const index = presetIndex(t);

    const preset = trackInfos[index].zones
        .filter((t) =>
            t.velRange.lo < note.velocity * 0x7f &&
            t.velRange.hi >= note.velocity * 0x7f &&
            t.keyRange.hi >= note.midi && t.keyRange.lo <= note.midi
        )[0];

    if (preset && preset.sample) {
        const ratio = (Math.pow(2, (preset.sample.originalPitch - note.midi) / 12) * 48000) /
            preset.sample.sampleRate;
        const length = Math.floor(note.duration * 48000 / 128) * 128;
        dv.setUint32(0, start, true)
        dv.setUint32(4, end, true)
        dv.setUint32(8, loopStart, true)
        dv.setUint32(12, loopEnd, true)
        dv.setUint32(16, length, true);
        dv.setFloat32(20, ratio, true);
    }
}



export async function loadPresetIfno(tracks) {

    let cache = {};
    async function* gen(tracks) {
        while (tracks.length) {

            const t = tracks.shift();
            const index = presetIndex(t);

            const url = `./info/preset_${t.instrument.percussion ? 128 : 0}_${t.instrument.number
                }.json`;
            if (cache[url]) yield cache[url];
            const res = await fetch(
                url
            );
            const json = await res.json();
            cache[url] = json;
            trackInfo[index] = json;
            yield json;
        }
        return;
    }
    gen(tracks);
    for await (const _ of gen(tracks));
}



onmessage = function({ data: { tracks, notes, port, msg } }) {
    if (tracks) {
        loadPresetIfno(tracks);
    }
    if (port) procPort = port;
    if (notes) {
        notes.forEach({ note, track } => {
            statePreset(track, note);
        })
        if (!timer) {
            timer = setInterval(render, 60000 / (48000 / 128));
        }
    }
    if (msg) {
        switch (msg) {
            case 'done':
                clearInterval(timer);
                break;
            default:
                break;
        }
    }
    if (!renderFn) {
        init().then(ret => {
            postMessage("ready");
            renderFn = ret;
        }).catch(e => console.error(e));
    }
}

export function presetIndex(t) {
    const bankId = t.instrument.percussion ? 128 : 0;
    const presetId = t.instrument.number;
    const index = presetId + bankId << 2;
    return index;
}
