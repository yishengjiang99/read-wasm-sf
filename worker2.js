importScripts('./go.js');

let sounds;
let procPort;
let trackInfo = {};
let renderFn;
let timer;
Module.addOnInit(async function() {
    Module._initWithPreload();
    postMessage("init");

    function mallocStruct(byteLength) {
        const ptr = Module._malloc(byteLength);
        const rr = Module.HEAPU8.buffer.slice(ptr, ptr + byteLength);
        const dv = new DataView(rr);
        return {
            ptr,
            dv
        };
    }
    sounds = new Array(16).fill(mallocStruct(40));

    renderFn = function() {
        const output = Module._malloc(128 * Float32Array.BYTES_PER_ELEMENT);

        const arr = new Float32Array(Module.HEAPF32.buffer, output, 128);
        for (const sound of sounds) {
            const ratio = sound.dv.getFloat32(20, true);
            const offset = sound.dv.getUint32(0, true);
            const length = sound.dv.getUint16(16, true);
            if (length <= 0) continue;
            const ll = Module._render(output, sound.ptr, 128);
            console.log(ll);
            const offsetAfter = sound.dv.getUint32(0, true);
            const lengthaff = sound.dv.getUint16(16, true);
            sound.dv.setUint16(16, length - 128)
            console.log("ratio", ratio, '\noffsets: ', offset, offsetAfter, "\ntodo", length, lengthaff);

        }
        // if (procPort) procPort.postMessage({ buffer: arr }, [arr]);
    }
});





function stagePreset(track, note, duration) { //presetId, bankId, key, velocity) {
    const index = presetIndex(track);
    length = ~~(duration * 48000)

    const preset = trackInfo[index].zones
        .filter((t) =>
            t.velRange.lo < note.velocity * 0x7f &&
            t.velRange.hi >= note.velocity * 0x7f &&
            t.keyRange.hi >= note.midi && t.keyRange.lo <= note.midi
        )[0];

    if (preset && preset.sample) {
        const ratio = (Math.pow(2, (preset.sample.originalPitch - note.midi) / 12) * 48000) /
            preset.sample.sampleRate;

        const dv = sounds[track.instrument.channel].dv;
        const { start, end, startLoop, endLoop } = preset.sample;
        dv.setUint32(0, start, true)
        dv.setUint32(4, end, true)
        dv.setUint32(8, startLoop, true)
        dv.setUint32(12, endLoop, true)
        dv.setUint16(16, length, true);
        dv.setFloat32(20, ratio, true);
    }
}



async function loadPresetIfno(tracks) {
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



onmessage = function(e) {
    // const data = e.data;
    const { data: { tracks, midiNote, port, msg } } = e;
    if (tracks) {
        loadPresetIfno(tracks);
    }
    if (port) procPort = port;
    if (midiNote) {
        stagePreset(midiNote.track, midiNote.note, midiNote.length);
        if (!timer) {
            timer = setInterval(renderFn, 60000 / (48000 / 128));
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
    //     if (!renderFn) {
    //         init().then(ret => {
    //             postMessage("ready");
    //             renderFn = ret;
    //         }).catch(e => console.error(e));
    //     }
}

function presetIndex(t) {
    const bankId = t.instrument.percussion ? 128 : 0;
    const presetId = t.instrument.number;
    const index = presetId + (bankId << 2);
    return index;
}