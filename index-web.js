let ctx,
  proc,
  tracks,
  durationTicks,
  trackInfo,
  outputs = [];

function stdout(str) {
  outputs.push(str);
  if (outputs.length > 20) outputs.shift();
  document.querySelector("#mocha").innerHTML = outputs.join("\n");
}

const worker = new Worker("./worker2.js");

worker.addEventListener("message", (event) => {
  console.error(`Received message from worker: ${event}`);
});

worker.addEventListener("messageerror", (event) => {
  console.error(`Error receiving message from worker: ${event}`);
});
worker.postMessage("start");

async function initCtx() {
  ctx = new AudioContext();
  await ctx.audioWorklet.addModule(
    URL.createObjectURL(
      new Blob(
        [
          `const chunk = 128 * 4;

  class Proc5 extends AudioWorkletProcessor {
      constructor() {
          super();
          this.buffer = [];
          this.port.onmessage = async({ data: { readable, msg } }) => {
              if (readable) {
                  const reader = readable.getReader();
  
                  while (true) {
                      const { value, done } = await reader.read();
                      if (done) break;
                      while (value && value.length) {
                          const b = value.slice(0, chunk);
                          if (b.byteLength < 0) {
                              let padded = new Uint8Array(chunk).fill(0);
                              padded.set(b);
                              this.buffer.push(padded);
                          } else {
                              this.buffer.push(b);
                          }
                      }
                  }
              }
          }
          this.port.postMessage({ msg: 'proc inited' })
      }
      process(_inputs, outputs, _parameters) {
          if (this.buffer.length == 0) return true;
          const ob = this.buffers.shift();
          const dv = new DataView(ob.buffer);
          for (let i = 0; i < 128; i++) {
              outputs[0][0][i] = dv.getFloat32(i * 4, true);
          }
          return true;
      }
  
  }
  registerProcessor("proc5", Proc5);`,
        ],
        { type: "application/javascript" }
      )
    )
  ); //.then(() => {
  proc = new AudioWorkletNode(ctx, "proc5", {
    numberOfInputs: 6,
    numberOfOutputs: 1,
  });
  proc.port.onmessage = async () => {
    worker.postMessage({ port: proc.port }, [proc.port]);
  };
  proc.connect(ctx.destination);
}
const btn = document.querySelector("button");
btn.addEventListener("click", async function () {
  if (!ctx) await initCtx();
  worker.postMessage({
    midiNote: {
        number: t.instrument.number,
        percussion: t.instrument.percussion,
        channel: t.channel,
      },
      note: t.notes.shift(),
    },
  });
});

btn.innerHTML = "START";
