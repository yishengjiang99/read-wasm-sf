export const generatorNames = `#define SFGEN_startAddrsOffset         0
#define SFGEN_endAddrsOffset           1
#define SFGEN_startloopAddrsOffset     2
#define SFGEN_endloopAddrsOffset       3
#define SFGEN_startAddrsCoarseOffset   4
#define SFGEN_modLfoToPitch            5
#define SFGEN_vibLfoToPitch            6
#define SFGEN_modEnvToPitch            7
#define SFGEN_initialFilterFc          8
#define SFGEN_initialFilterQ           9
#define SFGEN_modLfoToFilterFc         10
#define SFGEN_modEnvToFilterFc         11
#define SFGEN_endAddrsCoarseOffset     12
#define SFGEN_modLfoToVolume           13
#define SFGEN_unused1                  14
#define SFGEN_chorusEffectsSend        15
#define SFGEN_reverbEffectsSend        16
#define SFGEN_pan                      17
#define SFGEN_unused2                  18
#define SFGEN_unused3                  19
#define SFGEN_unused4                  20
#define SFGEN_delayModLFO              21
#define SFGEN_freqModLFO               22
#define SFGEN_delayVibLFO              23
#define SFGEN_freqVibLFO               24
#define SFGEN_delayModEnv              25
#define SFGEN_attackModEnv             26
#define SFGEN_holdModEnv               27
#define SFGEN_decayModEnv              28
#define SFGEN_sustainModEnv            29
#define SFGEN_releaseModEnv            30
#define SFGEN_keynumToModEnvHold       31
#define SFGEN_keynumToModEnvDecay      32
#define SFGEN_delayVolEnv              33
#define SFGEN_attackVolEnv             34
#define SFGEN_holdVolEnv               35
#define SFGEN_decayVolEnv              36
#define SFGEN_sustainVolEnv            37
#define SFGEN_releaseVolEnv            38
#define SFGEN_keynumToVolEnvHold       39
#define SFGEN_keynumToVolEnvDecay      40
#define SFGEN_instrument               41
#define SFGEN_reserved1                42
#define SFGEN_keyRange                 43
#define SFGEN_velRange                 44
#define SFGEN_startloopAddrsCoarse     45
#define SFGEN_keynum                   46
#define SFGEN_velocity                 47
#define SFGEN_initialAttenuation       48
#define SFGEN_reserved2                49
#define SFGEN_endloopAddrsCoarse       50
#define SFGEN_coarseTune               51
#define SFGEN_fineTune                 52
#define SFGEN_sampleID                 53
#define SFGEN_sampleModes              54
#define SFGEN_reserved3                55
#define SFGEN_scaleTuning              56
#define SFGEN_exclusiveClass           57
#define SFGEN_overridingRootKey        58
#define SFGEN_unused5                  59
#define SFGEN_endOper                  60`
    .trim()
    .split("\n")
    .map((line) => line.split(/\s+/)[1])
    .map((token) => token.replace("SFGEN_", ""));
export var generators;
(function (generators) {
    generators[generators["startAddrsOffset"] = 0] = "startAddrsOffset";
    generators[generators["endAddrsOffset"] = 1] = "endAddrsOffset";
    generators[generators["startloopAddrsOffset"] = 2] = "startloopAddrsOffset";
    generators[generators["endloopAddrsOffset"] = 3] = "endloopAddrsOffset";
    generators[generators["startAddrsCoarseOffset"] = 4] = "startAddrsCoarseOffset";
    generators[generators["modLfoToPitch"] = 5] = "modLfoToPitch";
    generators[generators["vibLfoToPitch"] = 6] = "vibLfoToPitch";
    generators[generators["modEnvToPitch"] = 7] = "modEnvToPitch";
    generators[generators["initialFilterFc"] = 8] = "initialFilterFc";
    generators[generators["initialFilterQ"] = 9] = "initialFilterQ";
    generators[generators["modLfoToFilterFc"] = 10] = "modLfoToFilterFc";
    generators[generators["modEnvToFilterFc"] = 11] = "modEnvToFilterFc";
    generators[generators["endAddrsCoarseOffset"] = 12] = "endAddrsCoarseOffset";
    generators[generators["modLfoToVolume"] = 13] = "modLfoToVolume";
    generators[generators["unused1"] = 14] = "unused1";
    generators[generators["chorusEffectsSend"] = 15] = "chorusEffectsSend";
    generators[generators["reverbEffectsSend"] = 16] = "reverbEffectsSend";
    generators[generators["pan"] = 17] = "pan";
    generators[generators["unused2"] = 18] = "unused2";
    generators[generators["unused3"] = 19] = "unused3";
    generators[generators["unused4"] = 20] = "unused4";
    generators[generators["delayModLFO"] = 21] = "delayModLFO";
    generators[generators["freqModLFO"] = 22] = "freqModLFO";
    generators[generators["delayVibLFO"] = 23] = "delayVibLFO";
    generators[generators["freqVibLFO"] = 24] = "freqVibLFO";
    generators[generators["delayModEnv"] = 25] = "delayModEnv";
    generators[generators["attackModEnv"] = 26] = "attackModEnv";
    generators[generators["holdModEnv"] = 27] = "holdModEnv";
    generators[generators["decayModEnv"] = 28] = "decayModEnv";
    generators[generators["sustainModEnv"] = 29] = "sustainModEnv";
    generators[generators["releaseModEnv"] = 30] = "releaseModEnv";
    generators[generators["keynumToModEnvHold"] = 31] = "keynumToModEnvHold";
    generators[generators["keynumToModEnvDecay"] = 32] = "keynumToModEnvDecay";
    generators[generators["delayVolEnv"] = 33] = "delayVolEnv";
    generators[generators["attackVolEnv"] = 34] = "attackVolEnv";
    generators[generators["holdVolEnv"] = 35] = "holdVolEnv";
    generators[generators["decayVolEnv"] = 36] = "decayVolEnv";
    generators[generators["sustainVolEnv"] = 37] = "sustainVolEnv";
    generators[generators["releaseVolEnv"] = 38] = "releaseVolEnv";
    generators[generators["keynumToVolEnvHold"] = 39] = "keynumToVolEnvHold";
    generators[generators["keynumToVolEnvDecay"] = 40] = "keynumToVolEnvDecay";
    generators[generators["instrument"] = 41] = "instrument";
    generators[generators["reserved1"] = 42] = "reserved1";
    generators[generators["keyRange"] = 43] = "keyRange";
    generators[generators["velRange"] = 44] = "velRange";
    generators[generators["startloopAddrsCoarse"] = 45] = "startloopAddrsCoarse";
    generators[generators["keynum"] = 46] = "keynum";
    generators[generators["velocity"] = 47] = "velocity";
    generators[generators["initialAttenuation"] = 48] = "initialAttenuation";
    generators[generators["reserved2"] = 49] = "reserved2";
    generators[generators["endloopAddrsCoarse"] = 50] = "endloopAddrsCoarse";
    generators[generators["coarseTune"] = 51] = "coarseTune";
    generators[generators["fineTune"] = 52] = "fineTune";
    generators[generators["sampleID"] = 53] = "sampleID";
    generators[generators["sampleModes"] = 54] = "sampleModes";
    generators[generators["reserved3"] = 55] = "reserved3";
    generators[generators["scaleTuning"] = 56] = "scaleTuning";
    generators[generators["exclusiveClass"] = 57] = "exclusiveClass";
    generators[generators["overridingRootKey"] = 58] = "overridingRootKey";
    generators[generators["unused5"] = 59] = "unused5";
    generators[generators["endOper"] = 60] = "endOper";
})(generators || (generators = {}));
export const adsrParams = [
    generators.attackVolEnv,
    generators.decayVolEnv,
    generators.holdVolEnv,
    generators.releaseVolEnv,
];
const { startAddrsOffset, endAddrsOffset, startloopAddrsOffset, endloopAddrsOffset, startAddrsCoarseOffset, } = generators;
export const attributeGenerators = {
    sampleOffsets: [startAddrsOffset, endAddrsOffset, startloopAddrsOffset, endloopAddrsOffset, startAddrsCoarseOffset],
};
