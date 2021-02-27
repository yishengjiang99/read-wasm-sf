class TrackView {
  dv: DataView;
  ptr: number;
  constructor(ptr: number, dv: DataView) {
    this.ptr = ptr;
    this.dv = dv;
  }
  get length() {
    return this.dv.getUint16(0);
  }
  set length(n: number) {
    this.dv.setUint16(0, n);
  }
  get offset() {
    return this.dv.getUint32(2);
  }
  set offset(n: number) {
    this.dv.setUint32(2, n);
  }
  get end() {
    return this.dv.getUint32(6);
  }
  set end(n: number) {
    this.dv.setUint32(6, n);
  }
  get startLoop() {
    return this.dv.getUint32(10);
  }
  set startLoop(n: number) {
    this.dv.setUint32(10, n);
  }
  get endLoop() {
    return this.dv.getUint32(14);
  }
  set endLoop(n: number) {
    this.dv.setUint32(14, n);
  }
  get ratio() {
    return this.dv.getFloat32(18);
  }
  set ratio(n: number) {
    this.dv.setFloat32(18, n);
  }
}
