let grafico = null;

function limpiarNumero(texto) {
  return parseFloat(texto.replace(/\./g, '').replace(',', '.'));
}

function formatearMilesEnTiempoReal(input) {
  input.addEventListener('input', function () {
    let valor = input.value.replace(/\./g, '').replace(/[^\d]/g, '');
    if (valor === "") return;
    let numero = parseInt(valor, 10);
    if (!isNaN(numero)) {
      input.value = numero.toLocaleString('es-ES');
    }
  });
}

function permitirComaEnMargen(input) {
  input.addEventListener('input', function () {
    let valor = input.value
      .replace(/[^\d,]/g, '')    // solo números y comas
      .replace(/,+/g, ',')        // solo una coma
      .replace(/^,/, '');         // no empezar con coma
    input.value = valor;
  });
}

window.onload = function () {
  formatearMilesEnTiempoReal(document.getElementById('asesoramiento'));
  formatearMilesEnTiempoReal(document.getElementById('rto'));
  permitirComaEnMargen(document.getElementById('margen'));
};

function calcular() {
  const asesoramiento = limpiarNumero(document.getElementById('asesoramiento').value);
  const rto = limpiarNumero(document.getElementById('rto').value);
  const margen = limpiarNumero(document.getElementById('margen').value);

  const operativo = document.getElementById('operativo').value;
  const saldos = document.getElementById('saldos').value;
  const permanencia = document.getElementById('permanencia').value;

  const resultado = document.getElementById('resultado');
  resultado.innerHTML = "";

  if (isNaN(asesoramiento) || isNaN(rto) || isNaN(margen)) {
    resultado.innerHTML = "<span style='color:red;'>❌ Error: Introduce valores numéricos válidos.</span>";
    return;
  }

  const saldoCartera = asesoramiento + rto;

  let criteriosCumplidos = 0;
  if (operativo === 'Sí') criteriosCumplidos++;
  if (saldos === 'Sí') criteriosCumplidos++;
  if (permanencia === 'Sí') criteriosCumplidos++;

  const porcentajeAdicional = { 0: 0.00, 1: 0.001, 2: 0.004, 3: 0.006 }[criteriosCumplidos];

  const cuantitativo = (asesoramiento * 0.0030) + (rto * 0.0020) + (asesoramiento * porcentajeAdicional);
  const cualitativoMax = (cuantitativo * 30) / 70;
  const cualitativo = cualitativoMax * (criteriosCumplidos / 3);

  const comisionBruta = cuantitativo + cualitativo;
  const comisionMaxima = saldoCartera * (margen / 100) * 0.75;
  const comisionFinal = Math.min(comisionBruta, comisionMaxima);

  resultado.innerHTML = `
    <strong>Comisión por Criterios Cuantitativos:</strong> ${cuantitativo.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €<br>
    <strong>Comisión por Criterios Cualitativos:</strong> ${cualitativo.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €<br>
    <strong>Comisión Total antes de ajuste:</strong> ${comisionBruta.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €<br>
    <strong>Comisión Total FINAL (ajustada a máximo 75% del margen de la Aseguradora):</strong> ${comisionFinal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
    <br><br>
    <div style="height:250px;">
      <canvas id="graficoComisiones"></canvas>
    </div>
  `;

  dibujarGrafico(cuantitativo, cualitativo, comisionFinal);
}

function dibujarGrafico(cuantitativo, cualitativo, comisionFinal) {
  const ctx = document.getElementById('graficoComisiones').getContext('2d');

  if (grafico) grafico.destroy();

  grafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Cuantitativo', 'Cualitativo', 'Final'],
      datasets: [{
        label: 'Comisiones (€)',
        data: [cuantitativo, cualitativo, comisionFinal],
        backgroundColor: ['#2a9d8f', '#f4a261', '#e76f51']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#000', // Texto negro
            generateLabels: function (chart) {
              const dataset = chart.data.datasets[0];
              return [{
                text: dataset.label,
                fillStyle: '#e76f51', // Cuadro rojo
                strokeStyle: '#e76f51',
                lineWidth: 1,
                hidden: false,
                index: 2
              }];
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
