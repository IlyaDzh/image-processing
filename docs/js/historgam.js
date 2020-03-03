const profileBtn = document.getElementById('profile');
const horizontalRadio = document.getElementById('horizontalRadio');
const verticalRadio = document.getElementById('verticalRadio');

let yClick, xClick;
let horizontal = true;

profileBtn.addEventListener('click', () => {
    if (historyChanges.length === 0) {
        tata.error('Ошибка', 'Необходимо загрузить картинку!');
        return;
    }
    if (!yClick) {
        tata.error('Ошибка', 'Необходимо выбрать строку пикселей!');
        return;
    }
    drawByPosition(currentPositionInHistory);
    getProfile();
    yClick = null;
}, false);
horizontalRadio.addEventListener('click', () => {
    horizontal = true;
}, false);
verticalRadio.addEventListener('click', () => {
    horizontal = false;
}, false);
canvas.addEventListener('click', (e) => {
    if (historyChanges.length === 0) {
        tata.error('Ошибка', 'Необходимо загрузить картинку!');
        return;
    }
    drawByPosition(currentPositionInHistory);
    let mul = canvas.height / canvas.offsetHeight;
    let rect = canvas.getBoundingClientRect();
    yClick = Math.round((e.clientY - rect.top) * mul);
    xClick = Math.round((e.clientX - rect.left) * mul);
    horizontal ? ctx.strokeRect(0, yClick, canvas.width, 5) : ctx.strokeRect(xClick, 0, 5, canvas.height);
}, false);



function calcAndHist() {
    let r = [], g = [], b = [], pixelSum = [];
    const iD = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 0; i < 256; i++) { r[i] = 0; g[i] = 0; b[i] = 0; pixelSum[i] = 0; }
    for (let i = 0; i < iD.length; i += 4) {
        pixelSum[Math.round((iD[i] + iD[i + 1] + iD[i + 2]) / 3)]++;
        r[iD[i]]++;
        g[iD[i + 1]]++;
        b[iD[i + 2]]++;
    }
    drawHistogram(pixelSum, r, g, b);
}

function drawHistogram(pixelSum, r, g, b) {
    let options = {
        series: [
            { name: 'Red', data: r },
            { name: 'Green', data: g },
            { name: 'Blue', data: b },
            { name: 'RGB', data: pixelSum }
        ],
        chart: {
            zoom: false,
            type: 'bar',
            height: 350,
            width: 600,
            toolbar: {
                tools: {
                    pan: false
                }
            },
            animations: {
                speed: 300,
            }
        },
        legend: {
            fontSize: '15px',
            horizontalAlign: 'left',
            position: 'top',
            offsetX: 4
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 2
        },
        colors: ['#dc3545', '#28a745', '#007bff', '#000000'],
        yaxis: {
            title: {
                text: 'Количество пикселей',
                style: {
                    fontSize: '16px'
                }
            }
        },
        xaxis: {
            title: {
                text: 'Значение пикселя',
                style: {
                    fontSize: '16px'
                }
            },
            min: 0,
            max: 255
        }
    };
    let chart = new ApexCharts(document.getElementById("histogram-containers"), options);
    chart.render();
}



function getProfile() {
    Modal.alert({
        title: '<h5 style="margin-bottom: 0">Профиль яркости по трем цветовым каналам</h5>',
        message: '<div id="profile-container"></div>',
        profile: true
    });
    calcAndProfile();
}

function calcAndProfile() {
    let r = [], g = [], b = [];
    let iD;
    if (horizontal) {
        iD = ctx.getImageData(0, yClick, canvas.width, 1).data;
    } else {
        iD =ctx.getImageData(xClick, 0, 1, canvas.height).data;
    }
    for (let i = 0; i < iD.length; i += 4) {
        r.push(iD[i]);
        g.push(iD[i + 1]);
        b.push(iD[i + 2]);
    }
    drawProfile(r, g, b);
}

function drawProfile(r, g, b) {
    let options = {
        series: [
            { name: "Red", data: r },
            { name: "Green", data: g },
            { name: 'Blue', data: b }
        ],
        chart: {
            height: 350,
            type: 'line',
            animations: {
                enabled: false
            },
            toolbar: {
                tools: {
                    pan: false
                }
            }
        },
        legend: {
            fontSize: '16px',
            horizontalAlign: 'left',
            position: 'top',
            offsetX: 4
        },
        stroke: {
            curve: 'straight',
            lineCap: 'butt'
        },
        colors: ['#dc3545', '#28a745', '#007bff'],
        yaxis: {
            title: {
                text: 'Яркость',
                style: {
                    fontSize: '16px'
                },
            },
            min: 0,
            max: 255
        },
        xaxis: {
            type: 'numeric',
            labels: {
                show: true
            },
            title: {
                text: 'Длина',
                style: {
                    fontSize: '16px'
                },
            },
            min: 0,
            max: horizontal ? canvas.width : canvas.height
        },
        grid: {
            borderColor: '#f1f1f1',
        }
    };
    let chart = new ApexCharts(document.getElementById("profile-container"), options);
    chart.render();
}