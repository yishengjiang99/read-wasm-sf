importScripts("./go.js");
importScripts("./dist/track-view.js");

const sizeof_track_t =
  Uint32Array.BYTES_PER_ELEMENT * 4 +
  Float32Array.BYTES_PER_ELEMENT +
  Int16Array.BYTES_PER_ELEMENT;
const polyphony = 16;

let sounds;
let procPort;
let trackInfo = {};
let renderFn;
let timer;
let tvs;
const { readable, writable } = new TransformStream();
const writer = writable.getWriter();
onmessage = function (e) {
  // const data = e.data;
  const {
    data: { tracks, midiNote, port, msg },
  } = e;
  if (tracks) {
    loadPresetIfno(tracks);
  }
  if (port) {
    procPort = port;
    procPort.postMessage({ readable }, [readable]);
  }

  if (midiNote) {
    stagePreset(midiNote.track, midiNote.note, midiNote.length);
    if (!timer && renderFn)
      timer = setInterval(() => {
        const buffer = renderFn();
        writer.write(buffer);
      }, 60000 / (48000 / 128));
  }
  if (msg) {
    omsg(msg);
  }
};

Module.addOnInit(async function () {
  Module._initWithPreload();
  postMessage("init");
  let trackListPtr = Module._malloc(sizeof_track_t * polyphony);
  tvs = [];
  for (let i = 0; i < 16; i++) {
    const tv = new TrackView(
      trackListPtr + i * sizeof_track_t,
      new DataView(
        Module.HEAPU8.buffer,
        trackListPtr + i * sizeof_track_t,
        sizeof_track_t
      )
    );
    tv.length = 0;
    tvs.push(tv);
  }
  renderFn = function () {
    const n = 128 * Float32Array.BYTES_PER_ELEMENT;
    const output = Module._malloc(n);
    Module._render(output, trackListPtr);
    const data = new Float32Array(Module.HEAPF32.buffer, output, n);
    debugger;
    Module._free(output);
  };
});

function stagePreset(track, note, duration) {
  //presetId, bankId, key, velocity) {
  const index = presetIndex(track);
  Module.trackInfo(track.instrument.number, note.midi, note.velocity);
  length = ~~(duration * 48000);

  const preset = trackInfo[index].zones.filter(
    (t) =>
      t.velRange.lo < note.velocity * 0x7f &&
      t.velRange.hi >= note.velocity * 0x7f &&
      t.keyRange.hi >= note.midi &&
      t.keyRange.lo <= note.midi
  )[0];

  if (preset && preset.sample) {
    const ratio =
      (Math.pow(2, (preset.sample.originalPitch - note.midi) / 12) * 48000) /
      preset.sample.sampleRate;
    const tv = tvs[track.instrument.channel];
    const { start, end, startLoop, endLoop } = preset.sample;
    tv.length = length;
    tv.offset = start;
    tv.end = end;
    tv.startLoop = startLoop;
    tv.endLoop = endLoop;
    tv.ratio = ratio;
  }
}

async function loadPresetIfno(tracks) {
  let cache = {};
  async function* gen(tracks) {
    while (tracks.length) {
      const t = tracks.shift();
      const index = presetIndex(t);
      const url = `./info/preset_${t.instrument.percussion ? 128 : 0}_${
        t.instrument.number
      }.json`;
      if (cache[url]) yield cache[url];
      const res = await fetch(url);
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

function presetIndex(t) {
  const bankId = t.instrument.percussion ? 128 : 0;
  const presetId = t.instrument.number;
  const index = presetId + (bankId << 2);
  return index;
}

function omsg(msg) {
  switch (msg) {
    case "done":
      clearInterval(timer);
      break;
    default:
      break;
  }
}
