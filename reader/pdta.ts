import { reader, Reader } from "./reader";
import * as sfTypes from "./types";
const sampleId_gen = 53;

const velRangeGeneratorId = 44;
const keyRangeGeneratorId = 43;
const instrumentGenerator = 41;
const ShdrLength = 46;
const ibagLength = 4;
const imodLength = 10;
const phdrLength = 38;
const pbagLength = 4;
const pgenLength = 4;
const pmodLength = 10;
const instLength = 22;
export function parsePDTA(r: Reader) {
  //const sections: Map<string, any> = new Map<string, any>();
  let n = 0;
  const pheaders: sfTypes.Phdr[] = [],
    pbag: sfTypes.Pbag[] = [],
    pgen: sfTypes.Generator[] = [],
    pmod: sfTypes.Mod[] = [],
    inst: sfTypes.InstrHeader[] = [],
    igen: sfTypes.Generator[] = [],
    imod: sfTypes.Mod[] = [],
    ibag: sfTypes.IBag[] = [],
    shdr: sfTypes.Shdr[] = [];

  do {
    const sectionName = r.read32String();
    const sectionSize = r.get32();
    switch (sectionName) {
      case "phdr":
        for (let i = 0; i < sectionSize; i += phdrLength) {
          nextPhdr(r, pheaders);
        }
        break;
      case "pbag":
        for (let i = 0; i < sectionSize; i += pbagLength) {
          const bag = {
            pgen_id: r.get16(),
            pmod_id: r.get16(),
          };
          pbag.push(bag);
        }
        break;
      case "pgen":
        for (let i = 0; i < sectionSize; i += pgenLength) {
          const [operator, lo, hi] = [r.get16(), r.get8(), r.get8()];
          pgen.push({
            operator,
            range: { lo, hi },
            amount: lo | (hi << 8),
            signed: hi & 0x80 ? -0x10000 + (lo | (hi << 8)) : lo | (hi << 8),
          });
        }
        break;
      case "pmod":
        for (let i = 0; i < sectionSize; i += pmodLength) {
          pmod.push({
            src: r.get16(),
            dest: r.get16(),
            amt: r.get16(),
            amtSrc: r.get16(),
            transpose: r.get16(),
          });
        }
        break;
      case "inst":
        for (let i = 0; i < sectionSize; i += instLength) {
          inst.push({
            name: r.readNString(20),
            iBagIndex: r.get16(),
          });
        }
        break;
      case "igen":
        for (let i = 0; i < sectionSize; i += 4) {
          const [operator, lo, hi] = [r.get16(), r.get8(), r.get8()];

          igen.push({
            operator,
            range: { lo, hi },
            amount: lo | (hi << 8),
            signed: hi & 0x80 ? -0x10000 + (lo | (hi << 8)) : lo | (hi << 8),
          });
        }
        break;
      case "imod":
        for (let i = 0; i < sectionSize; i += imodLength) {
          imod.push({
            src: r.get16(),
            dest: r.get16(),
            amt: r.get16(),
            amtSrc: r.get16(),
            transpose: r.get16(),
          });
        }
        break;
      case "ibag":
        for (let i = 0; i < sectionSize; i += ibagLength) {
          ibag.push({
            igen_id: r.get16(),
            imod_id: r.get16(),
          });
        }
        break;
      case "shdr":
        for (
          let i = 0;
          i < sectionSize;
          i += ShdrLength ///20 + 4 * 5 + 1 + 1 + 4)
        ) {
          nextShdr(r, shdr);
        }
        break;
      default:
        break; // `seciont name [${sectionName}]`;
    }
  } while (n++ < 8);
  return { pheaders, pbag, pgen, pmod, inst, ibag, imod, igen, shdr };
}
function getpresets(
  pheaders,
  pbag,
  pgen,
  pmod,
  inst,
  ibag,
  imod,
  igen,
  shdr01
) {
  const presets: any = {};
  for (let i = 0; i < pheaders.length; i++) {
    const header = pheaders[i];
    presets[header.bankId] = presets[header.bankId] || {};
    const nextPresetBagIndex =
      i < pheaders.length - 1 ? pheaders[i + 1].pbagIndex : pbag.length - 1;
    let preset: sfTypes.Preset = {
      ...header,
      defaultBag: null,
      zones: [],
    };
    for (
      let pbagIndex = header.pbagIndex;
      pbagIndex < nextPresetBagIndex;
      pbagIndex++
    ) {
      const _pbag = pbag[pbagIndex];
      let pgenMap: sfTypes.Generator[] = [];
      const pgenEnd =
        pbagIndex < pbag.length - 1
          ? pbag[pbagIndex + 1].pgen_id
          : pgen[pgen.length - 1];
      for (let pgenIndex = _pbag.pgen_id; pgenIndex < pgenEnd; pgenIndex++) {
        const _pgen = pgen[pgenIndex];
        pgenMap[_pgen.operator] = _pgen;
      }
      const pbagZone = makeZone(pgenMap, shdr, preset.defaultBag);
      if (pgenMap[sfTypes.generators.sampleID] !== null) {
        if (pbagZone.sample) {
          preset.zones.push(pbagZone);
        } else {
          preset.defaultBag = pbagZone;
        }
      }
      if (pgenMap[instrumentGenerator]) {
        const instId = pgenMap[instrumentGenerator]!.amount;
        const instHeader = inst[instId];
        const nextIbagIndex =
          inst.length - 1 ? inst[instId + 1].iBagIndex : ibag.length - 1;

        for (
          let _ibagIndex = instHeader.iBagIndex;
          _ibagIndex < nextIbagIndex;
          _ibagIndex++
        ) {
          const _ibag = ibag[_ibagIndex];
          const lastIgenIndex =
            _ibagIndex < ibag.length - 1
              ? ibag[_ibagIndex + 1].igen_id
              : igen.length - 1;
          const igenMap: sfTypes.Generator[] = [];

          for (
            let igenIndex = _ibag.igen_id;
            igenIndex < lastIgenIndex;
            igenIndex++
          ) {
            const _igen = igen[igenIndex];
            igenMap[_igen.operator] = _igen;
          }
          if (
            igenMap[sfTypes.generators.sampleID] &&
            shdr[igenMap[sfTypes.generators.sampleID].amount]
          ) {
            const izone = makeZone(igenMap, shdr, pbagZone);
            preset.zones.push(izone);
          }
        }
      }
    }
    presets[header.bankId][header.presetId] = preset;
  }
  return presets;
}
const defaultZone: sfTypes.Zone = {
  velRange: {
    lo: 0,
    hi: 127,
  },
  keyRange: {
    lo: 0,
    hi: 127,
  },
  adsr: [0, 0, 0.69, 0],
  parent: null,
  sample: null,
  lowPassFilter: {
    centerFreq: 0.5,
    q: 0,
  },
  rootKey: 69, //we get to pick random integers ehre
  attenuation: 0,
  pan: -5,
  generators: [],
};
function makeZone(
  pgenMap: sfTypes.Generator[],
  shdr: sfTypes.Shdr[],
  baseZone?: sfTypes.Zone
): sfTypes.Zone {
  function getPgenVal(genId, type = "signed") {
    let v =
      (pgenMap[genId] && pgenMap[genId][type]) ||
      (baseZone &&
        baseZone.generators[genId] &&
        baseZone.generators[genId][type]);

    if (type == "signed") {
      if (v < -12000) v = -12000;
      if (v > 8000) v = 8000;
      return v;
    }
  }
  baseZone = baseZone || defaultZone;

  return {
    velRange: pgenMap[velRangeGeneratorId]?.range || baseZone?.velRange,
    keyRange: pgenMap[keyRangeGeneratorId]?.range || baseZone?.keyRange,
    adsr: [
      Math.pow(
        2,
        clamp(getPgenVal(sfTypes.generators.attackVolEnv), -12000, 8000) / 1200
      ),
      Math.pow(
        2,
        clamp(getPgenVal(sfTypes.generators.decayVolEnv), -12000, 8000) / 1200
      ),
      1 - clamp(getPgenVal(sfTypes.generators.sustainVolEnv), 1, 999) / 1000,
      Math.pow(
        2,
        clamp(getPgenVal(sfTypes.generators.releaseVolEnv), -12000, 8000) / 1200
      ),
    ],
    parent: baseZone,
    sample: shdr[pgenMap[sampleId_gen]?.amount] || null,
    get generators() {
      return pgenMap;
    },

    lowPassFilter: {
      centerFreq:
        Math.pow(2, getPgenVal(sfTypes.generators.initialFilterFc) / 1200) ||
        baseZone.lowPassFilter.centerFreq,
      q:
        getPgenVal(sfTypes.generators.initialFilterQ) / 10 ||
        baseZone.lowPassFilter.q,
    },
    rootKey:
      pgenMap[sfTypes.generators.overridingRootKey]?.amount || baseZone.rootKey,
    attenuation:
      getPgenVal(sfTypes.generators.initialAttenuation, "signed") ||
      baseZone.attenuation,
    pan: getPgenVal(sfTypes.generators.pan) || baseZone.pan,
    get attributes() {
      return parseAttributes(pgenMap, baseZone?.attributes);
    },
  };
}
function parseAttributes(pgenMap: sfTypes.Generator[], baseValues): {} {
  return pgenMap.reduce((gmap, g) => {
    if (!g) return gmap;
    switch (g.operator) {
      case sfTypes.generators.initialFilterFc:
      case sfTypes.generators.initialAttenuation:
      case sfTypes.generators.initialFilterQ:
        gmap[sfTypes.generatorNames[g.operator]] = g.signed;
        break;
      case sfTypes.generators.velRange:
      case sfTypes.generators.keyRange:
        gmap[sfTypes.generatorNames[g.operator]] = g.range;
        break;
      case sfTypes.generators.startAddrsOffset:
      case sfTypes.generators.endAddrsOffset:
      case sfTypes.generators.startAddrsOffset:
      case sfTypes.generators.endloopAddrsOffset:
      case sfTypes.generators.fineTune:
        gmap[sfTypes.generatorNames[g.operator]] ||= 0;
        gmap[sfTypes.generatorNames[g.operator]] += g.signed;
        break;
      case sfTypes.generators.startAddrsCoarseOffset:
      case sfTypes.generators.endAddrsCoarseOffset:
      case sfTypes.generators.coarseTune:
        gmap[sfTypes.generatorNames[g.operator]] ||= 0;
        gmap[sfTypes.generatorNames[g.operator]] += g.signed << 15;
        break;
      default:
        gmap[sfTypes.generatorNames[g.operator]] = g.signed;
        break;
    }
    return gmap;
  }, baseValues || {});
}

function nextPhdr(r: Reader, pheaders: sfTypes.Phdr[]) {
  const phdrItem = {
    name: r.readNString(20),
    presetId: r.get16(),
    bankId: r.get16(),
    pbagIndex: r.get16(),
    misc: [r.get32(), r.get32(), r.get32()],
  };
  pheaders.push(phdrItem);
}
function nextShdr(r: Reader, shdr: sfTypes.Shdr[]) {
  const name = r.readNString(20);
  const [
    start,
    end,
    startLoop,
    endLoop,
    sampleRate,
    originalPitch,
    pitchCorrection,
    sampleLink,
    sampleType,
  ] = [
    r.get32(),
    r.get32(),
    r.get32(),
    r.get32(),
    r.get32(),
    r.get8(),
    r.get8(),
    r.get16(),
    r.get16(),
  ];

  shdr.push({
    name,
    start,
    end,
    startLoop,
    endLoop,
    sampleRate,
    originalPitch,
    pitchCorrection,
    sampleLink,
    sampleType,
  });
}
