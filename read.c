
#define TSF_IMPLEMENTATION
#define TSF_NO_STDIO
#include "tsf.h"
#include <stdint.h>
#include <math.h>
static tsf *f;

	
static uint8_t *srcPtr;
static float pow2over2table[12] = {
	1,
	1.0594630943592953,
	1.122462048309373,
	1.189207115002721,
	1.2599210498948732,
	1.3348398541700344,
	1.4983070768766815,
	1.5874010519681994,
	1.6817928305074292,
	1.7817974362806788,
	1.887748625363387
	};

unsigned int ssample(float *ptr, int preset, int midi, int vel, int n);
float poww(int n, int b);
float lerp(float v0, float v1, float t);
	
struct tsf *load_sf(uint8_t *ptr, int length)
{
	f = tsf_load_memory(ptr, length);
	srcPtr = ptr;
	return f;
}

unsigned int ssample(float *ptr, int preset, int midi, int vel, int n)
{

	double pos;
	struct tsf_region r;
	struct tsf_preset p = f->presets[preset];
	for (int j = 0; j < p.regionNum; j++)
	{
		r = p.regions[j];
		if (r.lokey <= midi && r.hikey >= midi && r.lovel <= vel && r.hivel >= vel)
		{
			pos = r.offset;
			float shift = poww(2, (midi*100 - r.pitch_keycenter*100) / 1200);
			
			int loopr = (r.loop_end - r.loop_start);

			while (n--)
			{
				uint8_t tmp = (uint8_t)pos;
				*ptr++ = lerp(f->fontSamples[tmp], f->fontSamples[tmp + 1], pos-tmp);

				if (pos > r.loop_end + 1)
					pos -= loopr;
			}
		}
	}
	return 0;
}
float lerp(float v0, float v1, float t)
{
	return v0 + t * (v1 - v0);
}

 
float poww(base, exp){
	if(base!=2) return powf(base,exp);
	
	int intv=1;
	int fraction=0;
	while(exp > 2){
		intv++;
		exp = exp >> 1;
	}
	return pow2over2table[~~(exp*12)];

 }