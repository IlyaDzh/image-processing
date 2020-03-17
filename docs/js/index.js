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

function add_mod8(x, y) {
    let summ = x + y;
    if (summ > 7)
        summ = summ - 8;
    return summ;
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

    try {
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
    }
    catch{ }

    temp = new Uint8ClampedArray(temp.toString().split(',').map(v => +v));

    imgPixels.data.set(temp);

    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
}


// no
function imageToCirsh() {
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
                    let r = [
                        temp[i - 1][j - 1][0],
                        temp[i - 1][j][0],
                        temp[i - 1][j + 1][0],
                        temp[i][j - 1][0],
                        temp[i][j + 1][0],
                        temp[i + 1][j - 1][0],
                        temp[i + 1][j][0],
                        temp[i + 1][j + 1][0]
                    ]

                    let g = [
                        temp[i - 1][j - 1][1],
                        temp[i - 1][j][1],
                        temp[i - 1][j + 1][1],
                        temp[i][j - 1][1],
                        temp[i][j + 1][1],
                        temp[i + 1][j - 1][1],
                        temp[i + 1][j][1],
                        temp[i + 1][j + 1][1]
                    ];

                    let b = [
                        temp[i - 1][j - 1][2],
                        temp[i - 1][j][2],
                        temp[i - 1][j + 1][2],
                        temp[i][j - 1][2],
                        temp[i][j + 1][2],
                        temp[i + 1][j - 1][2],
                        temp[i + 1][j][2],
                        temp[i + 1][j + 1][2]
                    ];

                    let s_r = [];
                    let s_g = [];
                    let s_b = [];

                    for (let k = 0; k < 8; k++) {
                        s_r.push(r[k] + add_mod8(r[1], r[k]) + add_mod8(r[2], r[k]));
                        s_g.push(g[k] + add_mod8(g[1], g[k]) + add_mod8(g[2], g[k]));
                        s_b.push(b[k] + add_mod8(b[1], b[k]) + add_mod8(b[2], b[k]));
                    }

                    let t_r = [];
                    let t_g = [];
                    let t_b = [];

                    for (let k = 0; k < 8; k++) {
                        t_r.push(r[k] + add_mod8(r[3], r[k]) + add_mod8(r[4], r[k]) + add_mod8(r[5], r[k]) + add_mod8(r[6], r[k]) + add_mod8(r[7], r[k]));
                        t_g.push(g[k] + add_mod8(g[3], g[k]) + add_mod8(g[4], g[k]) + add_mod8(g[5], g[k]) + add_mod8(g[6], g[k]) + add_mod8(g[7], g[k]));
                        t_b.push(b[k] + add_mod8(b[3], b[k]) + add_mod8(b[4], b[k]) + add_mod8(b[5], b[k]) + add_mod8(b[6], b[k]) + add_mod8(b[7], b[k]));
                    }

                    let f_r = [];
                    let f_g = [];
                    let f_b = [];

                    for (let k = 0; k < 8; k++) {
                        f_r.push(Math.abs(5 * s_r[k] - 3 * t_r[k]));
                        f_g.push(Math.abs(5 * s_g[k] - 3 * t_g[k]));
                        f_b.push(Math.abs(5 * s_b[k] - 3 * t_b[k]));
                    }

                    let nf_r = Math.max(...f_r);
                    let nf_g = Math.max(...f_g);
                    let nf_b = Math.max(...f_b);

                    temp[i][j][0] = Number(nf_r);
                    temp[i][j][1] = Number(nf_g);
                    temp[i][j][2] = Number(nf_b);
                }
            }
        }
    }
    catch{ }

    temp = new Uint8ClampedArray(temp.toString().split(',').map(v => +v));

    imgPixels.data.set(temp);

    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
}

// no
function imageToLaplas() {

}

// yes
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

// no
function imageToSobel() {
    drawByPosition(currentPositionInHistory);

    let imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let temp = toMatrix(imgPixels.data, imgPixels.width * 4);

    for (let i = 0; i < temp.length; i++)
        temp[i] = toMatrix(temp[i], 4);

    // let sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    // let sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];

    // for (let j = 0; j < canvas.width; j++) {
    //     for (let i = 0; i < canvas.height; i++) {
    //         if (i == 0 || j == 0 || i + 1 == canvas.height || j + 1 == canvas.width) { }
    //         else {
    //             let x_r = [
    //                 temp[i - 1][j - 1][0] * sobelX[0],
    //                 temp[i - 1][j][0] * sobelX[2],
    //                 temp[i - 1][j + 1][0] * sobelX[2],
    //                 temp[i][j - 1][0] * sobelX[3],
    //                 temp[i][j][0] * sobelX[4],
    //                 temp[i][j + 1][0] * sobelX[5],
    //                 temp[i + 1][j - 1][0] * sobelX[6],
    //                 temp[i + 1][j][0] * sobelX[7],
    //                 temp[i + 1][j + 1][0] * sobelX[8]
    //             ]
    //             let y_r = [
    //                 temp[i - 1][j - 1][0] * sobelY[0],
    //                 temp[i - 1][j][0] * sobelY[2],
    //                 temp[i - 1][j + 1][0] * sobelY[2],
    //                 temp[i][j - 1][0] * sobelY[3],
    //                 temp[i][j][0] * sobelY[4],
    //                 temp[i][j + 1][0] * sobelY[5],
    //                 temp[i + 1][j - 1][0] * sobelY[6],
    //                 temp[i + 1][j][0] * sobelY[7],
    //                 temp[i + 1][j + 1][0] * sobelY[8]
    //             ]

    //             let x_g = [
    //                 temp[i - 1][j - 1][1] * sobelX[0],
    //                 temp[i - 1][j][1] * sobelX[2],
    //                 temp[i - 1][j + 1][1] * sobelX[2],
    //                 temp[i][j - 1][1] * sobelX[3],
    //                 temp[i][j][1] * sobelX[4],
    //                 temp[i][j + 1][1] * sobelX[5],
    //                 temp[i + 1][j - 1][1] * sobelX[6],
    //                 temp[i + 1][j][1] * sobelX[7],
    //                 temp[i + 1][j + 1][1] * sobelX[8]
    //             ]
    //             let y_g = [
    //                 temp[i - 1][j - 1][1] * sobelY[0],
    //                 temp[i - 1][j][1] * sobelY[2],
    //                 temp[i - 1][j + 1][1] * sobelY[2],
    //                 temp[i][j - 1][1] * sobelY[3],
    //                 temp[i][j][1] * sobelY[4],
    //                 temp[i][j + 1][1] * sobelY[5],
    //                 temp[i + 1][j - 1][1] * sobelY[6],
    //                 temp[i + 1][j][1] * sobelY[7],
    //                 temp[i + 1][j + 1][1] * sobelY[8]
    //             ]

    //             let x_b = [
    //                 temp[i - 1][j - 1][2] * sobelX[0],
    //                 temp[i - 1][j][2] * sobelX[2],
    //                 temp[i - 1][j + 1][2] * sobelX[2],
    //                 temp[i][j - 1][2] * sobelX[3],
    //                 temp[i][j][2] * sobelX[4],
    //                 temp[i][j + 1][2] * sobelX[5],
    //                 temp[i + 1][j - 1][2] * sobelX[6],
    //                 temp[i + 1][j][2] * sobelX[7],
    //                 temp[i + 1][j + 1][2] * sobelX[8]
    //             ]
    //             let y_b = [
    //                 temp[i - 1][j - 1][2] * sobelY[0],
    //                 temp[i - 1][j][2] * sobelY[2],
    //                 temp[i - 1][j + 1][2] * sobelY[2],
    //                 temp[i][j - 1][2] * sobelY[3],
    //                 temp[i][j][2] * sobelY[4],
    //                 temp[i][j + 1][2] * sobelY[5],
    //                 temp[i + 1][j - 1][2] * sobelY[6],
    //                 temp[i + 1][j][2] * sobelY[7],
    //                 temp[i + 1][j + 1][2] * sobelY[8]
    //             ]

    //             x_r = x_r.reduce((prev, next) => prev + next);
    //             x_g = x_g.reduce((prev, next) => prev + next);
    //             x_b = x_b.reduce((prev, next) => prev + next);
    //             y_r = y_r.reduce((prev, next) => prev + next);
    //             y_g = y_g.reduce((prev, next) => prev + next);
    //             y_b = y_b.reduce((prev, next) => prev + next);

    //             let r = Math.sqrt(x_r * x_r + y_r * y_r);
    //             let g = Math.sqrt(x_g * x_g + y_g * y_g);
    //             let b = Math.sqrt(x_b * x_b + y_b * y_b);

    //             temp[i][j][0] = r;
    //             temp[i][j][1] = g;
    //             temp[i][j][2] = b;
    //         }
    //     }
    // }
    for (let j = 0; j < canvas.width; j++) {
        for (let i = 0; i < canvas.height; i++) {
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

                temp[i][j][0] = g_r;
                temp[i][j][1] = g_g;
                temp[i][j][2] = g_b;
            }
        }
    }

    temp = new Uint8ClampedArray(temp.toString().split(',').map(v => +v));

    imgPixels.data.set(temp);

    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
}

// no
function imageToUolles() {
    drawByPosition(currentPositionInHistory);

    let imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let temp = toMatrix(imgPixels.data, imgPixels.width * 4);

    for (let i = 0; i < temp.length; i++)
        temp[i] = toMatrix(temp[i], 4);

    for (let j = 0; j < canvas.width; j++) {
        for (let i = 0; i < canvas.height; i++) {
            if (i == 0 || j == 0 || i + 1 == canvas.height || j + 1 == canvas.width) { }
            else {
                let f_r = Math.log((
                    (temp[i][j][0] + 1) / (temp[i - 1][j][0] + 1) *
                    (temp[i][j][0] + 1) / (temp[i][j + 1][0] + 1) *
                    (temp[i][j][0] + 1) / (temp[i + 1][j][0] + 1) *
                    (temp[i][j][0] + 1) / (temp[i][j - 1][0] + 1))
                ) / 4;
                let f_g = Math.log((
                    (temp[i][j][1] + 1) / (temp[i - 1][j][1] + 1) *
                    (temp[i][j][1] + 1) / (temp[i][j + 1][1] + 1) *
                    (temp[i][j][1] + 1) / (temp[i + 1][j][1] + 1) *
                    (temp[i][j][1] + 1) / (temp[i][j - 1][1] + 1))
                ) / 4;
                let f_b = Math.log((
                    (temp[i][j][2] + 1) / (temp[i - 1][j][2] + 1) *
                    (temp[i][j][2] + 1) / (temp[i][j + 1][2] + 1) *
                    (temp[i][j][2] + 1) / (temp[i + 1][j][2] + 1) *
                    (temp[i][j][2] + 1) / (temp[i][j - 1][2] + 1))
                ) / 4;

                temp[i][j][0] = Number(f_r * 1000);
                temp[i][j][1] = Number(f_g * 1000);
                temp[i][j][2] = Number(f_b * 1000);
            }
        }
    }

    temp = new Uint8ClampedArray(temp.toString().split(',').map(v => +v));

    imgPixels.data.set(temp);

    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
}

// no
function imageToStatic() {
    drawByPosition(currentPositionInHistory);

    let imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let temp = toMatrix(imgPixels.data, imgPixels.width * 4);

    for (let i = 0; i < temp.length; i++)
        temp[i] = toMatrix(temp[i], 4);

    for (let j = 0; j < canvas.width; j++) {
        for (let i = 0; i < canvas.height; i++) {
            if (i == 0 || j == 0 || i + 1 == canvas.height || j + 1 == canvas.width) { }
            else {
                let summ1_r = temp[i - 1][j][0] + temp[i][j][0] + temp[i + 1][j][0] + temp[i - 1][j - 1][0] + temp[i][j - 1][0] + temp[i + 1][j - 1][0] + temp[i - 1][j + 1][0] + temp[i][j + 1][0] + temp[i + 1][j + 1][0]
                let summ1_g = temp[i - 1][j][1] + temp[i][j][1] + temp[i + 1][j][1] + temp[i - 1][j - 1][1] + temp[i][j - 1][1] + temp[i + 1][j - 1][1] + temp[i - 1][j + 1][1] + temp[i][j + 1][1] + temp[i + 1][j + 1][1]
                let summ1_b = temp[i - 1][j][2] + temp[i][j][2] + temp[i + 1][j][2] + temp[i - 1][j - 1][2] + temp[i][j - 1][2] + temp[i + 1][j - 1][2] + temp[i - 1][j + 1][2] + temp[i][j + 1][2] + temp[i + 1][j + 1][2]

                let mu_r = 1 / 9 * summ1_r
                let mu_g = 1 / 9 * summ1_g
                let mu_b = 1 / 9 * summ1_b

                let summ2_r = (temp[i - 1][j][0] - mu_r) ** 2 + (temp[i][j][0] - mu_r) ** 2 + (temp[i + 1][j][0] - mu_r) ** 2 + temp[i - 1][j - 1][0] + (temp[i][j - 1][0] - mu_r) ** 2 + (temp[i + 1][j - 1][0] - mu_r) ** 2 + (temp[i - 1][j + 1][0] - mu_r) ** 2 + (temp[i][j + 1][0] - mu_r) ** 2 + (temp[i + 1][j + 1][0] - mu_r) ** 2
                let summ2_g = (temp[i - 1][j][1] - mu_g) ** 2 + (temp[i][j][1] - mu_g) ** 2 + (temp[i + 1][j][1] - mu_g) ** 2 + temp[i - 1][j - 1][1] + (temp[i][j - 1][1] - mu_g) ** 2 + (temp[i + 1][j - 1][1] - mu_g) ** 2 + (temp[i - 1][j + 1][1] - mu_g) ** 2 + (temp[i][j + 1][1] - mu_g) ** 2 + (temp[i + 1][j + 1][1] - mu_g) ** 2
                let summ2_b = (temp[i - 1][j][2] - mu_b) ** 2 + (temp[i][j][2] - mu_b) ** 2 + (temp[i + 1][j][2] - mu_b) ** 2 + temp[i - 1][j - 1][2] + (temp[i][j - 1][2] - mu_b) ** 2 + (temp[i + 1][j - 1][2] - mu_b) ** 2 + (temp[i - 1][j + 1][2] - mu_b) ** 2 + (temp[i][j + 1][2] - mu_b) ** 2 + (temp[i + 1][j + 1][2] - mu_b) ** 2

                let tau_r = Math.sqrt(1 / 9 * summ2_r)
                let tau_g = Math.sqrt(1 / 9 * summ2_g)
                let tau_b = Math.sqrt(1 / 9 * summ2_b)

                let val = 0

                temp[i][j - 1][0] = (tau_r * temp[i][j - 1][0] + val);
                temp[i][j - 1][1] = (tau_g * temp[i][j - 1][1] + val);
                temp[i][j - 1][2] = (tau_b * temp[i][j - 1][2] + val);
                temp[i][j][0] = (tau_r * temp[i][j][0] + val);
                temp[i][j][1] = (tau_g * temp[i][j][1] + val);
                temp[i][j][2] = (tau_b * temp[i][j][2] + val);
                temp[i][j + 1][0] = (tau_r * temp[i][j + 1][0] + val);
                temp[i][j + 1][1] = (tau_g * temp[i][j + 1][1] + val);
                temp[i][j + 1][2] = (tau_b * temp[i][j + 1][2] + val);

                temp[i - 1][j - 1][0] = (tau_r * temp[i - 1][j - 1][0] + val);
                temp[i - 1][j - 1][1] = (tau_g * temp[i - 1][j - 1][1] + val);
                temp[i - 1][j - 1][2] = (tau_b * temp[i - 1][j - 1][2] + val);
                temp[i - 1][j][0] = (tau_r * temp[i - 1][j][0] + val);
                temp[i - 1][j][1] = (tau_g * temp[i - 1][j][1] + val);
                temp[i - 1][j][2] = (tau_b * temp[i - 1][j][2] + val);
                temp[i - 1][j + 1][0] = (tau_r * temp[i - 1][j + 1][0] + val);
                temp[i - 1][j + 1][1] = (tau_g * temp[i - 1][j + 1][1] + val);
                temp[i - 1][j + 1][2] = (tau_b * temp[i - 1][j + 1][2] + val);

                temp[i + 1][j - 1][0] = (tau_r * temp[i + 1][j - 1][0] + val);
                temp[i + 1][j - 1][1] = (tau_g * temp[i + 1][j - 1][1] + val);
                temp[i + 1][j - 1][2] = (tau_b * temp[i + 1][j - 1][2] + val);
                temp[i + 1][j][0] = (tau_r * temp[i + 1][j][0] + val);
                temp[i + 1][j][1] = (tau_g * temp[i + 1][j][1] + val);
                temp[i + 1][j][2] = (tau_b * temp[i + 1][j][2] + val);
                temp[i + 1][j + 1][0] = (tau_r * temp[i + 1][j + 1][0] + val);
                temp[i + 1][j + 1][1] = (tau_g * temp[i + 1][j + 1][1] + val);
                temp[i + 1][j + 1][2] = (tau_b * temp[i + 1][j + 1][2] + val);
            }
        }
    }

    console.log(temp)

    temp = new Uint8ClampedArray(temp.toString().split(',').map(v => +v));

    imgPixels.data.set(temp);

    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
}