const coord = document.getElementsByClassName('coord-bar');

canvas.addEventListener('mousemove', (e) => {
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    coord[0].textContent =  `x: ${Math.round(x)}, y: ${y}`;
}, false);