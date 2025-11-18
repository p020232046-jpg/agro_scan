const introScreen = document.getElementById("intro-screen");
const mainScreen = document.getElementById("main-screen");

const focusModeSelect = document.getElementById("focus-mode");
const livestockTypeChecks = document.querySelectorAll(".livestock-type-check");

const numAnimalInput = document.getElementById("num-animal");
const numChipInput = document.getElementById("num-chip");
const fieldCoordsInput = document.getElementById("field-coords");
const fieldAreaInput = document.getElementById("field-area");
const soilTypeSelect = document.getElementById("soil-type");
const irrigationSystemSelect = document.getElementById("irrigation-system");
const predioAliasInput = document.getElementById("predio-alias");

const btnStart = document.getElementById("btn-start");
const btnEdit = document.getElementById("btn-edit");

const summaryFocus = document.getElementById("summary-focus");
const summaryGanado = document.getElementById("summary-ganado");
const summaryField = document.getElementById("summary-field");

const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

/* Ganadería */
const sensorTemp = document.getElementById("sensor-temp");
const sensorHr = document.getElementById("sensor-hr");
const sensorAct = document.getElementById("sensor-act");
const sensorIr = document.getElementById("sensor-ir");
const btnRefreshLivestock = document.getElementById("btn-refresh-livestock");
const livestockStatus = document.getElementById("livestock-status");
const livestockSuggestions = document.getElementById("livestock-suggestions");

const animalTypeSelect = document.getElementById("animal-type");
const animalIdInput = document.getElementById("animal-id");
const animalChipInput = document.getElementById("animal-chip");
const animalAgeInput = document.getElementById("animal-age");
const animalWeightInput = document.getElementById("animal-weight");
const animalStageSelect = document.getElementById("animal-stage");
const btnAddAnimal = document.getElementById("btn-add-animal");
const animalSelect = document.getElementById("animal-select");
const animalSummaryPill = document.getElementById("animal-summary-pill");

/* Agricultura */
const soilMoistureInput = document.getElementById("soil-moisture");
const airTempInput = document.getElementById("air-temp");
const cropTypeSelect = document.getElementById("crop-type");
const irrigationFrequencySelect = document.getElementById("irrigation-frequency");
const btnCalcIrrigation = document.getElementById("btn-calc-irrigation");
const irrigationResult = document.getElementById("irrigation-result");

const fertTypeSelect = document.getElementById("fert-type");
const pressureLevelSelect = document.getElementById("pressure-level");
const btnCalcFert = document.getElementById("btn-calc-fert");
const fertResult = document.getElementById("fert-result");

const mapIframe = document.getElementById("map-iframe");

let sessionData = {
  focusMode: "ambas",
  livestockTypes: ["bovino"],
  tipoGanado: "bovino",
  numAnimal: "",
  numChip: "",
  fieldCoords: "",
  fieldArea: 0,
  soilType: "franco",
  irrigationSystem: "gravedad",
  predioAlias: "",
  animals: [],
  selectedAnimalId: ""
};

// Helpers

function formatTipoGanado(tipo) {
  switch (tipo) {
    case "bovino":
      return "Bovino";
    case "ovino":
      return "Ovino";
    case "porcino":
      return "Porcino";
    case "aves":
      return "Gallos y gallinas";
    default:
      return "Sin especificar";
  }
}

function formatFocusMode(mode) {
  if (mode === "ganaderia") return "Solo ganadería";
  if (mode === "agricultura") return "Solo agricultura";
  return "Ganadería y agricultura";
}

function updateSummary() {
  summaryFocus.textContent = `Modo: ${formatFocusMode(sessionData.focusMode)}`;

  const ganados = (sessionData.livestockTypes || []).map(formatTipoGanado);
  const countAnimals = sessionData.animals.length;

  if (sessionData.focusMode === "agricultura") {
    summaryGanado.textContent = "Ganado: no aplicado (solo agricultura)";
  } else if (!ganados.length) {
    summaryGanado.textContent = "Ganado: sin registrar";
  } else {
    const typesLabel = ganados.join(", ");
    const countLabel = countAnimals > 0 ? ` | ${countAnimals} animales` : "";
    summaryGanado.textContent = `Ganado: ${typesLabel}${countLabel}`;
  }

  let fieldLabel = "";
  if (sessionData.predioAlias) {
    fieldLabel += sessionData.predioAlias;
  } else if (sessionData.fieldCoords) {
    fieldLabel += sessionData.fieldCoords;
  }

  if (!fieldLabel) {
    summaryField.textContent = "Predio sin localizar";
  } else if (sessionData.fieldArea) {
    summaryField.textContent = `Predio: ${fieldLabel} | ${sessionData.fieldArea} ha`;
  } else {
    summaryField.textContent = `Predio: ${fieldLabel}`;
  }
}

function updateMap() {
  const query = sessionData.fieldCoords?.trim();
  if (!query) {
    mapIframe.src = "";
    return;
  }
  const encoded = encodeURIComponent(query);
  mapIframe.src = `https://www.google.com/maps?q=${encoded}&output=embed`;
}

function updateLivestockVisibility() {
  const mode = focusModeSelect.value;
  const group = document.getElementById("livestock-types-group");
  const tabGanaderiaBtn = document.querySelector('[data-tab="tab-ganaderia"]');
  const tabGanaderia = document.getElementById("tab-ganaderia");

  if (mode === "agricultura") {
    group.style.display = "none";
    tabGanaderiaBtn.style.display = "none";
    if (tabGanaderia.classList.contains("active")) {
      document.querySelector('[data-tab="tab-agricultura"]').click();
    }
  } else {
    group.style.display = "block";
    tabGanaderiaBtn.style.display = "inline-flex";
  }
}

focusModeSelect.addEventListener("change", updateLivestockVisibility);

// Animal helpers

function renderAnimalSelect() {
  animalSelect.innerHTML = "";
  if (!sessionData.animals.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Sin animales registrados";
    animalSelect.appendChild(opt);
    sessionData.selectedAnimalId = "";
    animalSummaryPill.textContent = "0 animales registrados";
    return;
  }

  sessionData.animals.forEach((animal) => {
    const opt = document.createElement("option");
    opt.value = animal.id;
    opt.textContent = `${formatTipoGanado(animal.tipo)} | #${animal.numero || "-"} (${animal.chip || "sin chip"})`;
    animalSelect.appendChild(opt);
  });

  if (!sessionData.selectedAnimalId) {
    sessionData.selectedAnimalId = sessionData.animals[0].id;
  }
  animalSelect.value = sessionData.selectedAnimalId;

  const count = sessionData.animals.length;
  animalSummaryPill.textContent = `${count} animal${count !== 1 ? "es" : ""} registrado${count !== 1 ? "s" : ""}`;
}

function getSelectedAnimal() {
  if (!sessionData.selectedAnimalId) return null;
  return sessionData.animals.find((a) => a.id === sessionData.selectedAnimalId) || null;
}

// Navegación

btnStart.addEventListener("click", () => {
  const mode = focusModeSelect.value;
  sessionData.focusMode = mode;

  const selectedTypes = Array.from(livestockTypeChecks)
    .filter((c) => c.checked)
    .map((c) => c.value);
  sessionData.livestockTypes = mode === "agricultura" ? [] : selectedTypes;
  sessionData.tipoGanado = selectedTypes[0] || "";

  sessionData.numAnimal = numAnimalInput.value.trim();
  sessionData.numChip = numChipInput.value.trim();
  const coords = fieldCoordsInput.value.trim();
  sessionData.fieldCoords = coords;

  const area = parseFloat(fieldAreaInput.value);
  sessionData.fieldArea = !isNaN(area) && area > 0 ? area : 0;

  sessionData.soilType = soilTypeSelect.value;
  sessionData.irrigationSystem = irrigationSystemSelect.value;
  sessionData.predioAlias = predioAliasInput.value.trim();

  // Prellenar primer animal si aplica
  sessionData.animals = [];
  sessionData.selectedAnimalId = "";

  if (sessionData.focusMode !== "agricultura" && (sessionData.numAnimal || sessionData.numChip)) {
    const firstType = sessionData.tipoGanado || "bovino";
    const firstAnimal = {
      id: `a-${Date.now()}`,
      tipo: firstType,
      numero: sessionData.numAnimal,
      chip: sessionData.numChip,
      edad: "",
      peso: "",
      etapa: "engorda"
    };
    sessionData.animals.push(firstAnimal);
    sessionData.selectedAnimalId = firstAnimal.id;
  }

  renderAnimalSelect();
  updateLivestockVisibility();
  updateSummary();
  updateMap();
  generateLivestockReading();

  introScreen.classList.remove("active");
  mainScreen.classList.add("active");
});

btnEdit.addEventListener("click", () => {
  focusModeSelect.value = sessionData.focusMode;
  updateLivestockVisibility();

  livestockTypeChecks.forEach((c) => {
    c.checked = sessionData.livestockTypes.includes(c.value);
  });

  numAnimalInput.value = sessionData.numAnimal;
  numChipInput.value = sessionData.numChip;
  fieldCoordsInput.value = sessionData.fieldCoords;
  fieldAreaInput.value = sessionData.fieldArea || "";
  soilTypeSelect.value = sessionData.soilType || "franco";
  irrigationSystemSelect.value = sessionData.irrigationSystem || "gravedad";
  predioAliasInput.value = sessionData.predioAlias || "";

  mainScreen.classList.remove("active");
  introScreen.classList.add("active");
});

// Tabs

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;
    tabButtons.forEach((b) => b.classList.toggle("active", b === btn));
    tabPanels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === target);
    });
  });
});

// GANADERÍA: registro de animales

btnAddAnimal.addEventListener("click", () => {
  if (sessionData.focusMode === "agricultura") {
    alert("El modo actual es solo agricultura. Cambia el enfoque para registrar ganado.");
    return;
  }

  const tipo = animalTypeSelect.value;
  const numero = animalIdInput.value.trim();
  const chip = animalChipInput.value.trim();
  const edad = animalAgeInput.value.trim();
  const peso = animalWeightInput.value.trim();
  const etapa = animalStageSelect.value;

  if (!numero && !chip) {
    alert("Ingresa al menos el número de animal o el número de chip.");
    return;
  }

  const newAnimal = {
    id: `a-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    tipo,
    numero,
    chip,
    edad,
    peso,
    etapa
  };

  sessionData.animals.push(newAnimal);
  sessionData.tipoGanado = tipo;
  sessionData.selectedAnimalId = newAnimal.id;

  animalIdInput.value = "";
  animalChipInput.value = "";
  animalAgeInput.value = "";
  animalWeightInput.value = "";

  renderAnimalSelect();
  updateSummary();
  generateLivestockReading();
});

animalSelect.addEventListener("change", () => {
  sessionData.selectedAnimalId = animalSelect.value;
  const animal = getSelectedAnimal();
  if (animal) {
    sessionData.tipoGanado = animal.tipo;
  }
  generateLivestockReading();
});

// GANADERÍA: simulación de sensores

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function formatNumber(num, decimals = 1) {
  return num.toFixed(decimals).replace(".", ",");
}

function generateLivestockReading() {
  if (sessionData.focusMode === "agricultura") {
    livestockStatus.textContent = "El modo actual está enfocado solo en agricultura.";
    livestockStatus.className = "status-text";
    livestockSuggestions.innerHTML = "";
    sensorTemp.textContent = "-";
    sensorHr.textContent = "-";
    sensorAct.textContent = "-";
    sensorIr.textContent = "-";
    return;
  }

  const tipoRef = sessionData.tipoGanado;
  if (!tipoRef) {
    livestockStatus.textContent = "No se ha seleccionado tipo de ganado. Agrega un animal al listado.";
    livestockStatus.className = "status-text";
    livestockSuggestions.innerHTML = "";
    sensorTemp.textContent = "-";
    sensorHr.textContent = "-";
    sensorAct.textContent = "-";
    sensorIr.textContent = "-";
    return;
  }

  let tempBase = 38.5;
  let hrBase = 70;
  let actBase = 100;
  if (tipoRef === "ovino" || tipoRef === "porcino") {
    tempBase = 39;
    hrBase = 80;
  }
  if (tipoRef === "aves") {
    tempBase = 41;
    hrBase = 280;
    actBase = 120;
  }

  const temp = tempBase + randomRange(-0.7, 1.6);
  const hr = hrBase + randomRange(-15, 25);
  const act = actBase + randomRange(-40, 40);
  const ir = temp + randomRange(-0.3, 0.7);

  sensorTemp.textContent = `${formatNumber(temp)} °C`;
  sensorHr.textContent = `${Math.round(hr)} lpm`;
  sensorAct.textContent = `${Math.max(20, Math.round(act))} pasos/h`;
  sensorIr.textContent = `${formatNumber(ir)} °C`;

  evaluateLivestock(temp, hr, act, ir, tipoRef);
}

function evaluateLivestock(temp, hr, act, ir, tipoGanado) {
  livestockSuggestions.innerHTML = "";
  livestockStatus.className = "status-text";

  let riskScore = 0;
  const tips = [];

  const highFever = tipoGanado === "aves" ? temp > 42.5 : temp > 40.5;
  const mildFever = tipoGanado === "aves"
    ? temp > 41.7
    : temp > 39.5;

  if (highFever) {
    riskScore += 3;
    tips.push("Posible fiebre alta: revisar mucosas, apetito y respiración.");
  } else if (mildFever) {
    riskScore += 1;
    tips.push("Temperatura ligeramente elevada: vigilar evolución en las próximas horas.");
  }

  if (hr > (tipoGanado === "aves" ? 330 : 100)) {
    riskScore += 2;
    tips.push("Frecuencia cardíaca alta: posible estrés por calor, dolor o infección.");
  }

  if (act < (tipoGanado === "aves" ? 90 : 70)) {
    riskScore += 1;
    tips.push("Actividad baja detectada por el chip: revisar cojera o apatía.");
  }

  if (Math.abs(ir - temp) > 1.5) {
    riskScore += 1;
    tips.push("Diferencias térmicas superficiales: posible inflamación localizada.");
  }

  if (riskScore <= 1) {
    livestockStatus.textContent = "Estado general: estable. Sin signos claros de estrés.";
    livestockStatus.classList.add("ok");
    if (!tips.length) {
      tips.push("Continuar monitoreo rutinario y revisar agua y sombra suficiente.");
    }
  } else if (riskScore <= 3) {
    livestockStatus.textContent = "Estado general: alerta moderada.";
    livestockStatus.classList.add("warning");
    tips.push("Revisar de cerca al animal y registrar si hay tos, secreciones o diarrea.");
  } else {
    livestockStatus.textContent = "Estado general: ALTA probabilidad de estrés o enfermedad.";
    livestockStatus.classList.add("danger");
    tips.push("Se recomienda contactar a un médico veterinario y aislar al animal si es necesario.");
  }

  livestockSuggestions.innerHTML = tips.map((t) => `<li>${t}</li>`).join("");
}

btnRefreshLivestock.addEventListener("click", generateLivestockReading);

// AGRICULTURA: riego

btnCalcIrrigation.addEventListener("click", () => {
  const soil = parseFloat(soilMoistureInput.value);
  const temp = parseFloat(airTempInput.value);
  const crop = cropTypeSelect.value;
  const freq = irrigationFrequencySelect.value;
  const area = sessionData.fieldArea || 1;
  const soilType = sessionData.soilType || "franco";
  const irrigationSystem = sessionData.irrigationSystem || "gravedad";

  if (isNaN(soil) || isNaN(temp)) {
    irrigationResult.textContent = "Ingresa la humedad del suelo y la temperatura ambiente.";
    return;
  }

  let base = 5; // litros/m²
  if (crop === "maiz") base = 6;
  if (crop === "hortalizas") base = 7;

  if (soil > 60) base *= 0.5;
  else if (soil < 30) base *= 1.3;

  if (temp > 30) base *= 1.2;
  if (temp < 18) base *= 0.8;

  if (freq === "baja") base *= 1.4;
  if (freq === "alta") base *= 0.7;

  if (soilType === "arenoso") base *= 1.15;
  if (soilType === "arcilloso") base *= 0.9;

  if (irrigationSystem === "goteo") base *= 0.85;
  if (irrigationSystem === "gravedad") base *= 1.1;

  const perM2 = Math.max(2, Math.round(base));
  const total = Math.round(perM2 * area * 10000) / 1000; // m³ aproximados

  irrigationResult.textContent =
    `Riego sugerido: ${perM2} L/m² por evento (${total.toFixed(1)} m³ ` +
    `para ${area.toFixed(2)} ha). Ajustado según el medidor de humedad, el clima, el tipo de suelo y el sistema de riego.`;
});

// AGRICULTURA: fertilizante y plaguicidas

btnCalcFert.addEventListener("click", () => {
  const fertType = fertTypeSelect.value;
  const pressure = pressureLevelSelect.value;
  const area = sessionData.fieldArea || 1;

  let fertKgHa = fertType === "organico" ? 1200 : 180;
  let pestLHa = 0.8;

  if (pressure === "baja") {
    fertKgHa *= 0.8;
    pestLHa *= 0.6;
  } else if (pressure === "alta") {
    fertKgHa *= 1.2;
    pestLHa *= 1.3;
  }

  const totalFert = Math.round(fertKgHa * area);
  const totalPest = Math.round(pestLHa * area * 10) / 10;

  const fertLabel = fertType === "organico" ? "kg de abono orgánico" : "kg de fertilizante químico";

  fertResult.textContent =
    `Dosis estimada: ${Math.round(fertKgHa)} ${fertLabel} / ha y ` +
    `${pestLHa.toFixed(2)} L de plaguicida / ha. ` +
    `Para ${area.toFixed(2)} ha: ${totalFert} kg de abono y ${totalPest} L de plaguicida. ` +
    `Verifica siempre con la etiqueta del producto y recomendaciones técnicas locales.`;
});

// Estado inicial mapa (vacío)
updateMap();
updateLivestockVisibility();
renderAnimalSelect();
updateSummary();