import test from "ava";
import { execSync } from "child_process";
import { parsePDTA } from "./pdta";
import { reader } from "./reader";
import * as sfTypes from "./sf.types";
const pdtaoffset = execSync("strings -o file.sf2|grep pdta")
  .toString()
  .trim()
  .split(/S+/)[0];
const nitoff = parseInt(pdtaoffset);

test("pdta parse", (t) => {
  const r = reader("file.sf2");
  r.setOffset(nitoff);
  let size = r.get32();

  //   t.is(r.read32String(), "pdta");

  const pdta = parsePDTA(r);
  // console.log(pdta);
  t.truthy(pdta);

  Object.values(pdta[0]).map(function (p: sfTypes.Preset) {
    t.truthy(p.defaultBag);

    p.zones.map((z) => {
      p.defaultBag.lowPassFilter.q !== null && t.truthy(z.lowPassFilter.q);
    });
  }); //.defaultBag
});
