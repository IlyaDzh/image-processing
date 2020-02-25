const histogramBtn = document.getElementById('histogram');
const profileBtn = document.getElementById('profile');

let activeColor = 'red';
let yAxis = false;

histogramBtn.addEventListener('click', () => {
    if (historyChanges.length === 0) {
        tata.error('Ошибка', 'Необходимо загрузить картинку!');
        return;
    }
    getHistogram();
}, false);
profileBtn.addEventListener('click', () => {
    if (historyChanges.length === 0) {
        tata.error('Ошибка', 'Необходимо загрузить картинку!');
        return;
    }
    getProfile();
}, false);

function getHistogram() {
    Modal.alert({
        title: '<h5 style="margin-bottom: 0">Гистограмма по яркости и трем цветовым каналам</h5>',
        message: `
            <div class="row">
                <button id="red" class="focuser btn btn-info mr-1 btn-sm">R</button>
                <button id="green" class="focuser btn btn-info mr-1 btn-sm">G</button>
                <button id="blue" class="focuser btn btn-info mr-1 btn-sm">B</button>
                <button id="sum" class="focuser btn btn-info mr-1 btn-sm">Sum</button>
                <button id="blend" class="focuser btn btn-info btn-sm">All</button>
            </div>
            <div class="row"><svg width="1" height="1"></svg></div>
        `,
        graphics: true
    });
    calcAndGraph();
    document.querySelectorAll("button.focuser").forEach(button => {
        button.addEventListener("click", amplify);
    });
}

function getProfile() {

}

function amplify(e) {
    const colors = ['red', 'green', 'blue', 'sum'];
    const boost = e.target.id;
    if (boost == 'blend') {
        document.querySelectorAll('rect').forEach(bar => {
            bar.style.opacity = 0.7;
        });
    }
    else {
        activeColor = boost;
        const deaden = colors.filter(e => e !== boost);
        document.querySelectorAll('.bar-' + boost).forEach(bar => {
            bar.style.opacity = 1.0;
        });
        deaden.forEach(color => {
            document.querySelectorAll('.bar-' + color).forEach(bar => {
                bar.style.opacity = 0.2;
            });
        });
    }
}

function histogram(data) {
    let W = 800
    let H = W / 1.8;
    const svg = d3.select('svg');
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = W - margin.left - margin.right;
    const height = H - margin.top - margin.bottom;
    let q = document.querySelector('svg');
    q.style.width = W;
    q.style.height = H;
    if (yAxis) { d3.selectAll("g.y-axis").remove(); yAxis = false; }

    function graphComponent(dataC, color) {
        d3.selectAll(".bar-" + color).remove();
        let data = Object.keys(dataC).map(function (key) { return { freq: dataC[key], idx: +key } });
        let x = d3.scaleLinear()
            .range([0, width])
            .domain([0, d3.max(data, function (d) { return d.idx; })]);
        let y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(data, function (d) { return d.freq; })]);
        let g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        if (!yAxis) {
            yAxis = true;
            g.append("g")
                .attr("class", "y-axis")
                .attr("transform", "translate(" + -2 + ",0)")
                .call(d3.axisLeft(y).ticks(10).tickSizeInner(10).tickSizeOuter(2));
        }
        g.selectAll(".bar-" + color)
            .data(data)
            .enter().append("rect")
            .attr("class", "bar-" + color)
            .attr("fill", color)
            .attr("x", function (d) { return x(d.idx); })
            .attr("y", function (d) { return y(d.freq); })
            .attr("width", 2)
            .attr("opacity", 0.8)
            .attr("height", function (d) { return height - y(d.freq); })
    }

    graphComponent(data.rD, "red");
    graphComponent(data.gD, "green");
    graphComponent(data.bD, "blue");
    graphComponent(data.pixelSum, "sum");
}

function calcAndGraph() {
    let rD = {}, gD = {}, bD = {};
    let pixelSum = {};
    const iD = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 0; i < 256; i++) { rD[i] = 0; gD[i] = 0; bD[i] = 0; }
    for (let i = 0; i <= 765; i++) { pixelSum[i] = 0; }
    for (let i = 0; i < iD.length; i += 4) {
        // pixelSum[Math.round(0.3 * iD[i] + 0.59 * iD[i + 1] + 0.1 * iD[i + 2])]++;
        pixelSum[iD[i] + iD[i + 1] + iD[i + 2]]++;
        rD[iD[i]]++;
        gD[iD[i + 1]]++;
        bD[iD[i + 2]]++;
    }
    histogram({ pixelSum, rD, gD, bD });
}