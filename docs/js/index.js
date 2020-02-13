const btnSave = document.getElementById('btn-save');
const btnLoad = document.getElementById('btn-load');
const btnBack = document.getElementById('btn-back');
const btnForward = document.getElementById('btn-forward');
const btnGetCurrentImage = document.getElementById('get-current-image');
const btnGetOriginalImage = document.getElementById('get-original-image');
const btnFilterApply = document.getElementById('btn-filter-apply');
const grayscale = document.getElementById('grayscale');
const negative = document.getElementById('negative');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const tempImage = new Image();
const originalImage = new Image();

let historyChanges = [];
let currentPositionInHistory = -1;


btnLoad.addEventListener('change', loadImage, false);
btnSave.addEventListener('click', saveImage, false);
btnBack.addEventListener('click', () => {
    if (historyChanges.length === 0) {
        alert('Загрузите изображение!');
        return;
    }
    if (currentPositionInHistory > 0) {
        currentPositionInHistory--;
        drawByPosition(currentPositionInHistory);
    }
}, false);
btnForward.addEventListener('click', () => {
    if (historyChanges.length === 0) {
        alert('Загрузите изображение!');
        return;
    }
    if (currentPositionInHistory < historyChanges.length - 1) {
        currentPositionInHistory++;
        drawByPosition(currentPositionInHistory);
    }
}, false);
btnGetCurrentImage.addEventListener('click', () => {
    if (historyChanges.length === 0) {
        alert('Загрузите изображение!');
        return;
    }
    currentPositionInHistory = historyChanges.length - 1;
    drawByPosition(historyChanges.length - 1);
}, false);
btnGetOriginalImage.addEventListener('click', () => {
    if (historyChanges.length === 0) {
        alert('Загрузите изображение!');
        return;
    }
    drawByPosition(0);
}, false);
btnFilterApply.addEventListener('click', applyChanges, false);
grayscale.addEventListener('click', getGrayscale, false);
negative.addEventListener('click', getNegative, false);



function applyChanges() {
    tempImage.src = canvas.toDataURL("image/jpeg");
    historyPush(tempImage.src);
}

function historyPush(src) {
    historyChanges.push(src);
    currentPositionInHistory = historyChanges.length - 2;
    currentPositionInHistory++;
}

function deleteHistory() {
    historyChanges.length = 0;
    currentPositionInHistory = -1;
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
        deleteHistory();
        historyPush(event.target.result);
    }
    reader.readAsDataURL(e.target.files[0]);
}

function saveImage() {
    if (historyChanges.length === 0) {
        alert('Загрузите изображение!');
        return;
    }
    let link = document.createElement("a");
    document.body.appendChild(link);
    link.href = canvas.toDataURL("image/jpeg");
    link.download = "image_name.jpg";
    link.click();
}

function getGrayscale() {
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

function getNegative() {
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