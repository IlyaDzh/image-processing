const coord = document.getElementsByClassName('coord-bar__numbers')[0];
const hist_visibility = document.getElementsByClassName('coord-bar__hist')[0];

let displayHist = true;

canvas.addEventListener('mousemove', (e) => {
    let mul = canvas.height / canvas.offsetHeight;
    let rect = canvas.getBoundingClientRect();
    xCoord = Math.round((e.clientX - rect.left) * mul);
    yCoord = Math.round((e.clientY - rect.top) * mul);
    coord.textContent = `x: ${Math.round(xCoord)}, y: ${Math.round(yCoord)}`;
}, false);

hist_visibility.addEventListener('click', () => {
    if (displayHist) {
        histContainer.style = 'display: none';
        hist_visibility.innerHTML = 'Показать гистограмму';
        displayHist = false;
    } else {
        histContainer.style = 'display: block; min-height: 365px';
        hist_visibility.innerHTML = 'Скрыть гистограмму';
        displayHist = true;
        setTimeout(() => calcAndHist(), 500);
    }
}, false);