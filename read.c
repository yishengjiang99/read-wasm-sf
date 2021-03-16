#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <assert.h>
#include <emscripten.h>

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
#ifndef EMSCRIPTEN_KEEPALIVE
#define EMSCRIPTEN_KEEPALIVE /**/
void upload(int n, void *data);
void upload(int n, void *data)
{
	zone *zz;
	zz = (zone *)data;
	printf("upload %d", zz->start);
}
#else
EMSCRIPTEN_KEEPALIVE extern void upload(int n, void *data);
#endif

void rpdta(FILE *fd);

EMSCRIPTEN_KEEPALIVE
void rfff()
{
	unsigned int size, size2L;
	FILE *fd = fopen("file.sf2", "r");
	header_t *header = (header_t *)malloc(sizeof(header_t));
	header2_t *h2 = (header2_t *)malloc(sizeof(header2_t));
	fread(header, sizeof(header_t), 1, fd);
	fprintf(stdout, "%.4s %.4s %.4s %u", header->name, header->sfbk, header->list, header->size);
	fread(h2, sizeof(header2_t), 1, fd);
	fprintf(stdout, "\n%.4s %u", h2->name, h2->size);
	fseek(fd, h2->size, SEEK_CUR);
	fread(h2, sizeof(header2_t), 1, fd);
	fprintf(stdout, "\n%.4s %u", h2->name, h2->size);
	fseek(fd, h2->size, SEEK_CUR);

	fread(h2, sizeof(header2_t), 1, fd);
	fprintf(stdout, "\n%.4s %u\n", h2->name, h2->size);
	section_header *sh = (section_header *)malloc(sizeof(section_header));

	fread(sh, sizeof(section_header), 1, fd);
	npresets = sh->size / sizeof(phdr);
	phdrs = (phdr *)malloc(sh->size);
	fread(phdrs, sizeof(phdr), sh->size / sizeof(phdr), fd);
	fprintf(stdout, "%.4s:%u--%d\n", sh->name, sh->size, npresets);

	fread(sh, sizeof(section_header), 1, fd);
	fprintf(stdout, "%.4s:%u\n", sh->name, sh->size);
	npbags = sh->size / sizeof(pbag);
	pbags = (pbag *)malloc(sh->size);
	fread(pbags, sizeof(pbag), sh->size / sizeof(pbag), fd);

	fread(sh, sizeof(section_header), 1, fd);
	fprintf(stdout, "%.4s:%u\n", sh->name, sh->size);
	npmods = sh->size / sizeof(pmod);
	pmods = (pmod *)malloc(sh->size);
	fread(pmods, sizeof(pmod), sh->size / sizeof(pmod), fd);
	fread(sh, sizeof(section_header), 1, fd);
	fprintf(stdout, "%.4s:%u\n", sh->name, sh->size);
	npgens = sh->size / sizeof(pgen_t);
	pgens = (pgen_t *)malloc(sh->size);
	fread(pgens, sizeof(pgen_t), sh->size / sizeof(pgen_t), fd);

	fread(sh, sizeof(section_header), 1, fd);
	ninst = sh->size / sizeof(inst);
	insts = (inst *)malloc(sh->size);
	fread(insts, sizeof(inst), sh->size / sizeof(inst), fd);
	fprintf(stdout, "%.4s:%u %d\n", sh->name, sh->size, ninst);

	fread(sh, sizeof(section_header), 1, fd);
	nibags = sh->size / sizeof(ibag);
	fprintf(stdout, "%.4s:%u %u\n", sh->name, sh->size, nibags);
	ibags = (ibag *)malloc(sh->size);
	fread(ibags, sizeof(ibag), sh->size / sizeof(ibag), fd);

	fread(sh, sizeof(section_header), 1, fd);
	fprintf(stdout, "%.4s:%u\n", sh->name, sh->size);
	nimods = sh->size / sizeof(imod);
	imods = (imod *)malloc(sh->size);
	fread(imods, sizeof(imod), sh->size / sizeof(imod), fd);

	fread(sh, sizeof(section_header), 1, fd);
	fprintf(stdout, "%.4s:%u\n", sh->name, sh->size);
	nigens = sh->size / sizeof(pgen_t);
	igens = (pgen_t *)malloc(sh->size);
	fread(igens, sizeof(pgen_t), sh->size / sizeof(pgen_t), fd);

	fread(sh, sizeof(section_header), 1, fd);

	nshdrs = sh->size / sizeof(shdr);
	fprintf(stdout, "%.4s:%u %lu %d\n", sh->name, sh->size, sizeof(shdr), nshdrs);

	shdrs = (shdr *)malloc(sh->size);
	for (int i = 0; i < nshdrs; i++)
	{
		fread(shdrs + i, 46, 1, fd);

		//	fprintf(stdout, "%.20s %u %u\n", (shdrs + i)->achSampleName, (shdrs + i)->dwStart, (shdrs + i)->dwEnd);
	}
}
#define setAtt(attr, genid) z.attr = igenset[genid].val.shAmount + pgenset[genid].val.shAmount;
#define offset(attr, genid) z.attr = z.attr + pgenset[genid].val.shAmount;
EMSCRIPTEN_KEEPALIVE
void zoneinfo(zone *zz, unsigned short pid, unsigned short key, unsigned short vel)
{
	int bankid = 0;
	if (pid > 127)
	{
		bankid = 9;
		pid = pid - 128;
	}
	printf("query %hu %hu %d", pid, key, vel);
	for (int pndx = 0; pndx < npresets - 1; pndx++)
	{
		pgen_t psetDefault[60];
		int hasDefault = 0;

		if (phdrs[pndx].bankId != bankid || phdrs[pndx].pid != pid)
			continue;
		for (int j = phdrs[pndx].bagNdx; j < npbags && j < phdrs[pndx + 1].bagNdx; j++)
		{
			pgen_t *pgenset = psetDefault;

			int k = j + 1 < npbags ? pbags[j + 1].pgen_id - 1 : npgens - 1;
			int isZoneDefault = 0, hasInst = 0;
			for (; k >= pbags[j].pgen_id; k--)
			{
				pgen_t g = pgens[k];

				if (!hasInst && pgens[k].operator<SFGEN_instrument)
				{
					if (!hasDefault)
					{
						isZoneDefault = 1;
						hasDefault = 1;
					}
				}
				if (pgens[k].operator== SFGEN_instrument)
				{
					hasInst = 1;
				}

				if (g.operator== SFGEN_velRange && g.val.ranges.hi != 0 &&(g.val.ranges.lo > vel || g.val.ranges.hi < vel))
					goto nextbag;
				if (g.operator== SFGEN_keyRange && g.val.ranges.hi != 0 &&(g.val.ranges.lo > key || g.val.ranges.hi < key))
					goto nextbag;
				if (isZoneDefault)
				{
					psetDefault[g.operator]=g;
					//printf("\n default %s %hu", generator[g.operator], g.val.shAmount);
				}
				else
				{
					pgenset[g.operator]=g;
					//	printf("\n%s %hu", generator[g.operator], g.val.shAmount);
				}
			}
			if (!hasInst)
			{
				continue;
			}
			else
			{
				int defaultIbag = 0;
				int ddi = pgenset[SFGEN_instrument].val.shAmount;
				if (ddi > ninst + 1)
					continue;
				pgen_t instDefaults[60];
				instDefaults[SFGEN_sampleID].val.shAmount = -1;
				inst *in = &insts[ddi];
				ibag *ib = ibags + in->ibagNdx;
				ibag *lastBag = ibags + insts[ddi + 1].ibagNdx;
				for (; ib < lastBag; ib++)
				{
					int hasSample = 0,
						isInstDefault = 0;
					pgen_t *igenset = instDefaults;
					int igNdx = ib->igen_id;
					int endNdx = (ib + 1)->igen_id;
					for (int k = endNdx - 1; k >= igNdx; k--)
					{

						pgen_t g = igens[k];
						if (!hasSample && g.operator<SFGEN_sampleID && defaultIbag == 0)
						{
							defaultIbag = k;
							isInstDefault = 1;
						}
						// if (g.operator== SFGEN_velRange && g.val.ranges.hi != 0 &&(g.val.ranges.lo > vel || g.val.ranges.hi < vel))
						// 	goto nextbag;
						// if (g.operator== SFGEN_keyRange && g.val.ranges.hi != 0 &&(g.val.ranges.lo > key || g.val.ranges.hi < key))
						// 	goto nextbag;
						if (g.operator== SFGEN_sampleID)
						{
							hasSample = 1;
								igenset[g.operator] = g;
						}
						if (defaultIbag == k)
						{
								instDefaults[g.operator]=g;

								igenset[g.operator] = g;
						}
						else
						{
								igenset[g.operator] =  g;
						}
					}

					if (igenset[SFGEN_sampleID].val.shAmount < 0)
					{
						continue;
					}
					zone z = *zz;
					z.lovel = max(igenset[SFGEN_velRange].val.ranges.lo, pgenset[SFGEN_velRange].val.ranges.lo);
					z.hivel = min(igenset[SFGEN_velRange].val.ranges.hi, pgenset[SFGEN_velRange].val.ranges.hi);
					z.lokey = max(igenset[SFGEN_keyRange].val.ranges.lo, pgenset[SFGEN_velRange].val.ranges.lo);
					z.hivel = min(igenset[SFGEN_keyRange].val.ranges.hi, pgenset[SFGEN_velRange].val.ranges.hi);
					if (z.hivel < vel || z.lovel > vel || z.hikey < key || z.lokey > key)
						;
					shdr *samples = shdrs + igenset[SFGEN_sampleID].val.shAmount;
					printf("\nt\tfound %d", igenset[SFGEN_sampleID].val.shAmount);
					z.start = samples->dwStart;
					z.end = samples->dwEnd;
					z.loopStart = samples->dwStartloop;
					z.loopEnd = samples->dwEndloop;
					z.sampleRate = samples->dwSampleRate;

					setAtt(attentuation, SFGEN_initialAttenuation);
					setAtt(lpf_cutff, SFGEN_initialFilterFc);
					setAtt(lpf_q, SFGEN_initialFilterQ);
					offset(start, SFGEN_startAddrsOffset);
					offset(end, SFGEN_startAddrsOffset + 1);
					offset(loopStart, SFGEN_startAddrsOffset + 2);
					offset(loopEnd, SFGEN_startAddrsOffset + 3);
					setAtt(a, SFGEN_attackVolEnv);
					setAtt(d, SFGEN_decayVolEnv);
					setAtt(r, SFGEN_releaseVolEnv);
					setAtt(s, SFGEN_sustainVolEnv);

					setAtt(loopStart, SFGEN_startAddrsOffset + 2);
					setAtt(loopEnd, SFGEN_startAddrsOffset + 3);

					int inputKey = igenset[SFGEN_overridingRootKey].val.shAmount > 0 ? igenset[SFGEN_overridingRootKey].val.shAmount : samples->byOriginalKey;
					int inputScale = 0 - inputKey * 100;

					inputScale -= igenset[SFGEN_coarseTune].val.shAmount * 100;
					inputScale -= igenset[SFGEN_fineTune].val.shAmount;
#define printAttr(lbl, attr) printf("\n%s:%d", lbl, z.attr);
					printAttr("lokey", lokey);
					printAttr("hikey", hikey);
					printAttr("lovel", lovel);
					printAttr("hivel", hivel);
					printAttr("start", start);
					printAttr("end", end);
					printAttr("loopStart", loopStart);

					float sampleShift = samples->dwSampleRate / 48000.0f; //1200.0f * log2(samples->dwSampleRate / 440) - 1200.0f * log2(48000 / 440);
					float shiftToMidc = powf(2, (key * 100 - inputScale) / 1200.0f);
					z.pitchAdjust = sampleShift * shiftToMidc;
					upload(sizeof(z), (void *)&z);
					printf("\n%f pitchsh\n", z.pitchAdjust);
					return;
				}
			nextbag:
				continue;
			}
		}
	}
	printf("nothing");
}
// int main()
// {
// 	rfff();
// 	zoneinfo(0, 54, 44);

// 	zoneinfo(0, 54, 55);
// 	zoneinfo(0, 54, 57);
// 	zoneinfo(0, 54, 55);
// } // 	// 				z.sampl = shdrs + instGen->genlist[SFGEN_sampleID].val.shAmount;
// 	// 				z.lovel = max(instGen->genlist[SFGEN_velRange].val.ranges.lo, pgenset[SFGEN_velRange].val.ranges.lo);
// 	// 				z.hivel = min(instGen->genlist[SFGEN_velRange].val.ranges.lo, pgenset[SFGEN_velRange].val.ranges.hi);
// 	// 				z.lokey = max(instGen->genlist[SFGEN_keyRange].val.ranges.lo, pgenset[SFGEN_velRange].val.ranges.lo);
// 	// 				z.hivel = min(instGen->genlist[SFGEN_keyRange].val.ranges.hi, pgenset[SFGEN_velRange].val.ranges.hi);
// 	// 				if (z.lokey > key || z.hikey < key || z.lovel > vel || z.hivel < vel)
// 	// 				{
// 	// 					continue;
// 	// 				}