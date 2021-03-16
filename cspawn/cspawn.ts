import { ChildProcess, spawn } from "child_process";

export function cspawn(str, [p0, p1, p2] = []): ChildProcess {
  let t = str.split(" ");
  const cp = spawn(t.shift(), t);
  const { stdin, stdout, stderr } = cp;
  if (p0) {
    p0.pipe(stdin);
  }
  if (p1) stdout.pipe(p0);
  if (p2) stderr.pipe(p2);
  stdout.on("error", (e) => {
    console.log(e.toString());
  });
  return cp;
}
