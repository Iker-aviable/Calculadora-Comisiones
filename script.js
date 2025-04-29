let grafico = null; // Variable global para el gráfico

function formatearNumero(num) {
  return num.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function limpiarNumero(texto) {
  return parseFloat(texto.replace(/\./g, '').replace(',', '.'));
}

function formatearInput(input) {
  input.addEventListener('input', function () {
    let valor = input.value.replace(/\./g, '').replace(',', '.');
    if (!isNaN(valor) && valor.trim() !== '') {
      let num = parseFloat(valor);
      input.value = num.toLocaleString('es-ES', {
        maximumFractionDigits: 0
      });
    }
  });
}

// Formatear entradas en vivo
window.onload = function () {
  formatearInput(document.getElementById('asesoramiento'));
  formatearInput(document.getElementById('rto'));
  formatearInput(document.getElementById('margen'));
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
    <strong>Comisión por Criterios Cuantitativos:</strong> ${formatearNumero(cuantitativo)} €<br>
    <strong>Comisión por Criterios Cualitativos:</strong> ${formatearNumero(cualitativo)} €<br>
    <strong>Comisión Total antes de ajuste:</strong> ${formatearNumero(comisionBruta)} €<br>
    <strong>Comisión Total FINAL (ajustada a máximo 75% del margen de la Aseguradora):</strong> ${formatearNumero(comisionFinal)} €
  `;

  dibujarGrafico(cuantitativo, cualitativo, comisionFinal);
}

function dibujarGrafico(cuantitativo, cualitativo, comisionFinal) {
  const ctx = document.getElementById('graficoComisiones').getContext('2d');

  if (grafico) {
    grafico.destroy();
  }

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
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
