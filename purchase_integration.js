function getPurchaseCartKey() {
  return PURCHASE.cartKey(isPrivateManagementRoute(), publicPurchaseMode);
}

function getActiveCatalogMode() {
  return isPrivateManagementRoute() ? internalPurchaseMode : publicPurchaseMode || "surtida";
}

async function loadPackSettings(client) {
  const { data, error } = await client.from("product_pack_settings").select("product_id,mode,quantity,enabled,base_kind,mix_group,allow_mixed_prices,revision");
  if (error) {
    packSettingsReady = false;
    packSettingsError = "La modalidad por packs no está disponible. Falta aplicar o verificar su migración.";
    return;
  }
  packSettings = new Map((data || []).map(row => [String(row.product_id), row]));
  packSettingsReady = true;
  packSettingsError = "";
}

function getPackConfig(variant) {
  return packSettings.get(String(variant.productId || variant.id)) || {
    mode: "same", quantity: 1, enabled: true, base_kind: PURCHASE.baseKind(variant), mix_group: null, revision: 0
  };
}

function getCatalogProducts(mode = getActiveCatalogMode()) {
  const groups = getBaseCatalogProducts();
  if (mode !== "packs") return groups;
  if (!packSettingsReady) return [];
  return groups.map(group => ({ ...group, variants: group.variants.flatMap(variant => {
    if (!(Number(variant.basePrice ?? variant.price) > 0) || !String(variant.presentation || "").trim()) return [];
    const spec = PURCHASE.resolve(variant, getPackConfig(variant));
    const product = products.find(p => String(p.id) === String(variant.productId));
    const stock = Object.hasOwn(product?.variantStock || {}, variant.label) ? product.variantStock[variant.label] : variant.stock;
    return spec ? [{ ...variant, stock, presentation: spec.presentation, price: spec.price, packSpec: spec }] : [];
  }) })).filter(group => group.variants.length).map(group => ({ ...group, minimum: group.variants[0].packSpec.quantity }));
}

function renderPurchaseModeControls() {
  const internal = isPrivateManagementRoute();
  document.documentElement.dataset.purchaseState = internal ? "internal" : publicPurchaseMode || "choice";
  document.body.classList.toggle("purchase-pack-catalog", getActiveCatalogMode() === "packs");
  document.querySelectorAll("[data-choose-purchase]").forEach(button => { button.disabled = false; });
  document.querySelector("#purchaseChoice")?.classList.toggle("hidden", internal || Boolean(publicPurchaseMode));
  document.querySelector("#catalogBrowseContent")?.classList.toggle("hidden", !internal && !publicPurchaseMode);
  const controls = document.querySelector("#purchaseModeControls");
  controls?.classList.toggle("hidden", !internal && !publicPurchaseMode);
  if (controls) controls.innerHTML = internal
    ? `<div class="purchase-mode-switch" role="group" aria-label="Modalidad de venta"><button type="button" data-internal-purchase="habitual" aria-pressed="${internalPurchaseMode === "habitual"}">Venta habitual</button><button type="button" data-internal-purchase="packs" aria-pressed="${internalPurchaseMode === "packs"}">Venta por packs</button></div>`
    : `<strong>${publicPurchaseMode === "packs" ? "COMPRA POR PACKS" : `COMPRA SURTIDA · Mínimo ${formatMoney(WHOLESALE_MINIMUM)}`}</strong><button type="button" class="ghost-button" data-change-purchase> Cambiar modalidad </button>`;
  const banner = document.querySelector(".minimum-banner");
  banner?.classList.toggle("hidden", internal || !publicPurchaseMode);
  banner?.querySelectorAll(".minimum-marquee span:nth-child(4n+1)").forEach(span => {
    span.textContent = publicPurchaseMode === "packs" ? "SIN MÍNIMO DE DINERO · MÍNIMO POR PRODUCTO" : `COMPRA MÍNIMA ${formatMoney(WHOLESALE_MINIMUM)}`;
  });
  banner?.setAttribute("aria-label", publicPurchaseMode === "packs" ? "Compra por packs sin mínimo de dinero" : `Compra mínima ${formatMoney(WHOLESALE_MINIMUM)}`);
  if (getActiveCatalogMode() === "packs" && !packSettingsReady && els.productGrid) {
    els.productGrid.innerHTML = `<p class="load-error" role="alert">${escapeHtml(packSettingsError || "Cargando las presentaciones por packs…")}</p>`;
  }
}

function choosePublicPurchaseMode(mode) {
  if (isPrivateManagementRoute() || !["surtida", "packs", ""].includes(mode)) return;
  saveCart();
  localStorage.setItem(`${getPurchaseCartKey()}_customer`, JSON.stringify(getCustomerData()));
  publicPurchaseMode = mode;
  const url = new URL(location.href);
  if (mode) url.searchParams.set("compra", mode); else url.searchParams.delete("compra");
  history.pushState({ ...history.state, purchaseMode: mode }, "", url);
  restorePurchaseCart();
}

function restorePurchaseCart() {
  cart = loadCart();
  let customer = {};
  try { customer = JSON.parse(localStorage.getItem(`${getPurchaseCartKey()}_customer`) || "{}"); } catch { /* Missing draft fields are optional. */ }
  if (els.customerName) els.customerName.value = customer.name || "";
  if (els.customerPhone) els.customerPhone.value = customer.phone || "";
  if (els.customerLocation) els.customerLocation.value = customer.location || "";
  closeCart();
  renderAll();
}

function renderPackDistributionControl(group) {
  if (!group.variants.some(v => v.packSpec?.mixGroup)) return "";
  return `<fieldset class="pack-distribution hidden" data-pack-distribution="${escapeHtml(group.id)}"><legend>Distribución de talles</legend><div data-pack-allocation-list></div><output data-pack-allocation-total></output></fieldset>`;
}

function updatePackDistributionControl(group, selected) {
  const root = document.querySelector(`[data-pack-distribution="${CSS.escape(group.id)}"]`);
  if (!root) return;
  const spec = selected?.packSpec;
  root.classList.toggle("hidden", !spec?.mixGroup);
  if (!spec?.mixGroup) return;
  const variants = getCompatiblePackVariants(group, selected);
  const signature = variants.map(v => `${v.id}:${v.packSpec.orderUnitPrice}:${v.packSpec.revision}`).join("|");
  const list = root.querySelector("[data-pack-allocation-list]");
  if (root.dataset.signature !== signature) {
    root.dataset.signature = signature;
    list.innerHTML = variants.map(v => `<label><span>${escapeHtml(v.label)}</span>${spec.allowMixedPrices ? `<small>${escapeHtml(formatMoney(v.packSpec.orderUnitPrice))}</small>` : ""}<input type="number" min="0" step="1" value="0" max="${Math.floor(Number(v.stock) / v.packSpec.stockPerBase)}" data-pack-variant="${escapeHtml(v.id)}" aria-label="Cantidad talle ${escapeHtml(v.label)}"></label>`).join("");
    list.querySelectorAll("input").forEach(input => input.addEventListener("input", () => updatePackDistributionControl(group, getSelectedCatalogVariant(group.id, [group]) || selected)));
  }
  const total = [...list.querySelectorAll("input")].reduce((sum, input) => sum + (Number(input.value) || 0), 0);
  root.querySelector("output").textContent = `${total} de ${getCatalogQuantityValue(group.id, spec.quantity)} ${spec.noun} elegidas · mínimo ${spec.quantity}`;
  if (spec.allowMixedPrices) {
    const target = getCatalogQuantityValue(group.id, spec.quantity);
    const reference = variants[0].packSpec.orderUnitPrice;
    const selectedTotal = variants.reduce((sum, v) => sum + Math.max(0, Number(list.querySelector(`[data-pack-variant="${CSS.escape(v.id)}"]`)?.value) || 0) * v.packSpec.orderUnitPrice, 0);
    const amount = selectedTotal + Math.max(0, target - total) * reference;
    if (isPrivateManagementRoute()) document.querySelector(`[data-catalog-price="${CSS.escape(group.id)}"]`).textContent = formatMoney(amount);
    else if (total > 0) root.querySelector("output").textContent += ` · Total: ${formatMoney(amount)}`;
  }
}

function getCompatiblePackVariants(group, selected) {
  const spec = selected.packSpec;
  return group.variants.filter(v => v.packSpec?.mixGroup === spec.mixGroup && v.packSpec.quantity === spec.quantity && v.packSpec.kind === spec.kind &&
    (v.packSpec.orderUnitPrice === spec.orderUnitPrice || (spec.allowMixedPrices && v.packSpec.allowMixedPrices)));
}

function getPackUnitPriceText(group, variant) {
  const variants = variant.packSpec.allowMixedPrices && group ? getCompatiblePackVariants(group, variant) : [variant];
  const prices = [...new Set(variants.map(v => v.packSpec.orderUnitPrice))].sort((a, b) => a - b);
  return `Precio por ${PURCHASE.quantityNoun(1, variant.packSpec.noun)}: ${prices.map(formatMoney).join(" / ")}${prices.length > 1 ? " según talle" : ""}`;
}

function addConfiguredPack(group, variant, packs) {
  try {
    const spec = variant.packSpec;
    const count = PURCHASE.integer(packs, "Cantidad elegida");
    if (count < spec.quantity) throw new Error(`La compra mínima es de ${spec.quantity} ${spec.noun}.`);
    let selected;
    if (spec.mixGroup) {
      const root = document.querySelector(`[data-pack-distribution="${CSS.escape(group.id)}"]`);
      const allocation = Object.fromEntries([...root.querySelectorAll("[data-pack-variant]")].map(input => [input.dataset.packVariant, input.value]));
      selected = PURCHASE.distribution(spec, group.variants, allocation, count);
    } else {
      if (count * spec.stockPerBase > Number(variant.stock)) throw new Error("No hay stock suficiente para esa cantidad.");
      selected = [{ variant, quantity: count }];
    }
    const packId = crypto.randomUUID();
    {
      const requested = new Map();
      const currentItems = isInternalCatalogQuickSaleMode() ? (getManualCatalogTarget() || getInternalCatalogSale()).items : cart;
      const stockKey = (line) => {
        const id = String(line.internalProductId || line.id);
        const product = products.find(p => String(p.id) === id);
        const label = line.variantLabel || line.variant || "";
        return Object.hasOwn(product?.variantStock || {}, label) ? `${id}:${label}` : id;
      };
      for (const line of [...currentItems, ...selected.map(({ variant: v, quantity }) => ({ id: v.productId, variantLabel: v.label, quantity, presentation: v.packSpec.orderPresentation, stockUnit: v.stockUnit }))]) {
        const id = stockKey(line);
        requested.set(id, (requested.get(id) || 0) + Number(line.quantity) * PURCHASE.stockFactor(line.presentation, line.stockUnit));
      }
      for (const { variant: v } of selected) {
        if (requested.get(stockKey({ id: v.productId, variantLabel: v.label })) > Number(v.stock)) throw new Error(`La preparación supera el stock de ${v.label || group.name}.`);
        const existing = isInternalCatalogQuickSaleMode() && currentItems.find(item => String(item.id) === String(v.productId));
        if (existing) {
          const multiplier = PURCHASE.stockFactor(existing.presentation, existing.stockUnit) / v.packSpec.stockPerBase;
          PURCHASE.integer(existing.quantity * multiplier, "Cantidad existente");
          if (Math.abs(existing.price / multiplier - v.packSpec.orderUnitPrice) > 0.001) throw new Error("Este producto tiene otro precio en el pedido. Revisalo en el detalle antes de sumar un pack al precio vigente.");
        }
      }
    }
    for (const { variant: v, quantity } of selected) {
      const next = { ...v, price: v.packSpec.orderUnitPrice, presentation: v.packSpec.orderPresentation, packSpec: null };
      const detail = { packId, quantityRule: "minimum", requestedTotal: count, minimumQuantity: spec.quantity, allocated: quantity, unitsPerPack: spec.quantity, presentation: spec.presentation, noun: spec.noun, same: spec.same, mixed: Boolean(spec.mixGroup), allowMixedPrices: v.packSpec.allowMixedPrices, revision: v.packSpec.revision };
      if (isInternalCatalogQuickSaleMode()) {
        const target = getManualCatalogTarget() || getInternalCatalogSale();
        const existing = target.items.find(item => String(item.id) === String(v.productId));
        if (existing && (existing.presentation !== next.presentation || Number(existing.price) !== next.price)) {
          const factor = PURCHASE.stockFactor(existing.presentation, existing.stockUnit);
          const converted = existing.quantity * factor / v.packSpec.stockPerBase;
          PURCHASE.integer(converted, "Cantidad existente");
          existing.quantity = converted;
          existing.presentation = next.presentation;
          existing.price = next.price;
        }
        const source = products.find(p => p.id === v.productId);
        // The minimum was checked for the full assortment, not for each individual size.
        addCatalogGroupToInternalSale(spec.mixGroup ? { ...group, minimum: 1 } : group, next, quantity, source ? { ...source, presentation: next.presentation } : null);
        const item = target.items.find(item => String(item.id) === String(v.productId));
        if (item) item.purchaseDetails = { ...detail, allocated: item.quantity };
        target.purchaseMode = target.items.every(item => item.purchaseDetails) ? "packs" : "habitual";
        recalculateBudget(target);
      } else {
        const cartId = `${group.id}__${v.id}__${packId}`;
        cart.push({ cartId, id: v.productId, internalProductId: v.productId, catalogGroupId: group.id, name: getCartProductNameFromCatalog(group, v),
          variantLabel: v.label, image: v.image || group.image, price: next.price, basePrice: v.basePrice, presentation: next.presentation, stockUnit: v.stockUnit,
          quantity, purchaseDetails: detail, purchaseMode: "packs" });
      }
    }
    if (isInternalCatalogQuickSaleMode()) renderInternalCatalogSale();
    else { saveCart(); renderCart(); }
    showToast("Cantidad agregada", "success");
  } catch (error) { showToast(error.message); }
}

function refreshPackCartItem(item) {
  const group = getCatalogProducts("packs").find(g => g.id === item.catalogGroupId);
  const variant = group?.variants.find(v => String(v.productId) === String(item.internalProductId || item.id) && v.label === item.variantLabel);
  if (!variant) return { ...item, packError: "Un artículo ya no está disponible por packs. Quitá esa presentación del carrito." };
  const spec = variant.packSpec;
  if (spec.revision !== item.purchaseDetails.revision) {
    return { ...item, packError: "Cambió la presentación de un pack. Quitalo y seleccioná nuevamente sus cantidades." };
  }
  const { packError, ...rest } = item;
  const quantity = item.purchaseDetails.quantityRule === "minimum" ? item.quantity
    : PURCHASE.integer(item.quantity * PURCHASE.stockFactor(item.presentation, item.stockUnit) / spec.stockPerBase, "Cantidad guardada");
  return { ...rest, quantity, purchaseDetails: { ...item.purchaseDetails, quantityRule: "minimum", allocated: quantity, minimumQuantity: spec.quantity,
    unitsPerPack: spec.quantity, requestedTotal: null, noun: spec.noun, presentation: spec.presentation, same: spec.same, allowMixedPrices: spec.allowMixedPrices },
    price: spec.orderUnitPrice, basePrice: variant.basePrice, presentation: spec.orderPresentation, stockUnit: variant.stockUnit };
}

function validatePackCart(items) {
  if (publicPurchaseMode !== "packs") return;
  const batches = new Map();
  const stock = new Map();
  for (const item of items) {
    if (item.packError) throw new Error(item.packError);
    const detail = item.purchaseDetails;
    if (!detail || item.quantity !== detail.allocated) throw new Error("El carrito contiene un pack incompleto. Seleccionalo nuevamente.");
    const batch = batches.get(detail.packId) || { total: 0, minimum: detail.minimumQuantity, price: item.price, mixedPrices: detail.allowMixedPrices === true, items: [] };
    if (detail.mixed && Number(batch.price) !== Number(item.price) && !(batch.mixedPrices && detail.allowMixedPrices === true)) throw new Error("Los talles tienen precios diferentes. Seleccioná nuevamente la distribución.");
    batch.total += item.quantity;
    batch.items.push(item);
    batches.set(detail.packId, batch);
    const id = String(item.internalProductId || item.id);
    stock.set(id, (stock.get(id) || 0) + item.quantity * PURCHASE.stockFactor(item.presentation, item.stockUnit));
  }
  if ([...batches.values()].some(batch => batch.total < batch.minimum)) throw new Error("Hay un producto que no alcanza su cantidad mínima.");
  for (const batch of batches.values()) for (const item of batch.items) item.purchaseDetails.requestedTotal = batch.total;
  for (const [id, quantity] of stock) if (quantity > getProductTotalStock(products.find(p => String(p.id) === id))) throw new Error("La cantidad del carrito supera el stock vigente.");
}

function validateMinimumOrderItems(items, order = null) {
  const batches = new Map();
  const variants = getCatalogProducts("packs").flatMap(group => group.variants);
  for (const item of items) {
    if (item.purchaseDetails?.quantityRule !== "minimum") continue;
    const variant = variants.find(v => String(v.productId) === String(item.internalProductId || item.id) && v.label === (item.variant || item.variantLabel || ""));
    if (!variant) throw new Error("Un producto ya no está disponible en la modalidad por packs.");
    const spec = variant.packSpec;
    if (item.presentation !== spec.orderPresentation) throw new Error("La presentación cambió. Revisá el producto en el catálogo.");
    // Existing pending orders keep their original agreement; SQL verifies the saved line exactly.
    if (order?.remoteId && item.remoteItemId && item.purchaseDetails.minimumQuantity === 5 && spec.quantity === 6 && item.purchaseDetails.revision < spec.revision) continue;
    const key = `${spec.mixGroup || variant.productId}:${spec.allowMixedPrices ? "mixed" : item.price}:${spec.quantity}:${spec.kind}`;
    const batch = batches.get(key) || { total: 0, minimum: spec.quantity, noun: spec.noun, items: [] };
    batch.total += PURCHASE.integer(item.quantity, "Cantidad");
    batch.items.push({ item, spec });
    batches.set(key, batch);
  }
  for (const batch of batches.values()) {
    if (batch.total < batch.minimum) throw new Error(`La compra mínima por producto es de ${batch.minimum} ${batch.noun}.`);
    for (const { item, spec } of batch.items) item.purchaseDetails = { ...item.purchaseDetails, allocated: item.quantity, minimumQuantity: spec.quantity, requestedTotal: batch.total, revision: spec.revision };
  }
}

function fillPackEditor(product) {
  const section = document.querySelector("#packProductEditor");
  section?.classList.toggle("hidden", !canAccess("admin"));
  if (!section || !canAccess("admin")) return;
  const config = getPackConfig({ ...product, productId: product.id });
  section.dataset.revision = config.revision || 0;
  section.querySelector("[name=packEnabled]").checked = config.enabled !== false;
  section.querySelector("[name=packMode]").value = config.mode;
  section.querySelector("[name=packQuantity]").value = config.quantity;
  updatePackEditorPreview();
}

function readPackEditor(product) {
  if (!canAccess("admin")) return null;
  const section = document.querySelector("#packProductEditor");
  const mode = section.querySelector("[name=packMode]").value;
  const config = { ...getPackConfig({ ...product, productId: product.id }), mode,
    enabled: section.querySelector("[name=packEnabled]").checked, revision: Number(section.dataset.revision),
    quantity: mode === "same" ? 1 : PURCHASE.integer(section.querySelector("[name=packQuantity]").value, "Cantidad del pack") };
  if (config.mode === "same") config.quantity = 1;
  return config;
}

function updatePackEditorPreview() {
  const product = products.find(p => p.id === editingProductId);
  if (!product) return;
  const section = document.querySelector("#packProductEditor");
  section.querySelector("[name=packQuantity]").closest("label").classList.toggle("hidden", section.querySelector("[name=packMode]").value === "same");
  try {
    const spec = PURCHASE.resolve({ ...product, basePrice: Number(els.editProductPrice.value), presentation: els.editProductPresentation.value }, readPackEditor(product));
    section.querySelector("output").textContent = spec ? `${spec.presentation} · ${formatMoney(spec.price)} por ${PURCHASE.quantityNoun(1, spec.noun)}` : "No se mostrará en el catálogo por packs";
  } catch (error) { section.querySelector("output").textContent = error.message; }
}

async function savePackEditor(product, config) {
  if (!packSettingsReady) throw new Error(packSettingsError || "No se pudo leer la configuración por packs.");
  const original = getPackConfig({ ...product, productId: product.id });
  if (["mode", "enabled", "quantity"].every(key => config[key] === original[key])) return;
  const { data, error } = await getSupabaseCatalogClient().rpc("internal_set_product_pack", {
    p_product_id: product.id, p_profile_token: getStoredInternalProfileSessionToken(), p_mode: config.mode,
    p_quantity: config.quantity, p_enabled: config.enabled, p_revision: config.revision
  });
  if (error) throw new Error(error.message || "No se pudo guardar la presentación por packs.");
  packSettings.set(String(product.id), data);
  document.querySelector("#packProductEditor").dataset.revision = data.revision;
}

document.addEventListener("click", event => {
  const pdfButton = event.target.closest("[data-commercial-pdf]");
  if (pdfButton) handleCatalogPdfAction(pdfButton.dataset.commercialPdf, pdfButton.dataset.pdfAction);
  const publicButton = event.target.closest("[data-choose-purchase], [data-change-purchase]");
  if (publicButton) choosePublicPurchaseMode(publicButton.dataset.choosePurchase || "");
  const internalButton = event.target.closest("[data-internal-purchase]");
  if (internalButton && isPrivateManagementRoute() && internalUnlocked) {
    internalPurchaseMode = internalButton.dataset.internalPurchase;
    sessionStorage.setItem("gb_mayorista_internal_purchase_mode", internalPurchaseMode);
    renderCatalog();
  }
});
document.addEventListener("input", event => {
  if (event.target.closest("#packProductEditor") || ["editProductPrice", "editProductPresentation"].includes(event.target.id)) updatePackEditorPreview();
});
window.addEventListener("popstate", () => {
  if (isPrivateManagementRoute()) return;
  const mode = new URLSearchParams(location.search).get("compra");
  const next = ["surtida", "packs"].includes(mode) ? mode : "";
  if (next !== publicPurchaseMode) { saveCart(); publicPurchaseMode = next; restorePurchaseCart(); }
});
