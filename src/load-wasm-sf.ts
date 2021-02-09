
const fs = require("fs");
const flsf: Buffer = fs.readFileSync("./file.sf2");
const ab = new Uint8Array(fs.readFileSync("./re2ad.wasm"));
export default async function loadReader(): Promise<{
  sample: (
    presetId: number,
    midiNote: number,
    velocity: number,
    duration: number
  ) => Buffer
}> {
  // const memory = new WebAssembly.Memory({ initial: 256 });
  // @ts-ignore
  let memory = new WebAssembly.Memory({
    initial: 1024,
    maximum: 10240,
    // @ts-ignore
  });


  const { instance, module } = await WebAssembly.instantiate(ab, {
    env: {
      memory: new WebAssembly.Memory({
        initial: 1024,
        maximum: 10240,
      }),
      table: new WebAssembly.Table({
        initial: 1024,
        element: "anyfunc",
      }),
      tableBase: 0,
      __table_base: 0,
      _abort: () => console.log("abort!"),
      _grow: () => memory.grow(1)
    },
  });
  const HEAP8 = new Uint8Array(memory.buffer);
  const heapf32 = new Float32Array(memory.buffer);
  const sfptr = memory.buffer.byteLength - flsf.byteLength;
  HEAP8.set(flsf, sfptr);
  //@ts-ignore
  instance.exports.load_sf(sfptr, flsf.byteLength);
  let wptr = 0;
  return {
   sample: (preset: number, midi: number, velocity: number, seconds: number): Buffer => {
     const n = seconds * 31000;

     //@ts-ignore
     const ptr = instance.exports.ssample(preset, midi, velocity, n);

     const cp = Buffer.from(
       memory.buffer.slice(ptr, ptr + n * Float32Array.BYTES_PER_ELEMENT)
     );
     //@ts-ignore
     instance.exports.free(ptr);
     return cp;
   }
  }
}
