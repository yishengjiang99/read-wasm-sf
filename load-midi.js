import './Midi.js';

let ctx;

export async function preload(url) {
    ctx = await Midi.fromUrl(url);
    const { durationTicks, tracks, header } = ctx;
    const trackInfos = []
    let cache = {};
    async function* gen(tracks) {
        while (tracks.length) {

            const t = tracks.shift();
            const url = `./info/preset_${t.instrument.percussion ? 128 : 0}_${t.instrument.number
                }.json`;
            if (cache[url]) yield cache[url];
            const res = await fetch(
                url
            );
            const json = await res.json();
            cache[url] = json;
            yield json;
        }
        return;
    }
    gen(tracks);


    for await (const _ of gen(tracks)) {
        trackInfos.push(_.zones);
    }
    return { trackInfos, tracks, header, durationTicks };
}
export async function start(tracks, durationTicks, cb) {

    let ticks = 0;
    while (ticks <= durationTicks) {
        let batch = [];
        for (const t of tracks) {
            if (t.notes.length && t.notes[0].ticks < ticks) {
                batch.push({
                    note: t.notes[0],
                    track: t,
                });
            }
        }
        const advance = await cb(batch);
        ticks += ctx.header.secondsToTicks(advance);
    }
}