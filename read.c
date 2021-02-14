#include "emscripten.h"
#include <math.h>
#define TSF_IMPLEMENTATION
#include "tsf.h"
#include <assert.h>


EMSCRIPTEN_KEEPALIVE 
static tsf *g_tsf;

EMSCRIPTEN_KEEPALIVE 
void init_tsf(){
  g_tsf =tsf_load_filename("file.sf2");
}

EMSCRIPTEN_KEEPALIVE
void read_sf(void *buffer, int size)
{
  g_tsf = tsf_load_memory(buffer, size);
  printf( "fontsamplle size %lu", sizeof(g_tsf->fontSamples));
  printf( "fontsamplle size %lu", sizeof(g_tsf->presetNum));
}


EMSCRIPTEN_KEEPALIVE
struct tsf_region get_legion(int presetId, int midi, float velocity)
{

  int diff = 128; /*scalar*/ /* integer difference between sample note and note we are trying to produce*/
  struct tsf_region r;       /* the preset region we render from*/

  struct tsf_preset p; /* the preset, a preset has a number of regions with differena pitches etc. we vary the playback loop here to make shift to some midi number */

  p = g_tsf->presets[presetId];
  for (int j = 0; j < p.regionNum; j++)
  {
    r = p.regions[j];
    if (p.regions[j].lokey <= midi && p.regions[j].hikey >= midi && p.regions[j].lovel <= velocity && p.regions[j].hivel >= velocity)
    {
      if (abs(midi - p.regions[j].pitch_keycenter) < diff)
      {
        r = p.regions[j];
        diff = abs(midi - r.pitch_keycenter);
      }
    }
  }
  return r;
}

EMSCRIPTEN_KEEPALIVE
void load_sound(float* buffout, int presetId, int midi, float velocity, int size)
{

	if(!g_tsf->presetNum) g_tsf = tsf_load_filename("/data/3file.sf2");
  int diff = 128; /*scalar*/ /* integer difference between sample note and note we are trying to produce*/
  struct tsf_region r;       /* the preset region we render from*/

  struct tsf_preset p; /* the preset, a preset has a number of regions with differena pitches etc. we vary the playback loop here to make shift to some midi number */

  p = g_tsf->presets[presetId];
  for (int j = 0; j < p.regionNum; j++)
  {
    r = p.regions[j];
    if (p.regions[j].lokey <= midi && p.regions[j].hikey >= midi && p.regions[j].lovel <= velocity && p.regions[j].hivel >= velocity)
    {
      if (abs(midi - p.regions[j].pitch_keycenter) < diff)
      {
        r = p.regions[j];
        diff = abs(midi - r.pitch_keycenter);
      }
    }
  }
  float *input = g_tsf->fontSamples;  
  float *output = buffout;
	TSF_BOOL isLooping = (r.loop_start < r.loop_end);
  double gain = -10 - r.attenuation - tsf_gainToDecibels(1.0f / velocity);
  unsigned int pos = r.offset;
  
  while(size-- > 0){
    *output++ = input[pos++];
  }
}
