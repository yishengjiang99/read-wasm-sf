import { openSync, readSync, Stats, statSync } from "fs";
export type Reader = {
  getc: () => number;
  get8: () => number;
  get16: () => number;
  read32String: () => string;
  get32: () => number;
  fstat: () => Stats;
  skip: (n: number) => void;
  getOffset: () => number;
  setOffset: (n: number) => void;
  readN: (n: number) => Buffer;
  readNString: (n: number) => string;
};
export function reader(path: string): Reader {
  let offset: number = 0;

  const fd = openSync(path, "r");

  const getc = function (): number {
    const buffer: Buffer = Buffer.alloc(4);
    readSync(fd, buffer, 0, 4, offset);
    offset++;
    return buffer.readUInt8();
  };
  const get8 = function (): number {
    return getc();
  };
  const get16 = function (): number {
    return get8() | (get8() << 8);
  };
  const get32 = function (): number {
    const buffer: Buffer = Buffer.alloc(16);
    readSync(fd, buffer, 0, 16, offset);
    offset += 4;
    return buffer.readUInt32LE(0);
  };
  const read32String = function (): string {
    return [getc(), getc(), getc(), getc()]
      .map((c) => {
        return String.fromCharCode(c);
      })
      .join("");
  };
  function fstat() {
    return statSync(path);
  }

  let skipped = [];
  function skip(n: number) {
    skipped.push(offset);
    offset += n;
  }
  function getOffset() {
    return offset;
  }
  function setOffset(n: number) {
    offset = n;
  }
  function readN(n: number) {
    const buffer: Buffer = Buffer.alloc(n);
    readSync(fd, buffer, 0, n, offset);
    offset += n;
    return buffer;
  }
  function readNString(n: number) {
    const buffer: Buffer = Buffer.alloc(n);
    readSync(fd, buffer, 0, n, offset);
    offset += n;
    return buffer.toString("ascii", 0, buffer.indexOf(0x00));
  }
  return {
    getc,
    get8,
    get16,
    read32String,
    get32,
    fstat,
    skip,
    getOffset,
    setOffset,
    readN,
    readNString,
  };
}
