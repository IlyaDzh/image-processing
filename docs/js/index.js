const btnApply = document.getElementsByClassName('btn-apply');
const btnBrightContrastApply = document.getElementById('btn-bright_contrast-apply');
const btnSave = document.getElementById('btn-save');
const btnLoad = document.getElementById('btn-load');
const btnBack = document.getElementById('btn-back');
const btnForward = document.getElementById('btn-forward');
const btnInfo = document.getElementById('btn-info');
const btnGetCurrentImage = document.getElementById('get-current-image');
const btnGetOriginalImage = document.getElementById('get-original-image');

const brightness = document.getElementById('input-brightness');
const contrast = document.getElementById('input-contrast');
const grayscale = document.getElementById('grayscale');
const sepia = document.getElementById('sepia');
const negative = document.getElementById('negative');

const colorPick1 = document.getElementById('colorPick1');
const colorPick2 = document.getElementById('colorPick2');
const bin = document.getElementById('input-bin');
const swapColors = document.getElementById('swap-colors');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const tempImage = new Image();
const originalImage = new Image();

let name, type, size, resolution;

let historyChanges = [];
let currentPositionInHistory = -1;

for (let i = 0; i < btnApply.length; i++) {
    btnApply[i].addEventListener('click', applyChanges, false);
}

btnLoad.addEventListener('change', loadImage, false);
btnSave.addEventListener('click', saveImage, false);
btnInfo.addEventListener('click', () => {
    if (historyChanges.length === 0) {
        tata.error('Ошибка', 'Необходимо загрузить картинку!');
        return;
    }
    Modal.alert({
        title: '<h5 style="margin-bottom: 0">Информация</h5>',
        message: `
            <p><b>Имя файла:</b> ${name}</p>
            <p><b>Тип файла:</b> ${type}</p>
            <p><b>Размер:</b> ${Math.round(size / 1024)} КБ (${size} байт)</p>
            <p><b>Разрешение:</b> ${resolution.width}x${resolution.height}</p>
        `
    });
}, false);
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
    currentPositionInHistory = 0;
    drawByPosition(0);
}, false);

btnBrightContrastApply.addEventListener('click', () => {
    brightness.value = 0;
    contrast.value = 0;
}, false);
swapColors.addEventListener('click', () => {
    let temp = colorPick1.value;
    colorPick1.value = colorPick2.value;
    colorPick2.value = temp;
}, false);
brightness.addEventListener('input', () => setBrightness(Number(event.target.value)), false);
contrast.addEventListener('input', () => setContrast(Number(event.target.value)), false);
bin.addEventListener('input', () => imageToBin(Number(event.target.value), hexToRgb(colorPick1.value), hexToRgb(colorPick2.value)), false);
grayscale.addEventListener('click', imageToGrayscale, false);
sepia.addEventListener('click', imageToSepia, false);
negative.addEventListener('click', imageToNegative, false);



function applyChanges() {
    if (historyChanges.length === 0) {
        tata.error('Ошибка', 'Необходимо загрузить картинку!');
        return;
    }
    tata.success('Успех', 'Изменения зафиксированы!', { duration: 1700 })
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
    bin.value = 128;
}

function drawByPosition(index) {
    let image = new Image();
    image.src = historyChanges[index];
    ctx.drawImage(image, 0, 0);
}

function hexToRgb(hex) {
    let rgb = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
        , (m, r, g, b) => '#' + r + r + g + g + b + b)
        .substring(1).match(/.{2}/g)
        .map(x => parseInt(x, 16))
    return { r: rgb[0], g: rgb[1], b: rgb[2] };
}



function loadImage(e) {
    let reader = new FileReader();
    reader.onload = function (event) {
        let img = new Image();
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            resolution = {
                'width': img.width,
                'height': img.height
            }
            ctx.drawImage(img, 0, 0);
        }
        img.src = event.target.result;
        tempImage.src = event.target.result;
        originalImage.src = event.target.result;
        clearVariables();
        historyPush(event.target.result);
    }
    name = e.target.files[0].name;
    size = e.target.files[0].size;
    type = e.target.files[0].type.substr(e.target.files[0].type.lastIndexOf('/') + 1);
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
    for (let i = 0; i < imgPixels.data.length; i += 4) {
        let avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
        imgPixels.data[i] = avg;
        imgPixels.data[i + 1] = avg;
        imgPixels.data[i + 2] = avg;
    }
    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
}

function imageToSepia() {
    drawByPosition(currentPositionInHistory);
    let imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imgPixels.data.length; i += 4) {
        var r = imgPixels.data[i];
        var g = imgPixels.data[i + 1];
        var b = imgPixels.data[i + 2];
        imgPixels.data[i] = (r * 0.393) + (g * 0.769) + (b * 0.189);
        imgPixels.data[i + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
        imgPixels.data[i + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
    }
    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
}

function imageToNegative() {
    drawByPosition(currentPositionInHistory);
    let imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imgPixels.data.length; i += 4) {
        imgPixels.data[i] = 255 - imgPixels.data[i];
        imgPixels.data[i + 1] = 255 - imgPixels.data[i + 1];
        imgPixels.data[i + 2] = 255 - imgPixels.data[i + 2];
    }
    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
}

function imageToBin(binMul, color1, color2) {
    drawByPosition(currentPositionInHistory);
    let imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imgPixels.data.length; i += 4) {
        let v = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
        imgPixels.data[i] = v > binMul ? color1.r : color2.r;
        imgPixels.data[i + 1] = v > binMul ? color1.g : color2.g;
        imgPixels.data[i + 2] = v > binMul ? color1.b : color2.b;
    }
    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
}