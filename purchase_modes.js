(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PXMPurchaseModes = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const MINIMUM = 150000;
  const normalize = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const integer = (value, label) => {
    const n = Number(value);
    if (!Number.isSafeInteger(n) || n <= 0 || n > 1000000) throw new Error(`${label}: ingresá un entero positivo.`);
    return n;
  };
  function stockFactor(presentation, stockUnit) {
    const text = normalize(presentation);
    const pack = text.match(/pack\s*x\s*(\d+)/);
    if (pack) return integer(pack[1], "Presentación");
    return /docena/.test(text) && stockUnit !== "docenas" ? 12 : 1;
  }
  function baseKind(product) {
    if (product.stockUnit === "docenas" || /docena/i.test(product.presentation || "")) return "dozen";
    if (/unidad|pack/i.test(product.presentation || "")) return "unit";
    return "presentation";
  }
  function seed(product, rule = {}, mixGroup = null) {
    const kind = rule.goldsun ? "valijita" : rule.dozen || rule.completeDozen ? "dozen" : baseKind(product);
    const variant = normalize(product.label || product.optionName).replace(/^talle\s*:?\s*/, "");
    const allowed = rule.minSize === undefined || /^\d+$/.test(variant) && Number(variant) >= rule.minSize && Number(variant) <= rule.maxSize;
    return {
      mode: rule.pack || rule.completeDozen ? "custom" : "same",
      quantity: rule.pack || 1,
      enabled: allowed,
      base_kind: kind,
      mix_group: rule.mixed || rule.minSize !== undefined ? mixGroup : null,
      revision: 0
    };
  }
  function resolve(product, config) {
    if (!config || config.enabled === false) return null;
    const base = Number(product.basePrice ?? product.price);
    if (!Number.isFinite(base) || base <= 0) throw new Error("El producto no tiene precio vigente válido.");
    const unit = product.stockUnit === "docenas" ? "docenas" : "unidades";
    const habitual = String(product.presentation || "").trim();
    if (!habitual) throw new Error("Falta la presentación habitual.");
    const same = config.mode === "same";
    if (!same && config.mode !== "custom") throw new Error("Configuración de pack inválida.");
    const kind = config.base_kind === "valijita" ? "valijita" : baseKind(product);
    const factor = kind === "presentation" ? stockFactor(habitual, unit)
      : kind === "valijita" ? 2 : kind === "dozen" && unit !== "docenas" ? 12 : 1;
    const quantity = integer(same ? stockFactor(habitual, unit) / factor : config.quantity, "Compra mínima por producto");
    const noun = kind === "valijita" ? "valijitas" : kind === "dozen" ? "docenas" : kind === "presentation"
      ? /valijita/i.test(habitual) ? "valijitas" : /juego/i.test(habitual) ? "juegos" : /\bpar(?:es)?\b/i.test(habitual) ? "pares" : "presentaciones" : "unidades";
    const orderPresentation = kind === "presentation" ? habitual
      : kind === "valijita" ? "Pack x2 unidades" : kind === "dozen" ? "Docena" : "Unidad";
    const label = `Compra mínima: ${quantity} ${quantityNoun(quantity, noun)}${kind === "valijita" ? ` (${quantity * 2} juegos)` : ""}`;
    const unitPrice = base * factor;
    return {
      presentation: label, price: unitPrice, minimumTotalPrice: unitPrice * quantity, quantity, orderPresentation, same, quantityRule: "minimum",
      orderUnitPrice: unitPrice, stockPerBase: factor, kind, noun,
      mixGroup: same ? null : config.mix_group || null, revision: Number(config.revision) || 0
    };
  }
  function distribution(spec, variants, allocations, requested) {
    const required = integer(requested, "Cantidad elegida");
    if (required < spec.quantity) throw new Error(`La compra mínima es de ${spec.quantity} ${spec.noun}.`);
    const selected = [];
    let total = 0;
    for (const variant of variants) {
      const amount = Number(allocations[variant.id] || 0);
      if (!amount) continue;
      integer(amount, "Cantidad por talle");
      const next = variant.packSpec;
      if (!next || next.mixGroup !== spec.mixGroup || next.orderUnitPrice !== spec.orderUnitPrice || next.quantity !== spec.quantity || next.kind !== spec.kind) throw new Error("No se pueden mezclar estas variantes en un pack.");
      if (amount * next.stockPerBase > Number(variant.stock || 0)) throw new Error(`Stock insuficiente para ${variant.label || variant.id}.`);
      total += amount;
      selected.push({ variant, quantity: amount });
    }
    if (total !== required) throw new Error(`Completá ${required} ${spec.noun}; seleccionaste ${total}.`);
    return selected;
  }
  const cartKey = (internal, mode) => internal ? "gb_mayorista_cart_internal" : mode === "packs" ? "gb_mayorista_cart_packs" : "gb_mayorista_cart";
  const reachesMinimum = (mode, total) => mode === "packs" ? total > 0 : total >= MINIMUM;
  function quantityText(item) {
    const details = item.purchaseDetails;
    if (details?.quantityRule === "minimum") return `${item.quantity} ${quantityNoun(item.quantity, details.noun)}`;
    if (!details || details.same || Number(item.quantity) !== Number(details.allocated)) return null;
    const noun = quantityNoun(item.quantity, details.noun);
    if (details.mixed) return `${item.quantity} ${noun} · ${details.presentation} surtido`;
    return `${details.packs} ${details.packs === 1 ? "presentación" : "presentaciones"} × ${details.presentation} = ${item.quantity} ${noun}`;
  }
  function quantityNoun(quantity, noun) {
    return Number(quantity) === 1 ? ({docenas:"docena",unidades:"unidad",valijitas:"valijita",juegos:"juego",pares:"par",presentaciones:"presentación",packs:"pack"}[noun] || noun) : noun;
  }
  return { MINIMUM, normalize, integer, stockFactor, baseKind, seed, resolve, distribution, cartKey, reachesMinimum, quantityText, quantityNoun };
});
