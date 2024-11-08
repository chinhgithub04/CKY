const startTime = "2024-10-20T00:00+00:00";
const endTime = new Date().toISOString().split('T')[0] + "T23:59+00:00";
const apiUrl = `https://api.gridstatus.io/v1/datasets/caiso_fuel_mix/query?api_key=0287b26403464cf3921101a5c07e97b4&start_time=${startTime}&end_time=${endTime}&limit=1000`;

async function fetchData() {
    const response = await fetch(apiUrl);
    const result = await response.json();
    console.log(result.data);
    return result.data;
}

function plotData(data) {
    const time = data.map(item => item.interval_start_utc);
    const coal = data.map(item => item.coal);
    const gas = data.map(item => item.natural_gas);
    const wind = data.map(item => item.wind);
    const solar = data.map(item => item.solar);
    const nuclear = data.map(item => item.nuclear);
    const hydro = data.map(item => item.large_hydro + item.small_hydro);
    const other = data.map(item => item.other);

    const traces = [
        { x: time, y: coal, mode: 'lines+markers', name: 'Coal' },
        { x: time, y: gas, mode: 'lines+markers', name: 'Natural Gas' },
        { x: time, y: wind, mode: 'lines+markers', name: 'Wind' },
        { x: time, y: solar, mode: 'lines+markers', name: 'Solar' },
        { x: time, y: nuclear, mode: 'lines+markers', name: 'Nuclear' },
        { x: time, y: hydro, mode: 'lines+markers', name: 'Hydro' },
        { x: time, y: other, mode: 'lines+markers', name: 'Other' }
    ];

    const layout = {
        title: 'Fuel Mix Over Time',
        xaxis: { title: 'Time', tickangle: -45 },
        yaxis: { title: 'Amount (in MW)' },
        showlegend: true
    };

    Plotly.newPlot('plots', traces, layout);

    const totals = {
        coal: coal.reduce((a, b) => a + b, 0),
        gas: gas.reduce((a, b) => a + b, 0),
        wind: wind.reduce((a, b) => a + b, 0),
        solar: solar.reduce((a, b) => a + b, 0),
        nuclear: nuclear.reduce((a, b) => a + b, 0),
        hydro: hydro.reduce((a, b) => a + b, 0),
        other: other.reduce((a, b) => a + b, 0)
    };

    const summaryTrace = [{
        x: Object.keys(totals),
        y: Object.values(totals),
        type: 'bar',
        marker: { color: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2'] }
    }];

    const summaryLayout = {
        title: 'Total Generation by Fuel Type',
        xaxis: { title: 'Fuel Type' },
        yaxis: { title: 'Total Amount (in MW)' }
    };

    Plotly.newPlot('summaryPlot', summaryTrace, summaryLayout);

    const individualTraces = [
        { id: 'coalPlot', y: coal, title: 'Coal' },
        { id: 'gasPlot', y: gas, title: 'Natural Gas' },
        { id: 'windPlot', y: wind, title: 'Wind' },
        { id: 'solarPlot', y: solar, title: 'Solar' },
        { id: 'nuclearPlot', y: nuclear, title: 'Nuclear' },
        { id: 'hydroPlot', y: hydro, title: 'Hydro' },
        { id: 'otherPlot', y: other, title: 'Other' }
    ];

    individualTraces.forEach(trace => {
        Plotly.newPlot(trace.id, [{
            x: time,
            y: trace.y,
            mode: 'lines+markers',
            name: trace.title
        }], {
            title: trace.title + ' Over Time',
            xaxis: { title: 'Time', tickangle: -45 },
            yaxis: { title: 'Amount (in MW)' }
        });
    });
}

fetchData().then(data => plotData(data)).catch(error => console.error("Error fetching data:", error));