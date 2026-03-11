let projectionChart;

function initCharts() {
    const ctx = document.getElementById('projectionChart').getContext('2d');
    
    projectionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [2026, 2030, 2035, 2040, 2045, 2050],
            datasets: [{
                label: 'Sea Level Rise (mm)',
                data: [0, 0, 0, 0, 0, 0],
                borderColor: '#00f2ff',
                backgroundColor: 'rgba(0, 242, 255, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: '#00f2ff'
            },
            {
                label: 'Flood Prob (%)',
                data: [0, 0, 0, 0, 0, 0],
                borderColor: '#ffdd00',
                borderDash: [5, 5],
                tension: 0.4,
                borderWidth: 1,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8', font: { size: 10 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8', font: { size: 10 } }
                }
            }
        }
    });
}

function updateCharts(projectionData) {
    if (!projectionChart) return;

    projectionChart.data.datasets[0].data = projectionData.filter(p => [2026, 2030, 2035, 2040, 2045, 2050].includes(p.year)).map(p => p.increase);
    projectionChart.data.datasets[1].data = projectionData.filter(p => [2026, 2030, 2035, 2040, 2045, 2050].includes(p.year)).map(p => p.floodProbability);
    
    projectionChart.update();
}

window.addEventListener('DOMContentLoaded', initCharts);
