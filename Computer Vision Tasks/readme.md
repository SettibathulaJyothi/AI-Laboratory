https://settibathulajyothi.github.io/AI-Laboratory/Computer%20Vision%20Tasks

# AI Computer Vision Learning Lab

An interactive HTML/CSS/JavaScript teaching webpage with real photographic sample images and pretrained image classification.

## Run it
1. Extract the ZIP.
2. Open `index.html` in a modern browser, or use VS Code with Live Server.
3. Choose a sample photo or upload a JPG, PNG, or WEBP image (maximum 10 MB).
4. The page loads TensorFlow.js and MobileNet from a CDN, then classifies the photo in the browser and shows the top three predicted ImageNet labels with confidence scores.

## Tasks
- **Image classification:** Real predictions from MobileNet for sample photos and user-uploaded images.
- **Classification + localisation:** Classification is real, but the displayed location box is illustrative.
- **Object detection and instance segmentation:** The visual overlays are educational examples; real detection/segmentation need dedicated models.

## Privacy and network requirements
Uploaded images are processed locally in the browser and are not sent to this project's server. Sample photos, TensorFlow.js libraries, and model weights load from external servers, so an internet connection is required. CDN availability, school network restrictions, or browser extensions may prevent images or the model from loading.

## Files
- `index.html` — page structure and library references
- `style.css` — responsive design
- `script.js` — real sample photo URLs, model loading, image classification, UI and illustrative task overlays
