async function loadImageAsTensor(url) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;

    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
    });

    // Convert the image to a tensor
    const tensor = tf.browser.fromPixels(img);
    return tensor;
}

async function imgToTensor(url1, url2) {
    const tensor1 = await loadImageAsTensor(url1);
    const tensor2 = await loadImageAsTensor(url2);

    return [tensor1.div(255.0).expandDims(0), tensor2.div(255.0).expandDims(0)];
}

const interpolation_tree = {
    15: [1, 30],
    7: [1, 15],
    4: [1, 7],
    2: [1, 4],
    3: [2, 4],
    5: [4, 7],
    6: [5, 7],
    11: [7, 15],
    13: [11, 15],
    14: [13, 15],
    12: [11, 13],
    9: [7, 11],
    8: [7, 9],
    10: [9, 11],
    23: [15, 30],
    19: [15, 23],
    17: [15, 19],
    16: [15, 17],
    18: [17, 19],
    21: [19, 23],
    20: [19, 21],
    22: [21, 23],
    26: [23, 30],
    28: [26, 30],
    27: [26, 28],
    29: [28, 30],
    24: [23, 26],
    25: [24, 26],
};

let model;
tf.loadGraphModel(
    "https://raw.githubusercontent.com/Senthilsk10/Latent-Space-Interpolation/refs/heads/master/sepconv-model/model.json"
).then((loadedModel) => {
    model = loadedModel;
    console.log("Model loaded successfully!");
});

function predict(img1, img2) {
    return model.predict([img1, img2]);
}

// Interpolation function
async function interpolate(url1, url2) {
    // Load and preprocess the images
    const [img1, img30] = await imgToTensor(url1, url2);

    // Store the images by index
    const images = {
        1: img1,
        30: img30,
    };

    // Recursive function to compute interpolated images
    function get_interpolated_image(index) {
        if (images[index]) return images[index]; // Return if already computed

        const [img_a_index, img_b_index] = interpolation_tree[index];
        const img_a = get_interpolated_image(img_a_index);
        const img_b = get_interpolated_image(img_b_index);

        // Predict and store the result
        images[index] = tf.tidy(() => predict(img_a, img_b));
        return images[index];
    }

    // Iterate over all indices in the interpolation tree
    for (const img_index of Object.keys(interpolation_tree)) {
        get_interpolated_image(parseInt(img_index));
    }

    return images;
}

function postprocess(img){
    img = img.squeeze(axis=0);
    img = img.clipByValue(0,1);
    img = img.mul(255);
    return tf.cast(img,'int32');
}

async function call(url1, url2){
    let interpolatedImages = await interpolate(url1, url2);
    const tensors = Object.values(interpolatedImages);
    let frames = [];
    for (let tensor of tensors) {
        frames.push(postprocess(tensor));
    }
    return frames;
}

async function tensorToVideo(url1, url2) {
    return new Promise(async (resolve, reject) => {
        // Get the frames by calling the interpolation function
        let tensor = await call(url1, url2);
        tensor = tf.stack(tensor);
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        const stream = canvas.captureStream(30);  // 30 fps
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        const recordedChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            recordedChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
            const videoUrl = URL.createObjectURL(videoBlob);
            resolve(videoUrl); // Resolve the promise with the video URL
        };

        // Start recording the video
        mediaRecorder.start();

        // Render the frames sequentially using requestAnimationFrame
        let frameIndex = 0;
        function renderFrame() {
            if (frameIndex >= tensor.shape[0]) {
                mediaRecorder.stop(); // Stop recording after all frames are rendered
                return;
            }

            // Extract the current frame from the tensor
            const frameTensor = tensor.slice([frameIndex, 0, 0, 0], [1, tensor.shape[1], tensor.shape[2], 3]);

            // Render the frame onto the canvas
            tf.browser.toPixels(frameTensor.squeeze(), canvas)
                .then(() => {
                    frameIndex++;
                    requestAnimationFrame(renderFrame); // Render the next frame
                });

            frameTensor.dispose(); // Free memory for the tensor
        }

        // Start rendering the frames
        renderFrame();
    });
}

// Expose call and tensorToVideo functions to be used in your HTML file
window.call = call;
window.tensorToVideo = tensorToVideo;
