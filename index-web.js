import { preload, start } from './load-midi.js';
let ctx,
    proc, tracks, durationTicks, trackInfo,
    outputs = [];

function stdout(str) {
    outputs.push(str);
    if (outputs.length > 20) outputs.shift();
    document.querySelector("#mocha").innerHTML = outputs.join("\n");
}

const worker = new Worker("./worker2.js", { type: "module" });

worker.addEventListener("message", (event) => {
    console.error(`Received message from worker: ${event}`);
});

worker.addEventListener("messageerror", (event) => {
    console.error(`Error receiving message from worker: ${event}`);
});
worker.postMessage("start");

// preload("song.mid").then((ret) => {
//     tracks = ret.tracks;
//     durationTicks = ret.durationTicks;
//     trackInfo = ret.trackInfos;
// }).catch(e => {
//     alert(e.message);
// })





const btn = document.querySelector("button");
btn.addEventListener("click", async function() {
    ctx = new AudioContext();
    await ctx.audioWorklet.addModule("./proc.js"); //.then(() => {
    proc = new AudioWorkletNode(ctx, "proc4", {
        numberOfInputs: 6,
        numberOfOutputs: 1,
        channelCount: [1],
    });
    proc.port.onmessage = async() => {
        worker.postMessage({ port: proc.port }, [proc.port])
    };
    proc.connect(ctx.destination);
    start(tracks, durationTicks, async function onNotesDue(notes) {
        notes.map(({ note, track }) => {
            const preset = trackInfos[track.channel]
                .filter(
                    (t) =>
                    t.velRange.lo < note.velocity * 0x7f &&
                    t.velRange.hi >= note.velocity * 0x7f
                )
                .filter(
                    (t) => t.keyRange.hi >= note.midi && t.keyRange.lo <= note.midi
                )[0];
            if (preset && preset.sample) {
                const ratio = (Math.pow(2, (preset.sample.originalPitch - note.midi) / 12) * 48000) /
                    preset.sample.sampleRate;

                worker.postMessage({
                    sample: preset.sample,
                    channel: track.channel,
                    ratio: ratio,
                    length: note.duration * 48000,
                });

            }

            return preset;
        });

        await new Promise((resolve) => {
            setTimeout(resolve, 250);
        });
        return 0.25;
    });
});

btn.innerHTML = "START";