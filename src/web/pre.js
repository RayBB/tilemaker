// Pre-js code that runs before the wasm module
var Module = {
    onRuntimeInitialized: function() {
        console.log('WASM Module initialized');
    }
}; 