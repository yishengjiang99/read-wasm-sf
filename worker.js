debugger;
let api, procPort, timer;
const length = 128;
console.log('loive');


onmessage = (e) => {
    if (e.data.port) procPort = port;
    if (e.data.sample) {
        const { port, sample, channel, ratio, length } = e.data;
        const { start, end, loopStart, loopEnd, length } = sample;
    }
    if (api) api.noteOn(start, end, loopStart, loopEnd, channel, ratio, length);

}