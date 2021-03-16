#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include <string.h>
#include <unistd.h>
static void safe_sql_str(FILE *file, int size, FILE *output);
char *generator[60] = {"Gen_StartAddrOfs", "Gen_EndAddrOfs", "Gen_StartLoopAddrOfs", "Gen_EndLoopAddrOfs", "Gen_StartAddrCoarseOfs", "Gen_ModLFO2Pitch", "Gen_VibLFO2Pitch", "Gen_ModEnv2Pitch", "Gen_FilterFc", "Gen_FilterQ", "Gen_ModLFO2FilterFc", "Gen_ModEnv2FilterFc", "Gen_EndAddrCoarseOfs", "Gen_ModLFO2Vol", "Gen_Unused1", "Gen_ChorusSend", "Gen_ReverbSend", "Gen_Pan", "Gen_Unused2", "Gen_Unused3", "Gen_Unused4", "Gen_ModLFODelay", "Gen_ModLFOFreq", "Gen_VibLFODelay", "Gen_VibLFOFreq", "Gen_ModEnvDelay", "Gen_ModEnvAttack", "Gen_ModEnvHold", "Gen_ModEnvDecay", "Gen_ModEnvSustain", "Gen_ModEnvRelease", "Gen_Key2ModEnvHold", "Gen_Key2ModEnvDecay", "Gen_VolEnvDelay", "Gen_VolEnvAttack", "Gen_VolEnvHold", "Gen_VolEnvDecay", "Gen_VolEnvSustain", "Gen_VolEnvRelease", "Gen_Key2VolEnvHold", "Gen_Key2VolEnvDecay", "Gen_Instrument", "Gen_Reserved1", "Gen_KeyRange", "Gen_VelRange", "Gen_StartLoopAddrCoarseOfs", "Gen_Keynum", "Gen_Velocity", "Gen_Attenuation", "Gen_Reserved2", "Gen_EndLoopAddrCoarseOfs", "Gen_CoarseTune", "Gen_FineTune", "Gen_SampleId", "Gen_SampleModes", "Gen_Reserved3", "Gen_ScaleTune", "Gen_ExclusiveClass", "Gen_OverrideRootKey", "Gen_Dummy"};

static uint16_t read16(FILE *file) { return fgetc(file) | (fgetc(file) << 8); }
static uint32_t read32(FILE *file) { return fgetc(file) | (fgetc(file) << 8) | (fgetc(file) >> 16) | fgetc(file) << 24; } // | (fgetc(file) << 16) | (fgetc(file) << 8) | fgetc(file); }
static float *fsamples;
typedef char tsf_fourcc[4];
typedef signed char tsf_s8;
typedef unsigned char tsf_u8;
typedef unsigned short tsf_u16;
typedef signed short tsf_s16;
typedef unsigned int tsf_u32;
typedef char tsf_char20[20];

// Stream structure for the generic loading
struct tsf_stream
{
	// Custom data given to the functions as the first parameter
	void *data;

	// Function pointer will be called to read 'size' bytes into ptr (returns number of read bytes)
	int (*read)(void *data, void *ptr, unsigned int size);

	// Function pointer will be called to skip ahead over 'count' bytes (returns 1 on success, 0 on error)
	int (*skip)(void *data, unsigned int count);
};

struct tsf_hydra_phdr
{
	tsf_char20 presetName;
	tsf_u16 preset, bank, presetBagNdx;
	tsf_u32 library, genre, morphology;
};
struct tsf_hydra_pbag
{
	tsf_u16 genNdx, modNdx;
};
struct tsf_hydra_pmod
{
	tsf_u16 modSrcOper, modDestOper;
	tsf_s16 modAmount;
	tsf_u16 modAmtSrcOper, modTransOper;
};
union tsf_hydra_genamount
{
	tsf_u16 genAmount;
};
struct tsf_hydra_pgen
{
	tsf_u16 genOper;
	union tsf_hydra_genamount genAmount;
};
struct tsf_hydra_inst
{
	tsf_char20 instName;
	tsf_u16 instBagNdx;
};
struct tsf_hydra_ibag
{
	tsf_u16 instGenNdx, instModNdx;
};
struct tsf_hydra_imod
{
	tsf_u16 modSrcOper, modDestOper;
	tsf_s16 modAmount;
	tsf_u16 modAmtSrcOper, modTransOper;
};
struct tsf_hydra_igen
{
	tsf_u16 genOper;
	union tsf_hydra_genamount genAmount;
};
struct tsf_hydra_shdr
{
	tsf_char20 sampleName;
	tsf_u32 start, end, startLoop, endLoop, sampleRate;
	tsf_u8 originalPitch;
	tsf_s8 pitchCorrection;
	tsf_u16 sampleLink, sampleType;
};
int main()
{
	char name[4];
	int size, nsamples;
	int16_t *samples;
	FILE *fdim = fopen("./file.sf2", "r");

	fread(name, 4, 1, fdim);
	printf("\n%.4s", name);
	fread(&size, 1, 4, fdim);
	printf("\n%u", size);
	fread(name, 4, 1, fdim);
	printf("\n%.4s", name);
	fread(name, 4, 1, fdim);
	printf("\n%.4s", name);

	fread(&size, 1, 4, fdim);
	printf("\n%u", size);

	fread(name, 4, 1, fdim);
	printf("\nlist-%.4s", name);

	fread(name, 4, 1, fdim);
	printf("\n%.4s", name);
	fseek(fdim, size, SEEK_CUR);

	fread(name, 4, 1, fdim);
	printf("\n%.4s", name);
	fread(name, 4, 1, fdim);
	printf("\n%.4s", name);
	fread(&size, 1, 4, fdim);
	printf("\n%u", size);
	// int pid = fork();
	// if (!pid)
	// {
	// 	nsamples = size / 2;
	// 	samples = (int16_t *)malloc(sizeof(int16_t) * nsamples);
	// 	fsamples = (float *)malloc(sizeof(float) * nsamples);
	// 	float *ptr = fsamples;
	// 	fread(samples, sizeof(int16_t), nsamples, fdim);
	// 	for (int i = 0; i < nsamples; i++)
	// 	{
	// 		*ptr++ = (*samples++) / (0.0f + 0x7fff);
	// 	}
	// }
	fseek(fdim, size, SEEK_CUR);
	fprintf(stdout, "\n--%lu", ftell(fdim));

	fread(name, 4, 1, fdim);
	printf("\n%.4s", name);
	fread(name, 4, 1, fdim);
	printf("\n%.4s", name);
	fread(&size, 1, 4, fdim);
	printf("\n%u", size);
	int *sections;
	int *sectionItemSizes;
	typedef struct
	{
		char name[20];
		uint16_t presetId, bankId, pbagNdx;
		int32_t idc1, idc2, idc3;
	} phdr;

	int *head = sections;
	fread(name, 4, 1, fdim);
	printf("\n%.4s", name);
	fread(&size, 1, 4, fdim);
	printf("\n%u", size);
	phdr *headers;
	phdr **list;
	fread(headers, sizeof(phdr), size / 36, fdim);
	printf("%.4s\n", headers[0]->name);
	return 1;
}