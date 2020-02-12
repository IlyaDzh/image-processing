const btnSave = document.getElementById('btn-save');
const btnLoad = document.getElementById('btn-load');
const btnRotateRight = document.getElementById('btn-rotate-right');
const btnRotateLeft = document.getElementById('btn-rotate-left');
const grayscale = document.getElementById('grayscale');
const negative = document.getElementById('negative');
// const inputScale = document.getElementById('input-scale');
// const inputWidth = document.getElementById('input-width');
// const inputHeight = document.getElementById('input-height');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const originalImage = new Image();

let currentRotate = 0;


btnLoad.addEventListener('change', loadImage, false);
btnSave.addEventListener('click', saveImage, false);
grayscale.addEventListener('click', getGrayscale, false);
negative.addEventListener('click', getNegative, false);
btnRotateRight.addEventListener('click', () => {
    currentRotate = currentRotate + 90;
    rotate();
}, false);
btnRotateLeft.addEventListener('click', () => {
    currentRotate = currentRotate - 90;
    rotate();
}, false);



function draw() {
    ctx.drawImage(originalImage, 0, 0);
}

function loadImage(e) {
    let reader = new FileReader();
    reader.onload = function (event) {
        let img = new Image();
        img.onload = function () {
            canvas.setAttribute('style', 'height: auto; width: 100%');
            currentRotate = 0;
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        }
        img.src = event.target.result;
        originalImage.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
}

function saveImage() {
    let link = document.createElement("a");
    document.body.appendChild(link);
    link.href = canvas.toDataURL("image/jpeg");
    link.download = "image_name.jpg";
    link.click();
}

function rotate() {
    let image = new Image();
    image.src = originalImage.src;

    if (currentRotate % 180) {
        canvas.setAttribute('style', 'height: 100%; width: auto');
        canvas.width = image.height;
        canvas.height = image.width;
    } else {
        canvas.setAttribute('style', 'width: 100%; height: auto');
        canvas.width = image.width;
        canvas.height = image.height;
    }

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(currentRotate * Math.PI / 180);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.restore();
}

function getGrayscale() {
    draw();
    let imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < imgPixels.height; y++) {
        for (let x = 0; x < imgPixels.width; x++) {
            let i = (y * 4) * imgPixels.width + x * 4;
            let avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
            imgPixels.data[i] = avg;
            imgPixels.data[i + 1] = avg;
            imgPixels.data[i + 2] = avg;
        }
    }
    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
}

function getNegative() {
    draw();
    let imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imgPixels.data.length; i += 4) {
        let r = imgPixels.data[i];
        let g = imgPixels.data[i + 1];
        let b = imgPixels.data[i + 2];
        let invertedRed = 255 - r;
        let invertedGreen = 255 - g;
        let invertedBlue = 255 - b;
        imgPixels.data[i] = invertedRed;
        imgPixels.data[i + 1] = invertedGreen;
        imgPixels.data[i + 2] = invertedBlue;
    }
    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
}