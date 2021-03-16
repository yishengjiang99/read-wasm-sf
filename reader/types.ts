export type Range = { lo: number; hi: number };
export type Phdr = {
  name: string;
  presetId: number;
  bankId: number;
  pbagIndex: number;
};
export type Generator = {
  operator: number;
  range: Range;
  amount: number;
  signed?: number;
};
export type Pbag = { pgen_id: number; pmod_id: number };
export type IBag = { igen_id: number; imod_id: number };
export type Mod = {
  src: number;
  dest: number;
  amt: number;
  amtSrc: number;
  transpose: number;
};
export type InstrHeader = { name: string; iBagIndex: number };
export type Shdr = {
  name: string;
  start: number;
  end: number;
  startLoop: number;
  endLoop: number;
  sampleRate: number;
  originalPitch: number;
  pitchCorrection: number;
  sampleLink: number;
  sampleType: number;
};
export type Zone = {
  velRange: Range;
  keyRange: Range;
  sample: Shdr;
  adsr: [number, number, number, number];
  sampleOffsets?: number[];
  generators?: Generator[];
  attributes?: {};
  parent?: Zone;
  rootKey?: number;
  pan?: number;
  lowPassFilter?: {
    centerFreq: number;
    q: number;
  };
  attenuation?: number;
};
export type Preset = Phdr & {
  defaultBag: Zone;
  zones?: Zone[];
};
