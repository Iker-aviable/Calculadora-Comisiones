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
  `;
}
