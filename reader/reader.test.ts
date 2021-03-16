import { reader } from "./reader";
import test from "ava";
import { closeSync, openSync, writeSync } from "fs";

test("reader", (t) => {
  t.pass();
  const { get32, fstat, read32String } = reader("./file.sf2");
  t.is(read32String(), "RIFF");

  t.is(get32(), fstat().size - 8);

  t.is(read32String(), "sfbk");
  t.is(read32String(), "LIST");

  const wfd = openSync("test.txt", "w+");
  writeSync(wfd, Buffer.from([0xff]), 0, 1, 0);
  writeSync(wfd, Buffer.from([0xff, 0x00]), 0, 2, 1);

  closeSync(wfd);
  const r = reader("test.txt");
  t.is(r.get8(), 0xff);
  t.is(r.get16(), 0xff);
});
