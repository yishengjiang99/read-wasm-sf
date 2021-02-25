(async function() {
    let { durationTicks, tracks, header } = await Midi.fromUrl("./song.mid");
    async function* gen(tracks) {
        while (tracks.length) {
            const t = tracks.shift();
            const url = `./info/preset_${t.instrument.percussion ? 128 : 0}_${t.instrument.number
                }.json`;
            const res = await fetch(
                url
            );
            const json = await res.json();
            yield json;
        }
        return;
    }
    gen(tracks);
    const trackInfos = []


    for await (const _ of gen(tracks)) {
        trackInfos.push(_.zones);
    }
})();

function start(cb) {
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
        ticks += header.secondsToTicks(advance);
    }
}