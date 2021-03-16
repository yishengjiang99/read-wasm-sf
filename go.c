#include <stdio.h>
#include <stdlib.h>
#include "read.h"
#include <emscripten/emscripten.h>

typedef struct track
{
	uint16_t length;

	uint32_t offset, end, startLoop, endLoop;
	float ratio;
} track_t;

static float *fsamples;
void getSample(float *buf, unsigned int start, unsigned int length);
float hermite4(float frac_pos, float xm1, float x0, float x1, float x2);
int render(float *output, track_t *tracks);
int initWithPreload();
zone *trackInfo(int pid, int note, int vel);
EMSCRIPTEN_KEEPALIVE
int initWithPreload()
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
	printf("\n%.4s", name);
	fprintf(stdout, "%.4s %u", name, size);

	nsamples = size / 2;
	samples = (int16_t *)malloc(sizeof(int16_t) * nsamples);
	fsamples = (float *)malloc(sizeof(float) * nsamples);
	float *ptr = fsamples;
	fread(samples, sizeof(int16_t), nsamples, fdim);
	for (int i = 0; i < nsamples; i++)
	{
		*ptr++ = (*samples++) / (0.0f + 0x7fff);
	}
	fprintf(stdout, "%lu", ftell(fdim));
	rfff();

	return nsamples;
}

EMSCRIPTEN_KEEPALIVE
void getSample(float *buf, unsigned int start, unsigned int length)
{
	while (length > 0)
	{
		*buf++ = *(fsamples + start++);
		length--;
	}
}
EMSCRIPTEN_KEEPALIVE
zone *trackInfo(int pid, int note, int vel)
{
	return zoneinfo(pid, note, vel);
}

#define frameSize 128
#define polyphony 16
EMSCRIPTEN_KEEPALIVE
int render(float *output, track_t *tracks)
{
	track_t *endTrack = tracks + polyphony - 1;
	for (track_t *t = tracks; t <= endTrack; t++)
	{
		if (!t->length)
			continue;

		unsigned int start = t->startLoop;
		unsigned int end = t->endLoop;
		unsigned int offset = t->offset;
		float ratio = t->ratio;
		float shift = 0.0f;
		for (int i = 0; i < frameSize; i++)
		{
			*(output + i) = *(output + i) + *(fsamples + offset);
			output++;
			shift += ratio;
			while (shift >= 1)
			{
				offset++;
				shift--;
			}
			if (offset >= end)
			{
				start -= (end - start + 1);
			}
		}
		t->length--;
	}
	return 0;
}

float hermite4(float frac_pos, float xm1, float x0, float x1, float x2)
{
	const float c = (x1 - xm1) * 0.5f;
	const float v = x0 - x1;
	const float w = c + v;
	const float a = w + v + (x2 - x0) * 0.5f;
	const float b_neg = w + a;

	return ((((a * frac_pos) - b_neg) * frac_pos + c) * frac_pos + x0);
}
