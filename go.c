#include <emscripten/emscripten.h>
#include <stdio.h>
#include <stdlib.h>
typedef struct track
{
	uint32_t offset, end, startLoop, endLoop, length;
	float ratio;
	float lastOutput;
} track_t;

static float *fsamples;

float hermite4(float frac_pos, float xm1, float x0, float x1, float x2);
void render(float *output, track_t *t, int size);
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

	printf("%.4s %u", name, size);

	nsamples = size / 2;
	samples = (int16_t *)malloc(sizeof(int16_t) * nsamples);
	fsamples = (float *)malloc(sizeof(float) * nsamples);
	float *ptr = fsamples;
	printf("%.4s", name);
	fread(samples, sizeof(int16_t), nsamples, fd);
	for (int i = 0; i < nsamples; i++)
	{
		*ptr++ = (*samples++) / (0.0f + 0x7fff);
	}
	printf("%lu", ftell(fd));
}

EMSCRIPTEN_KEEPALIVE
void render(float *output, track_t *t, int size)
{

	if (t->length <= 0)
		return;
	int loopr = (t->endLoop - t->startLoop);
	float shift = 0.0f;
	for (int i = 0; i < size; i++)
	{
		*(output + i) += *(fsamples + t->offset);

		shift += t->ratio;

		while (shift >= 1)
		{
			shift--;
			t->offset++;
		}
		if (t->offset >= t->endLoop)
		{
			t->offset -= t->endLoop - t->startLoop;
		}
	}
	t->length -= size;
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
