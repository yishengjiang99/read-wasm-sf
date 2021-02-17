const SFReader = require("./run.js");
new SFReader().init().then((reader) => {
    const s = reader.load_sound(0, 44, 120, 1);
    console.log(s);
})