const btnApply = document.getElementById('btn-apply');
const btnReset = document.getElementById('btn-reset');
const btnSave = document.getElementById('btn-save');
const btnLoad = document.getElementById('btn-load');
const btnBack = document.getElementById('btn-back');
const btnForward = document.getElementById('btn-forward');
const btnInfo = document.getElementById('btn-info');
const btnGetCurrentImage = document.getElementById('get-current-image');
const btnGetOriginalImage = document.getElementById('get-original-image');
const histContainer = document.getElementById('histogram-containers');

const linear = document.getElementById('linear');
const median = document.getElementById('median');
const bin = document.getElementById('input-bin');
const noise = document.getElementById('input-noise');
const brightness = document.getElementById('input-brightness');
const contrast = document.getElementById('input-contrast');
const grayscale = document.getElementById('grayscale');
const sepia = document.getElementById('sepia');
const negative = document.getElementById('negative');
const cirsh = document.getElementById('cirsh');
const laplas = document.getElementById('laplas');
const robets = document.getElementById('robets');
const sobel = document.getElementById('sobel');
const uolles = document.getElementById('uolles');
const static = document.getElementById('static');


const colorPick1 = document.getElementById('colorPick1');
const colorPick2 = document.getElementById('colorPick2');
const swapColors = document.getElementById('swap-colors');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const tempImage = new Image();
const originalImage = new Image();

let name, type, size, resolution;

let historyChanges = [];
let currentPositionInHistory = -1;


btnApply.addEventListener('click', () => {
    applyChanges();
    setTimeout(() => calcAndHist(), 500);
}, false);
btnReset.addEventListener('click', () => {
    if (historyChanges.length === 0) {
        tata.error('Ошибка', 'Необходимо загрузить картинку!');
        return;
    }
    drawByPosition(currentPositionInHistory);
    noise.value = 0;
    brightness.value = 0;
    contrast.value = 0;
    bin.value = 128;
    yClick = null;
}, false);
btnLoad.addEventListener('change', (e) => {
    loadImage(e);
    setTimeout(() => calcAndHist(), 500);
}, false);
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
        setTimeout(() => calcAndHist(), 500);
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
        setTimeout(() => calcAndHist(), 500);
    }
}, false);
btnGetCurrentImage.addEventListener('click', () => {
    if (historyChanges.length === 0) {
        tata.error('Ошибка', 'Необходимо загрузить картинку!');
        return;
    }
    currentPositionInHistory = historyChanges.length - 1;
    drawByPosition(historyChanges.length - 1);
    setTimeout(() => calcAndHist(), 500);
}, false);
btnGetOriginalImage.addEventListener('click', () => {
    if (historyChanges.length === 0) {
        tata.error('Ошибка', 'Необходимо загрузить картинку!');
        return;
    }
    currentPositionInHistory = 0;
    drawByPosition(0);
    setTimeout(() => calcAndHist(), 500);
}, false);
swapColors.addEventListener('click', () => {
    let temp = colorPick1.value;
    colorPick1.value = colorPick2.value;
    colorPick2.value = temp;
}, false);
linear.addEventListener('click', imageToLinear, false);
median.addEventListener('click', imageToMedian, false);
noise.addEventListener('input', () => setNoise(Number(event.target.value)), false);
brightness.addEventListener('input', () => setBrightness(Number(event.target.value)), false);
contrast.addEventListener('input', () => setContrast(Number(event.target.value)), false);
bin.addEventListener('input', () => imageToBin(Number(event.target.value), hexToRgb(colorPick1.value), hexToRgb(colorPick2.value)), false);
grayscale.addEventListener('click', imageToGrayscale, false);
sepia.addEventListener('click', imageToSepia, false);
negative.addEventListener('click', imageToNegative, false);

cirsh.addEventListener('click', imageToCirsh, false);
laplas.addEventListener('click', imageToLaplas, false);
robets.addEventListener('click', imageToRoberts, false);
sobel.addEventListener('click', imageToSobel, false);
uolles.addEventListener('click', imageToUolles, false);
static.addEventListener('click', imageToStatic, false);



function applyChanges() {
    if (historyChanges.length === 0) {
        tata.error('Ошибка', 'Необходимо загрузить картинку!');
        return;
    }
    noise.value = 0;
    brightness.value = 0;
    contrast.value = 0;
    bin.value = 128;
    yClick = null;
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
    yClick = null;
    currentPositionInHistory = -1;
    noise.value = 0;
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

function toMatrix(array, chunkSize) {
    let R = [];
    for (let i = 0; i < array.length; i += chunkSize)
        R.push(array.slice(i, i + chunkSize));
    return R;
}

function convolution(pixels, weights) {
    let side = Math.round(Math.sqrt(weights.length));
    let halfSide = Math.floor(side / 2);
    let src = pixels.data;
    let canvasWidth = pixels.width;
    let canvasHeight = pixels.height;
    let temporaryCanvas = document.createElement('canvas');
    let temporaryCtx = temporaryCanvas.getContext('2d');
    let outputData = temporaryCtx.createImageData(canvasWidth, canvasHeight);

    for (let y = 0; y < canvasHeight; y++) {

        for (let x = 0; x < canvasWidth; x++) {

            let dstOff = (y * canvasWidth + x) * 4;
            let sumReds = 0, sumGreens = 0, sumBlues = 0;

            for (let kernelY = 0; kernelY < side; kernelY++) {
                for (let kernelX = 0; kernelX < side; kernelX++) {

                    let currentKernelY = y + kernelY - halfSide;
                    let currentKernelX = x + kernelX - halfSide;

                    if (currentKernelY >= 0 &&
                        currentKernelY < canvasHeight &&
                        currentKernelX >= 0 &&
                        currentKernelX < canvasWidth) {

                        let offset = (currentKernelY * canvasWidth + currentKernelX) * 4;
                        let weight = weights[kernelY * side + kernelX];

                        sumReds += src[offset] * weight;
                        sumGreens += src[offset + 1] * weight;
                        sumBlues += src[offset + 2] * weight;
                    }
                }
            }

            outputData.data[dstOff] = sumReds;
            outputData.data[dstOff + 1] = sumGreens;
            outputData.data[dstOff + 2] = sumBlues;
            outputData.data[dstOff + 3] = 255;
        }
    }
    return outputData;
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

function setNoise(noiseMul) {
    drawByPosition(currentPositionInHistory);

    let imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imgPixels.data.length; i += 4) {
        let v = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
        imgPixels.data[i] = v >= 127 ? 0 : 255;
        imgPixels.data[i + 1] = v >= 127 ? 0 : 255;
        imgPixels.data[i + 2] = v >= 127 ? 0 : 255;
    }

    for (let i = 0; i < imgPixels.data.length; i += 4) {
        let isBlack = imgPixels.data[i] == 0 ? true : false;
        let rand = Math.random();

        imgPixels.data[i] = isBlack ? (rand >= noiseMul ? 0 : 255) : (rand >= noiseMul ? 255 : 0);
        imgPixels.data[i + 1] = isBlack ? (rand >= noiseMul ? 0 : 255) : (rand >= noiseMul ? 255 : 0);
        imgPixels.data[i + 2] = isBlack ? (rand >= noiseMul ? 0 : 255) : (rand >= noiseMul ? 255 : 0);
    }

    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
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
        let r = imgPixels.data[i];
        let g = imgPixels.data[i + 1];
        let b = imgPixels.data[i + 2];
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

function imageToLinear() {
    drawByPosition(currentPositionInHistory);

    let imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let temp = toMatrix(imgPixels.data, imgPixels.width * 4);

    for (let i = 0; i < temp.length; i++)
        temp[i] = toMatrix(temp[i], 4);

    try {
        for (let j = 0; j < canvas.width; j++) {
            for (let i = 0; i < canvas.height; i++) {
                if (i == 0 || j == 0 || i + 1 == canvas.height || j + 1 == canvas.width) { }
                else {
                    let r_summ = temp[i - 1][j - 1][0];
                    let g_summ = temp[i - 1][j - 1][1];
                    let b_summ = temp[i - 1][j - 1][2];

                    r_summ = r_summ + temp[i - 1][j][0];
                    g_summ = g_summ + temp[i - 1][j][1];
                    b_summ = b_summ + temp[i - 1][j][2];

                    r_summ += temp[i - 1][j + 1][0];
                    g_summ += temp[i - 1][j + 1][1];
                    b_summ += temp[i - 1][j + 1][2];

                    r_summ = r_summ + temp[i][j - 1][0];
                    g_summ = g_summ + temp[i][j - 1][1];
                    b_summ = b_summ + temp[i][j - 1][2];

                    r_summ = r_summ + temp[i][j][0];
                    g_summ = g_summ + temp[i][j][1];
                    b_summ = b_summ + temp[i][j][2];

                    r_summ = r_summ + temp[i][j + 1][0];
                    g_summ = g_summ + temp[i][j + 1][1];
                    b_summ = b_summ + temp[i][j + 1][2];

                    r_summ = r_summ + temp[i + 1][j - 1][0];
                    g_summ = g_summ + temp[i + 1][j - 1][1];
                    b_summ = b_summ + temp[i + 1][j - 1][2];

                    r_summ = r_summ + temp[i + 1][j][0];
                    g_summ = g_summ + temp[i + 1][j][1];
                    b_summ = b_summ + temp[i + 1][j][2];

                    r_summ = r_summ + temp[i + 1][j + 1][0];
                    g_summ = g_summ + temp[i + 1][j + 1][1];
                    b_summ = b_summ + temp[i + 1][j + 1][2];

                    r_summ = r_summ / 9;
                    g_summ = g_summ / 9;
                    b_summ = b_summ / 9;

                    temp[i][j][0] = Math.floor(r_summ);
                    temp[i][j][1] = Math.floor(g_summ);
                    temp[i][j][2] = Math.floor(b_summ);
                }
            }
        }
    }
    catch{ }

    temp = new Uint8ClampedArray(temp.toString().split(',').map(v => +v));

    imgPixels.data.set(temp);

    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
}

function imageToMedian() {
    drawByPosition(currentPositionInHistory);

    let imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let temp = toMatrix(imgPixels.data, imgPixels.width * 4);

    for (let i = 0; i < temp.length; i++)
        temp[i] = toMatrix(temp[i], 4);

    for (let j = 0; j < canvas.width; j++) {
        for (let i = 0; i < canvas.height; i++) {
            if (i == 0 || j == 0 || i + 1 == canvas.height || j + 1 == canvas.width) { }
            else {
                let r_summ = [
                    temp[i - 1][j - 1][0],
                    temp[i - 1][j][0],
                    temp[i - 1][j + 1][0],
                    temp[i][j - 1][0],
                    temp[i][j][0],
                    temp[i][j + 1][0],
                    temp[i + 1][j - 1][0],
                    temp[i + 1][j][0],
                    temp[i + 1][j + 1][0]
                ];

                let g_summ = [
                    temp[i - 1][j - 1][1],
                    temp[i - 1][j][1],
                    temp[i - 1][j + 1][1],
                    temp[i][j - 1][1],
                    temp[i][j][1],
                    temp[i][j + 1][1],
                    temp[i + 1][j - 1][1],
                    temp[i + 1][j][1],
                    temp[i + 1][j + 1][1]
                ];

                let b_summ = [
                    temp[i - 1][j - 1][2],
                    temp[i - 1][j][2],
                    temp[i - 1][j + 1][2],
                    temp[i][j - 1][2],
                    temp[i][j][2],
                    temp[i][j + 1][2],
                    temp[i + 1][j - 1][2],
                    temp[i + 1][j][2],
                    temp[i + 1][j + 1][2]
                ];

                r_summ.sort();
                g_summ.sort();
                b_summ.sort();

                temp[i][j][0] = r_summ[4];
                temp[i][j][1] = g_summ[4];
                temp[i][j][2] = b_summ[4];
            }
        }
    }

    temp = new Uint8ClampedArray(temp.toString().split(',').map(v => +v));

    imgPixels.data.set(temp);

    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
}

function imageToCirsh() {
    drawByPosition(currentPositionInHistory);

    let imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let weight = [
        -3, 5, 5,
        -3, 0, 5,
        -3, -3, -3
    ];

    imgPixels = convolution(imgPixels, weight);

    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
}

function imageToLaplas() {
    drawByPosition(currentPositionInHistory);

    let imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let weight = [
        -1, -2, -1,
        -2, 12, -2,
        -1, -2, -1
    ]

    imgPixels = convolution(imgPixels, weight)

    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
}

function imageToRoberts() {
    drawByPosition(currentPositionInHistory);

    let imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let temp = toMatrix(imgPixels.data, imgPixels.width * 4);

    for (let i = 0; i < temp.length; i++)
        temp[i] = toMatrix(temp[i], 4);

    for (let j = 0; j < canvas.width; j++) {
        for (let i = 0; i < canvas.height; i++) {
            if (i == 0 || j == 0 || i + 1 == canvas.height || j + 1 == canvas.width) { }
            else {
                let r = Math.abs(temp[i][j][0] - temp[i + 1][j + 1][0]) + Math.abs(temp[i][j + 1][0] - temp[i + 1][j][0]);
                let g = Math.abs(temp[i][j][1] - temp[i + 1][j + 1][1]) + Math.abs(temp[i][j + 1][1] - temp[i + 1][j][1]);
                let b = Math.abs(temp[i][j][2] - temp[i + 1][j + 1][2]) + Math.abs(temp[i][j + 1][2] - temp[i + 1][j][2]);

                temp[i][j][0] = r;
                temp[i][j][1] = g;
                temp[i][j][2] = b;
            }
        }
    }

    temp = new Uint8ClampedArray(temp.toString().split(',').map(v => +v));

    imgPixels.data.set(temp);

    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
}

function imageToSobel() {
    drawByPosition(currentPositionInHistory);

    let imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let temp = toMatrix(imgPixels.data, imgPixels.width * 4);
    for (let i = 0; i < temp.length; i++)
        temp[i] = toMatrix(temp[i], 4);

    let temporaryCanvas = document.createElement('canvas');
    let temporaryCtx = temporaryCanvas.getContext('2d');
    let outputData = temporaryCtx.createImageData(canvas.width, canvas.height);
    outputData = toMatrix(outputData.data, outputData.width * 4);
    for (let i = 0; i < outputData.length; i++)
        outputData[i] = toMatrix(outputData[i], 4);

    for (let i = 0; i < canvas.height; i++) {
        for (let j = 0; j < canvas.width; j++) {
            if (i == 0 || j == 0 || i + 1 == canvas.height || j + 1 == canvas.width) { }
            else {
                let x_r =
                    (temp[i - 1][j + 1][0] + 2 * temp[i][j + 1][0] + temp[i + 1][j + 1][0]) -
                    (temp[i - 1][j - 1][0] + 2 * temp[i][j - 1][0] + temp[i + 1][j - 1][0]);
                let y_r =
                    (temp[i - 1][j - 1][0] + 2 * temp[i - 1][j][0] + temp[i - 1][j + 1][0]) -
                    (temp[i + 1][j - 1][0] + 2 * temp[i + 1][j][0] + temp[i + 1][j + 1][0]);

                let x_g =
                    (temp[i - 1][j + 1][1] + 2 * temp[i][j + 1][1] + temp[i + 1][j + 1][1]) -
                    (temp[i - 1][j - 1][1] + 2 * temp[i][j - 1][1] + temp[i + 1][j - 1][1]);
                let y_g =
                    (temp[i - 1][j - 1][1] + 2 * temp[i - 1][j][1] + temp[i - 1][j + 1][1]) -
                    (temp[i + 1][j - 1][1] + 2 * temp[i + 1][j][1] + temp[i + 1][j + 1][1]);

                let x_b =
                    (temp[i - 1][j + 1][2] + 2 * temp[i][j + 1][2] + temp[i + 1][j + 1][2]) -
                    (temp[i - 1][j - 1][2] + 2 * temp[i][j - 1][2] + temp[i + 1][j - 1][2]);
                let y_b =
                    (temp[i - 1][j - 1][2] + 2 * temp[i - 1][j][2] + temp[i - 1][j + 1][2]) -
                    (temp[i + 1][j - 1][2] + 2 * temp[i + 1][j][2] + temp[i + 1][j + 1][2]);

                let g_r = Math.sqrt(x_r * x_r + y_r * y_r);
                let g_g = Math.sqrt(x_g * x_g + y_g * y_g);
                let g_b = Math.sqrt(x_b * x_b + y_b * y_b);

                outputData[i][j][0] = g_r;
                outputData[i][j][1] = g_g;
                outputData[i][j][2] = g_b;
                outputData[i][j][3] = 255;
            }
        }
    }

    outputData = new Uint8ClampedArray(outputData.toString().split(',').map(v => +v));
    imgPixels.data.set(outputData);

    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
}

function imageToUolles() {
    drawByPosition(currentPositionInHistory);

    let imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let temp = toMatrix(imgPixels.data, imgPixels.width * 4);
    for (let i = 0; i < temp.length; i++)
        temp[i] = toMatrix(temp[i], 4);

    let temporaryCanvas = document.createElement('canvas');
    let temporaryCtx = temporaryCanvas.getContext('2d');
    let outputData = temporaryCtx.createImageData(canvas.width, canvas.height);
    outputData = toMatrix(outputData.data, outputData.width * 4);
    for (let i = 0; i < outputData.length; i++)
        outputData[i] = toMatrix(outputData[i], 4);

    for (let i = 0; i < canvas.height; i++) {
        for (let j = 0; j < canvas.width; j++) {
            if (i == 0 || j == 0 || i + 1 == canvas.height || j + 1 == canvas.width) { }
            else {
                let f_r = Math.log((
                    ((temp[i][j][0] + 1) / (temp[i - 1][j][0] + 1)) *
                    ((temp[i][j][0] + 1) / (temp[i][j + 1][0] + 1)) *
                    ((temp[i][j][0] + 1) / (temp[i + 1][j][0] + 1)) *
                    ((temp[i][j][0] + 1) / (temp[i][j - 1][0] + 1))
                )) / 4;
                let f_g = Math.log((
                    ((temp[i][j][1] + 1) / (temp[i - 1][j][1] + 1)) *
                    ((temp[i][j][1] + 1) / (temp[i][j + 1][1] + 1)) *
                    ((temp[i][j][1] + 1) / (temp[i + 1][j][1] + 1)) *
                    ((temp[i][j][1] + 1) / (temp[i][j - 1][1] + 1))
                )) / 4;
                let f_b = Math.log((
                    ((temp[i][j][2] + 1) / (temp[i - 1][j][2] + 1)) *
                    ((temp[i][j][2] + 1) / (temp[i][j + 1][2] + 1)) *
                    ((temp[i][j][2] + 1) / (temp[i + 1][j][2] + 1)) *
                    ((temp[i][j][2] + 1) / (temp[i][j - 1][2] + 1))
                )) / 4;

                outputData[i][j][0] = f_r * 1000;
                outputData[i][j][1] = f_g * 1000;
                outputData[i][j][2] = f_b * 1000;
                outputData[i][j][3] = 255;
            }
        }
    }

    outputData = new Uint8ClampedArray(outputData.toString().split(',').map(v => +v));
    imgPixels.data.set(outputData);

    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
}

function imageToStatic() {
    drawByPosition(currentPositionInHistory);

    let imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let temp = toMatrix(imgPixels.data, imgPixels.width * 4);
    for (let i = 0; i < temp.length; i++)
        temp[i] = toMatrix(temp[i], 4);

    let temporaryCanvas = document.createElement('canvas');
    let temporaryCtx = temporaryCanvas.getContext('2d');
    let outputData = temporaryCtx.createImageData(canvas.width, canvas.height);
    outputData = toMatrix(outputData.data, outputData.width * 4);
    for (let i = 0; i < outputData.length; i++)
        outputData[i] = toMatrix(outputData[i], 4);

    for (let j = 0; j < canvas.width; j++) {
        for (let i = 0; i < canvas.height; i++) {
            if (i == 0 || j == 0 || i + 1 == canvas.height || j + 1 == canvas.width) { }
            else {
                let summ1_r = temp[i][j][0] + temp[i + 1][j][0] + temp[i][j + 1][0] + temp[i + 1][j + 1][0];
                let summ1_g = temp[i][j][1] + temp[i + 1][j][1] + temp[i][j + 1][1] + temp[i + 1][j + 1][1];
                let summ1_b = temp[i][j][2] + temp[i + 1][j][2] + temp[i][j + 1][2] + temp[i + 1][j + 1][2];

                let mu_r = 1 / 4 * summ1_r;
                let mu_g = 1 / 4 * summ1_g;
                let mu_b = 1 / 4 * summ1_b;

                let summ2_r = Math.pow((temp[i][j][0] - mu_r), 2) + Math.pow((temp[i + 1][j][0] - mu_r), 2) + Math.pow((temp[i][j + 1][0] - mu_r), 2) + Math.pow((temp[i + 1][j + 1][0] - mu_r), 2);
                let summ2_g = Math.pow((temp[i][j][1] - mu_g), 2) + Math.pow((temp[i + 1][j][1] - mu_g), 2) + Math.pow((temp[i][j + 1][1] - mu_g), 2) + Math.pow((temp[i + 1][j + 1][1] - mu_g), 2);
                let summ2_b = Math.pow((temp[i][j][2] - mu_b), 2) + Math.pow((temp[i + 1][j][2] - mu_b), 2) + Math.pow((temp[i][j + 1][2] - mu_b), 2) + Math.pow((temp[i + 1][j + 1][2] - mu_b), 2);

                let tau_r = Math.sqrt(1 / 4 * summ2_r);
                let tau_g = Math.sqrt(1 / 4 * summ2_g);
                let tau_b = Math.sqrt(1 / 4 * summ2_b);

                let val = -100;

                outputData[i][j][0] = (tau_r * temp[i][j][0] + val);
                outputData[i][j][1] = (tau_g * temp[i][j][1] + val);
                outputData[i][j][2] = (tau_b * temp[i][j][2] + val);
                outputData[i][j][3] = 255;
                outputData[i][j + 1][0] = (tau_r * temp[i][j + 1][0] + val);
                outputData[i][j + 1][1] = (tau_g * temp[i][j + 1][1] + val);
                outputData[i][j + 1][2] = (tau_b * temp[i][j + 1][2] + val);
                outputData[i][j + 1][3] = 255;

                outputData[i + 1][j][0] = (tau_r * temp[i + 1][j][0] + val);
                outputData[i + 1][j][1] = (tau_g * temp[i + 1][j][1] + val);
                outputData[i + 1][j][2] = (tau_b * temp[i + 1][j][2] + val);
                outputData[i + 1][j][3] = 255;
                outputData[i + 1][j + 1][0] = (tau_r * temp[i + 1][j + 1][0] + val);
                outputData[i + 1][j + 1][1] = (tau_g * temp[i + 1][j + 1][1] + val);
                outputData[i + 1][j + 1][2] = (tau_b * temp[i + 1][j + 1][2] + val);
                outputData[i + 1][j + 1][3] = 255;
            }
        }
    }

    outputData = new Uint8ClampedArray(outputData.toString().split(',').map(v => +v));
    imgPixels.data.set(outputData);

    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
}