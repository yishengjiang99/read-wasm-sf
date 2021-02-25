class Proc extends AudioWorkletProcessor {
    constructor() {
        super();
        this.buffer = [];


        this.port.onmessage = ({ buffer }) => {
            this.buffer.push(buffer);
        }
        this.port.postMessage("hi")
    }

    process(inputList, outputList, parameters) {
        /* using the inputs (or not, as needed), write the output
           into each of the outputs */
        if (this.buffer.length) {
            outputList[0][0] = this.buffer.shift();

        }
        return true;
    }

}
registerProcessor("proc4", Proc);