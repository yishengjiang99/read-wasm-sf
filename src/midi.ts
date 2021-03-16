function readMidi(buffer: Uint8Array) {
  let offset = 0;

  function bufferReader(buffer: Uint8Array) {
    const bl = buffer.byteLength;
    const fgetc = () => offset < bl && buffer[offset++];
    const btoa = () => String.fromCharCode(fgetc());
    const read32 = () =>
      (fgetc() << 24) | (fgetc() << 16) | (fgetc() << 8) | fgetc();
    const read16 = () => (fgetc() << 8) | fgetc();
    const read24 = () => (fgetc() << 16) | (fgetc() << 8) | fgetc();
    const fgets = (n: number) => (n > 1 ? btoa() + fgets(n - 1) : btoa());
    const fgetnc = (n: number) =>
      n > 1 ? fgetnc(n - 1).concat(fgetc()) : [fgetc()];
    const readVarLength = () => {
      let v = 0;
      let n = fgetc();
      v = n & 0x7f;
      while (n & 0x80) {
        n = fgetc();
        v = (v << 7) | (n & 0x7f);
      }
      return v;
    };
    return {
      fgetc,

      btoa,
      read32,
      read16,
      read24,
      fgetnc,
      readVarLength,
      fgets,
    };
  }
  const reader = bufferReader(buffer);
  const {
    fgetc,
    btoa,
    read32,
    read16,
    read24,
    fgets,
    fgetnc,
    readVarLength,
  } = reader;
  const chunkType = [btoa(), btoa(), btoa(), btoa()].join("");
  const headerLength = read32();
  const format = read16();
  const ntracks = read16();
  const division = read16();
  let g_time = -1000;
  const tracks = [];
  const limit = buffer.byteLength;
  const tempos = [];
  const metainfo = [];
  const timesigs = [];
  while (offset < limit) {
    const mhrk = [btoa(), btoa(), btoa(), btoa()].join("");
    let mhrkLength = read32();
    const endofTrack = offset + mhrkLength;
    tracks.push({ endofTrack, offset, time: 0, program: 0 });
    offset = endofTrack;
  }

  function readAt(g_time, cbNoteOn, cbnoteOff) {
    for (const track of tracks) {
      offset = track.offset;
      while (track.time <= g_time && offset < track.endofTrack) {
        track.time += readVarLength();
        const event = readMessage(track);
      }
      track.offset = offset;
    }
    function readMessage(track) {
      const msg = fgetc();
      if (!msg) return false;
      let meta;

      let info = [];
      if (msg >= 0xf0) {
        switch (msg) {
          case 0xff:
            meta = fgetc();
            var len = readVarLength();
            let cmd = "";
            switch (meta) {
              case 0x01:
                cmd = "done";
                break;

              case 0x02:
              case 0x03:
              case 0x05:
              case 0x06:
              case 0x07:
                metainfo.push(fgets(len));
                cmd = "etc";
                break;
              case 0x04:
                info.push(fgets(len));
                cmd = "instrument";
                break;
              case 0x51:
                tempos.push({ tempo: read24() });
                cmd = "tempo";
                break;
              case 0x54:
                const [framerateAndhour, min, sec, frame, subframe] = [
                  fgetc(),
                  fgetc(),
                  fgetc(),
                  fgetc(),
                  fgetc(),
                ];
                const framerate = [24, 25, 29, 30][framerateAndhour & 0x60];
                const hour = framerate & 0x1f;
                info = JSON.stringify({
                  framerate,
                  hour,
                  min,
                  sec,
                  frame,
                  subframe,
                }).split(/,s+/);
                break;
              case 0x58:
                cmd = "timesig";
                timesigs.push({
                  qnpm: fgetc(),
                  beat: fgetc(),
                  ticks: fgetc(),
                  measure: fgetc(),
                });

                break;
              case 0x59:
                info.push({
                  scale: fgetc() & 0x7f,
                });
                info.push({
                  majminor: fgetc() & 0x7f,
                });
                cmd = "note pitch change";
                break;
              case 0x2f:
                //END OF TRACK;
                break;
              default:
                cmd = "unkown " + meta;
                info.push({ "type:": meta, info: fgets(len) });
                break;
            }
            // console.log("meta ", msg, cmd, info);
            break;
          case 0xf2:
            return ["Song Position Pointer", read16()];
          case 0xf1:
            console.log("smpte:", [fgetc(), fgetc(), fgetc(), fgetc()]);
            break;
          case 0xf3:
          case 0xf4:
            console.log("icd,", fgetc());
            break;
          case 0xf6:
            console.log("list tunes");
            break;
          case 0xf7:
          case 0xf8:
            console.log("timing");
            break;
          case 0xfa:
            console.log("start");
            break;
          case 0xfb:
            console.log("Continue");
            break;
          case 0xfc:
            console.log("stop");
            break;
          default:
            console.log(msg);
            console.log("wtf");
            break;
        }
      } else {
        const channel = msg & 0x0f;
        const cmd = msg >> 4;
        switch (cmd) {
          case 0x08:
            cbnoteOff({
              channel: channel,
              notesOff: fgetc(),
              vel: fgetc(),
            });
          case 0x09:
            const note = fgetc();
            const vel = fgetc();
            cbNoteOn({
              channel,
              program: track.program,
              notesOn: note,
              vel: vel,
            });
          case 0x0a:
            return [fgetc(), fgetc()];
          case 0x0b:
            return ["cc change", fgetc(), "value", fgetc()];
          case 0x0c:
            track.program = fgetc();
            break;
          case 0x0e:
            return ["0x0e", fgetc(), fgetc()];
          default:
            return [cmd, fgetc()];
        }
      }
    }
  }
  return {
    tracks,
    tempos,
    timesigs,
    metainfo,
    readAt,
    tick: (cbNoteOn, cbnoteOff) => {
      g_time = g_time + 3;
      readAt(g_time, cbNoteOn, cbnoteOff);
    },
  };
}
const canvas = document.querySelector("canvas");
canvas.setAttribute("width", "1024");
canvas.setAttribute("height", "1024");
// canvas.width = 1024;
// canvas.height = 560;
const cells = 16 * 88;
const gridw = 1024 / 88;
const gridh = 1024 / 16;
const grid = new Array(88).fill(new Array(16));
const ctgx = canvas.getContext("2d");
fetch("./song.mid")
  .then((res) => res.arrayBuffer())
  .then((ab) => {
    const rr = readMidi(new Uint8Array(ab));

    function noteOn({ channel, notesOn, program, vel }) {
      grid[notesOn][channel] = vel;
    }
    function noteOff({ channel, notesOff, vel }) {
      grid[notesOff][channel] = 0;
    }
    function draw() {
      for (let i = 0; i < 88; i++) {
        for (let j = 0; j < 16; j++) {
          if (grid[i][j] > 0) {
            ctgx.fillStyle = "black";
            ctgx.fillRect(i * gridw, j * gridh, gridw, gridh);
          } else {
            ctgx.clearRect(i * gridw, j * gridh, gridw, gridh);
            ctgx.fillStyle = "white";
            ctgx.fillRect(i * gridw, j * gridh, gridw, gridh);
          }
        }
      }
      requestAnimationFrame(draw);
    }
    setInterval(() => rr.tick(noteOn, noteOff), 3.5);
    requestAnimationFrame(draw);
  });
