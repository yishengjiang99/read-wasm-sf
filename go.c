#include <emscripten.h>
#include <stdio.h>
#include <stdlib.h>
typedef struct track
{
	uint32_t offset, end, startLoop, endLoop;
	uint16_t length;
	float ratio;
} track_t;

static float *fsamples;

float hermite4(float frac_pos, float xm1, float x0, float x1, float x2);
int render(float *output, track_t *t, int size);
void initWithPreload();

EMSCRIPTEN_KEEPALIVE
void initWithPreload()
{
	char name[4];
	int size, nsamples;
	int16_t *samples;
	FILE *fd = fopen("./file.sf2", "r");

	fseek(fd, 2418, SEEK_SET);
	fread(&size, 4, 1, fd);
	fread(name, 4, 1, fd);
	fread(name, 4, 1, fd);

	fprintf(stdout, "%.4s %u", name, size);

	nsamples = size / 2;
	samples = (int16_t *)malloc(sizeof(int16_t) * nsamples);
	fsamples = (float *)malloc(sizeof(float) * nsamples);
	float *ptr = fsamples;
	fread(samples, sizeof(int16_t), nsamples, fd);
	for (int i = 0; i < nsamples; i++)
	{
		*ptr++ = (*samples++) / (0.0f + 0x7fff);
	}
	printf("%lu", ftell(fd));
}

EMSCRIPTEN_KEEPALIVE
int render(float *output, track_t *t, int size)
{
	float output[128] = *output;

	if (t->length <= 0)
		return -1;
	int loopr = (t->endLoop - t->startLoop);
	float shift = 0.0f;
	int start = t->offset;
	for (int i = 0; i < size; i++)
	{
		output[i] = output[i] + *(fsamples + start);

		shift += t->ratio;

		while (shift >= 1)
		{
			shift--;
			start++;
		}
		if (start >= t->endLoop)
		{
			start -= (t->endLoop - t->startLoop);
		}
	}

	return t->length;
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
