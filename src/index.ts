import "./Midi.js";
let Midi = globalThis.Midi;
let ctx;
let proc;
let outputs = [];

function stdout(str) {
  outputs.push(str);
  if (outputs.length > 20) outputs.shift();
  document.querySelector("#mocha").innerHTML = outputs.join("\n");
}

const worker = new Worker("./worker2.js");

worker.addEventListener("message", (event) => {
  stdout(`Received message from worker: ${event}`);
});

worker.addEventListener("messageerror", (event) => {
  stdout(`Error receiving message from worker: ${event}`);
});
worker.postMessage({ msg: "start" });
ctx = new AudioContext();
ctx.audioWorklet.addModule("./proc.js").then(() => {
  proc = new AudioWorkletNode(ctx, "proc4", {
    numberOfInputs: 6,
    numberOfOutputs: 1,
  });
  proc.port.onmessage = async () => {
    worker.postMessage({ port: proc.port }, [proc.port]);
  };
});

let Player;

Midi.fromUrl("./song.mid").then((obj) => {
  const { durationTicks, tracks, header } = obj;
  Player = {};
  Player.tracks = tracks;
  Player.ppq = header.ppq;
  Player.tempos = header.tempos;
  Player.timeSignatures = header.timeSignatures;

  Player.duration = durationTicks;
  Player.played = 0;

  const inst = tracks.map((t) => ({ instrument: t.instrument }));
  worker.postMessage({ tracks: inst });
});

async function Play() {
  Player.played = 0;
  while (Player.tracks.length && Player.played < Player.duration) {
    let t0 = performance.now();
    Player.tracks.map((t, idx) => {
      const memoizedTrackInfo = {
        instrument: {
          number: t.instrument.number,
          percussion: t.instrument.percussion,
          channel: t.channel,
        },
      };
      if (t.notes.length && t.notes[0].ticks <= Player.played - 1) {
        worker.postMessage({
          midiNote: { track: memoizedTrackInfo, note: t.notes.shift() },
        });
      }
    });
    Player.played += Player.ppq;
    if (Player.tempos.length > 1 && Player.played >= Player.tempos[1].ticks) {
      Player.tempos.shift();
    }
    if (
      Player.timeSignatures.length > 1 &&
      Player.played >= Player.timeSignatures[1].ticks
    ) {
      //&& Player.timeSignatures.length > 1) {
      Player.timeSignatures.shift();
    }
    const bpm = Player.tempos[0].bpm || 60;
    const wakeUpsPerBeat = Player.timeSignatures[0].timeSignature[0] || 4;
    const sleep = 60000 / (bpm * wakeUpsPerBeat);
    const elapsed = performance.now() - t0;
    stdout(Player.played / Player.ppq);
    await new Promise((r) => setTimeout(r, sleep - elapsed));
  }
}

const btn = document.querySelector("button");
btn.addEventListener("click", async function () {
  await ctx.resume();
  proc.connect(ctx.destination);
  Play();
});

btn.innerHTML = "START";
