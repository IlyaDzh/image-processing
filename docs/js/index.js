const btnApply = document.getElementsByClassName('btn-apply');
const btnBrightContrastApply = document.getElementById('btn-bright_contrast-apply');
const btnSave = document.getElementById('btn-save');
const btnLoad = document.getElementById('btn-load');
const btnBack = document.getElementById('btn-back');
const btnForward = document.getElementById('btn-forward');
const btnGetCurrentImage = document.getElementById('get-current-image');
const btnGetOriginalImage = document.getElementById('get-original-image');
const brightness = document.getElementById('input-brightness');
const contrast = document.getElementById('input-contrast');
const grayscale = document.getElementById('grayscale');
const negative = document.getElementById('negative');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const tempImage = new Image();
const originalImage = new Image();

let historyChanges = [];
let currentPositionInHistory = -1;

for (let i = 0; i < btnApply.length; i++) {
    btnApply[i].addEventListener('click', applyChanges, false);
}

btnLoad.addEventListener('change', loadImage, false);
btnSave.addEventListener('click', saveImage, false);
btnBack.addEventListener('click', () => {
    if (historyChanges.length === 0) {
        tata.error('Ошибка', 'Необходимо загрузить картинку!');
        return;
    }
    if (currentPositionInHistory > 0) {
        currentPositionInHistory--;
        drawByPosition(currentPositionInHistory);
    }
}, false);
btnForward.addEventListener('click', () => {
    if (historyChanges.length === 0) {
        tata.error('Ошибка', 'Необходимо загрузить картинку!');
        return;
    }
    if (currentPositionInHistory < historyChanges.length - 1) {
        currentPositionInHistory++;
        drawByPosition(currentPositionInHistory);
    }
}, false);
btnGetCurrentImage.addEventListener('click', () => {
    if (historyChanges.length === 0) {
        tata.error('Ошибка', 'Необходимо загрузить картинку!');
        return;
    }
    currentPositionInHistory = historyChanges.length - 1;
    drawByPosition(historyChanges.length - 1);
}, false);
btnGetOriginalImage.addEventListener('click', () => {
    if (historyChanges.length === 0) {
        tata.error('Ошибка', 'Необходимо загрузить картинку!');
        return;
    }
    drawByPosition(0);
}, false);
btnBrightContrastApply.addEventListener('click', () => {
    brightness.value = 0;
    contrast.value = 0;
}, false);
brightness.addEventListener('input', () => setBrightness(Number(event.target.value)), false);
contrast.addEventListener('input', () => setContrast(Number(event.target.value)), false);
grayscale.addEventListener('click', imageToGrayscale, false);
negative.addEventListener('click', imageToNegative, false);



function applyChanges() {
    if (historyChanges.length === 0) {
        tata.error('Ошибка', 'Необходимо загрузить картинку!');
        return;
    }
    tata.success('Успех', 'Изменения зафиксированы!', { duration: 1500 })
    tempImage.src = canvas.toDataURL("image/jpeg");
    historyPush(tempImage.src);
}

function historyPush(src) {
    historyChanges.push(src);
    currentPositionInHistory = historyChanges.length - 1;
}

function clearVariables() {
    historyChanges.length = 0;
    currentPositionInHistory = -1;
    brightness.value = 0;
    contrast.value = 0;
}

function drawByPosition(index) {
    let image = new Image();
    image.src = historyChanges[index];
    ctx.drawImage(image, 0, 0);
}



function loadImage(e) {
    let reader = new FileReader();
    reader.onload = function (event) {
        let img = new Image();
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        }
        img.src = event.target.result;
        tempImage.src = event.target.result;
        originalImage.src = event.target.result;
        clearVariables();
        historyPush(event.target.result);
    }
    reader.readAsDataURL(e.target.files[0]);
}

function saveImage() {
    if (historyChanges.length === 0) {
        tata.error('Ошибка', 'Необходимо загрузить картинку!');
        return;
    }
    let link = document.createElement("a");
    document.body.appendChild(link);
    link.href = canvas.toDataURL("image/jpeg");
    link.download = "image_name.jpg";
    link.click();
}

function setBrightness(brightnessMul) {
    drawByPosition(currentPositionInHistory);
    let imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imgPixels.data.length; i += 4) {
        imgPixels.data[i] += brightnessMul;
        imgPixels.data[i + 1] += brightnessMul;
        imgPixels.data[i + 2] += brightnessMul;
    }
    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
}

function setContrast(contrastMul) {
    drawByPosition(currentPositionInHistory);
    let imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    contrastMul = (contrastMul / 100) + 1;
    let intercept = 128 * (1 - contrastMul);
    for (let i = 0; i < imgPixels.data.length; i += 4) {
        imgPixels.data[i] = imgPixels.data[i] * contrastMul + intercept;
        imgPixels.data[i + 1] = imgPixels.data[i + 1] * contrastMul + intercept;
        imgPixels.data[i + 2] = imgPixels.data[i + 2] * contrastMul + intercept;
    }
    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
}

function imageToGrayscale() {
    drawByPosition(currentPositionInHistory);
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

function imageToNegative() {
    drawByPosition(currentPositionInHistory);
    let imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imgPixels.data.length; i += 4) {
        let r = imgPixels.data[i];
        let g = imgPixels.data[i + 1];
        let b = imgPixels.data[i + 2];
        imgPixels.data[i] = 255 - r;
        imgPixels.data[i + 1] = 255 - g;
        imgPixels.data[i + 2] = 255 - b;
    }
    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
}