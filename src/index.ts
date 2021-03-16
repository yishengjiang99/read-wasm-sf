let ctx,
  proc,
  tracks,
  durationTicks,
  outputs = [];

function stdout(str) {
  outputs.push(str);
  if (outputs.length > 20) outputs.shift();
  document.querySelector("#mocha").innerHTML = outputs.join("\n");
}

const worker = new Worker("./worker2.js");

worker.addEventListener("message", (event) => {
  console.log(`Received message from worker: ${event}`);
});

worker.addEventListener("messageerror", (event) => {
  console.log(`Error receiving message from worker: ${event}`);
});
worker.postMessage("start");

async function initCtx() {
  ctx = new AudioContext();
  await ctx.audioWorklet.addModule("./proc.js"); //.then(() => {
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
});

btn.innerHTML = "START";
