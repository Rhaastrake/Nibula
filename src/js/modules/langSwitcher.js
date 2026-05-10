//==========================
// LANG-SWITCHER MODULE
//==========================

export let currentLang = null;
export let langKeys = null;

async function loadLangKeys() {
  if (langKeys) return langKeys;
  const response = await fetch("/data/lang.json");
  langKeys = await response.json();
  return langKeys;
}

export async function initLangSwitcher() {
  const data = await loadLangKeys();
  const availableLangs = Object.keys(data);
  const fallbackLang = document.documentElement.lang || availableLangs[0];
  const initialLang = await getInitialLang(availableLangs, fallbackLang);

  applyLanguage(initialLang, data);

  function handleLangChange(value) {
    localStorage.setItem("language", value);
    applyLanguage(value, data);
  }

  // Radio buttons
  document.querySelectorAll("input[type='radio'][name='lang-button']").forEach((radio) => {
    if (radio.value === initialLang) radio.checked = true;
    radio.addEventListener("change", () => handleLangChange(radio.value));
  });

  // Select
  document.querySelectorAll("select#lang-select").forEach((select) => {
    select.value = initialLang;
    select.addEventListener("change", () => handleLangChange(select.value));
  });
}

async function getInitialLang(availableLangs, fallbackLang) {
  if (localStorage.getItem("language")) return localStorage.getItem("language");
  const browserLang = navigator.language.slice(0, 2);
  return availableLangs.includes(browserLang) ? browserLang : fallbackLang;
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function applyLanguage(lang, data) {
  currentLang = lang;
  langKeys = data;
  const langData = data[lang];

  document.querySelectorAll("[data-lang-key]").forEach((element) => {
    const key = element.dataset.langKey;
    const value = getNestedValue(langData, key);
    if (value) element.textContent = value;
  });

  document.querySelectorAll("[data-lang-placeholder]").forEach((element) => {
    const key = element.dataset.langPlaceholder;
    const value = getNestedValue(langData, key);
    if (value) element.setAttribute("placeholder", value);
  });

  document.documentElement.lang = lang;
}