
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

typedef uint8_t uint8_t;
typedef uint32_t uint32_t; // uint32_t;
typedef uint32_t FOURCC;
typedef struct
{
	uint8_t lo, hi;
} rangesType; //  Four-character code

typedef union
{
	rangesType ranges;
	short shAmount;
	unsigned short uAmount;
} genAmountType;

typedef struct
{
	char name[4];
	unsigned int size;
	char sfbk[4];
	char list[4];
} header_t;

typedef struct
{
	unsigned int size;
	char name[4];
} header2_t;
typedef struct
{
	char name[4];
	unsigned int size;
} section_header;
typedef enum
{
	monoSample = 1,
	rightSample = 2,
	leftSample = 4,
	linkedSample = 8,
	RomMonoSample = 0x8001,
	RomRightSample = 0x8002,
	RomLeftSample = 0x8004,
	RomLinkedSample = 0x8008
} SFSampleLink;
typedef struct
{
	char name[4];
	unsigned int size;
	char *data;
} pdta;
typedef struct
{
	char name[20];
	uint16_t pid, bankId, bagNdx;
	char idc[12];
} phdr;
typedef struct
{
	unsigned short pgen_id, pmod_id;
} pbag;
typedef struct
{
	unsigned short igen_id, imod_id;
} ibag;
typedef struct
{
	unsigned short operator;
	genAmountType val;
} pgen_t;
typedef struct
{
	char data[10];
} pmod;
typedef struct
{
	char name[20];
	unsigned short ibagNdx;
} inst;
typedef struct
{
	char data[10];
} imod;

typedef union
{
	uint8_t hi, lo;
	unsigned short val;
	short word;
} gen_val;

typedef struct
{
	unsigned short operator;
	genAmountType val;
} igen;
typedef struct
{ /*
    start,
    end,
    startLoop,
    endLoop,
    sampleRate,
    originalPitch,
    pitchCorrection,
    sampleLink,
    sampleType,
	*/
	char achSampleName[20];
	uint32_t dwStart;
	uint32_t dwEnd;
	uint32_t dwStartloop;
	uint32_t dwEndloop;
	uint32_t dwSampleRate;
	uint8_t byOriginalKey;
	char chCorrection;
	uint16_t wSampleLink;
	uint16_t sfSampleType;
} shdr;
// tsf_char20 sampleName;
// tsf_u32 start, end, startLoop, endLoop, sampleRate;
// tsf_u8 originalPitch;
// tsf_s8 pitchCorrection;
// tsf_u16 sampleLink, sampleType;
#define max(a, b) a > b ? a : b
#define min(a, b) a < b ? b : a
#define SFGEN_startAddrsOffset 0
#define SFGEN_endAddrsOffset 1
#define SFGEN_startloopAddrsOffset 2
#define SFGEN_endloopAddrsOffset 3
#define SFGEN_startAddrsCoarseOffset 4
#define SFGEN_modLfoToPitch 5
#define SFGEN_vibLfoToPitch 6
#define SFGEN_modEnvToPitch 7
#define SFGEN_initialFilterFc 8
#define SFGEN_initialFilterQ 9
#define SFGEN_modLfoToFilterFc 10
#define SFGEN_modEnvToFilterFc 11
#define SFGEN_endAddrsCoarseOffset 12
#define SFGEN_modLfoToVolume 13
#define SFGEN_unused1 14
#define SFGEN_chorusEffectsSend 15
#define SFGEN_reverbEffectsSend 16
#define SFGEN_pan 17
#define SFGEN_unused2 18
#define SFGEN_unused3 19
#define SFGEN_unused4 20
#define SFGEN_delayModLFO 21
#define SFGEN_freqModLFO 22
#define SFGEN_delayVibLFO 23
#define SFGEN_freqVibLFO 24
#define SFGEN_delayModEnv 25
#define SFGEN_attackModEnv 26
#define SFGEN_holdModEnv 27
#define SFGEN_decayModEnv 28
#define SFGEN_sustainModEnv 29
#define SFGEN_releaseModEnv 30
#define SFGEN_keynumToModEnvHold 31
#define SFGEN_keynumToModEnvDecay 32
#define SFGEN_delayVolEnv 33
#define SFGEN_attackVolEnv 34
#define SFGEN_holdVolEnv 35
#define SFGEN_decayVolEnv 36
#define SFGEN_sustainVolEnv 37
#define SFGEN_releaseVolEnv 38
#define SFGEN_keynumToVolEnvHold 39
#define SFGEN_keynumToVolEnvDecay 40
#define SFGEN_instrument 41
#define SFGEN_reserved1 42
#define SFGEN_keyRange 43
#define SFGEN_velRange 44
#define SFGEN_startloopAddrsCoarse 45
#define SFGEN_keynum 46
#define SFGEN_velocity 47
#define SFGEN_initialAttenuation 48
#define SFGEN_reserved2 49
#define SFGEN_endloopAddrsCoarse 50
#define SFGEN_coarseTune 51
#define SFGEN_fineTune 52
#define SFGEN_sampleID 53
#define SFGEN_sampleModes 54
#define SFGEN_reserved3 55
#define SFGEN_scaleTuning 56
#define SFGEN_exclusiveClass 57
#define SFGEN_overridingRootKey 58
#define SFGEN_unused5 59
#define SFGEN_endOper 60
#define fivezeros 0, 0, 0, 0, 0
char *generator[60] = {"Gen_StartAddrOfs", "Gen_EndAddrOfs", "Gen_StartLoopAddrOfs", "Gen_EndLoopAddrOfs", "Gen_StartAddrCoarseOfs", "Gen_ModLFO2Pitch", "Gen_VibLFO2Pitch", "Gen_ModEnv2Pitch", "Gen_FilterFc", "Gen_FilterQ", "Gen_ModLFO2FilterFc", "Gen_ModEnv2FilterFc", "Gen_EndAddrCoarseOfs", "Gen_ModLFO2Vol", "Gen_Unused1", "Gen_ChorusSend", "Gen_ReverbSend", "Gen_Pan", "Gen_Unused2", "Gen_Unused3", "Gen_Unused4", "Gen_ModLFODelay", "Gen_ModLFOFreq", "Gen_VibLFODelay", "Gen_VibLFOFreq", "Gen_ModEnvDelay", "Gen_ModEnvAttack", "Gen_ModEnvHold", "Gen_ModEnvDecay", "Gen_ModEnvSustain", "Gen_ModEnvRelease", "Gen_Key2ModEnvHold", "Gen_Key2ModEnvDecay", "Gen_VolEnvDelay", "Gen_VolEnvAttack", "Gen_VolEnvHold", "Gen_VolEnvDecay", "Gen_VolEnvSustain", "Gen_VolEnvRelease", "Gen_Key2VolEnvHold", "Gen_Key2VolEnvDecay", "Gen_Instrument", "Gen_Reserved1", "Gen_KeyRange", "Gen_VelRange", "Gen_StartLoopAddrCoarseOfs", "Gen_Keynum", "Gen_Velocity", "Gen_Attenuation", "Gen_Reserved2", "Gen_EndLoopAddrCoarseOfs", "Gen_CoarseTune", "Gen_FineTune", "Gen_SampleId", "Gen_SampleModes", "Gen_Reserved3", "Gen_ScaleTune", "Gen_ExclusiveClass", "Gen_OverrideRootKey", "Gen_Dummy"};
short default_gen_vals[60] = {
	fivezeros,
	fivezeros,
	fivezeros,
	fivezeros,
	-11500, //SFGEN_delayModEnv 25
	-11500,
	-11500,
	-11500,
	240,	//sustain vol
	-11500, //30
	0,
	0,
	-11500, //SFGEN_delayVolEnv 33
	-11500,
	-11500,
	-11500,
	240, //sustain vol
	-11500,
	0,
	0,
	-1, //instrument
	0,
	127 << 7, //velrange+keyrange
	127 << 7,
	fivezeros, fivezeros, fivezeros, fivezeros

};
static phdr *phdrs;
static pbag *pbags;
static pmod *pmods;
static pgen_t *pgens;
static inst *insts;
static pgen_t *igens;
static ibag *ibags;
static imod *imods;
static shdr *shdrs;
int npresets, npbags, npgens, npmods, nshdrs, ninst, nimods, nigens, ishdrs, nibags;
typedef struct
{
	uint8_t lokey, hikey, lovel, hivel;
	short attentuation, lpf_cutff, lpf_q;
	short a, d, s, r;
	float pitchAdjust;
	uint32_t start, end, loopStart, loopEnd, sampleRate;
} zone;
zone *zoneinfo(unsigned short pid, unsigned short key, unsigned short vel);