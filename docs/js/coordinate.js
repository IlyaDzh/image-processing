const coord = document.getElementById('coord-bar');

canvas.addEventListener('mousemove', (e) => {
    let mul = canvas.height / canvas.offsetHeight;
    let rect = canvas.getBoundingClientRect();
    xCoord = Math.round((e.clientX - rect.left) * mul);
    yCoord = Math.round((e.clientY - rect.top) * mul);
    coord.textContent =  `x: ${Math.round(xCoord)}, y: ${Math.round(yCoord)}`;
}, false);