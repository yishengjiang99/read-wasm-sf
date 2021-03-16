self.addEventListener("fetch", function(event) {
    return new ReadableStream({
        start: (controller) => {
            controller.enqueue("rick rolled");
            controller.close();
        },
    });
});