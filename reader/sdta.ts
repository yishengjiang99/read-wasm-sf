import { reader } from "./reader";
import * as sfTypes from "./types";

export function readSF(path) {
  const r = reader(path);
  let i = 0;
  let size: number = r.get32();
  size -= 64;
  const sections: any = {};
  let sectionSize = r.get32();
  let section = r.read32String();
  r.skip(sectionSize);
  sectionSize = r.get32();
  section = r.read32String();
  r.skip(sectionSize);
  sectionSize = r.get32();
  section = r.read32String();
  return collatePDTA(r);
}

export function collatePDTA(r) {
  let sectionItemSizes = [
    [20, 2, 2, 2, 4, 4, 4],
    [2, 2],
    [2, 1, 1],
    [2, 2, 2, 2, 2],
    [20, 2],
    [2, 2],
    [2, 1, 1],
    [2, 2, 2, 2, 2],
    [20, 4, 4, 4, 4, 1, 1, 2, 2],
  ];
  const sections = [];
  for (let i = 0; i < 8; i++) {
    r.read32String();
    let sectionSize = r.get32();
    let nrow = 0;
    sections[i] = [];
    while (sectionSize > 0) {
      let row = [];
      console.log(sectionSize);
      for (let k = 0; k < sectionItemSizes[i].length; k++) {
        sectionSize -= sectionItemSizes[i][k];
        row.push(r.readN(sectionItemSizes[i][k] / 4));
      }
      sections[i][nrow++] = row;
    }
  }
}

let r = reader("file.sf2");
r.setOffset(31028738 + 4);
collatePDTA(r);
