const { loadSound, initSFReader } = require(".");
const assert = require('assert');
const { spawn } = require("child_process");
const { stdout } = require("process");

initSFReader().then(() => {
    const t = process.uptime();
    for (let i = 0; i < 125; i++) {
        const buffer = loadSound(0, i, 100, 1);
        process.stdout.write(buffer);

    }
});