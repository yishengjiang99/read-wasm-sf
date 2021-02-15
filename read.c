#include <emscripten/emscripten.h>
#include <math.h>
#define TSF_IMPLEMENTATION
#include "tsf.h"
#include <assert.h>

static float pow2over2table[12] = {
    1,
    1.0594630943592953,
    1.122462048309373,
    1.189207115002721,
    1.2599210498948732,
    1.3348398541700344,
    1.4142135623730951,
    1.4983070768766815,
    1.5874010519681994,
    1.6817928305074292,
    1.7817974362806788,
    1.887748625363387};

EMSCRIPTEN_KEEPALIVE
static tsf *g_tsf;

EMSCRIPTEN_KEEPALIVE
void init_tsf()
{
    g_tsf = tsf_load_filename("file.sf2");
}

EMSCRIPTEN_KEEPALIVE
void read_sf(void *buffer, int size)
{
    g_tsf = tsf_load_memory(buffer, size);
    printf("fontsamplle size %lu", sizeof(g_tsf->fontSamples));
    printf("fontsamplle size %lu", sizeof(g_tsf->presetNum));
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
        if (p.regions[j]
                    .lokey <= midi &&
            p.regions[j]
                    .hikey >= midi &&
            p.regions[j]
                    .lovel <= velocity &&
            p.regions[j]
                    .hivel >= velocity)
        {
            if (abs(midi - p.regions[j]
                               .pitch_keycenter) < diff)
            {
                r = p.regions[j];
                diff = abs(midi - r.pitch_keycenter);
            }
        }
    }
    return r;
}

EMSCRIPTEN_KEEPALIVE
float lerp(float v0, float v1, float t)
{
    return v0 + t * (v1 - v0);
}
EMSCRIPTEN_KEEPALIVE
void load_sound(float *buffout, int presetId, int midi, int velocity, int size)
{

    int rdiff = 128; /*scalar*/ /* integer difference between sample note and note we are trying to produce*/
    struct tsf_region r;        /* the preset region we render from*/
    struct tsf_preset p;
    p = g_tsf->presets[presetId];

    for (int diff = 10; diff < 127; diff += 10)
    {
        for (int j = 0; j < p.regionNum; j++)
        {
            if (p.regions[j].lokey > midi)
                continue;
            if (p.regions[j].hikey < midi)
                continue;
            if (p.regions[j].lovel > velocity)
                continue;
            if (p.regions[j].hivel < velocity)
                continue;
            if (velocity > p.regions[j].lovel + diff)
                continue;
            if (abs(midi - p.regions[j].pitch_keycenter) < rdiff)
            {

                printf("\n*** note: %d ***\npitch center:%d\nspeed lo:%d \nhi %d\nsample rate: %d\n",
                       midi, p.regions[j].pitch_keycenter, (int)(p.regions[j].lovel), (int)(p.regions[j].hivel), p.regions[j].sample_rate);

                r = p.regions[j];

                rdiff = abs(midi - r.pitch_keycenter);
            }
        }
        if (rdiff < 128)
            break;
    }

    float absratio = 1;
    while (rdiff > 12)
    {
        absratio *= 2;
        rdiff -= 12;
    }
    absratio *= pow2over2table[rdiff];
    float ratio = (midi > r.pitch_keycenter ? absratio : 1 / absratio) * r.sample_rate / 48000;
    float shift = 1;
    int loopr = (r.loop_end - r.loop_start);
    int iterator = r.offset;
    double gain = -10 - r.attenuation - tsf_gainToDecibels(1.0f / velocity);
    fprintf(stdout, "\nplayback ratio %f %f \n**** </%d> *** \n", ratio, gain,midi);

    while (size-- >= 1)
    {
        while (shift-- >= 1)
        {
            iterator++;
        }
        *buffout++ = lerp(g_tsf->fontSamples[iterator], g_tsf->fontSamples[iterator + 1], shift);
        shift += ratio;

        if (iterator > r.loop_end)
            iterator -= loopr + 1;
    }
}
