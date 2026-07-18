const STORAGE_PRODUCTS = "gb_mayorista_products";
document.documentElement.dataset.gbApp = "loading";

const STORAGE_CART = "gb_mayorista_cart";
const STORAGE_ORDERS = "gb_mayorista_orders";
const STORAGE_STOCK_HISTORY = "gb_mayorista_stock_history";
const STORAGE_CLIENTS = "gb_mayorista_clients";
const STORAGE_CATEGORIES = "gb_mayorista_categories";
const STORAGE_ROLE = "gb_mayorista_role";
const STORAGE_SCHEMA = "gb_mayorista_schema";
const STORAGE_SUPABASE_CATALOG_STATUS = "gb_mayorista_supabase_catalog_status";
const APP_DATA_VERSION = "catalog-unified-mobile-v1";
const DISPLAY_PHONE = "2477520456";
const WHATSAPP_NUMBER = normalizeArgentinaWhatsappNumber(DISPLAY_PHONE);
const WHOLESALE_MINIMUM = 100000;
const DEFAULT_ADMIN_PASSWORD = "1234";
const DEFAULT_EMPLOYEE_PASSWORD = "0000";
const PRIVATE_MANAGEMENT_PATH = "/gestion";
const DEFAULT_PRODUCT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='675' viewBox='0 0 900 675'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%23f7f8f2'/%3E%3Cstop offset='1' stop-color='%23e8efe3'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='900' height='675' fill='url(%23bg)'/%3E%3Crect x='72' y='58' width='756' height='559' rx='30' fill='%23ffffff' stroke='%23dbe2d8' stroke-width='4'/%3E%3Cpath d='M360 168 L411 128 H489 L540 168 L598 220 L548 286 L520 262 V478 H380 V262 L352 286 L302 220 Z' fill='%23edf4e8' stroke='%234b7a3e' stroke-width='12' stroke-linejoin='round'/%3E%3Cpath d='M411 128 C424 170 476 170 489 128' fill='none' stroke='%234b7a3e' stroke-width='12' stroke-linecap='round'/%3E%3Ctext x='450' y='548' text-anchor='middle' font-family='Arial,sans-serif' font-size='42' font-weight='900' fill='%232b332d'%3EGB Mayorista%3C/text%3E%3Ctext x='450' y='594' text-anchor='middle' font-family='Arial,sans-serif' font-size='26' font-weight='700' fill='%23717c72'%3EImagen de prueba%3C/text%3E%3C/svg%3E";
const LODY_742_IMAGE = "https://acdn-us.mitiendanube.com/stores/941/776/products/742-f8db079bccbf04a99a17447222071825-1024-1024.webp";
let processedProductImage = "";
const CATALOG_IMAGE_SIZE = 1200;
const CATALOG_IMAGE_CONTENT_RATIO = 0.88;
const CATALOG_IMAGE_MAX_SOURCE_SIZE = 1800;

const defaultProductCategories = [
  "Medias",
  "Ropa Interior Hombre",
  "Ropa Interior Dama",
  "Ropa Interior Niño",
  "Blanquería"
];

const statuses = [
  "En revisión",
  "Pagado"
];

const confirmedStatuses = ["Pagado"];

const roles = {
  client: {
    label: "Catálogo cliente",
    description: "El cliente ve productos, precios y arma una consulta por WhatsApp. No ve administración ni stock."
  },
  admin: {
    label: "Administrador",
    description: "Acceso total a productos, costos, márgenes, reportes, importación y exportación."
  },
  employee: {
    label: "Empleado",
    description: "Puede trabajar productos, precios de venta y stock. No ve costos, márgenes, reportes ni exportaciones."
  }
};

const userProfiles = [
  {
    id: "admin",
    name: "Administrador",
    role: "admin",
    password: DEFAULT_ADMIN_PASSWORD,
    active: true
  },
  {
    id: "empleado",
    name: "Empleado",
    role: "employee",
    password: DEFAULT_EMPLOYEE_PASSWORD,
    active: true
  }
];

const rolePermissions = {
  client: [],
  employee: ["internal", "products", "stock", "orders", "clients"],
  admin: ["internal", "products", "stock", "orders", "clients", "reports", "costs", "margins", "importExport", "manageProducts", "editAll"]
};

const definitiveProductCatalog = [];
const definitiveDescriptions = {
  maxton: "Docena surtida de talles y colores.",
  conjunto728: "Talles 85 al 100.\nConjunto algodón y lycra.\nIncluye colaless.\nDocena surtida de talles y colores.",
  conjunto746: "Talles 85 al 100.\nConjunto algodón y lycra.\nIncluye colaless regulable.\nDocena surtida de talles y colores.",
  conjunto741: "Talles 85 al 100.\nConjunto algodón y lycra.\nIncluye colaless.\nDocena surtida de talles y colores.",
  nino: "Docena surtida de talles y colores.",
  medias: "Talle único.\nComposición: poliéster y algodón.\nSurtido de colores.",
  deportivas: "Talle único.\nComposición: poliéster y algodón.\nSurtido de colores.\nCon antideslizantes.",
  elementoPack: "Talle único.\nComposición: 100% algodón.\nSurtido de colores.\nLa docena se presenta en 4 packs de 3 pares.",
  elementoNino: "Composición: 100% algodón.\nSurtido de colores.\nLa docena se presenta en 4 packs de 3 pares.",
  elemento13: "Talle único.\nComposición: 100% algodón.\nSurtido de colores.",
  repasador: "Algodón.\nSurtido de colores."
};

function addDefinitiveProduct(name, category, presentation = "1 Docena", description = "") {
  const identity = getProductIdentityFromName(name);
  definitiveProductCatalog.push({
    name: identity.baseName,
    baseName: identity.baseName,
    optionName: identity.optionName,
    category,
    presentation,
    description
  });
}

["Talle 1", "Talle 2", "Talle 3", "Talle 4", "Talle 5", "Talle 6", "Surtido T1-4", "Surtido T5-6"]
  .forEach((option) => addDefinitiveProduct(`Boxer Lody Adulto Art. 742 ${option}`, "Ropa Interior Hombre"));
["Talle 1", "Talle 2", "Talle 3", "Talle 4", "Talle 5", "Talle 6"]
  .forEach((option) => addDefinitiveProduct(`Boxer XY Art. 1387 Liso ${option}`, "Ropa Interior Hombre"));
addDefinitiveProduct("Boxer Uomo Surtido de talles M al 4XL", "Ropa Interior Hombre");
["Talle 2", "Talle 3", "Talle 4", "Talle 5", "Talle 6", "Surtido T2-6"]
  .forEach((option) => addDefinitiveProduct(`Boxer Maxton ${option}`, "Ropa Interior Hombre", "1 Docena", definitiveDescriptions.maxton));
["Talle 2", "Talle 3", "Talle 4", "Talle 5", "Surtido T2-5"]
  .forEach((option) => addDefinitiveProduct(`Boxer Dufour Art. 11855 ${option}`, "Ropa Interior Hombre"));
addDefinitiveProduct("Boxer Capicúa Surtido de talles", "Ropa Interior Hombre");

[
  "Colaless Algodón Íntima",
  "Vedetina Algodón Íntima",
  "Vedetina Especial Algodón Íntima",
  "Universal Algodón Íntima",
  "Especial Algodón Íntima",
  "Colaless Algodón Línea Económica",
  "Vedetina Algodón Línea Económica",
  "Regulable Línea Económica"
].forEach((name) => addDefinitiveProduct(name, "Ropa Interior Dama"));
addDefinitiveProduct("Conjunto Taza Soft Art.728", "Ropa Interior Dama", "1 Docena", definitiveDescriptions.conjunto728);
addDefinitiveProduct("Conjunto Triángulo Soft Art.746", "Ropa Interior Dama", "1 Docena", definitiveDescriptions.conjunto746);
addDefinitiveProduct("Conjunto Triángulo Soft Art.741", "Ropa Interior Dama", "1 Docena", definitiveDescriptions.conjunto741);

[
  "Bombachas Algodón Niñas",
  "Bombachas Algodón Juvenil",
  "Boxers Uomo Niño Pañalero",
  "Boxers Uomo Niño Intermedio",
  "Boxers Uomo Juvenil"
].forEach((name) => addDefinitiveProduct(name, "Ropa Interior Niño", "1 Docena", definitiveDescriptions.nino));

[
  "Soquetes Elastizados Adultos",
  "Soquetes Elastizados Niños",
  "Medias Elastizadas Adultos",
  "Medias Toalla Adultos"
].forEach((name) => addDefinitiveProduct(name, "Medias", "1 Docena", definitiveDescriptions.medias));
[
  "Medias 1/2 Caña Deportivas Adultos",
  "Medias 3/4 Deportivas Adultos",
  "Medias Deportivas Juveniles"
].forEach((name) => addDefinitiveProduct(name, "Medias", "1 Docena", definitiveDescriptions.deportivas));
["Soquete Elemento Hombre 102L", "Soquete Elemento Dama 101L"]
  .forEach((name) => addDefinitiveProduct(name, "Medias", "1 Docena", definitiveDescriptions.elementoPack));
["Talle 1", "Talle 2", "Talle 3", "Talle 4"]
  .forEach((option) => addDefinitiveProduct(`Soquete Elemento Niño 104 ${option}`, "Medias", "1 Docena", definitiveDescriptions.elementoNino));
["Medias 1/3 Elemento Hombre 402L", "Medias 1/3 Elemento Dama 401L"]
  .forEach((name) => addDefinitiveProduct(name, "Medias", "1 Docena", definitiveDescriptions.elemento13));

[
  ["Toalla de Visita F. Valente 450 g", "Medida: 30 x 50 cm."],
  ["Toalla de Mano F. Valente 400 g", "Medida: 50 x 80 cm."],
  ["Toallón F. Valente 400 g", "Medida: 70 x 140 cm."],
  ["Toalla de Mano F. Valente 500 g", "Medida: 50 x 80 cm."],
  ["Toallón F. Valente 500 g", "Medida: 70 x 140 cm."],
  ["Juego T+T F. Valente 400 g", "Incluye toalla de mano 50 x 80 cm y toallón 70 x 140 cm."],
  ["Juego T+T F. Valente 500 g", "Incluye toalla de mano 50 x 80 cm y toallón 70 x 140 cm."],
  ["Juego T+T Palette 420 g", "Incluye toalla de mano 50 x 80 cm y toallón 70 x 140 cm."],
  ["Toalla de Mano Fantasía", "Medida: 50 x 80 cm."],
  ["Toallón Algodón Fantasía", "Medida: 70 x 140 cm."]
].forEach(([name, detail]) => addDefinitiveProduct(name, "Blanquería", "Pack x3", `Algodón.\nSurtido de colores.\n${detail}`));
["Repasadores F. Valente", "Repasador Corazón", "Repasador Algodón Económico"]
  .forEach((name) => addDefinitiveProduct(name, "Blanquería", "1 Docena", definitiveDescriptions.repasador));
addDefinitiveProduct("Juego de Sábanas París Basic 1½ Plaza", "Blanquería", "Pack x3", "Juego de sábanas París Basic.\nMedidas 1½ plaza: sábana plana 160 x 240 cm, sábana ajustable 90 x 190 cm y 1 funda.\nSurtido de colores y diseños.");
addDefinitiveProduct("Juego de Sábanas París Basic 2½ Plazas", "Blanquería", "Pack x3", "Juego de sábanas París Basic.\nMedidas 2½ plazas: sábana plana 220 x 240 cm, sábana ajustable 140 x 190 cm y 2 fundas.\nSurtido de colores y diseños.");
addDefinitiveProduct("Juego de Sábanas París Cotton Touch 1½ Plaza", "Blanquería", "Pack x3", "Juego de sábanas París Cotton Touch.\nMedidas 1½ plaza: sábana plana 160 x 240 cm, sábana ajustable 90 x 190 cm y 1 funda.\nSurtido de colores y diseños.");
addDefinitiveProduct("Juego de Sábanas París Cotton Touch 2½ Plazas", "Blanquería", "Pack x3", "Juego de sábanas París Cotton Touch.\nMedidas 2½ plazas: sábana plana 220 x 240 cm, sábana ajustable 140 x 190 cm y 2 fundas.\nSurtido de colores y diseños.");

const sampleProducts = definitiveProductCatalog.map(makeDefinitiveProduct);
const requestedProductCatalog = definitiveProductCatalog.map(({ name, baseName, optionName, category, presentation }) => [name, category, presentation, baseName, optionName]);

const legacyProductRenames = {
  "Boxer Lody Talle 1 Pack x12": "Boxer Adulto Lody Art. 742 T1",
  "Boxer Lody Talle 2 Pack x12": "Boxer Adulto Lody Art. 742 T2",
  "Boxer Lody Talle 3 Pack x12": "Boxer Adulto Lody Art. 742 T3",
  "Boxer Lody Talle 4 Pack x12": "Boxer Adulto Lody Art. 742 T4",
  "Boxer Lody Surtido 1-4 Pack x12": "Boxer Adulto Lody Art. 742 T1-4 Surtido",
  "Boxer Lody Talle 5-6 Pack x12": "Boxer Adulto Lody Art. 742 T5",
  "Boxer Lody Surtido 5-6 Pack x12": "Boxer Adulto Lody Art. 742 T5-6 Surtido"
};

resetLegacyData();

let categories = normalizeCategories(loadCategories());
let products = normalizeProducts(loadProducts());
ensureRequestedProductCatalog();
let cart = loadCart();
let orders = normalizeBudgets(loadOrders());
let stockHistory = loadStockHistory();
let clients = normalizeClients(loadClients());
syncClientsFromOrders();
applyPendingPaidStockDiscounts();
let currentRole = "client";
let currentCategory = "Todas";
let currentAdminCategory = products.find((product) => product.active !== false)?.category || getVisibleCategories()[0] || defaultProductCategories[0];
let adminProductSort = { field: "name", direction: "asc" };
let currentView = "catalogo";
let previewOrderId = "";
let previewMode = "budget";
let currentPrintOrderId = "";
let openOrderId = "";
let orderListSearch = "";
let orderListFilter = "Hoy";
let orderDetailHistoryActive = false;
let orderDetailClosingByCode = false;
let budgetPreviewHistoryActive = false;
let budgetPreviewClosingByCode = false;
let printPreviewHistoryActive = false;
let printPreviewClosingByCode = false;
let editingOrderCustomerId = "";
let editingBudgetItem = null;
let budgetItemEditHistoryActive = false;
let budgetItemEditClosingByCode = false;
let selectedClientPhone = "";
let editingClientPhone = "";
let currentPrintHtml = "";
let currentPrintType = "";
let currentPrintFilename = "";
let currentPdfUrl = "";
let currentPdfBlob = null;
let currentPdfFilename = "";
let currentPrintDocument = null;
let stockModalProductId = "";
let editingProductId = "";
let editProductInitialState = "";
let editProductRemoveImagePending = false;
let productDetailsMenuHistoryActive = false;
let productDetailsMenuClosingByCode = false;
let toastTimer;
let internalUnlocked = false;
let appHistoryReady = false;
let suppressHistoryUpdate = false;
let allowExternalBack = false;
let lastExitBackPress = 0;
let editProductModalHistoryActive = false;
let editProductModalClosingByCode = false;
let imageLightboxHistoryActive = false;
let imageLightboxClosingByCode = false;
let stockModalHistoryActive = false;
let stockModalClosingByCode = false;
let addProductModalHistoryActive = false;
let addProductModalClosingByCode = false;
var supabaseCatalogSyncTimer = null;
var supabaseCatalogSyncRunning = false;
var supabaseCatalogBootstrapped = false;
var supabaseCatalogReadyForWrites = false;
var supabaseCatalogRemoteRefreshing = false;
var supabaseCatalogRealtimeChannel = null;
var supabaseCatalogRealtimeRefreshTimer = null;
var supabaseCatalogPendingDeletedProductIds = new Set();
var supabaseProductDescriptionSupported = false;
var supabaseProductOptionSupported = false;
var supabaseProductGallerySupported = false;
let lightboxImages = [];
let lightboxIndex = 0;
let lightboxTitle = "";
let lightboxDescription = "";
let lightboxTouchStartX = 0;
let catalogImageFallbacks = new Map();

const els = {
  catalogView: document.querySelector("#catalogView"),
  managementShell: document.querySelector("#managementShell"),
  adminView: document.querySelector("#adminView"),
  stockView: document.querySelector("#stockView"),
  importView: document.querySelector("#importView"),
  ordersView: document.querySelector("#ordersView"),
  clientsView: document.querySelector("#clientsView"),
  reportsView: document.querySelector("#reportsView"),
  productGrid: document.querySelector("#productGrid"),
  categoryFilters: document.querySelector("#categoryFilters"),
  searchInput: document.querySelector("#searchInput"),
  cartDrawer: document.querySelector("#cartDrawer"),
  cartItems: document.querySelector("#cartItems"),
  cartCount: document.querySelector("#cartCount"),
  floatingCartButton: document.querySelector("#floatingCartButton"),
  floatingCartCount: document.querySelector("#floatingCartCount"),
  cartTotal: document.querySelector("#cartTotal"),
  cartSubtitle: document.querySelector("#cartSubtitle"),
  cartSummaryCounts: document.querySelector("#cartSummaryCounts"),
  customerName: document.querySelector("#customerName"),
  customerPhone: document.querySelector("#customerPhone"),
  customerLocation: document.querySelector("#customerLocation"),
  minimumStatus: document.querySelector("#minimumStatus"),
  cartError: document.querySelector("#cartError"),
  whatsappLink: document.querySelector("#whatsappLink"),
  openCart: document.querySelector("#openCart"),
  closeCart: document.querySelector("#closeCart"),
  clearCart: document.querySelector("#clearCart"),
  continueShopping: document.querySelector("#continueShopping"),
  addProductToggle: document.querySelector("#addProductToggle"),
  addProductOverlay: document.querySelector("#addProductOverlay"),
  importProductsButton: document.querySelector("#importProductsButton"),
  exportProductsButton: document.querySelector("#exportProductsButton"),
  importProductsInput: document.querySelector("#importProductsInput"),
  downloadProductsTemplate: document.querySelector("#downloadProductsTemplate"),
  productForm: document.querySelector("#productForm"),
  productFormCancel: document.querySelector("#productFormCancel"),
  productImageInput: document.querySelector("#productImageInput"),
  productImagePreview: document.querySelector("#productImagePreview"),
  productImageGallery: document.querySelector("#productImageGallery"),
  imagePreviewText: document.querySelector("#imagePreviewText"),
  productVariants: document.querySelector("#productVariants"),
  variantRows: document.querySelector("#variantRows"),
  addVariantRow: document.querySelector("#addVariantRow"),
  adminSearchInput: document.querySelector("#adminSearchInput"),
  adminCategoryFilters: document.querySelector("#adminCategoryFilters"),
  manageCategoriesButton: document.querySelector("#manageCategoriesButton"),
  categoryManager: document.querySelector("#categoryManager"),
  closeCategoryManager: document.querySelector("#closeCategoryManager"),
  newCategoryName: document.querySelector("#newCategoryName"),
  addCategoryButton: document.querySelector("#addCategoryButton"),
  categoryManagerList: document.querySelector("#categoryManagerList"),
  adminCategoryTitle: document.querySelector("#adminCategoryTitle"),
  adminCategorySummary: document.querySelector("#adminCategorySummary"),
  downloadTemplate: document.querySelector("#downloadTemplate"),
  adminProducts: document.querySelector("#adminProducts"),
  stockProducts: document.querySelector("#stockProducts"),
  resetProducts: document.querySelector("#resetProducts"),
  addSampleOrder: document.querySelector("#addSampleOrder"),
  ordersList: document.querySelector("#ordersList"),
  clientsList: document.querySelector("#clientsList"),
  clientsSearch: document.querySelector("#clientsSearch"),
  clientsSort: document.querySelector("#clientsSort"),
  exportClientsButton: document.querySelector("#exportClientsButton"),
  clientDetail: document.querySelector("#clientDetail"),
  reportGrid: document.querySelector("#reportGrid"),
  heroProducts: document.querySelector("#heroProducts"),
  heroCategories: document.querySelector("#heroCategories"),
  printPreviewOverlay: document.querySelector("#printPreviewOverlay"),
  printPreviewTitle: document.querySelector("#printPreviewTitle"),
  printPreviewBody: document.querySelector("#printPreviewBody"),
  printPreviewClose: document.querySelector("#printPreviewClose"),
  printPreviewPrint: document.querySelector("#printPreviewPrint"),
  printPreviewPdf: document.querySelector("#printPreviewPdf"),
  pdfDownloadSlot: document.querySelector("#pdfDownloadSlot"),
  stockModalOverlay: document.querySelector("#stockModalOverlay"),
  stockModalForm: document.querySelector("#stockModalForm"),
  stockModalTitle: document.querySelector("#stockModalTitle"),
  stockModalCurrent: document.querySelector("#stockModalCurrent"),
  stockModalQuantity: document.querySelector("#stockModalQuantity"),
  stockModalCancel: document.querySelector("#stockModalCancel"),
  editProductOverlay: document.querySelector("#editProductOverlay"),
  editProductForm: document.querySelector("#editProductForm"),
  editProductClose: document.querySelector("#editProductClose"),
  editProductTitle: document.querySelector("#editProductTitle"),
  editProductName: document.querySelector("#editProductName"),
  editProductOption: document.querySelector("#editProductOption"),
  editProductCategory: document.querySelector("#editProductCategory"),
  editProductPrice: document.querySelector("#editProductPrice"),
  editProductCostWrap: document.querySelector("#editProductCostWrap"),
  editProductCost: document.querySelector("#editProductCost"),
  editProductPresentation: document.querySelector("#editProductPresentation"),
  editProductDescription: document.querySelector("#editProductDescription"),
  editProductCatalog: document.querySelector("#editProductCatalog"),
  editProductImage: document.querySelector("#editProductImage"),
  editProductImageLabel: document.querySelector("#editProductImageLabel"),
  editProductImagePreview: document.querySelector("#editProductImagePreview"),
  replaceEditProductPhoto: document.querySelector("#replaceEditProductPhoto"),
  removeEditProductPhoto: document.querySelector("#removeEditProductPhoto"),
  editProductStock: document.querySelector("#editProductStock"),
  editProductStockCurrent: document.querySelector("#editProductStockCurrent"),
  editProductStockUnit: document.querySelector("#editProductStockUnit"),
  editProductStockDecrease: document.querySelector("#editProductStockDecrease"),
  editProductStockIncrease: document.querySelector("#editProductStockIncrease"),
  editProductImageGallery: document.querySelector("#editProductImageGallery"),
  editProductVariants: document.querySelector("#editProductVariants"),
  duplicateProductButton: document.querySelector("#duplicateProductButton"),
  deleteProductButton: document.querySelector("#deleteProductButton"),
  editProductCancel: document.querySelector("#editProductCancel"),
  internalLoginView: document.querySelector("#internalLoginView"),
  internalLoginForm: document.querySelector("#internalLoginForm"),
  internalUserRole: document.querySelector("#internalUserRole"),
  internalPassword: document.querySelector("#internalPassword"),
  internalLoginError: document.querySelector("#internalLoginError"),
  adminNav: document.querySelector("#adminNav"),
  adminNavManagement: document.querySelector("#adminNavManagement"),
  adminNavCatalog: document.querySelector("#adminNavCatalog"),
  backToManagement: document.querySelector("#backToManagement"),
  topbar: document.querySelector(".topbar"),
  siteFooter: document.querySelector(".site-footer"),
  descriptionModalOverlay: document.querySelector("#descriptionModalOverlay"),
  descriptionModalTitle: document.querySelector("#descriptionModalTitle"),
  descriptionModalText: document.querySelector("#descriptionModalText"),
  descriptionModalClose: document.querySelector("#descriptionModalClose"),
  imageLightbox: document.querySelector("#imageLightbox"),
  imageLightboxImage: document.querySelector("#imageLightboxImage"),
  imageLightboxCaption: document.querySelector("#imageLightboxCaption"),
  imageLightboxClose: document.querySelector("#imageLightboxClose"),
  imageLightboxPrev: document.querySelector("#imageLightboxPrev"),
  imageLightboxNext: document.querySelector("#imageLightboxNext"),
  toast: document.querySelector("#toast")
};

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    setView(button.dataset.view);
  });
});

els.internalLoginForm?.addEventListener("submit", handleInternalLogin);
els.adminNavManagement?.addEventListener("click", () => setView("admin"));
els.adminNavCatalog?.addEventListener("click", () => setView("catalogo"));
els.backToManagement?.addEventListener("click", () => setView("admin"));

els.searchInput.addEventListener("input", renderCatalog);
els.customerName.addEventListener("input", renderCart);
els.customerPhone.addEventListener("input", renderCart);
els.customerLocation.addEventListener("input", renderCart);
els.productImageInput?.addEventListener("change", handleProductImagePreview);
els.addVariantRow?.addEventListener("click", addVariantRow);
els.addProductToggle?.addEventListener("click", openAddProductModal);
els.productFormCancel?.addEventListener("click", closeAddProductModal);
els.addProductOverlay?.addEventListener("click", (event) => {
  if (event.target === els.addProductOverlay) closeAddProductModal();
});
els.importProductsButton?.addEventListener("click", () => {
  if (!hasPermission("importExport")) return;
  els.importProductsInput?.click();
});
els.exportProductsButton?.addEventListener("click", exportProductsToExcel);
els.importProductsInput?.addEventListener("change", importProductsFromFile);
els.clientsSearch?.addEventListener("input", renderClients);
els.clientsSort?.addEventListener("change", renderClients);
els.exportClientsButton?.addEventListener("click", exportClientsToExcel);
els.adminSearchInput?.addEventListener("input", renderAdmin);
document.querySelectorAll("[data-money-input]").forEach(setupMoneyInput);
setupEnterToNextField(els.productForm);
els.manageCategoriesButton?.addEventListener("click", () => {
  if (!hasPermission("manageProducts")) return;
  els.categoryManager?.classList.remove("hidden");
  els.categoryManager?.setAttribute("aria-hidden", "false");
  window.setTimeout(() => els.newCategoryName?.focus(), 0);
});
els.closeCategoryManager?.addEventListener("click", () => {
  els.categoryManager?.classList.add("hidden");
  els.categoryManager?.setAttribute("aria-hidden", "true");
});
els.categoryManager?.addEventListener("click", (event) => {
  if (event.target !== els.categoryManager) return;
  els.categoryManager.classList.add("hidden");
  els.categoryManager.setAttribute("aria-hidden", "true");
});
els.addCategoryButton?.addEventListener("click", addCategoryFromManager);
els.newCategoryName?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addCategoryFromManager();
});
els.openCart.addEventListener("click", openCart);
els.floatingCartButton?.addEventListener("click", openCart);
els.closeCart.addEventListener("click", closeCart);
els.continueShopping?.addEventListener("click", closeCart);
els.cartDrawer.addEventListener("click", (event) => {
  if (event.target === els.cartDrawer) closeCart();
});
els.clearCart.addEventListener("click", () => {
  cart = [];
  saveCart();
  renderAll();
  clearCartError();
  showToast("Carrito vacío");
});

els.productForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!hasPermission("manageProducts")) return;
  if (!validateProductForm(event.currentTarget)) return;
  const form = new FormData(event.currentTarget);
  const presentation = String(form.get("presentation") || "").trim();
  const saleType = getSaleTypeFromPresentation(presentation);
  const price = Math.max(0, parseMoneyInput(form.get("price")));
  const productId = crypto.randomUUID();
  const optionName = normalizeProductOptionLabel(form.get("option") || "");
  const baseName = stripProductOptionFromName(String(form.get("name") || "").trim(), optionName);
  const selectedImages = await getImagesFromProductForm(form, productId);
  const primaryImage = selectedImages[0] || DEFAULT_PRODUCT_IMAGE;
  const product = {
    id: productId,
    image: primaryImage,
    images: selectedImages.length ? selectedImages : [],
    name: baseName,
    baseName,
    optionName,
    brand: "",
    category: normalizeCategory(String(form.get("category")).trim()),
    presentation,
    description: String(form.get("description") || "").trim(),
    saleType,
    price,
    packQuantity: getPackQuantityFromPresentation(presentation),
    variants: String(form.get("variants") || "").trim(),
    variantStock: {},
    stock: Math.max(0, Number(form.get("stock")) || 0),
    minimum: 1,
    cost: parseMoneyInput(form.get("cost")),
    active: true,
    showInCatalog: form.get("showInCatalog") !== "no",
    sortOrder: getNextSortOrder()
  };

  products.push(product);
  saveProducts();
  const scrollTop = getAdminTableScrollTop();
  closeAddProductModal();
  resetImagePreview();
  renderAll();
  restoreAdminTableScroll(scrollTop);
  showToast("Producto guardado correctamente", "success");
});

els.resetProducts.addEventListener("click", () => {
  if (!canAccess("admin")) return;
  products = freshSampleProducts();
  ensureRequestedProductCatalog();
  cart = [];
  orders = sampleBudgets(products);
  stockHistory = [];
  clients = [];
  syncClientsFromOrders();
  saveProducts();
  saveCart();
  saveOrders();
  saveClients();
  saveStockHistory();
  renderAll();
  showToast("Productos y consultas de ejemplo restaurados");
});

els.addSampleOrder.addEventListener("click", () => {
  if (!canAccess("admin")) return;
  orders.unshift(makeConsultation({ name: "Cliente WhatsApp", phone: "2477000000", location: "Sin localidad" }, "Consulta de prueba sin productos."));
  syncClientsFromOrders();
  saveOrders();
  saveClients();
  renderAll();
  showToast("Consulta de prueba agregada");
});

els.downloadTemplate?.addEventListener("click", downloadImportTemplate);
els.downloadProductsTemplate?.addEventListener("click", downloadImportTemplate);
els.printPreviewClose?.addEventListener("click", closeInlinePrintPreview);
els.printPreviewPrint?.addEventListener("click", () => printModalContent(currentPrintType || "recibo"));
els.printPreviewPdf?.addEventListener("click", () => {
  if (!currentPdfUrl) showToast("No se pudo preparar el PDF");
});
els.stockModalForm?.addEventListener("submit", confirmStockModal);
els.stockModalCancel?.addEventListener("click", closeStockModal);
els.stockModalOverlay?.addEventListener("click", (event) => {
  if (event.target === els.stockModalOverlay) closeStockModal();
});
els.editProductCancel?.addEventListener("click", closeEditProductModal);
els.editProductClose?.addEventListener("click", closeEditProductModal);
els.editProductOverlay?.addEventListener("click", (event) => {
  if (event.target === els.editProductOverlay) closeEditProductModal();
});
els.editProductImage?.addEventListener("change", previewEditProductImage);
els.replaceEditProductPhoto?.addEventListener("click", () => els.editProductImage?.click());
els.removeEditProductPhoto?.addEventListener("click", markEditProductPhotoForRemoval);
els.editProductStockDecrease?.addEventListener("click", () => stepEditProductStock(-1));
els.editProductStockIncrease?.addEventListener("click", () => stepEditProductStock(1));
els.editProductStock?.addEventListener("input", normalizeEditProductStockInput);
els.editProductForm?.addEventListener("submit", saveEditedProduct);
setupProductDetailsMenus();
els.duplicateProductButton?.addEventListener("click", duplicateEditingProduct);
els.deleteProductButton?.addEventListener("click", deleteEditingProduct);
els.descriptionModalClose?.addEventListener("click", closeDescriptionModal);
els.descriptionModalOverlay?.addEventListener("click", (event) => {
  if (event.target === els.descriptionModalOverlay) closeDescriptionModal();
});
els.imageLightboxClose?.addEventListener("click", closeImageLightbox);
els.imageLightbox?.addEventListener("click", (event) => {
  const target = event.target;
  if (target.closest?.(".image-lightbox-arrow, .image-lightbox-close, #imageLightboxImage")) return;
  closeImageLightbox();
});
els.imageLightboxPrev?.addEventListener("click", () => showLightboxImage(lightboxIndex - 1));
els.imageLightboxNext?.addEventListener("click", () => showLightboxImage(lightboxIndex + 1));
els.imageLightboxImage?.addEventListener("error", showNextLightboxImage);
els.imageLightbox?.addEventListener("touchstart", (event) => {
  lightboxTouchStartX = event.touches?.[0]?.clientX || 0;
}, { passive: true });
els.imageLightbox?.addEventListener("touchend", (event) => {
  const endX = event.changedTouches?.[0]?.clientX || 0;
  const delta = endX - lightboxTouchStartX;
  if (Math.abs(delta) < 45) return;
  showLightboxImage(lightboxIndex + (delta < 0 ? 1 : -1));
}, { passive: true });
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && els.editProductOverlay && !els.editProductOverlay.classList.contains("hidden")) {
    closeEditProductModal();
    return;
  }
  if (event.key === "Escape" && editingBudgetItem) {
    closeBudgetItemEditor();
    return;
  }
  if (event.key === "Escape" && openOrderId) {
    closeOrderDetail(openOrderId);
    return;
  }
  if (els.imageLightbox?.classList.contains("hidden")) return;
  if (event.key === "Escape") closeImageLightbox();
  if (event.key === "ArrowLeft") showLightboxImage(lightboxIndex - 1);
  if (event.key === "ArrowRight") showLightboxImage(lightboxIndex + 1);
});

renderAll();
setView(getInitialView(), false, { skipHistory: true });
initializeAppHistory();
document.documentElement.dataset.gbApp = "loaded";
initializeSupabaseCatalog();
window.addEventListener("pagehide", teardownSupabaseCatalogRealtime);

function loadProducts() {
  const stored = localStorage.getItem(STORAGE_PRODUCTS);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(sampleProducts));
  return sampleProducts;
}

function resetLegacyData() {
  if (localStorage.getItem(STORAGE_SCHEMA) === APP_DATA_VERSION) return;
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(sampleProducts));
  localStorage.setItem(STORAGE_CART, JSON.stringify([]));
  localStorage.setItem(STORAGE_ORDERS, JSON.stringify([]));
  localStorage.setItem(STORAGE_STOCK_HISTORY, JSON.stringify([]));
  localStorage.setItem(STORAGE_SCHEMA, APP_DATA_VERSION);
}

function loadCart() {
  const stored = localStorage.getItem(STORAGE_CART);
  return stored ? JSON.parse(stored) : [];
}

function loadOrders() {
  const stored = localStorage.getItem(STORAGE_ORDERS);
  if (stored) return JSON.parse(stored);
  const initialOrders = sampleBudgets(products.length ? products : sampleProducts);
  localStorage.setItem(STORAGE_ORDERS, JSON.stringify(initialOrders));
  return initialOrders;
}

function loadStockHistory() {
  const stored = localStorage.getItem(STORAGE_STOCK_HISTORY);
  return stored ? JSON.parse(stored) : [];
}

function loadClients() {
  const stored = localStorage.getItem(STORAGE_CLIENTS);
  return stored ? JSON.parse(stored) : [];
}

function loadCategories() {
  const stored = localStorage.getItem(STORAGE_CATEGORIES);
  return stored ? JSON.parse(stored) : defaultProductCategories;
}

function saveProducts() {
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products));
  logSupabaseSyncDebug("saveProducts", {
    message: "Cambio local de productos guardado como respaldo. Se encola escritura a Supabase.",
    products: products.length,
    activeProducts: products.filter((product) => product.active !== false).length
  });
  queueSupabaseCatalogSync("products");
}

function saveCart() {
  localStorage.setItem(STORAGE_CART, JSON.stringify(cart));
}

function saveOrders() {
  localStorage.setItem(STORAGE_ORDERS, JSON.stringify(orders.filter((order) => !order.manualDraft)));
}

function saveStockHistory() {
  localStorage.setItem(STORAGE_STOCK_HISTORY, JSON.stringify(stockHistory));
}

function saveClients() {
  localStorage.setItem(STORAGE_CLIENTS, JSON.stringify(clients));
}

function saveCategories() {
  localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(categories));
  logSupabaseSyncDebug("saveCategories", {
    message: "Cambio local de categorias guardado como respaldo. Se encola escritura a Supabase.",
    categories: categories.length
  });
  queueSupabaseCatalogSync("categories");
}

function getSupabaseCatalogClient() {
  return window.gbSupabase || null;
}

function updateSupabaseCatalogStatus(status) {
  const payload = {
    ...status,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_SUPABASE_CATALOG_STATUS, JSON.stringify(payload));
  window.gbSupabaseCatalogStatus = payload;
  document.documentElement.dataset.gbSupabaseCatalog = payload.ok ? payload.mode || "ok" : "localStorage";
  document.documentElement.dataset.gbSupabaseCatalogError = payload.ok ? "" : payload.message || "error";
  logSupabaseSyncDebug("status", payload, payload.ok ? "info" : "error");
}

function logSupabaseSyncDebug() {
  // Diagnostico visual desactivado. La sincronizacion Supabase sigue intacta.
}

function queueSupabaseCatalogSync(reason = "manual") {
  if (!supabaseCatalogBootstrapped) {
    logSupabaseSyncDebug("sync-skipped", { reason, cause: "Supabase todavia no termino el arranque." }, "warn");
    return;
  }
  if (!supabaseCatalogReadyForWrites) {
    logSupabaseSyncDebug("sync-skipped", { reason, cause: "Supabase no esta listo para escritura. Se evita subir una copia local vieja." }, "warn");
    return;
  }
  if (!getSupabaseCatalogClient()) {
    logSupabaseSyncDebug("sync-skipped", { reason, cause: "No hay cliente Supabase configurado." }, "warn");
    return;
  }
  window.clearTimeout(supabaseCatalogSyncTimer);
  logSupabaseSyncDebug("sync-queued", { reason, delayMs: 200 });
  supabaseCatalogSyncTimer = window.setTimeout(() => {
    syncCatalogToSupabase(reason);
  }, 200);
}

async function initializeSupabaseCatalog() {
  document.documentElement.dataset.gbSupabaseCatalog = "starting";
  const client = getSupabaseCatalogClient();
  if (!client) {
    supabaseCatalogReadyForWrites = false;
    updateSupabaseCatalogStatus({
      ok: false,
      mode: "localStorage",
      message: "Supabase no esta configurado. La app sigue usando localStorage."
    });
    return;
  }

  try {
    document.documentElement.dataset.gbSupabaseCatalog = "reading";
    const remote = await withSupabaseTimeout(loadCatalogFromSupabase(), "No se pudo leer Supabase a tiempo.");
    supabaseCatalogBootstrapped = true;

    if (remote.products.length) {
      applyRemoteCatalog(remote, "supabase-read");
      supabaseCatalogReadyForWrites = true;
      setupSupabaseCatalogRealtime();
      return;
    }

    document.documentElement.dataset.gbSupabaseCatalog = "syncing-local";
    supabaseCatalogReadyForWrites = true;
    const syncResult = await syncCatalogToSupabase("initial-local-migration");
    if (!syncResult?.ok) return;
    setupSupabaseCatalogRealtime();
    updateSupabaseCatalogStatus({
      ok: true,
      mode: "local-to-supabase",
      message: "Supabase no tenia productos. Se envio una copia inicial desde localStorage.",
      products: products.length,
      variants: syncResult.variants || 0,
      categories: categories.length
    });
  } catch (error) {
    supabaseCatalogBootstrapped = true;
    supabaseCatalogReadyForWrites = false;
    updateSupabaseCatalogStatus({
      ok: false,
      mode: "localStorage",
      message: error.message || "No se pudo conectar con Supabase. La app sigue usando localStorage.",
      hint: "Si aparece un error de RLS o JWT, falta iniciar sesion o habilitar policies para esta etapa."
    });
    console.warn("GB Mayorista Supabase catalog init:", error);
  }
}

async function loadCatalogFromSupabase() {
  const client = getSupabaseCatalogClient();
  if (!client) return { categories: [], products: [] };
  supabaseProductDescriptionSupported = await detectSupabaseProductDescriptionSupport(client);
  supabaseProductOptionSupported = await detectSupabaseProductOptionSupport(client);
  supabaseProductGallerySupported = await detectSupabaseProductGallerySupport(client);

  const { data: categoryRows, error: categoryError } = await client
    .from("categories")
    .select("id, name, active, sort_order")
    .order("sort_order", { ascending: true });

  if (categoryError) throw categoryError;

  const { data: productRows, error: productError } = await client
    .from("products")
    .select("*, categories(name), product_variants(*)")
    .order("sort_order", { ascending: true });

  if (productError) throw productError;

  return {
    categories: mapSupabaseCategoriesToLocal(categoryRows || []),
    products: mapSupabaseProductsToLocal(productRows || []).filter((product) => product.active !== false)
  };
}

function applyRemoteCatalog(remote, reason = "supabase-read") {
  categories = normalizeCategories(remote.categories);
  products = normalizeProducts(remote.products);
  localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(categories));
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products));
  renderAll();
  updateSupabaseCatalogStatus({
    ok: true,
    mode: reason,
    message: "Catalogo cargado desde Supabase.",
    products: products.length,
    categories: categories.length
  });
}

async function refreshCatalogFromSupabase(reason = "manual", options = {}) {
  const client = getSupabaseCatalogClient();
  if (!client || supabaseCatalogRemoteRefreshing) {
    const result = { ok: false, message: "Sin cliente o lectura en curso.", reason };
    logSupabaseSyncDebug("read-skipped", result, "warn");
    return result;
  }
  supabaseCatalogRemoteRefreshing = true;
  document.documentElement.dataset.gbSupabaseCatalog = reason === "realtime" ? "realtime-refresh" : "reading";
  logSupabaseSyncDebug("read-start", {
    reason,
    message: "Empieza relectura de Supabase.",
    currentProducts: products.length,
    currentCategories: categories.length
  });

  try {
    const remote = await withSupabaseTimeout(loadCatalogFromSupabase(), "No se pudo actualizar Gestion desde Supabase a tiempo.");
    supabaseCatalogBootstrapped = true;
    if (!remote.products.length) {
      supabaseCatalogReadyForWrites = false;
      throw new Error("Supabase no devolvio productos para Gestion.");
    }
    applyRemoteCatalog(remote, reason === "realtime" ? "supabase-realtime" : "supabase-read");
    supabaseCatalogReadyForWrites = true;
    setupSupabaseCatalogRealtime();
    logSupabaseSyncDebug("read-ok", {
      reason,
      message: "Supabase respondio OK y Gestion se actualizo con datos remotos.",
      products: products.length,
      categories: categories.length
    }, "info", { payload: remote });
    return { ok: true, products: products.length, categories: categories.length };
  } catch (error) {
    supabaseCatalogReadyForWrites = false;
    updateSupabaseCatalogStatus({
      ok: false,
      mode: "supabase-error",
      message: error.message || "No se pudo actualizar Gestion desde Supabase.",
      reason,
      code: error.code || null,
      hint: error.hint || error.details || "Revisar conexion, RLS o Realtime."
    });
    console.warn("GB Mayorista Supabase catalog refresh:", error);
    logSupabaseSyncDebug("read-error", {
      reason,
      message: error.message || "No se pudo actualizar desde Supabase.",
      code: error.code || null,
      hint: error.hint || error.details || null
    }, "error", { error });
    if (!options.silent) showToast("No se pudo actualizar Gestion desde Supabase");
    return { ok: false, message: error.message || "No se pudo actualizar desde Supabase." };
  } finally {
    supabaseCatalogRemoteRefreshing = false;
  }
}

function setupSupabaseCatalogRealtime() {
  const client = getSupabaseCatalogClient();
  if (!client || typeof client.channel !== "function") return false;
  if (supabaseCatalogRealtimeChannel) return true;

  const refreshFromEvent = (payload) => {
    logSupabaseSyncDebug("realtime-event", {
      message: "Supabase Realtime aviso un cambio remoto.",
      table: payload?.table || "",
      eventType: payload?.eventType || "",
      id: payload?.new?.id || payload?.old?.id || payload?.new?.product_id || payload?.old?.product_id || ""
    }, "info", { payload });
    window.clearTimeout(supabaseCatalogRealtimeRefreshTimer);
    supabaseCatalogRealtimeRefreshTimer = window.setTimeout(() => {
      if (supabaseCatalogSyncRunning) {
        supabaseCatalogRealtimeRefreshTimer = window.setTimeout(() => {
          refreshCatalogFromSupabase("realtime", { silent: true });
        }, 500);
        return;
      }
      refreshCatalogFromSupabase("realtime", { silent: true });
    }, 250);
  };

  supabaseCatalogRealtimeChannel = client
    .channel("gb-mayorista-gestion-catalogo")
    .on("postgres_changes", { event: "*", schema: "public", table: "products" }, refreshFromEvent)
    .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, refreshFromEvent)
    .on("postgres_changes", { event: "*", schema: "public", table: "product_variants" }, refreshFromEvent)
    .subscribe((status) => {
      document.documentElement.dataset.gbSupabaseRealtime = String(status || "").toLowerCase();
      logSupabaseSyncDebug(status === "SUBSCRIBED" ? "realtime-ok" : "realtime-status", {
        message: `Estado del canal Realtime: ${status}`,
        status
      }, status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED" ? "error" : "info");
    });

  return true;
}

function teardownSupabaseCatalogRealtime() {
  window.clearTimeout(supabaseCatalogRealtimeRefreshTimer);
  supabaseCatalogRealtimeRefreshTimer = null;
  const client = getSupabaseCatalogClient();
  const channel = supabaseCatalogRealtimeChannel;
  supabaseCatalogRealtimeChannel = null;
  if (client && channel && typeof client.removeChannel === "function") {
    client.removeChannel(channel);
  }
}

function withSupabaseTimeout(promise, message, timeoutMs = 10000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), timeoutMs);
    })
  ]);
}

async function detectSupabaseProductDescriptionSupport(client) {
  try {
    const { error } = await client
      .from("products")
      .select("description")
      .limit(1);
    return !error;
  } catch (error) {
    return false;
  }
}

async function detectSupabaseProductOptionSupport(client) {
  try {
    const { error } = await client
      .from("products")
      .select("base_name, option_name")
      .limit(1);
    return !error;
  } catch (error) {
    return false;
  }
}

async function detectSupabaseProductGallerySupport(client) {
  try {
    const { error } = await client
      .from("products")
      .select("gallery_images")
      .limit(1);
    return !error;
  } catch (error) {
    return false;
  }
}

async function syncCatalogToSupabase(reason = "manual") {
  const client = getSupabaseCatalogClient();
  if (!client || supabaseCatalogSyncRunning) {
    const result = { ok: false, message: "Sin cliente Supabase o sincronizacion en curso.", reason };
    logSupabaseSyncDebug("save-skipped", result, "warn");
    return result;
  }
  supabaseCatalogSyncRunning = true;
  logSupabaseSyncDebug("save-start", {
    reason,
    message: "Empieza guardado en Supabase.",
    products: products.length,
    categories: categories.length,
    pendingDeletedProducts: supabaseCatalogPendingDeletedProductIds.size
  });

  try {
    const categoryRows = categories.map((category, index) => ({
      name: String(category.name || "").trim(),
      active: category.active !== false,
      sort_order: (index + 1) * 10
    })).filter((category) => category.name);

    const { data: savedCategories, error: categoryError } = await client
      .from("categories")
      .upsert(categoryRows, { onConflict: "name" })
      .select("id, name");

    if (categoryError) throw categoryError;

    let categoriesForMap = savedCategories || [];
    if (!categoriesForMap.length) {
      const { data: refreshedCategories, error: refreshCategoryError } = await client
        .from("categories")
        .select("id, name");
      if (refreshCategoryError) throw refreshCategoryError;
      categoriesForMap = refreshedCategories || [];
    }

    const categoryIdByName = new Map(categoriesForMap.map((category) => [
      normalizeCategoryNameForCompare(category.name),
      category.id
    ]));

    const productRows = products.map((product, index) => {
      const row = {
        id: product.id,
        category_id: categoryIdByName.get(normalizeCategoryNameForCompare(product.category)) || null,
        name: supabaseProductOptionSupported ? getProductBaseName(product) : getProductArticleName(product),
        brand: product.brand || "",
        presentation: getProductPresentation(product),
        cost_price: Math.max(0, Number(product.cost) || 0),
        sale_price: Math.max(0, Number(product.price) || 0),
        stock: Math.max(0, Number(product.stock) || 0),
        show_in_catalog: product.showInCatalog !== false,
        image_path: getSupabaseImagePath(product.image),
        active: product.active !== false,
        sort_order: Number.isFinite(product.sortOrder) ? product.sortOrder : index + 1
      };
      if (supabaseProductDescriptionSupported) row.description = String(product.description || "").trim();
      if (supabaseProductGallerySupported) row.gallery_images = getStoredProductImages(product).map(getSupabaseImagePath).filter(Boolean);
      if (supabaseProductOptionSupported) {
        row.base_name = getProductBaseName(product);
        row.option_name = getProductOptionName(product);
      }
      return row;
    }).filter((product) => product.name);

    logSupabaseSyncDebug("save-payload", {
      reason,
      message: "Datos preparados para enviar a Supabase.",
      categoryRows: categoryRows.length,
      productRows: productRows.length,
      pendingDeletedProductIds: [...supabaseCatalogPendingDeletedProductIds]
    }, "info", { payload: { categoryRows, productRows, pendingDeletedProductIds: [...supabaseCatalogPendingDeletedProductIds] } });

    if (productRows.length) {
      const { data: savedProducts, error: productError } = await client
        .from("products")
        .upsert(productRows, { onConflict: "id" })
        .select("id");

      if (productError) throw productError;
      if (!Array.isArray(savedProducts) || savedProducts.length === 0) {
        throw new Error("Supabase no confirmo la escritura de productos. Revisar permisos RLS para products.");
      }

      const deletedProducts = await deleteExplicitlyRemovedProductsFromSupabase(client);
      const variantsSynced = await syncProductVariantsToSupabase(client);
      supabaseCatalogReadyForWrites = true;
      updateSupabaseCatalogStatus({
        ok: true,
        mode: "supabase-sync",
        message: "Productos, categorias y variantes sincronizados con Supabase.",
        reason,
        products: savedProducts.length,
        deletedProducts,
        variants: variantsSynced,
        categories: categories.length
      });
      setupSupabaseCatalogRealtime();
      logSupabaseSyncDebug("save-ok", {
        reason,
        message: "Supabase respondio OK al guardar productos/categorias/variantes.",
        savedProducts: savedProducts.length,
        deletedProducts,
        variantsSynced
      }, "info", { payload: { savedProducts, deletedProducts, variantsSynced } });
      const rereadResult = await refreshCatalogFromSupabase("after-save", { silent: true });
      logSupabaseSyncDebug(rereadResult.ok ? "after-save-read-ok" : "after-save-read-error", {
        reason,
        message: rereadResult.ok ? "Despues de guardar se releyo Supabase correctamente." : "Despues de guardar fallo la relectura de Supabase.",
        result: rereadResult
      }, rereadResult.ok ? "info" : "error");
      return {
        ok: true,
        products: savedProducts.length,
        deletedProducts,
        variants: variantsSynced,
        reread: rereadResult
      };
    }

    updateSupabaseCatalogStatus({
      ok: true,
      mode: "supabase-sync",
      message: "Productos, categorias y variantes sincronizados con Supabase.",
      reason,
      products: products.length,
      categories: categories.length
    });
    supabaseCatalogReadyForWrites = true;
    setupSupabaseCatalogRealtime();
    logSupabaseSyncDebug("save-ok", {
      reason,
      message: "Supabase respondio OK. No habia productos para enviar.",
      products: 0
    });
    const rereadResult = await refreshCatalogFromSupabase("after-save-empty", { silent: true });
    logSupabaseSyncDebug(rereadResult.ok ? "after-save-read-ok" : "after-save-read-error", {
      reason,
      message: rereadResult.ok ? "Despues de guardar se releyo Supabase correctamente." : "Despues de guardar fallo la relectura de Supabase.",
      result: rereadResult
    }, rereadResult.ok ? "info" : "error");
    return { ok: true, products: 0, variants: 0 };
  } catch (error) {
    updateSupabaseCatalogStatus({
      ok: false,
      mode: "localStorage",
      message: error.message || "No se pudo sincronizar con Supabase. Los datos quedaron guardados en localStorage.",
      reason,
      code: error.code || null,
      hint: error.hint || error.details || "Revisar RLS/policies si la tabla remota queda vacia."
    });
    console.warn("GB Mayorista Supabase catalog sync:", error);
    logSupabaseSyncDebug("save-error", {
      reason,
      message: error.message || "No se pudo sincronizar con Supabase.",
      code: error.code || null,
      hint: error.hint || error.details || null
    }, "error", { error });
    return {
      ok: false,
      message: error.message || "No se pudo sincronizar con Supabase.",
      code: error.code || null
    };
  } finally {
    supabaseCatalogSyncRunning = false;
  }
}

async function deleteExplicitlyRemovedProductsFromSupabase(client) {
  const deletedIds = [...supabaseCatalogPendingDeletedProductIds].filter(Boolean);
  if (!deletedIds.length) return 0;

  const { error: deleteVariantsError } = await client
    .from("product_variants")
    .delete()
    .in("product_id", deletedIds);
  if (deleteVariantsError) throw deleteVariantsError;

  const { error: deleteProductsError } = await client
    .from("products")
    .delete()
    .in("id", deletedIds);
  if (deleteProductsError) throw deleteProductsError;

  deletedIds.forEach((id) => supabaseCatalogPendingDeletedProductIds.delete(id));
  return deletedIds.length;
}

async function syncProductVariantsToSupabase(client) {
  const productIds = products.map((product) => product.id).filter(Boolean);
  if (!productIds.length) return;

  const { error: deleteError } = await client
    .from("product_variants")
    .delete()
    .in("product_id", productIds);

  if (deleteError) throw deleteError;

  const variantRows = products.flatMap((product) => {
    const variants = getProductVariantNames(product);
    return variants.map((name, index) => ({
      product_id: product.id,
      name,
      presentation: getProductPresentation(product),
      sale_price: null,
      stock: Math.max(0, Number(product.variantStock?.[name]) || 0),
      active: true,
      sort_order: index + 1
    }));
  });

  if (!variantRows.length) return 0;

  const { data: insertedVariants, error: insertError } = await client
    .from("product_variants")
    .insert(variantRows)
    .select("id");

  if (insertError) throw insertError;
  return Array.isArray(insertedVariants) ? insertedVariants.length : variantRows.length;
}

function mapSupabaseCategoriesToLocal(rows) {
  return rows.map((row) => ({
    name: row.name,
    active: row.active !== false
  }));
}

function mapSupabaseProductsToLocal(rows) {
  return rows.map((row, index) => {
    const variantRows = [...(row.product_variants || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const variantStock = {};
    variantRows.forEach((variant) => {
      variantStock[variant.name] = Math.max(0, Number(variant.stock) || 0);
    });
    const presentation = row.presentation || "";
    const identity = getProductIdentityFromName(row.base_name || row.name || "", row.option_name || "");
    const galleryImages = Array.isArray(row.gallery_images) ? row.gallery_images.map(getCatalogImage).filter(Boolean) : [];
    const productImages = mergeProductImages(row.image_path, galleryImages);

    return {
      id: row.id,
      name: identity.baseName,
      baseName: identity.baseName,
      optionName: identity.optionName,
      brand: row.brand || "",
      category: row.categories?.name || defaultProductCategories[0],
      presentation,
      description: row.description || getDefinitiveProductDescription(row.name) || getLocalProductDescription(row.id),
      saleType: getSaleTypeFromPresentation(presentation),
      price: Math.max(0, Number(row.sale_price) || 0),
      packQuantity: getPackQuantityFromPresentation(presentation),
      cost: Math.max(0, Number(row.cost_price) || 0),
      stock: Math.max(0, Number(row.stock) || 0),
      minimum: 1,
      image: productImages[0] || DEFAULT_PRODUCT_IMAGE,
      images: productImages,
      variants: variantRows.map((variant) => variant.name).join("\n"),
      variantStock,
      active: row.active !== false,
      showInCatalog: row.show_in_catalog !== false,
      sortOrder: Number.isFinite(row.sort_order) ? row.sort_order : index + 1
    };
  });
}

function getProductVariantNames(product) {
  return String(product.variants || "")
    .split(/[\n,;]+/)
    .map((variant) => variant.split("|")[0]?.trim())
    .filter(Boolean);
}

function getLocalProductDescription(productId) {
  const localProduct = products.find((product) => product.id === productId);
  return String(localProduct?.description || "").trim();
}

function getSupabaseImagePath(image) {
  const value = String(image || "").trim();
  if (!value || value === DEFAULT_PRODUCT_IMAGE || value.startsWith("data:")) return null;
  return value;
}

async function uploadProductImageToSupabase(productId, file) {
  const client = getSupabaseCatalogClient();
  if (!client || !(file instanceof File) || !file.size) return "";

  try {
    const extension = getImageFileExtension(file);
    const path = `products/${productId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const { error } = await client.storage
      .from("product-images")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type || `image/${extension}`
      });

    if (error) throw error;

    const { data } = client.storage
      .from("product-images")
      .getPublicUrl(path);

    return data?.publicUrl || "";
  } catch (error) {
    updateSupabaseCatalogStatus({
      ok: false,
      mode: "localStorage",
      message: error.message || "No se pudo subir la imagen a Supabase. Se mantiene respaldo local.",
      scope: "images"
    });
    console.warn("GB Mayorista Supabase image upload:", error);
    return "";
  }
}

function getImageFileExtension(file) {
  const fromName = String(file?.name || "").split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(fromName)) return fromName === "jpg" ? "jpeg" : fromName;
  const fromType = String(file?.type || "").split("/").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(fromType)) return fromType === "jpg" ? "jpeg" : fromType;
  return "png";
}

window.gbSyncCatalogToSupabase = syncCatalogToSupabase;
window.gbLoadCatalogFromSupabase = loadCatalogFromSupabase;
window.gbRefreshCatalogFromSupabase = refreshCatalogFromSupabase;
window.gbSetupCatalogRealtime = setupSupabaseCatalogRealtime;
window.gbTeardownCatalogRealtime = teardownSupabaseCatalogRealtime;
window.gbForceSyncProductsToSupabase = function () {
  supabaseCatalogBootstrapped = true;
  supabaseCatalogReadyForWrites = true;
  return syncCatalogToSupabase("manual-force-products");
};

function renderAll() {
  renderRole();
  renderNav();
  renderStats();
  renderCategories();
  renderProductFormCategories();
  renderCatalog();
  if (internalUnlocked) {
    renderAdmin();
    renderCategoryManager();
    renderStock();
    renderOrders();
    renderClients();
    if (hasPermission("reports")) {
      renderReports();
    } else if (els.reportGrid) {
      els.reportGrid.innerHTML = "";
    }
  }
  renderCart();
  applyRoleVisibility();
}

function renderRole() {
  const role = roles[currentRole] || roles.client;
  if (els.roleTitle) els.roleTitle.textContent = role.label;
  if (els.roleDescription) els.roleDescription.textContent = role.description;
}

function renderNav() {
  const isManagementView = getManagementViews().includes(currentView);
  document.querySelectorAll("[data-view]").forEach((button) => {
    const isManagementEntry = button.dataset.managementEntry === "true";
    button.classList.toggle("active", isManagementEntry ? isManagementView : button.dataset.view === currentView);
  });
}

function renderStats() {
  els.heroProducts.textContent = products.length;
  els.heroCategories.textContent = getCategories().length;
}

function renderCategories() {
  const categoryNames = ["Todas", ...getVisibleCategories()];
  if (currentCategory !== "Todas" && !categoryNames.includes(currentCategory)) currentCategory = "Todas";
  const categoryButtons = categoryNames.map((category) => `
    <button type="button" class="${category === currentCategory ? "active" : ""}" data-category="${escapeHtml(category)}">
      ${escapeHtml(category)}
    </button>
  `).join("");
  els.categoryFilters.innerHTML = `
    <details class="mobile-category-menu">
      <summary>Categorías <strong>${escapeHtml(currentCategory)}</strong></summary>
      <div class="mobile-category-options">${categoryButtons}</div>
    </details>
    <div class="desktop-category-buttons">${categoryButtons}</div>
  `;

  els.categoryFilters.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      currentCategory = button.dataset.category;
      renderCategories();
      renderCatalog();
    });
  });
}

function renderProductFormCategories() {
  const select = els.productForm?.querySelector('select[name="category"]');
  if (!select) return;
  const currentValue = select.value;
  const categoryNames = getVisibleCategories();
  select.innerHTML = categoryNames.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("");
  if (categoryNames.includes(currentValue)) select.value = currentValue;
}

function renderCatalog() {
  const query = normalizeProductSearchText(els.searchInput.value);
  const catalogProducts = getCatalogProducts();
  const filtered = catalogProducts.filter((group) => {
    const matchesCategory = currentCategory === "Todas" || group.category === currentCategory;
    const haystack = normalizeProductSearchText(group.name);
    const matchesSearch = !query || haystack.includes(query);
    return matchesCategory && matchesSearch;
  });

  if (!filtered.length) {
    els.productGrid.innerHTML = `<div class="empty-state">Catálogo vacío. La estructura está lista para cargar productos reales.</div>`;
    return;
  }

  catalogImageFallbacks = new Map(filtered.map((group) => [
    group.id,
    mergeProductImages(group.images || [], group.image ? [group.image] : [])
  ]));

  els.productGrid.innerHTML = filtered.map((group) => `
    <article class="product-card ${hasCatalogVariantChoices(group) ? "has-variants" : "no-variants"}">
      <button class="product-image-button" type="button" data-open-gallery="${escapeHtml(group.id)}" aria-label="Ver fotos de ${escapeHtml(group.name)}">
        <img class="product-image" src="${escapeHtml(group.image)}" alt="${escapeHtml(group.name)}" loading="lazy" data-catalog-image="${escapeHtml(group.id)}" data-image-index="0" onerror="showNextCatalogImage(this)">
      </button>
      <div class="product-body">
        <div class="product-title-row">
          <div class="product-title">${formatCatalogTitleForCard(group.name)}</div>
        </div>
        ${renderCatalogVariantControl(group)}
        ${renderCatalogGroupPrice(group)}
        <div class="quantity-row quantity-stepper-row">
          <label for="qty-${group.id}">${escapeHtml(getCatalogQuantityLabel(group))}</label>
          <div class="quantity-stepper" data-stepper="${group.id}">
            <button class="quantity-stepper-button" type="button" data-qty-decrease="${group.id}" aria-label="Restar cantidad">−</button>
            <input id="qty-${group.id}" type="number" min="${group.minimum}" step="1" value="${group.minimum}" aria-label="Cantidad para ${escapeHtml(group.name)}" data-catalog-qty="${group.id}">
            <button class="quantity-stepper-button" type="button" data-qty-increase="${group.id}" aria-label="Sumar cantidad">+</button>
          </div>
          <button class="primary-button" type="button" data-add-catalog="${group.id}" ${!hasCatalogVariantChoices(group) && !hasCatalogPrice(group.variants[0]?.price) ? "disabled" : ""}><span class="button-label-full">Agregar al carrito</span><span class="button-label-short">Agregar</span></button>
        </div>
      </div>
    </article>
  `).join("");

  els.productGrid.querySelectorAll("[data-open-gallery]").forEach((button) => {
    button.addEventListener("click", () => {
      const group = catalogProducts.find((item) => item.id === button.dataset.openGallery);
      if (group) openImageLightbox(group.images || [group.image], { title: group.name, description: group.description || "" });
    });
  });

  els.productGrid.querySelectorAll("[data-catalog-image]").forEach((image) => {
    if (image.complete && image.naturalWidth === 0) showNextCatalogImage(image);
  });

  els.productGrid.querySelectorAll("[data-add-catalog]").forEach((button) => {
    button.addEventListener("click", () => {
      const group = catalogProducts.find((item) => item.id === button.dataset.addCatalog);
      if (!group) return;
      const variantSelect = document.querySelector(`#variant-${CSS.escape(group.id)}`);
      const needsVariant = hasCatalogVariantChoices(group);
      const variant = group.variants.find((item) => item.id === variantSelect?.value) || (!needsVariant ? group.variants[0] : null);
      if (!variant) {
        showToast("Elegí una variante antes de agregar al carrito");
        return;
      }
      if (!hasCatalogPrice(variant.price)) {
        showToast("Este producto no tiene precio cargado");
        return;
      }
      const internalProduct = products.find((item) => item.id === variant.productId);
      addCatalogGroupToCart(group, variant, getCatalogQuantityValue(group.id, group.minimum), internalProduct);
    });
  });

  els.productGrid.querySelectorAll("[data-catalog-variant]").forEach((select) => {
    select.addEventListener("change", () => updateCatalogCardSelection(select.dataset.catalogVariant, catalogProducts));
  });

  els.productGrid.querySelectorAll("[data-catalog-qty]").forEach((input) => {
    input.addEventListener("input", () => {
      normalizeCatalogQuantityInput(input);
      updateCatalogCardSelection(input.dataset.catalogQty, catalogProducts);
    });
    input.addEventListener("blur", () => normalizeCatalogQuantityInput(input, true));
  });

  els.productGrid.querySelectorAll("[data-qty-decrease], [data-qty-increase]").forEach((button) => {
    button.addEventListener("click", () => {
      const groupId = button.dataset.qtyDecrease || button.dataset.qtyIncrease;
      const group = catalogProducts.find((item) => item.id === groupId);
      const direction = button.dataset.qtyIncrease ? 1 : -1;
      changeCatalogQuantity(groupId, direction, group?.minimum || 1);
      updateCatalogCardSelection(groupId, catalogProducts);
    });
  });

}

function getCatalogProducts() {
  const groups = new Map();
  const catalogSourceProducts = getOrderedProducts()
    .filter((product) => product.active !== false)
    .filter((product) => product.showInCatalog !== false)
    .filter((product) => isCategoryVisible(product.category));

  catalogSourceProducts.forEach((product) => {
      const info = getCatalogGroupInfo(product);
      const key = info.key;
      const customVariants = parseVariantDetails(product);
      const productImages = getProductImages(product);
      if (!groups.has(key)) {
        groups.set(key, {
          id: key,
          name: info.name,
          brand: product.brand || "GB Mayorista",
          category: product.category,
          description: product.description || "",
          image: productImages[0] || DEFAULT_PRODUCT_IMAGE,
          images: productImages,
          saleType: product.saleType,
          minimum: product.minimum || 1,
          variants: []
        });
      }
      const group = groups.get(key);
      if (!group.description && product.description) group.description = product.description;
      group.images = mergeProductImages(group.images, productImages);
      group.image = group.images[0] || DEFAULT_PRODUCT_IMAGE;
      const variantsToAdd = customVariants.length
        ? customVariants.map((variant, index) => ({
          id: `${product.id}__${index}`,
          productId: product.id,
          internalName: getProductArticleName(product),
          label: variant.name,
          price: variant.price || product.price || 0,
          saleType: variant.saleType || product.saleType,
          packQuantity: variant.packQuantity || product.packQuantity,
          presentation: getProductPresentation(product),
          stock: getProductTotalStock(product)
        }))
        : [{
        id: product.id,
        productId: product.id,
        internalName: getProductArticleName(product),
        label: info.variantLabel,
        price: product.price || 0,
        saleType: product.saleType,
        packQuantity: product.packQuantity,
        presentation: getProductPresentation(product),
        stock: getProductTotalStock(product)
      }];
      group.variants.push(...variantsToAdd);
      group.minimum = Math.min(group.minimum || product.minimum || 1, product.minimum || 1);
      if (!group.image || group.image === DEFAULT_PRODUCT_IMAGE) group.image = getCatalogImage(product.image);
    });

  return [...groups.values()].map((group) => {
    const variants = group.variants
      .map((variant) => ({ ...variant, price: Number(variant.price) || 0 }))
      .filter((variant, index, list) => {
        const key = [
          normalizeProductSearchText(variant.label),
          Number(variant.price) || 0,
          normalizeProductSearchText(variant.presentation)
        ].join("|");
        return list.findIndex((item) => [
          normalizeProductSearchText(item.label),
          Number(item.price) || 0,
          normalizeProductSearchText(item.presentation)
        ].join("|") === key) === index;
      })
      .sort(compareCatalogVariants);
    return {
      ...group,
      variants,
      price: variants[0]?.price || 0
    };
  });
}

function getCatalogGroupInfo(product) {
  const baseName = getProductBaseName(product);
  const optionName = getProductOptionName(product);
  const priceKey = Math.max(0, Number(product.price) || 0);
  const presentationKey = normalizeProductSearchText(getProductPresentation(product));
  return {
    key: `${normalizeProductSearchText(baseName)}-${priceKey}-${presentationKey}`,
    name: baseName,
    variantLabel: optionName
  };
}

function getCatalogProductParts(name) {
  const cleanName = String(name || "").trim().replace(/\s+/g, " ");
  const patterns = [
    /^(.*?)\s+(Talle\s+[\w½]+)$/i,
    /^(.*?)\s+(Surtido\s+T\d+\s*-\s*\d+)$/i
  ];
  const match = patterns.map((pattern) => cleanName.match(pattern)).find(Boolean);
  if (!match || !match[1] || !match[2]) return null;
  return {
    baseName: match[1],
    variantRaw: match[2]
  };
}

function normalizeCatalogBaseName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function buildCatalogRanges(productList) {
  const rangesByBase = new Map();
  productList.forEach((product) => {
    const parts = getCatalogProductParts(getProductDisplayName(product));
    if (!parts) return;
    const rangeMatch = parts.variantRaw.match(/T?(\d+)-(\d+)/i);
    if (!rangeMatch) return;
    const baseKey = normalizeProductSearchText(parts.baseName);
    const range = {
      from: Number(rangeMatch[1]),
      to: Number(rangeMatch[2])
    };
    const ranges = rangesByBase.get(baseKey) || [];
    if (!ranges.some((item) => item.from === range.from && item.to === range.to)) ranges.push(range);
    rangesByBase.set(baseKey, ranges);
  });
  return rangesByBase;
}

function getCatalogSizeRange(value, knownRanges = []) {
  const text = String(value || "").toUpperCase();
  const rangeMatch = text.match(/T?(\d+)-(\d+)/);
  if (rangeMatch) return makeCatalogRange(Number(rangeMatch[1]), Number(rangeMatch[2]));
  const size = Number(text.match(/T(\d+)/)?.[1]) || 0;
  const matchingRange = knownRanges.find((range) => size >= range.from && size <= range.to);
  if (matchingRange) return makeCatalogRange(matchingRange.from, matchingRange.to);
  return { key: "general", title: "VARIANTES" };
}

function makeCatalogRange(from, to) {
  return {
    key: `t${from}-${to}`,
    title: `TALLES ${from} ${to - from === 1 ? "Y" : "AL"} ${to}`
  };
}

function getCatalogVariantLabel(value) {
  const text = String(value || "").trim();
  const surtido = /surtido/i.test(text);
  const rangeMatch = text.match(/T?(\d+)-(\d+)/i);
  if (rangeMatch) {
    return surtido
      ? `Surtido T${rangeMatch[1]}-${rangeMatch[2]}`
      : `Talles ${rangeMatch[1]} al ${rangeMatch[2]}`;
  }
  const sizeMatch = text.match(/T(\d+)/i);
  if (sizeMatch) return `Talle ${sizeMatch[1]}`;
  return surtido ? "Surtido" : text || "Variante";
}

function compareCatalogVariants(a, b) {
  return getCatalogVariantSort(a.label) - getCatalogVariantSort(b.label) || a.label.localeCompare(b.label, "es");
}

function getCatalogVariantSort(label) {
  const text = String(label || "");
  const number = Number(text.match(/\d+/)?.[0]) || 99;
  return /surtido/i.test(text) ? number + 50 : number;
}

function toCatalogTitle(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function formatCatalogTitleForCard(value) {
  const title = escapeHtml(String(value || "").trim().replace(/\s+/g, " ").toUpperCase());
  return title
    .replace(/\s+-\s+TALLES\s+/g, "<br>TALLES ")
    .replace(/\s+TALLES\s+/g, "<br>TALLES ")
    .replace(/\s+(ART\.\s*\d+)/g, "<br>$1")
    .replace(/<br>ART\.\s*(\d+)<br>TALLES\s+/g, "<br>ART. $1<br>TALLES ");
}

function renderCatalogGroupPrice(group) {
  const selectedVariant = group.variants[0];
  return `
    <div class="pack-price">
      <div class="pack-main-price" data-catalog-price="${group.id}">${selectedVariant ? formatCatalogPrice(selectedVariant.price || 0) : ""}</div>
      ${renderCatalogSaleDetail(group, selectedVariant)}
    </div>
  `;
}

function closeDescriptionModal() {
  els.descriptionModalOverlay?.classList.add("hidden");
  els.descriptionModalOverlay?.setAttribute("aria-hidden", "true");
}

function renderCatalogVariantControl(group) {
  if (!hasCatalogVariantChoices(group)) return "";
  return `
    <label class="variant-select-row" for="variant-${group.id}">
      <select id="variant-${group.id}" data-catalog-variant="${group.id}" aria-label="Elegir talle">
        <option value="">Elegir talle</option>
        ${group.variants.map((variant) => `<option value="${escapeHtml(variant.id)}" data-price="${variant.price}" data-internal-product-id="${escapeHtml(variant.productId)}" data-internal-product-name="${escapeHtml(variant.internalName || "")}">${escapeHtml(variant.label)}</option>`).join("")}
      </select>
    </label>
  `;
}

function hasCatalogVariantChoices(group) {
  const labels = new Set((group.variants || []).map((variant) => String(variant.label || "").trim().toLowerCase()).filter(Boolean));
  return labels.size > 0;
}

function updateCatalogCardSelection(groupId, catalogProducts) {
  const group = catalogProducts.find((item) => item.id === groupId);
  if (!group) return;
  const select = document.querySelector(`#variant-${CSS.escape(groupId)}`);
  const quantityInput = document.querySelector(`#qty-${CSS.escape(groupId)}`);
  const needsVariant = hasCatalogVariantChoices(group);
  const selectedVariant = group.variants.find((item) => item.id === select?.value) || null;
  const displayVariant = selectedVariant || group.variants[0] || null;
  const variant = selectedVariant || (!needsVariant ? displayVariant : null);
  const quantity = getCatalogQuantityValue(groupId, group.minimum || 1);
  const price = Number(displayVariant?.price) || 0;
  const priceEl = document.querySelector(`[data-catalog-price="${CSS.escape(groupId)}"]`);
  const saleDetailEl = document.querySelector(`[data-catalog-sale-detail="${CSS.escape(groupId)}"]`);
  const addButton = document.querySelector(`[data-add-catalog="${CSS.escape(groupId)}"]`);
  if (priceEl) priceEl.textContent = displayVariant ? formatCatalogPrice(price) : "";
  if (saleDetailEl) saleDetailEl.innerHTML = displayVariant ? getCatalogSaleDetailHtml(displayVariant) : "";
  if (addButton) addButton.disabled = !variant || !hasCatalogPrice(Number(variant?.price) || 0);
}

function formatCatalogPrice(price) {
  const amount = Number(price) || 0;
  return amount > 0 ? formatMoney(amount) : "";
}

function formatCatalogSubtotal(price, quantity) {
  const amount = Number(price) || 0;
  return amount > 0 ? formatMoney(amount * Math.max(1, Number(quantity) || 1)) : "";
}

function getCatalogQuantityValue(groupId, minimum = 1) {
  const input = document.querySelector(`#qty-${CSS.escape(groupId)}`);
  const min = Math.max(1, Math.round(Number(minimum) || 1));
  return Math.max(min, Math.round(Number(input?.value) || min));
}

function normalizeCatalogQuantityInput(input, force = false) {
  if (!input) return;
  const min = Math.max(1, Math.round(Number(input.min) || 1));
  const raw = Math.round(Number(input.value) || min);
  const next = Math.max(min, raw);
  if (force || String(input.value) !== String(next)) input.value = String(next);
}

function changeCatalogQuantity(groupId, delta, minimum = 1) {
  const input = document.querySelector(`#qty-${CSS.escape(groupId)}`);
  if (!input) return;
  const min = Math.max(1, Math.round(Number(minimum) || 1));
  const current = Math.max(min, Math.round(Number(input.value) || min));
  input.value = String(Math.max(min, current + delta));
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function renderCatalogSaleDetail(group, variant) {
  return `<div class="pack-sale-detail" data-catalog-sale-detail="${escapeHtml(group.id)}">${variant ? getCatalogSaleDetailHtml(variant) : ""}</div>`;
}

function getCatalogSaleDetailHtml(variant) {
  const presentation = getPresentationLabelForCatalog(variant?.presentation);
  const unitPrice = getCatalogUnitPriceLabel(variant);
  return [
    presentation ? `<span>${escapeHtml(presentation)}</span>` : "",
    unitPrice ? `<span>${escapeHtml(unitPrice)}</span>` : ""
  ].filter(Boolean).join("");
}

function getPresentationLabelForCatalog(presentation) {
  const text = String(presentation || "").trim();
  if (!text) return "";
  if (/docena/i.test(text)) return "Venta por docena";
  if (/unidad/i.test(text)) return "Venta por unidad";
  if (/pack/i.test(text)) return text;
  return text;
}

function getCatalogUnitPriceLabel(variant) {
  const price = Number(variant?.price) || 0;
  const presentation = String(variant?.presentation || "").trim();
  if (!price || !/docena/i.test(presentation)) return "";
  const docenas = Math.max(1, Number(presentation.match(/\d+/)?.[0]) || 1);
  return `Pagás por unidad: ${formatMoney(Math.round(price / (docenas * 12)))}`;
}

function getCatalogQuantityLabel(group) {
  return "Cantidad";
}

function hasCatalogPrice(price) {
  return Number(price) > 0;
}

function getCatalogImage(image) {
  const normalized = normalizeCatalogImageReference(image);
  return isExampleImage(normalized) ? DEFAULT_PRODUCT_IMAGE : normalized || DEFAULT_PRODUCT_IMAGE;
}

function showNextCatalogImage(image) {
  const images = catalogImageFallbacks.get(image.dataset.catalogImage) || [];
  const currentIndex = Number(image.dataset.imageIndex) || 0;
  const nextIndex = currentIndex + 1;
  if (nextIndex < images.length) {
    image.dataset.imageIndex = String(nextIndex);
    image.src = images[nextIndex];
    return;
  }
  image.removeAttribute("data-catalog-image");
  image.onerror = null;
  image.src = DEFAULT_PRODUCT_IMAGE;
}

function isExampleImage(image) {
  return /images\.unsplash\.com/i.test(String(image || ""));
}

function normalizeCatalogImageReference(image) {
  const value = String(image || "").trim();
  if (!value || value === DEFAULT_PRODUCT_IMAGE || value.startsWith("data:") || value.startsWith("blob:")) return value;
  if (/^https?:\/\//i.test(value)) {
    return value.replace("/storage/v1/object/product-images/", "/storage/v1/object/public/product-images/");
  }
  const supabaseUrl = String(window.GB_SUPABASE_CONFIG?.url || "").replace(/\/$/, "");
  if (!supabaseUrl) return value;
  const cleanPath = value.replace(/^\/+/, "");
  const storagePublicPrefix = "storage/v1/object/public/product-images/";
  if (cleanPath.startsWith(storagePublicPrefix)) return `${supabaseUrl}/${cleanPath}`;
  const storagePrivatePrefix = "storage/v1/object/product-images/";
  if (cleanPath.startsWith(storagePrivatePrefix)) return `${supabaseUrl}/${storagePublicPrefix}${cleanPath.slice(storagePrivatePrefix.length)}`;
  const bucketPrefix = "product-images/";
  const objectPath = cleanPath.startsWith(bucketPrefix) ? cleanPath.slice(bucketPrefix.length) : cleanPath;
  if (objectPath.startsWith("products/")) {
    return `${supabaseUrl}/${storagePublicPrefix}${objectPath.split("/").map(encodeURIComponent).join("/")}`;
  }
  return value;
}

function toggleCatalogDetails(groupId, button) {
  const details = document.querySelector(`#details-${CSS.escape(groupId)}`);
  if (!details) return;
  details.classList.toggle("hidden");
  button.textContent = details.classList.contains("hidden") ? "Ver detalles" : "Ocultar detalles";
}

function renderAdmin() {
  renderAdminCategories();
  const isAdmin = canAccess("admin");
  const canEditSaleData = hasPermission("editSaleData") || isAdmin;
  const adminHead = els.adminProducts?.closest("table")?.querySelector("thead tr");
  if (adminHead) {
    adminHead.innerHTML = `
      <th>Foto</th>
      <th>${renderSortHeader("name", "Producto")}</th>
      <th>Talle</th>
      <th>${renderSortHeader("category", "Categoría")}</th>
      ${isAdmin ? "<th>Costo</th>" : ""}
      <th>${renderSortHeader("price", "Venta")}</th>
      <th>${renderSortHeader("stock", "Stock")}</th>
      <th>Catálogo</th>
      ${isAdmin ? "<th>Editar</th>" : ""}
    `;
    adminHead.querySelectorAll("[data-sort-products]").forEach((button) => {
      button.addEventListener("click", () => updateAdminProductSort(button.dataset.sortProducts));
    });
  }
  const query = normalizeProductSearchText(els.adminSearchInput?.value || "");
  const queryWords = query ? query.split(" ").filter(Boolean) : [];
  const orderedProducts = sortAdminProducts(getOrderedProducts().filter((product) => {
    const matchesCategory = product.category === currentAdminCategory;
    const searchableText = normalizeProductSearchText([
      product.name,
      getProductBaseName(product),
      getProductOptionName(product),
      product.category,
      getProductPresentation(product)
    ].join(" "));
    const matchesSearch = !queryWords.length || queryWords.every((word) => searchableText.includes(word));
    return (queryWords.length ? true : matchesCategory) && matchesSearch;
  }));
  if (els.adminCategoryTitle) els.adminCategoryTitle.textContent = currentAdminCategory;
  if (els.adminCategorySummary) {
    els.adminCategorySummary.textContent = "";
  }

  if (!orderedProducts.length) {
    els.adminProducts.innerHTML = `
      <tr>
        <td colspan="${isAdmin ? 11 : 7}">
          <div class="empty-state compact">No hay productos para mostrar en esta categoría. Podés agregar uno nuevo o cambiar el filtro.</div>
        </td>
      </tr>
    `;
    return;
  }

  els.adminProducts.innerHTML = orderedProducts.map((product) => `
    <tr class="${getAdminProductRowClass(product)}">
      <td class="mobile-product-card" colspan="${isAdmin ? 9 : 7}">
        <div class="mobile-product-row">
          <div class="mobile-product-thumb">
            ${product.image && product.image !== DEFAULT_PRODUCT_IMAGE ? `<img src="${escapeHtml(getCatalogImage(product.image))}" alt="">` : `<span>Sin foto</span>`}
          </div>
          <div class="mobile-product-info">
            <strong>${escapeHtml(getProductBaseName(product))}</strong>
            <span>${escapeHtml(getProductOptionName(product) || "Sin talle")}</span>
            <small>${Number(product.price) > 0 ? formatMoney(product.price) : "Falta precio"} · Stock ${escapeHtml(formatProductStock(product))} · Catálogo ${product.showInCatalog !== false ? "Sí" : "No"}</small>
          </div>
          ${isAdmin ? `<button class="edit-product-button mobile-edit-product" type="button" data-edit-product="${product.id}" aria-label="Editar producto">Editar</button>` : ""}
        </div>
      </td>
      <td data-label="Foto" class="product-photo-cell">${product.image && product.image !== DEFAULT_PRODUCT_IMAGE ? `<img class="product-thumb" src="${escapeHtml(getCatalogImage(product.image))}" alt="">` : `<span class="no-photo-pill">Sin foto</span>`}</td>
      <td data-label="Producto" class="product-name-cell"><strong>${escapeHtml(getProductBaseName(product))}</strong></td>
      <td data-label="Talle" class="product-option-cell">${escapeHtml(getProductOptionName(product) || "-")}</td>
      <td data-label="Categoría" class="product-category-cell">${escapeHtml(product.category)}</td>
      ${isAdmin ? `<td data-label="Costo" class="metric-cell price-column product-cost-cell">${formatMoney(product.cost || 0)}</td>` : ""}
      <td data-label="Venta" class="metric-cell price-column product-price-cell ${Number(product.price) > 0 ? "" : "missing-price"}">${Number(product.price) > 0 ? formatMoney(product.price) : "Falta precio"}</td>
      <td data-label="Stock" class="stock-column product-stock-cell">
        <span class="stock-cell"><strong>${escapeHtml(formatProductStock(product))}</strong><button class="stock-button" type="button" data-open-stock-modal="${product.id}">Stock</button></span>
      </td>
      <td data-label="Catálogo" class="product-catalog-cell"><span class="catalog-status ${product.showInCatalog !== false ? "is-visible" : "is-hidden"}">${product.showInCatalog !== false ? "Sí" : "No"}</span></td>
      ${isAdmin ? `
        <td data-label="Editar" class="edit-column product-edit-cell">
          <button class="edit-product-button" type="button" data-edit-product="${product.id}" aria-label="Editar producto" title="Editar">Editar</button>
        </td>
      ` : ""}
    </tr>
  `).join("");
  els.adminProducts.querySelectorAll("[data-open-stock-modal]").forEach((button) => {
    button.addEventListener("click", () => openStockModal(button.dataset.openStockModal));
  });

  els.adminProducts.querySelectorAll("[data-product-catalog]").forEach((select) => {
    select.addEventListener("change", () => updateProductCatalogVisibility(select.dataset.productCatalog, select.value === "yes"));
  });

  els.adminProducts.querySelectorAll("[data-product-image]").forEach((input) => {
    input.addEventListener("change", () => updateProductImage(input.dataset.productImage, input.files?.[0]));
  });

  els.adminProducts.querySelectorAll("[data-inline-product-field]").forEach((input) => {
    if (input.dataset.inlineProductField === "price") setupMoneyInput(input);
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      input.blur();
    });
    input.addEventListener("blur", () => updateInlineProductField(input));
  });

  els.adminProducts.querySelectorAll("[data-edit-product]").forEach((button) => {
    button.addEventListener("click", () => openEditProductModal(button.dataset.editProduct));
  });
}

function updateProductCatalogVisibility(productId, showInCatalog) {
  if (!hasPermission("editSaleData") && !canAccess("admin")) return;
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  const scrollTop = getAdminTableScrollTop();
  product.showInCatalog = showInCatalog;
  saveProducts();
  renderAll();
  restoreAdminTableScroll(scrollTop);
  showToast(showInCatalog ? "Producto visible en catálogo" : "Producto oculto del catálogo");
}

function renderSortHeader(field, label) {
  const active = adminProductSort.field === field;
  const marker = active ? (adminProductSort.direction === "asc" ? " ▲" : " ▼") : "";
  return `<button class="table-sort-button ${active ? "active" : ""}" type="button" data-sort-products="${field}">${label}${marker}</button>`;
}

function updateAdminProductSort(field) {
  if (adminProductSort.field === field) {
    adminProductSort.direction = adminProductSort.direction === "asc" ? "desc" : "asc";
  } else {
    adminProductSort = { field, direction: "asc" };
  }
  renderAdmin();
}

function sortAdminProducts(productList) {
  const direction = adminProductSort.direction === "desc" ? -1 : 1;
  return [...productList].sort((a, b) => {
    let left;
    let right;
    if (adminProductSort.field === "category") {
      left = a.category || "";
      right = b.category || "";
    } else if (adminProductSort.field === "price") {
      left = Number(a.price) || 0;
      right = Number(b.price) || 0;
    } else if (adminProductSort.field === "stock") {
      left = getProductTotalStock(a);
      right = getProductTotalStock(b);
    } else {
      left = getProductDisplayName(a);
      right = getProductDisplayName(b);
    }
    if (typeof left === "number" || typeof right === "number") return (left - right) * direction;
    return String(left).localeCompare(String(right), "es", { sensitivity: "base" }) * direction;
  });
}

async function updateProductImage(productId, file) {
  if (!hasPermission("manageProducts")) return;
  const product = products.find((item) => item.id === productId);
  if (!product || !(file instanceof File) || !file.size) return;

  try {
    const scrollTop = getAdminTableScrollTop();
    const processedFile = await prepareProductImageFile(file);
    const image = await uploadProductImageToSupabase(product.id, processedFile) || await readFileAsDataUrl(processedFile);
    setProductImages(product, [image, ...getStoredProductImages(product)]);
    saveProducts();
    renderAll();
    restoreAdminTableScroll(scrollTop);
    showToast("Imagen actualizada");
  } catch (error) {
    showToast("No se pudo cargar la imagen");
  }
}

function updateInlineProductField(input) {
  if (!hasPermission("editSaleData") && !canAccess("admin")) return;
  const product = products.find((item) => item.id === input.dataset.productId);
  if (!product) return;
  const field = input.dataset.inlineProductField;
  const scrollTop = getAdminTableScrollTop();

  if (field === "price") {
    product.price = Math.max(0, Math.round(parseMoneyInput(input.value)));
    input.value = formatInputMoney(product.price);
  }

  if (field === "presentation") {
    const presentation = String(input.value || "").trim();
    if (!presentation) {
      setProductFieldError(input, "Ingresá la presentación.");
      return;
    }
    product.presentation = presentation;
    product.saleType = getSaleTypeFromPresentation(presentation);
    product.packQuantity = getPackQuantityFromPresentation(presentation);
  }

  saveProducts();
  renderAll();
  restoreAdminTableScroll(scrollTop);
  showToast("Producto guardado correctamente", "success");
}

function getAdminProductRowClass(product) {
  const classes = [];
  if (!(Number(product.price) > 0)) classes.push("row-missing-price");
  if (!(Number(product.stock) > 0)) classes.push("row-zero-stock");
  return classes.join(" ");
}

function getAdminTableScrollTop() {
  return document.querySelector(".admin-table-wrap")?.scrollTop || 0;
}

function restoreAdminTableScroll(scrollTop) {
  window.requestAnimationFrame(() => {
    const wrap = document.querySelector(".admin-table-wrap");
    if (wrap) wrap.scrollTop = scrollTop;
  });
}

function parseMoneyInput(value) {
  const normalized = String(value ?? "").replace(/[^\d]/g, "");
  return Number(normalized) || 0;
}

function formatInputMoney(value) {
  const number = parseMoneyInput(value);
  return number > 0 ? number.toLocaleString("es-AR") : "";
}

function setupMoneyInput(input) {
  if (!input) return;
  input.addEventListener("input", () => {
    const cursorAtEnd = input.selectionStart === input.value.length;
    input.value = formatInputMoney(input.value);
    if (cursorAtEnd) input.setSelectionRange(input.value.length, input.value.length);
  });
  input.addEventListener("blur", () => {
    input.value = formatInputMoney(input.value);
  });
}

function setupEnterToNextField(form) {
  if (!form) return;
  form.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.target instanceof HTMLTextAreaElement) return;
    const fields = [...form.querySelectorAll("input:not([type='hidden']), select, textarea, button[type='submit']")]
      .filter((field) => !field.disabled && !field.closest(".hidden"));
    const index = fields.indexOf(event.target);
    if (index < 0 || index >= fields.length - 1) return;
    event.preventDefault();
    fields[index + 1].focus();
  });
}

function openEditProductModal(productId) {
  if (!hasPermission("manageProducts")) return;
  const product = products.find((item) => item.id === productId);
  if (!product || !els.editProductOverlay || !els.editProductForm) return;
  editingProductId = productId;
  clearProductValidation(els.editProductForm);
  fillEditCategoryOptions(product.category);
  if (els.editProductTitle) els.editProductTitle.textContent = `Editar: ${getProductBaseName(product)}`;
  if (els.editProductName) els.editProductName.value = getProductBaseName(product);
  if (els.editProductOption) els.editProductOption.value = getProductOptionName(product);
  if (els.editProductPrice) els.editProductPrice.value = formatInputMoney(product.price);
  if (els.editProductCost) els.editProductCost.value = formatInputMoney(product.cost);
  if (els.editProductPresentation) els.editProductPresentation.value = getProductPresentation(product);
  if (els.editProductDescription) els.editProductDescription.value = product.description || "";
  if (els.editProductCatalog) els.editProductCatalog.value = product.showInCatalog === false ? "no" : "yes";
  if (els.editProductStock) els.editProductStock.value = String(Math.max(0, Number(product.stock) || 0));
  updateEditProductStockLabels(product);
  editProductRemoveImagePending = false;
  if (els.editProductImage) els.editProductImage.value = "";
  if (els.editProductImageLabel) els.editProductImageLabel.textContent = getStoredProductImages(product).length ? "Cambiar foto" : "Agregar foto";
  if (els.editProductImagePreview) els.editProductImagePreview.src = getPrimaryProductImage(product);
  renderEditProductImageGallery(product);
  if (els.editProductVariants) els.editProductVariants.value = product.variants || "";
  window.setTimeout(() => { editProductInitialState = getEditProductFormState(); }, 0);
  els.editProductCostWrap?.classList.toggle("hidden", !canAccess("admin"));
  els.editProductOverlay.classList.remove("hidden");
  els.editProductOverlay.setAttribute("aria-hidden", "false");
  pushEditProductHistoryState();
  window.setTimeout(clearEditProductModalFocus, 0);
}

function clearEditProductModalFocus() {
  if (!els.editProductOverlay || els.editProductOverlay.classList.contains("hidden")) return;
  const active = document.activeElement;
  if (active && els.editProductOverlay.contains(active) && typeof active.blur === "function") {
    active.blur();
  }
}
function fillEditCategoryOptions(selectedCategory) {
  if (!els.editProductCategory) return;
  const categoryNames = getCategories();
  els.editProductCategory.innerHTML = categoryNames.map((category) => (
    `<option value="${escapeHtml(category)}" ${category === selectedCategory ? "selected" : ""}>${escapeHtml(category)}</option>`
  )).join("");
}

function closeEditProductModal(options = {}) {
  const wasOpen = els.editProductOverlay && !els.editProductOverlay.classList.contains("hidden");
  if (wasOpen && !options.skipUnsavedCheck && hasEditProductUnsavedChanges()) {
    const confirmed = window.confirm("Hay cambios sin guardar. ¿Querés salir?");
    if (!confirmed) {
      if (options.fromHistory && window.history?.pushState) {
        editProductModalHistoryActive = false;
        pushEditProductHistoryState();
      }
      return;
    }
  }
  editingProductId = "";
  els.editProductOverlay?.classList.add("hidden");
  els.editProductOverlay?.setAttribute("aria-hidden", "true");
  clearProductValidation(els.editProductForm);
  els.editProductForm?.reset();
  if (els.editProductImageGallery) els.editProductImageGallery.innerHTML = "";
  editProductInitialState = "";
  editProductRemoveImagePending = false;
  closeOpenProductDetailsMenu({ skipHistory: true });
  if (wasOpen && editProductModalHistoryActive) {
    editProductModalHistoryActive = false;
    if (!options.fromHistory && window.history?.state?.modal === "editProduct") {
      editProductModalClosingByCode = true;
      window.history.back();
    }
  }
}

function pushEditProductHistoryState() {
  if (!appHistoryReady || !window.history?.pushState) return;
  if (editProductModalHistoryActive || window.history.state?.modal === "editProduct") return;
  editProductModalHistoryActive = true;
  window.history.pushState({ ...makeAppHistoryState(currentView), modal: "editProduct" }, "", getCurrentHistoryUrl());
}

function duplicateEditingProduct() {
  if (!hasPermission("manageProducts") || !editingProductId) return;
  const product = products.find((item) => item.id === editingProductId);
  if (!product) return;
  const scrollTop = getAdminTableScrollTop();
  const copy = {
    ...product,
    id: crypto.randomUUID(),
    name: `${getProductBaseName(product)} copia`,
    images: getStoredProductImages(product),
    stock: 0,
    variantStock: {},
    active: true,
    sortOrder: getNextSortOrder()
  };
  products.push(copy);
  saveProducts();
  closeEditProductModal({ skipUnsavedCheck: true });
  renderAll();
  restoreAdminTableScroll(scrollTop);
  showToast("Producto duplicado");
}

function deleteEditingProduct() {
  if (!hasPermission("manageProducts") || !editingProductId) return;
  const product = products.find((item) => item.id === editingProductId);
  if (!product) return;
  const confirmed = window.confirm(`¿Eliminar "${getProductArticleName(product)}"? Esta acción no borra pedidos históricos.`);
  if (!confirmed) return;
  const scrollTop = getAdminTableScrollTop();
  supabaseCatalogPendingDeletedProductIds.add(editingProductId);
  products = products.filter((item) => item.id !== editingProductId);
  cart = cart.filter((item) => item.id !== editingProductId && item.internalProductId !== editingProductId);
  stockHistory = stockHistory.filter((entry) => entry.productId !== editingProductId);
  saveProducts();
  saveCart();
  saveStockHistory();
  closeEditProductModal({ skipUnsavedCheck: true });
  renderAll();
  restoreAdminTableScroll(scrollTop);
  showToast("Producto eliminado");
}

function validateProductForm(form) {
  clearProductValidation(form);
  const requiredFields = [
    { name: "name", message: "Ingresá el nombre del producto." },
    { name: "category", message: "Seleccioná una categoría." },
    { name: "presentation", message: "Ingresá la presentación." }
  ];
  const firstInvalid = requiredFields.find(({ name, message }) => {
    const field = form.querySelector(`[name="${name}"]`);
    const value = String(field?.value || "").trim();
    const invalid = !value;
    if (invalid) setProductFieldError(field, message);
    return invalid;
  });
  if (firstInvalid) {
    const field = form.querySelector(`[name="${firstInvalid.name}"]`);
    field?.focus();
    showToast("Revisá los campos obligatorios.");
    return false;
  }
  return true;
}

function clearProductValidation(form) {
  if (!form) return;
  form.querySelectorAll(".input-error").forEach((field) => field.classList.remove("input-error"));
  form.querySelectorAll(".field-error-message").forEach((message) => message.remove());
}

function setProductFieldError(field, message) {
  if (!field) return;
  field.classList.add("input-error");
  const label = field.closest("label") || field.parentElement;
  if (!label || label.querySelector(".field-error-message")) return;
  const error = document.createElement("span");
  error.className = "field-error-message";
  error.textContent = message;
  label.appendChild(error);
}

async function previewEditProductImage() {
  const file = els.editProductImage?.files?.[0];
  if (!(file instanceof File) || !file.size || !els.editProductImagePreview) return;
  try {
    editProductRemoveImagePending = false;
    els.editProductImagePreview.src = await processProductImageToDataUrl(file);
    if (els.editProductImageLabel) els.editProductImageLabel.textContent = "Cambiar foto";
  } catch (error) {
    showToast("No se pudo cargar la imagen");
  }
}

async function saveEditedProduct(event) {
  event.preventDefault();
  if (!hasPermission("manageProducts") || !editingProductId) return;
  if (!validateProductForm(event.currentTarget)) return;
  const product = products.find((item) => item.id === editingProductId);
  if (!product) return;

  product.optionName = normalizeProductOptionLabel(els.editProductOption?.value || "");
  product.baseName = stripProductOptionFromName(String(els.editProductName?.value || "").trim() || getProductBaseName(product), product.optionName);
  product.name = product.baseName;
  product.brand = product.brand || "";
  product.category = normalizeCategory(String(els.editProductCategory?.value || product.category).trim());
  const scrollTop = getAdminTableScrollTop();
  product.price = Math.max(0, Math.round(parseMoneyInput(els.editProductPrice?.value)));
  if (canAccess("admin")) product.cost = Math.max(0, Math.round(parseMoneyInput(els.editProductCost?.value)));
  product.presentation = String(els.editProductPresentation?.value || "").trim();
  product.description = String(els.editProductDescription?.value || "").trim();
  product.stock = Math.max(0, Math.round(Number(els.editProductStock?.value) || 0));
  product.saleType = getSaleTypeFromPresentation(product.presentation);
  product.packQuantity = getPackQuantityFromPresentation(product.presentation);
  product.variants = String(els.editProductVariants?.value || "").trim();
  product.showInCatalog = els.editProductCatalog?.value !== "no";

  const imageFiles = getFileList(els.editProductImage?.files);
  if (imageFiles.length) {
    const nextImages = await uploadOrReadImageFiles(product.id, imageFiles.slice(0, 1));
    setProductImages(product, nextImages);
  } else if (editProductRemoveImagePending) {
    setProductImages(product, []);
  }

  saveProducts();
  closeEditProductModal({ skipUnsavedCheck: true });
  renderAll();
  restoreAdminTableScroll(scrollTop);
  showToast("Producto guardado correctamente", "success");
}

function openStockModal(productId) {
  if (!hasPermission("stock")) return;
  const product = products.find((item) => item.id === productId);
  if (!product || !els.stockModalOverlay || !els.stockModalForm) return;
  stockModalProductId = productId;
  if (els.stockModalTitle) {
    els.stockModalTitle.textContent = `Modificar stock: ${getProductArticleName(product)}`;
  }
  if (els.stockModalCurrent) {
    els.stockModalCurrent.textContent = `Stock actual: ${formatProductStock(product)}`;
  }
  els.stockModalForm.reset();
  const addMode = els.stockModalForm.querySelector('input[name="stockMode"][value="add"]');
  if (addMode) addMode.checked = true;
  if (els.stockModalQuantity) els.stockModalQuantity.value = "";
  els.stockModalOverlay.classList.remove("hidden");
  els.stockModalOverlay.setAttribute("aria-hidden", "false");
  pushStockModalHistoryState();
  window.setTimeout(() => els.stockModalQuantity?.focus(), 0);
}

function closeStockModal(options = {}) {
  stockModalProductId = "";
  els.stockModalOverlay?.classList.add("hidden");
  els.stockModalOverlay?.setAttribute("aria-hidden", "true");
  if (stockModalHistoryActive) {
    stockModalHistoryActive = false;
    if (!options.fromHistory && window.history?.state?.modal === "stockModal") {
      stockModalClosingByCode = true;
      window.history.back();
    }
  }
}

function pushStockModalHistoryState() {
  if (!appHistoryReady || !window.history?.pushState) return;
  if (stockModalHistoryActive || window.history.state?.modal === "stockModal") return;
  stockModalHistoryActive = true;
  window.history.pushState({ ...makeAppHistoryState(currentView), modal: "stockModal" }, "", getCurrentHistoryUrl());
}

function confirmStockModal(event) {
  event.preventDefault();
  if (!stockModalProductId) return;
  const product = products.find((item) => item.id === stockModalProductId);
  if (!product) return;
  const form = new FormData(event.currentTarget);
  const mode = String(form.get("stockMode") || "add");
  const quantity = Math.max(0, Math.round(Number(els.stockModalQuantity?.value) || 0));
  const currentStock = getProductTotalStock(product);
  const nextStock = mode === "replace"
    ? quantity
    : mode === "subtract"
      ? Math.max(0, currentStock - quantity)
      : currentStock + quantity;

  setProductStock(stockModalProductId, nextStock, "Ajuste manual", "Base / sin variante", { silent: true });
  closeStockModal();
}

function openAddProductModal() {
  if (!hasPermission("manageProducts") || !els.addProductOverlay || !els.productForm) return;
  els.productForm.reset();
  clearProductValidation(els.productForm);
  renderProductFormCategories();
  if (els.productVariants) els.productVariants.value = "";
  const stockInput = els.productForm.querySelector('input[name="stock"]');
  if (stockInput) stockInput.value = "0";
  resetImagePreview("La vista previa de la foto aparecer\\u00e1 antes de guardar.");
  els.addProductOverlay.classList.remove("hidden");
  els.addProductOverlay.setAttribute("aria-hidden", "false");
  updateProductFormToggle();
  pushAddProductModalHistoryState();
  window.setTimeout(() => els.productForm?.querySelector('input[name="name"]')?.focus(), 0);
}

function closeAddProductModal(options = {}) {
  els.addProductOverlay?.classList.add("hidden");
  els.addProductOverlay?.setAttribute("aria-hidden", "true");
  clearProductValidation(els.productForm);
  els.productForm?.reset();
  if (els.productVariants) els.productVariants.value = "";
  const stockInput = els.productForm?.querySelector('input[name="stock"]');
  if (stockInput) stockInput.value = "0";
  resetImagePreview("La vista previa de la foto aparecer\\u00e1 antes de guardar.");
  updateProductFormToggle();
  if (addProductModalHistoryActive) {
    addProductModalHistoryActive = false;
    if (!options.fromHistory && window.history?.state?.modal === "addProductModal") {
      addProductModalClosingByCode = true;
      window.history.back();
    }
  }
}

function pushAddProductModalHistoryState() {
  if (!appHistoryReady || !window.history?.pushState) return;
  if (addProductModalHistoryActive || window.history.state?.modal === "addProductModal") return;
  addProductModalHistoryActive = true;
  window.history.pushState({ ...makeAppHistoryState(currentView), modal: "addProductModal" }, "", getCurrentHistoryUrl());
}
function updateProductFormToggle() {
  if (!els.addProductToggle || !els.addProductOverlay) return;
  els.addProductToggle.textContent = els.addProductOverlay.classList.contains("hidden")
    ? "+ Agregar producto"
    : "Cerrar";
}

function renderAdminCategories() {
  if (!els.adminCategoryFilters) return;
  const categoryNames = getVisibleCategories();
  if (!categoryNames.includes(currentAdminCategory)) currentAdminCategory = categoryNames[0] || "";
  els.adminCategoryFilters.innerHTML = categoryNames.map((category) => {
    const count = products.filter((product) => product.category === category).length;
    return `<button class="${category === currentAdminCategory ? "active" : ""}" type="button" data-admin-category="${escapeHtml(category)}">${escapeHtml(category)} <span>(${count})</span></button>`;
  }).join("");

  els.adminCategoryFilters.querySelectorAll("[data-admin-category]").forEach((button) => {
    button.addEventListener("click", () => {
      currentAdminCategory = button.dataset.adminCategory;
      renderAdmin();
    });
  });
}

function getProductDisplayName(product) {
  return getProductArticleName(product)
    .replace(/\bpack\s*x\s*\d+\b/ig, "")
    .replace(/\bx\s*\d+\b/ig, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function getProductBaseName(product) {
  return stripProductOptionFromName(product?.baseName || product?.name || "", getProductOptionName(product));
}

function getProductOptionName(product) {
  return normalizeProductOptionLabel(product?.optionName || "");
}

function getProductArticleName(product) {
  return buildProductArticleName(getProductBaseName(product), getProductOptionName(product));
}

function buildProductArticleName(baseName, optionName = "") {
  const option = normalizeProductOptionLabel(optionName);
  const base = stripProductOptionFromName(baseName, option);
  if (!option) return base;
  return `${base} ${option}`.trim();
}

function stripProductOptionFromName(name, optionName = "") {
  const cleanName = String(name || "").trim().replace(/\s+/g, " ");
  const cleanOption = normalizeProductOptionLabel(optionName);
  if (!cleanName || !cleanOption) return cleanName;
  const escaped = cleanOption.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return cleanName.replace(new RegExp(`\\s+${escaped}$`, "i"), "").trim();
}

function getProductIdentityFromName(name, explicitOption = "") {
  const cleanName = String(name || "").trim().replace(/\s+/g, " ");
  const cleanOption = String(explicitOption || "").trim().replace(/\s+/g, " ");
  if (cleanOption) {
    const optionName = normalizeProductOptionLabel(cleanOption);
    return {
      baseName: stripProductOptionFromName(cleanName, optionName),
      optionName
    };
  }
  const parts = inferProductIdentityFromLegacyName(cleanName);
  return {
    baseName: parts.baseName || cleanName,
    optionName: normalizeProductOptionLabel(parts.optionName || "")
  };
}

function inferProductIdentityFromLegacyName(name) {
  const cleanName = String(name || "").trim().replace(/\s+/g, " ");
  const patterns = [
    /^(.*?)\s+(Talle\s+[\w½]+)$/i,
    /^(.*?)\s+(T\d+)$/i,
    /^(.*?)\s+(Surtido\s+Talle\s*\d+\s*-\s*\d+)$/i,
    /^(.*?)\s+(Surtido\s+T\d+\s*-\s*\d+)$/i,
    /^(.*?)\s+(T\d+\s*-\s*\d+\s*Surtido)$/i
  ];
  const match = patterns.map((pattern) => cleanName.match(pattern)).find(Boolean);
  if (!match || !match[1] || !match[2]) return { baseName: cleanName, optionName: "" };
  return {
    baseName: match[1].trim(),
    optionName: match[2].trim()
  };
}

function normalizeProductOptionLabel(value) {
  const text = String(value || "").trim().replace(/\s+/g, " ");
  const compactTalle = text.match(/^T(\d+)$/i);
  if (compactTalle) return `Talle ${compactTalle[1]}`;
  const rangeSurtido = text.match(/^T(\d+)\s*-\s*(\d+)\s*Surtido$/i);
  if (rangeSurtido) return `Surtido T${rangeSurtido[1]}-${rangeSurtido[2]}`;
  const surtidoTalleRange = text.match(/^Surtido\s+Talle\s*(\d+)\s*-\s*(\d+)$/i);
  if (surtidoTalleRange) return `Surtido T${surtidoTalleRange[1]}-${surtidoTalleRange[2]}`;
  const surtidoRange = text.match(/^Surtido\s+T(\d+)\s*-\s*(\d+)$/i);
  if (surtidoRange) return `Surtido T${surtidoRange[1]}-${surtidoRange[2]}`;
  return text;
}

function getProductPresentation(product) {
  if (product.presentation) return String(product.presentation).trim();

  const name = String(product.name || "");
  const unitsMatch = name.match(/\b(\d+)\s*unidades?\b/i);
  if (unitsMatch) {
    const units = Number(unitsMatch[1]) || 1;
    return `${units} ${units === 1 ? "Unidad" : "Unidades"}`;
  }

  const dozenMatch = name.match(/\b(\d+)\s*docenas?\b/i);
  if (dozenMatch) {
    const dozens = Number(dozenMatch[1]) || 1;
    return `${dozens} ${dozens === 1 ? "Docena" : "Docenas"}`;
  }

  const packMatch = name.match(/\bpack\s*x\s*(\d+)\b/i);
  const packQuantity = packMatch ? Number(packMatch[1]) : Number(product.packQuantity) || 1;
  if (product.saleType === "pack" || packMatch) {
    const dozens = packQuantity % 12 === 0 ? packQuantity / 12 : 1;
    return `${dozens} ${dozens === 1 ? "Docena" : "Docenas"}`;
  }

  return `${packQuantity} ${packQuantity === 1 ? "Unidad" : "Unidades"}`;
}

function getSaleTypeFromPresentation(presentation) {
  const text = String(presentation || "").trim();
  return /docena|pack/i.test(text) ? "pack" : "unit";
}

function formatProductStock(product, stock = getProductTotalStock(product)) {
  const quantity = Math.max(0, Number(stock) || 0);
  const unit = getStockUnitLabel(product, quantity);
  return `${quantity} ${unit}`;
}

function getStockUnitLabel(product, quantity = 0) {
  const presentation = String(getProductPresentation(product) || "").trim();
  const lower = presentation.toLowerCase();
  const pack = lower.match(/pack\s*x\s*(\d+)/i);
  if (pack) return `${quantity === 1 ? "pack" : "packs"} x${pack[1]}`;
  if (lower.includes("docena")) return quantity === 1 ? "docena" : "docenas";
  if (lower.includes("unidad")) return quantity === 1 ? "unidad" : "unidades";
  if (!presentation) return quantity === 1 ? "unidad" : "unidades";
  return quantity === 1 ? lower : lower.endsWith("s") ? lower : `${lower}s`;
}

function isLody742Product(product) {
  return /boxer\s+adulto\s+lody\s+art\.\s*742/i.test(String(product?.name || ""));
}

function ensureRequestedProductCatalog() {
  let changed = false;
  const allowedCategories = new Set(defaultProductCategories);
  const categoryRenames = {
    "Ropa Interior > Hombre": "Ropa Interior Hombre",
    "Ropa Interior > Dama": "Ropa Interior Dama",
    "Ropa Interior > Niño": "Ropa Interior Niño",
    "Ropa Interior > Niños": "Ropa Interior Niño",
    "Ropa Interior Niños": "Ropa Interior Niño",
    "Ropa Interior": "Ropa Interior Hombre",
    "Soquetes": "Medias",
    "Accesorios": "Medias"
  };

  categories.forEach((category) => {
    const nextName = categoryRenames[category.name];
    if (!nextName) return;
    category.name = nextName;
    category.active = true;
    changed = true;
  });
  const nextCategories = [];
  defaultProductCategories.forEach((name) => {
    const existing = categories.find((category) => category.name.toLowerCase() === name.toLowerCase());
    nextCategories.push({ ...(existing || {}), name, active: true });
  });
  if (
    categories.length !== nextCategories.length
    || categories.some((category, index) => category.name !== nextCategories[index]?.name)
  ) {
    changed = true;
  }
  categories = nextCategories;

  products.forEach((product) => {
    const nextCategory = categoryRenames[product.category];
    if (nextCategory) {
      product.category = nextCategory;
      changed = true;
    }
    if (["Soquetes Importados Adultos", "Soquetes Importados Niños"].includes(product.name)) {
      product.category = "Medias";
      product.presentation = "3 Docenas";
      product.saleType = "pack";
      product.packQuantity = getPackQuantityFromPresentation(product.presentation);
      changed = true;
    }
    if (!allowedCategories.has(product.category)) {
      product.category = "Medias";
      changed = true;
    }
  });

  requestedProductCatalog.forEach(([, category]) => {
    if (!categories.some((item) => item.name.toLowerCase() === category.toLowerCase())) {
      categories.push({ id: crypto.randomUUID(), name: category, active: true, sortOrder: categories.length + 1 });
      changed = true;
    }
  });

  products.forEach((product) => {
    const renamed = legacyProductRenames[product.name];
    if (!renamed) return;
    const requested = requestedProductCatalog.find(([name]) => name === renamed);
    const identity = getProductIdentityFromName(renamed);
    product.name = identity.baseName;
    product.baseName = identity.baseName;
    product.optionName = identity.optionName;
    product.category = requested?.[1] || "Ropa Interior Hombre";
    product.presentation = requested?.[2] || "1 Docena";
    product.saleType = "pack";
    product.packQuantity = getPackQuantityFromPresentation(product.presentation);
    product.description = "";
    changed = true;
  });

  let nextSortOrder = getNextSortOrder();
  requestedProductCatalog.forEach(([name, category, presentation, baseName, optionName]) => {
    const description = getDefinitiveProductDescription(name);
    const existing = products.find((product) => product.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      if (existing.baseName !== baseName) {
        existing.baseName = baseName;
        changed = true;
      }
      if (existing.optionName !== optionName) {
        existing.optionName = optionName;
        changed = true;
      }
      if (existing.category !== category) {
        existing.category = category;
        changed = true;
      }
      if (existing.presentation !== presentation) {
        existing.presentation = presentation;
        changed = true;
      }
      const packQuantity = getPackQuantityFromPresentation(presentation);
      if (existing.saleType !== "pack" || existing.packQuantity !== packQuantity) {
        existing.saleType = "pack";
        existing.packQuantity = packQuantity;
        changed = true;
      }
      if (isLody742Product(existing) && existing.image !== LODY_742_IMAGE) {
        existing.image = LODY_742_IMAGE;
        changed = true;
      }
      if (!existing.description && description) {
        existing.description = description;
        changed = true;
      }
      return;
    }

    products.push({
      id: crypto.randomUUID(),
      image: name.includes("Boxer Adulto Lody Art. 742") ? LODY_742_IMAGE : DEFAULT_PRODUCT_IMAGE,
      name: baseName,
      baseName,
      optionName,
      brand: getBrandFromProductName(name),
      category,
      presentation,
      description,
      saleType: getSaleTypeFromPresentation(presentation),
      price: 0,
      packQuantity: getPackQuantityFromPresentation(presentation),
      variants: "",
      variantStock: {},
      stock: 0,
      minimum: 1,
      cost: 0,
      active: true,
      showInCatalog: true,
      sortOrder: nextSortOrder++
    });
    changed = true;
  });

  if (changed) {
    saveCategories();
    saveProducts();
  }
}

function getPackQuantityFromPresentation(presentation) {
  const text = String(presentation || "").trim();
  const amount = Math.max(1, Number(text.match(/\d+/)?.[0]) || 1);
  return /docenas?/i.test(text) ? amount * 12 : amount;
}

function getBrandFromProductName(name) {
  const knownBrands = ["Lody", "XY", "Maxton", "Uomo", "Dufour", "Capicúa"];
  return knownBrands.find((brand) => name.toLowerCase().includes(brand.toLowerCase())) || "GB Mayorista";
}

function renderCategoryManager() {
  if (!els.categoryManagerList) return;
  els.categoryManagerList.innerHTML = categories.map((category) => {
    const count = products.filter((product) => product.category === category.name).length;
    return `
      <div class="category-manager-row">
        <div>
          <strong>${escapeHtml(category.name)}</strong>
          <span>${count} producto(s) · ${category.active ? "Visible" : "Oculta"}</span>
        </div>
        <div class="row-actions">
          <button class="secondary-button small-button" type="button" data-edit-category="${escapeHtml(category.name)}">Modificar</button>
          <button class="secondary-button small-button" type="button" data-toggle-category="${escapeHtml(category.name)}">${category.active ? "Ocultar" : "Mostrar"}</button>
          <button class="danger-button small-button" type="button" data-delete-category="${escapeHtml(category.name)}" ${count ? "disabled" : ""}>Eliminar</button>
        </div>
      </div>
    `;
  }).join("");

  els.categoryManagerList.querySelectorAll("[data-edit-category]").forEach((button) => {
    button.addEventListener("click", () => renameCategory(button.dataset.editCategory));
  });
  els.categoryManagerList.querySelectorAll("[data-toggle-category]").forEach((button) => {
    button.addEventListener("click", () => toggleCategoryVisibility(button.dataset.toggleCategory));
  });
  els.categoryManagerList.querySelectorAll("[data-delete-category]").forEach((button) => {
    button.addEventListener("click", () => deleteCategory(button.dataset.deleteCategory));
  });
}

function addCategoryFromManager() {
  const name = els.newCategoryName?.value.trim();
  if (!name) return;
  if (!addCategory(name)) {
    showToast("La categoría ya existe");
    return;
  }
  els.newCategoryName.value = "";
  renderAll();
  showToast("Categoría agregada");
}

function renameCategory(name) {
  const category = categories.find((item) => item.name === name);
  if (!category) return;
  const nextName = window.prompt("Nuevo nombre de categoría", category.name);
  if (nextName === null) return;
  const cleanName = nextName.trim();
  if (!cleanName || cleanName === category.name) return;
  if (categories.some((item) => normalizeCategoryNameForCompare(item.name) === normalizeCategoryNameForCompare(cleanName))) {
    showToast("La categoría ya existe");
    return;
  }
  products.forEach((product) => {
    if (product.category === category.name) product.category = cleanName;
  });
  category.name = cleanName;
  currentAdminCategory = cleanName;
  if (currentCategory === name) currentCategory = cleanName;
  saveCategories();
  saveProducts();
  renderAll();
  showToast("Categoría modificada");
}

function toggleCategoryVisibility(name) {
  const category = categories.find((item) => item.name === name);
  if (!category) return;
  category.active = !category.active;
  if (!category.active && currentCategory === name) currentCategory = "Todas";
  if (!category.active && currentAdminCategory === name) currentAdminCategory = getVisibleCategories()[0] || "";
  saveCategories();
  renderAll();
  showToast(category.active ? "Categoría visible" : "Categoría oculta");
}

function deleteCategory(name) {
  const count = products.filter((product) => product.category === name).length;
  if (count) {
    showToast("No se puede eliminar: tiene productos asociados");
    return;
  }
  categories = categories.filter((category) => category.name !== name);
  saveCategories();
  renderAll();
  showToast("Categoría eliminada");
}

function addVariantRow() {
  const row = document.createElement("div");
  row.className = "variant-row";
  row.innerHTML = `
    <label>Nombre de variante<input name="variantName" type="text" placeholder="Talle 1"></label>
    <label>Tipo de venta<select name="variantSaleType"><option value="pack">Pack</option><option value="unit">Unidad</option></select></label>
    <label>Cantidad por pack<input name="variantPackQuantity" type="number" min="1" step="1" value="12"></label>
    <label>Precio<input name="variantPrice" type="number" min="1" step="1" placeholder="60000"></label>
    <label>Stock<input name="variantStock" type="number" min="0" step="1" placeholder="24"></label>
    <label>Estado<select name="variantState"><option value="Activo">Activo</option><option value="Inactivo">Inactivo</option></select></label>
    <button class="danger-button small-button" type="button" data-remove-variant-row>Quitar</button>
  `;
  row.querySelector("[data-remove-variant-row]").addEventListener("click", () => row.remove());
  els.variantRows.appendChild(row);
}

function getVariantRowsFromForm(form) {
  const names = form.getAll("variantName");
  const saleTypes = form.getAll("variantSaleType");
  const packs = form.getAll("variantPackQuantity");
  const prices = form.getAll("variantPrice");
  const stocks = form.getAll("variantStock");
  const states = form.getAll("variantState");
  return names.map((name, index) => ({
    name: String(name).trim(),
    saleType: String(saleTypes[index]) === "unit" ? "unit" : "pack",
    packQuantity: Math.max(1, Number(packs[index]) || 1),
    price: Math.max(0, Number(prices[index]) || 0),
    stock: Math.max(0, Number(stocks[index]) || 0),
    state: String(states[index] || "Activo")
  })).filter((variant) => variant.name);
}

function buildVariantsTextFromForm(form) {
  return getVariantRowsFromForm(form)
    .map((variant) => [
      variant.name,
      variant.saleType === "pack" ? "Pack" : "Unidad",
      variant.packQuantity,
      variant.price,
      variant.stock,
      variant.state
    ].join(" | "))
    .join("\n");
}

function renderVariantSummary(product) {
  const variants = parseVariantDetails(product);
  if (!variants.length) {
    return `<span class="context-line">Sin variantes</span>`;
  }
  return `
    <div class="variant-summary">
      ${variants.map((variant) => `
        <span>${escapeHtml(variant.name)} | ${escapeHtml(variant.saleLabel)} | ${formatMoney(variant.price)} | ${variant.stock ? `Stock ${variant.stock}` : "Sin stock propio"}</span>
      `).join("")}
    </div>
  `;
}

function renderStock() {
  if (!els.stockProducts) return;
  const stockRows = getOrderedProducts().flatMap((product) => getProductStockRows(product));
  els.stockProducts.innerHTML = stockRows.map(({ product, variant }) => `
    <tr class="${product.active ? "" : "is-hidden-product"}">
      <td data-label="Producto"><strong>${escapeHtml(getProductArticleName(product))}</strong></td>
      <td data-label="Categoría">${escapeHtml(product.category)}</td>
      <td data-label="Variante"><span class="muted-cell">${escapeHtml(variant.name)}</span></td>
      <td data-label="Presentación">${escapeHtml(variant.saleLabel)}</td>
      <td data-label="Precio">${formatMoney(variant.price)}</td>
      <td data-label="Stock"><input class="inline-input" type="number" min="0" step="1" value="${variant.stock}" data-stock-set="${product.id}" data-variant="${escapeHtml(variant.name)}"></td>
      <td data-label="Ajuste">
        <div class="stock-adjust">
          <input class="inline-input" type="number" step="1" value="0" aria-label="Ajuste manual para ${escapeHtml(product.name)} ${escapeHtml(variant.name)}" data-stock-adjust-value="${product.id}" data-variant="${escapeHtml(variant.name)}">
          <button class="secondary-button small-button" type="button" data-stock-adjust="${product.id}" data-variant="${escapeHtml(variant.name)}">Aplicar</button>
        </div>
      </td>
      <td data-label="Estado"><span class="status-pill ${variant.active && variant.stock > 0 ? "visible" : "hidden-product"}">${variant.active ? (variant.stock > 0 ? "Disponible" : "Sin stock") : "Inactiva"}</span></td>
      <td data-label="Historial">${renderStockHistory(product.id, variant.name)}</td>
    </tr>
  `).join("");

  els.stockProducts.querySelectorAll("[data-stock-set]").forEach((input) => {
    input.addEventListener("change", () => setProductStock(input.dataset.stockSet, Number(input.value), "Corrección manual", input.dataset.variant));
  });

  els.stockProducts.querySelectorAll("[data-stock-adjust]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = els.stockProducts.querySelector(`[data-stock-adjust-value="${CSS.escape(button.dataset.stockAdjust)}"][data-variant="${CSS.escape(button.dataset.variant)}"]`);
      adjustProductStock(button.dataset.stockAdjust, Number(input?.value || 0), button.dataset.variant);
    });
  });
}

function renderStockHistory(productId, variantName = "Base / sin variante") {
  const movements = stockHistory.filter((entry) => entry.productId === productId && (entry.variant || "Base / sin variante") === variantName).slice(0, 3);
  if (!movements.length) {
    return `<span class="muted-cell">Sin movimientos registrados</span>`;
  }
  return `
    <div class="stock-history">
      ${movements.map((entry) => `
        <span>${formatDateTime(entry.createdAt)} · ${escapeHtml(entry.variant || "Base")} · ${entry.delta > 0 ? "+" : ""}${entry.delta} · ${escapeHtml(entry.reason)}${entry.orderId ? ` · ${escapeHtml(entry.orderId.slice(0, 8))}` : ""}</span>
      `).join("")}
    </div>
  `;
}

function getProductStockRows(product) {
  const variants = parseVariantDetails(product);
  if (!variants.length) {
    return [{
      product,
      variant: {
        name: "Base / sin variante",
        saleLabel: getSaleLabel(product),
        price: product.price,
        active: product.active,
        stock: getProductStock(product, "Base / sin variante")
      }
    }];
  }
  return variants.map((variant) => ({
    product,
    variant: {
      ...variant,
      stock: getProductStock(product, variant.name, variant.stock)
    }
  }));
}

function parseVariantNames(value) {
  return parseVariantDetails({ variants: value, saleType: "pack", packQuantity: 1, price: 0, stock: 0, active: true }).map((variant) => variant.name);
}

function parseVariantDetails(product) {
  return String(product.variants || "")
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, saleType, packQuantity, price, stock, state] = line.split("|").map((part) => part?.trim());
      const type = /^unidad$/i.test(saleType || "") ? "unit" : /^pack$/i.test(saleType || "") ? "pack" : product.saleType;
      const pack = type === "pack" ? Math.max(1, Number(packQuantity) || product.packQuantity || 1) : 1;
      const parsedPrice = Number(price);
      const parsedStock = Number(stock);
      return {
        name,
        saleType: type,
        packQuantity: pack,
        saleLabel: type === "pack" ? `Pack x${pack}` : "Unidad",
        price: Number.isFinite(parsedPrice) && parsedPrice > 0 ? parsedPrice : product.price,
        stock: Number.isFinite(parsedStock) ? Math.max(0, parsedStock) : 0,
        active: !/^inactivo|oculto|no$/i.test(state || "")
      };
    });
}

function getProductStock(product, variantName = "Base / sin variante", fallback = 0) {
  if (variantName === "Base / sin variante") return Math.max(0, Number(product.stock) || 0);
  if (Number.isFinite(Number(product.variantStock?.[variantName]))) return Math.max(0, Number(product.variantStock[variantName]) || 0);
  return Math.max(0, Number(fallback) || 0);
}

function setProductVariantStock(product, variantName, stock) {
  if (variantName === "Base / sin variante") {
    product.stock = stock;
    return;
  }
  product.variantStock = product.variantStock || {};
  product.variantStock[variantName] = stock;
}

function getProductTotalStock(product) {
  return getProductStock(product, "Base / sin variante");
}

function renderOrders() {
  if (!orders.length) {
    els.ordersList.innerHTML = `${renderOrdersToolbar()}<div class="empty-state">Todavía no hay pedidos o consultas cargadas.</div>`;
    bindBudgetEditor();
    return;
  }

  if (openOrderId || previewOrderId) {
    const focusedId = openOrderId || previewOrderId;
    const order = orders.find((item) => item.id === focusedId);
    if (order) {
      els.ordersList.innerHTML = `
        ${renderInternalOrderCard(order, { standalone: true })}
        ${previewOrderId === order.id ? renderBudgetPreview(order) : ""}
        ${editingBudgetItem?.orderId === order.id ? renderBudgetItemEditModal() : ""}
      `;
      bindBudgetEditor();
      return;
    }
    openOrderId = "";
    previewOrderId = "";
  }

  const filteredOrders = getFilteredOrders();
  els.ordersList.innerHTML = `
    ${renderOrdersToolbar()}
    ${filteredOrders.length ? renderOrdersCompactTable(filteredOrders) : `<div class="empty-state compact">No hay pedidos para ese filtro.</div>`}
  `;

  bindBudgetEditor();
}

function renderOrdersToolbar() {
  const filters = ["Hoy", "Ayer", "En revisión", "Pagadas", "Todas"];
  if (!filters.includes(orderListFilter)) orderListFilter = "Hoy";
  return `
    <div class="orders-workbar">
      <button class="primary-button small-button new-consultation-button" type="button" data-new-consultation>+ Nueva consulta</button>
      <label class="search-box orders-search-box">
        Buscar consulta
        <input type="search" value="${escapeHtml(orderListSearch)}" placeholder="Número, cliente, teléfono o localidad" data-orders-search>
      </label>
      <div class="orders-filter-row" aria-label="Filtros de pedidos">
        ${filters.map((filter) => `<button class="orders-filter-button ${orderListFilter === filter ? "active" : ""}" type="button" data-orders-filter="${escapeHtml(filter)}">${escapeHtml(filter)}</button>`).join("")}
      </div>
    </div>
  `;
}

function getFilteredOrders() {
  const terms = normalizeProductSearchText(orderListSearch).split(" ").filter(Boolean);
  return orders.filter((order) => {
    const matchesText = !terms.length || terms.every((term) => getOrderSearchText(order).includes(term));
    const matchesFilter = matchesOrderListFilter(order, orderListFilter);
    return matchesText && matchesFilter;
  });
}

function getOrderSearchText(order) {
  return normalizeProductSearchText([
    formatRecordNumber(order),
    order.number,
    getOrderCustomerName(order),
    order.customerPhone,
    order.customerLocation,
    order.status
  ].join(" "));
}

function normalizeConsultationStatus(status) {
  return ["Pagado", "Entregado", "Preparado", "Preparados"].includes(status) ? "Pagado" : "En revisión";
}
function matchesOrderListFilter(order, filter) {
  if (filter === "Hoy") return isOrderCreatedOnRelativeDay(order, 0);
  if (filter === "Ayer") return isOrderCreatedOnRelativeDay(order, -1);
  if (filter === "En revisión") return normalizeConsultationStatus(order.status) === "En revisión";
  if (filter === "Pagadas") return normalizeConsultationStatus(order.status) === "Pagado";
  return true;
}

function isOrderCreatedOnRelativeDay(order, offsetDays = 0) {
  const createdAt = order?.createdAt ? new Date(order.createdAt) : null;
  if (!createdAt || Number.isNaN(createdAt.getTime())) return false;
  const target = new Date();
  target.setDate(target.getDate() + offsetDays);
  return createdAt.getFullYear() === target.getFullYear()
    && createdAt.getMonth() === target.getMonth()
    && createdAt.getDate() === target.getDate();
}
function renderOrdersCompactTable(orderList) {
  return `
    <div class="orders-compact-table" role="table" aria-label="Listado de pedidos">
      <div class="orders-compact-head" role="row">
        <span>Número</span>
        <span>Fecha</span>
        <span>Cliente</span>
        <span>Localidad</span>
        <span>Total</span>
        <span>Estado</span>
        <span>Abrir</span>
      </div>
      ${orderList.map(renderOrderListRow).join("")}
    </div>
  `;
}

function renderOrderListRow(order) {
  const total = Number(order.total || order.catalogTotal) || 0;
  const openButton = `<button class="primary-button small-button" type="button" data-open-order="${order.id}">Abrir</button>`;
  return `
    <article class="orders-compact-row order-status-${getStatusKey(normalizeConsultationStatus(order.status))} order-row-consultation" role="row">
      <strong class="orders-row-number" role="cell">${escapeHtml(formatRecordNumber(order))}</strong>
      <span class="orders-row-date" role="cell">${escapeHtml(formatCompactDateTime(order.createdAt || order.updatedAt))}</span>
      <span class="orders-row-client" role="cell" data-location="${escapeHtml(order.customerLocation || "Sin localidad")}">${escapeHtml(getOrderCustomerName(order))}</span>
      <span class="orders-row-location" role="cell">${escapeHtml(order.customerLocation || "Sin localidad")}</span>
      <strong class="orders-row-total" role="cell">${formatMoney(total)}</strong>
      <span class="orders-row-status" role="cell"><span class="status-pill status-${getStatusKey(order.status)}">${escapeHtml(order.status || "En revisión")}</span></span>
      <span class="orders-row-action" role="cell">${openButton}</span>
    </article>
  `;
}

function renderConsultationCard(order) {
  return renderOrderListRow(order);
}

function renderOrderCustomerBlock(order) {
  const isEditing = editingOrderCustomerId === order.id;
  if (!isEditing) {
    return `
      <div class="compact-customer-readonly">
        <span><b>Nombre</b>${escapeHtml(getOrderCustomerName(order))}</span>
        <span><b>Teléfono</b>${escapeHtml(order.customerPhone || "Sin teléfono")}</span>
        <span><b>Localidad</b>${escapeHtml(order.customerLocation || "Sin localidad")}</span>
      </div>
      <button class="secondary-button small-button customer-edit-toggle" type="button" data-edit-order-customer="${order.id}" ${canEditOrder(order) ? "" : "disabled"}>Editar datos</button>
    `;
  }
  return `
    <div class="customer-edit-grid compact-customer-grid">
      <label>Nombre<input type="text" value="${escapeHtml(order.customerName ?? order.customer ?? "")}" data-budget-customer-name="${order.id}" ${canEditOrder(order) ? "" : "disabled"}></label>
      <label>Teléfono<input type="tel" value="${escapeHtml(order.customerPhone || "")}" data-budget-customer-phone="${order.id}" ${canEditOrder(order) ? "" : "disabled"}></label>
      <label>Localidad<input type="text" value="${escapeHtml(order.customerLocation || "")}" data-budget-customer-location="${order.id}" ${canEditOrder(order) ? "" : "disabled"}></label>
    </div>
    <button class="secondary-button small-button customer-edit-toggle" type="button" data-close-order-customer="${order.id}">Listo</button>
  `;
}

function renderOrderActionButtons(order) {
  const readonly = !canEditOrder(order);
  const previewButton = `<button class="secondary-button small-button order-secondary-action" type="button" data-preview-budget="${order.id}" ${order.customerPhone ? "" : "disabled"}>Vista previa de WhatsApp</button>`;
  const documentButton = `<button class="secondary-button small-button order-secondary-action" type="button" data-view-document="${order.id}">Ver / Imprimir</button>`;
  const backButton = `<button class="secondary-button small-button order-secondary-action" type="button" data-close-order="${order.id}">Volver</button>`;
  if (readonly) return `${previewButton}${documentButton}${backButton}`;
  return `
    <button class="primary-button small-button order-primary-action" type="button" data-save-order="${order.id}">Guardar cambios</button>
    ${previewButton}
    ${documentButton}
    ${backButton}
  `;
}

function getOrderQuantityUnitLabel(presentation, quantity) {
  return getStockUnitLabel({ presentation }, quantity);
}
function renderInternalOrderCard(order, options = {}) {
  const totals = calculateBudgetTotals(order);
  const isOpen = options.standalone || previewOrderId === order.id || openOrderId === order.id;
  return `
    <article class="order-card order-workspace order-kind-consultation order-status-${getStatusKey(normalizeConsultationStatus(order.status))} ${isConfirmed(normalizeConsultationStatus(order.status)) ? "confirmed" : ""}">
      <div class="order-workspace-top compact-order-top">
        <div>
          <h3>${escapeHtml(formatRecordNumber(order))}</h3>
          <span>Fecha: ${escapeHtml(formatDateTime(order.createdAt))}</span>
        </div>
        <span class="status-pill status-${getStatusKey(normalizeConsultationStatus(order.status))}">${escapeHtml(normalizeConsultationStatus(order.status))}</span>
        <button class="secondary-button small-button" type="button" data-close-order="${order.id}">Volver</button>
      </div>

      <details class="order-detail compact-order-detail" ${isOpen ? "open" : ""}>
        <summary>Abrir</summary>
        <section class="compact-order-section client-order-section">
          <div class="compact-section-title-row">
            <h4>Datos del cliente</h4>
          </div>
          ${renderOrderCustomerBlock(order)}
        </section>

        <section class="compact-order-section">
          ${canEditOrder(order) ? `
            <div class="budget-product-search compact-budget-search">
              <label>
                Agregar producto
                <input type="search" value="" placeholder="Buscar producto para agregar" data-budget-search="${order.id}">
              </label>
              <div class="budget-search-results" data-budget-search-results="${order.id}"></div>
            </div>
          ` : ""}

          <div class="budget-items compact-budget-items">
            <div class="budget-items-title-row">
              <h4>Productos del pedido</h4>
              <span>${order.items.length} producto${order.items.length === 1 ? "" : "s"}</span>
            </div>
            <div class="budget-item budget-item-head order-product-table-head">
              <span>Cantidad</span>
              <span>Producto</span>
              <span>Precio unitario</span>
              <span>Subtotal</span>
              <span>Acciones</span>
            </div>
            ${order.items.length ? order.items.map((item) => renderCompactBudgetItem(order, item)).join("") : `<div class="empty-state compact">Este pedido no tiene productos cargados.</div>`}
          </div>
        </section>

        <section class="compact-order-section order-data-panel compact-order-data-panel">
          <h4>Datos del pedido</h4>
          <div class="checkout-grid compact-checkout-grid">
            <label class="checkout-main-field">
              Forma de pago
              <select data-budget-payment="${order.id}" ${canEditOrder(order) ? "" : "disabled"}>
                ${["Efectivo", "Transferencia", "Cuenta corriente", "Otro"].map((method) => `<option value="${method}" ${(order.paymentMethod || "Transferencia") === method ? "selected" : ""}>${method}</option>`).join("")}
              </select>
            </label>
            <label class="checkout-main-field">
              Forma de entrega
              <select data-budget-delivery="${order.id}" ${canEditOrder(order) ? "" : "disabled"}>
                <option value="Retira en local" ${getNormalizedDeliveryType(order.deliveryType) === "Retira en local" ? "selected" : ""}>Retira en local</option>
                <option value="Transporte" ${getNormalizedDeliveryType(order.deliveryType) === "Transporte" ? "selected" : ""}>Transporte</option>
                <option value="A coordinar" ${getNormalizedDeliveryType(order.deliveryType) === "A coordinar" ? "selected" : ""}>A coordinar</option>
              </select>
            </label>
            <label class="checkout-main-field">
              Estado
              <select data-record-status="${order.id}" ${canChangeOrderStatus(order) ? "" : "disabled"}>
                ${statuses.map((status) => `<option value="${status}" ${normalizeConsultationStatus(order.status) === status ? "selected" : ""}>${status}</option>`).join("")}
              </select>
            </label>
            <label class="discount-control">
              Descuento
              <span class="discount-input-row">
                <select data-budget-discount-type="${order.id}" ${canEditOrder(order) ? "" : "disabled"}>
                  <option value="fixed" ${(order.discountType || "fixed") !== "percent" ? "selected" : ""}>$</option>
                  <option value="percent" ${order.discountType === "percent" ? "selected" : ""}>%</option>
                </select>
                <input type="number" min="0" step="1" value="${Number(order.discountValue) || 0}" data-budget-discount-value="${order.id}" ${canEditOrder(order) ? "" : "disabled"}>
              </span>
            </label>
            ${getNormalizedDeliveryType(order.deliveryType) === "Transporte" ? `
              <label class="conditional-delivery-field">
                Transporte
                <input type="text" value="${escapeHtml(order.transport || "")}" placeholder="Kelly, Vía Cargo, Expreso..." data-budget-transport="${order.id}" ${canEditOrder(order) ? "" : "disabled"}>
              </label>
            ` : ""}
            ${getNormalizedDeliveryType(order.deliveryType) === "A coordinar" ? `
              <label class="conditional-delivery-field">
                Observaciones
                <input type="text" value="${escapeHtml(order.deliveryNotes || "")}" placeholder="Detalle de entrega" data-budget-delivery-notes="${order.id}" ${canEditOrder(order) ? "" : "disabled"}>
              </label>
            ` : ""}
          </div>
        </section>

        <aside class="order-total-box economic-summary order-summary-box compact-order-summary consultation-summary-box" aria-label="Resumen del pedido">
          <strong class="consultation-total-line">TOTAL DEL PEDIDO: <span data-budget-total="${order.id}">${formatMoney(totals.total)}</span></strong>
          <div class="consultation-summary-meta">
            <span>Forma de pago: <b>${escapeHtml(order.paymentMethod || "Transferencia")}</b></span>
            <span>Forma de entrega: <b>${escapeHtml(getNormalizedDeliveryType(order.deliveryType))}</b></span>
            <span>Descuento: <b data-budget-discount="${order.id}">${escapeHtml(formatDiscountSummary(order))}</b></span>
            <span>Estado: <b>${escapeHtml(normalizeConsultationStatus(order.status))}</b></span>
          </div>
          <span class="sr-only" data-budget-subtotal="${order.id}">${formatMoney(totals.subtotal || 0)}</span>
        </aside>

        <div class="order-actions compact-order-actions">
          ${renderOrderActionButtons(order)}
        </div>
      </details>
    </article>
  `;
}

function renderCompactBudgetItem(order, item) {
  const product = products.find((entry) => entry.id === item.id);
  const option = getBudgetItemOptionLabel(item, product);
  const displayName = getOrderItemDisplayName(item.name, option);
  const productLine = option ? `${displayName} - ${option}` : displayName;
  const presentation = getBudgetItemPresentation(item);
  const unitLabel = getOrderQuantityUnitLabel(presentation, Number(item.quantity) || 1);
  const quantityLine = `${Math.max(1, Number(item.quantity) || 1)} ${unitLabel}`;
  const subtotal = (Number(item.quantity) || 0) * (Number(item.price) || 0);
  const actions = canEditOrder(order)
    ? `
        <button class="secondary-button small-button" type="button" data-edit-budget-item="${order.id}" data-product="${item.id}">Editar</button>
        <button class="danger-button small-button icon-trash-button" type="button" data-budget-remove="${order.id}" data-product="${item.id}" aria-label="Eliminar producto" title="Eliminar producto">Eliminar</button>
      `
    : `<span class="readonly-order-note">Solo lectura</span>`;
  return `
    <div class="budget-item compact-budget-item-row order-product-read-row">
      <span class="order-product-mobile-main">${escapeHtml(quantityLine)} · ${escapeHtml(productLine)}</span>
      <span class="order-product-quantity">${escapeHtml(quantityLine)}</span>
      <span class="budget-product-name order-product-line">${escapeHtml(productLine)}</span>
      <span class="order-product-unit-price">${formatMoney(item.price)}</span>
      <strong class="budget-subtotal-cell order-product-subtotal">${formatMoney(subtotal)}</strong>
      <span class="order-product-actions">${actions}</span>
    </div>
  `;
}

function getOrderItemDisplayName(name, option) {
  const cleanName = String(name || "").trim();
  const cleanOption = String(option || "").trim();
  if (!cleanName || !cleanOption) return cleanName;
  const normalizedName = normalizeProductSearchText(cleanName);
  const normalizedOption = normalizeProductSearchText(cleanOption);
  if (!normalizedOption || !normalizedName.includes(normalizedOption)) return cleanName;
  const lowerName = cleanName.toLocaleLowerCase("es-AR");
  const lowerOption = cleanOption.toLocaleLowerCase("es-AR");
  if (!lowerName.endsWith(lowerOption)) return cleanName;
  const stripped = cleanName.slice(0, cleanName.length - cleanOption.length).replace(/[\s·-]+$/g, "").trim();
  return stripped || cleanName;
}
function renderBudgetItemEditModal() {
  if (!editingBudgetItem) return "";
  const order = orders.find((item) => item.id === editingBudgetItem.orderId);
  const item = order?.items.find((entry) => entry.id === editingBudgetItem.productId);
  if (!order || !item) return "";
  const product = products.find((entry) => entry.id === item.id);
  const option = getBudgetItemOptionLabel(item, product);
  const presentation = getBudgetItemPresentation(item);
  return `
    <div class="budget-item-edit-modal" role="dialog" aria-modal="true" aria-label="Editar producto del pedido" data-budget-item-edit-overlay>
      <section class="budget-item-edit-dialog">
        <div class="budget-preview-head">
          <div>
            <strong>Editar producto</strong>
            <span>${escapeHtml(item.name)}</span>
            ${option ? `<span>${escapeHtml(option)}</span>` : ""}
          </div>
          <button class="icon-button" type="button" data-close-budget-item-edit aria-label="Cerrar edición">×</button>
        </div>
        <div class="budget-item-edit-grid">
          <label>Presentación<input type="text" value="${escapeHtml(presentation)}" data-edit-item-presentation></label>
          <label>Cantidad<input type="number" min="1" step="1" value="${Math.max(1, Number(item.quantity) || 1)}" data-edit-item-quantity></label>
          <label>Precio unitario<input type="number" min="1" step="1" value="${Number(item.price) || 1}" data-edit-item-price></label>
        </div>
        <div class="budget-item-edit-subtotal">
          <span>Subtotal actualizado</span>
          <strong data-edit-item-subtotal>${formatMoney(item.quantity * item.price)}</strong>
        </div>
        <div class="order-actions budget-item-edit-actions">
          <button class="primary-button small-button" type="button" data-save-budget-item-edit="${order.id}" data-product="${item.id}">Guardar</button>
          <button class="secondary-button small-button" type="button" data-close-budget-item-edit>Cancelar</button>
        </div>
      </section>
    </div>
  `;
}

function openBudgetItemEditor(orderId, productId) {
  const order = orders.find((item) => item.id === orderId);
  const item = order?.items.find((entry) => entry.id === productId);
  if (!order || !item || !canEditOrder(order)) return;
  editingBudgetItem = { orderId, productId };
  openOrderId = orderId;
  pushBudgetItemEditHistoryState();
  renderOrders();
}

function pushBudgetItemEditHistoryState() {
  if (!appHistoryReady || !window.history?.pushState) return;
  if (budgetItemEditHistoryActive || window.history.state?.modal === "budgetItemEdit") return;
  budgetItemEditHistoryActive = true;
  window.history.pushState({ ...makeAppHistoryState(currentView), modal: "budgetItemEdit" }, "", getCurrentHistoryUrl());
}

function closeBudgetItemEditor(options = {}) {
  editingBudgetItem = null;
  if (budgetItemEditHistoryActive) {
    budgetItemEditHistoryActive = false;
    if (!options.fromHistory && window.history?.state?.modal === "budgetItemEdit") {
      budgetItemEditClosingByCode = true;
      window.history.back();
      return;
    }
  }
  renderOrders();
}

function updateBudgetItemEditSubtotal() {
  const quantity = Math.max(1, Math.round(Number(els.ordersList.querySelector('[data-edit-item-quantity]')?.value) || 1));
  const price = Math.max(1, Math.round(Number(els.ordersList.querySelector('[data-edit-item-price]')?.value) || 1));
  const subtotal = els.ordersList.querySelector('[data-edit-item-subtotal]');
  if (subtotal) subtotal.textContent = formatMoney(quantity * price);
}

function saveBudgetItemEdit(orderId, productId) {
  const order = orders.find((item) => item.id === orderId);
  const item = order?.items.find((entry) => entry.id === productId);
  if (!order || !item || !canEditOrder(order)) return;
  const presentation = String(els.ordersList.querySelector('[data-edit-item-presentation]')?.value || '').trim();
  if (!presentation) {
    showToast('La presentación no puede quedar vacía');
    return;
  }
  restoreConfirmedStock(order);
  item.presentation = presentation;
  item.saleType = getSaleTypeFromPresentation(presentation);
  item.packQuantity = getPackQuantityFromPresentation(presentation);
  item.quantity = Math.max(1, Math.round(Number(els.ordersList.querySelector('[data-edit-item-quantity]')?.value) || 1));
  item.price = Math.max(1, Math.round(Number(els.ordersList.querySelector('[data-edit-item-price]')?.value) || item.price || 1));
  recalculateBudget(order);
  reapplyConfirmedStock(order);
  saveProducts();
  saveOrders();
  closeBudgetItemEditor();
  openOrderId = orderId;
  renderAll();
  showToast('Producto actualizado');
}
function getBudgetItemOptionLabel(item, product) {
  return String(item.variant || item.variantLabel || product?.optionName || getProductOptionName(product) || "").trim();
}

function getOrderFocusClass(order) {
  if (!openOrderId && !previewOrderId) return "";
  const focusedId = openOrderId || previewOrderId;
  if (order.id === focusedId || order.linkedOrderId === focusedId) return "";
  return "order-dimmed";
}
function createManualConsultation() {
  if (!hasPermission("orders")) return;
  const draft = makeConsultation({ name: "", phone: "", location: "" }, "Consulta cargada manualmente.");
  draft.manualDraft = true;
  draft.customer = "";
  draft.customerName = "";
  draft.customerPhone = "";
  draft.customerLocation = "";
  draft.paymentMethod = "Transferencia";
  draft.deliveryType = "Retira en local";
  draft.discountType = "fixed";
  draft.discountValue = 0;
  draft.items = [];
  recalculateBudget(draft);
  orders.unshift(draft);
  editingOrderCustomerId = draft.id;
  openOrderDetail(draft.id);
}

function saveManualConsultation(order) {
  const customerName = String(order.customerName || order.customer || "").trim();
  if (!customerName) {
    editingOrderCustomerId = order.id;
    openOrderId = order.id;
    renderOrders();
    showToast("Completá el nombre del cliente");
    return false;
  }
  order.customerName = customerName;
  order.customer = customerName;
  order.status = "En revisión";
  order.manualDraft = false;
  order.updatedAt = new Date().toISOString();
  recalculateBudget(order);
  syncClientsFromOrders();
  saveOrders();
  saveClients();
  openOrderId = order.id;
  editingOrderCustomerId = "";
  showToast("Cambios guardados", "success");
  return true;
}

function removeManualDraft(orderId) {
  const index = orders.findIndex((order) => order.id === orderId && order.manualDraft);
  if (index >= 0) orders.splice(index, 1);
}
function formatCompactDateTime(value) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function openOrderDetail(orderId) {
  openOrderId = orderId;
  previewOrderId = "";
  pushOrderDetailHistoryState();
  renderOrders();
}

function closeOrderDetail(orderId = openOrderId, options = {}) {
  removeManualDraft(orderId);
  if (editingOrderCustomerId === orderId) editingOrderCustomerId = "";
  if (openOrderId === orderId) openOrderId = "";
  if (previewOrderId === orderId) previewOrderId = "";
  if (orderDetailHistoryActive) {
    orderDetailHistoryActive = false;
    if (!options.fromHistory && window.history?.state?.modal === "orderDetail") {
      orderDetailClosingByCode = true;
      window.history.back();
      return;
    }
  }
  renderOrders();
}

function pushOrderDetailHistoryState() {
  if (!appHistoryReady || !window.history?.pushState) return;
  if (orderDetailHistoryActive || window.history.state?.modal === "orderDetail") return;
  orderDetailHistoryActive = true;
  window.history.pushState({ ...makeAppHistoryState(currentView), modal: "orderDetail" }, "", getCurrentHistoryUrl());
}

function getBudgetPreviewText(orderId) {
  return els.ordersList.querySelector(`[data-budget-preview-text="${CSS.escape(orderId)}"]`)?.value || "";
}

async function copyBudgetPreviewText(orderId) {
  const text = getBudgetPreviewText(orderId);
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    showToast("Mensaje copiado");
  } catch (error) {
    showToast("No se pudo copiar el mensaje");
  }
}

function sendBudgetPreviewByWhatsapp(orderId) {
  const order = orders.find((item) => item.id === orderId);
  if (!order) return;
  const phone = normalizeArgentinaWhatsappNumber(order.customerPhone || "");
  const text = getBudgetPreviewText(orderId) || buildBudgetMessage(order);
  if (!phone || phone === "549") {
    showToast("La consulta no tiene teléfono de cliente");
    return;
  }
  const opened = window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noreferrer");
  if (!opened) {
    showToast("No se pudo abrir WhatsApp");
    return;
  }
  if (normalizeConsultationStatus(order.status) !== "Pagado") {
    order.status = "En revisión";
    order.updatedAt = new Date().toISOString();
    recalculateBudget(order);
    previewOrderId = "";
    saveOrders();
    renderAll();
  }
}
function sendBudgetPreviewPdfByWhatsapp(orderId) {
  const order = orders.find((item) => item.id === orderId);
  if (!order) return;
  recalculateBudget(order);
  currentPrintOrderId = orderId;
  currentPrintDocument = buildOrderPrintDocument(order);
  const documentTitle = getOrderDocumentTitle(order);
  currentPrintFilename = buildPdfFilename(documentTitle, order);

  try {
    const pdf = createOrderDocumentPdf(currentPrintDocument);
    clearPdfDownloadLink({ keepBlob: true });
    currentPdfBlob = new Blob([pdf], { type: "application/pdf" });
    currentPdfUrl = URL.createObjectURL(currentPdfBlob);
    currentPdfFilename = currentPrintFilename;
    shareCurrentPdf();
  } catch (error) {
    clearPdfDownloadLink();
    showToast("No se pudo preparar el PDF");
  }
}
function bindBudgetEditor() {
  els.ordersList.querySelector("[data-orders-search]")?.addEventListener("input", (event) => {
    orderListSearch = event.target.value;
    renderOrders();
  });

  els.ordersList.querySelectorAll("[data-orders-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      orderListFilter = button.dataset.ordersFilter || "Hoy";
      renderOrders();
    });
  });

  els.ordersList.querySelector("[data-new-consultation]")?.addEventListener("click", createManualConsultation);
  els.ordersList.querySelectorAll("[data-record-status]").forEach((select) => {
    select.addEventListener("change", () => updateRecordStatus(select.dataset.recordStatus, select.value));
  });

  els.ordersList.querySelectorAll("[data-build-order]").forEach((button) => {
    button.addEventListener("click", () => buildInternalOrderFromConsultation(button.dataset.buildOrder));
  });

  els.ordersList.querySelectorAll("[data-open-linked-order]").forEach((button) => {
    button.addEventListener("click", () => {
      openOrderDetail(button.dataset.openLinkedOrder);
    });
  });

  els.ordersList.querySelectorAll("[data-open-order]").forEach((button) => {
    button.addEventListener("click", () => {
      openOrderDetail(button.dataset.openOrder);
    });
  });
  els.ordersList.querySelectorAll("[data-edit-order-customer]").forEach((button) => {
    button.addEventListener("click", () => {
      editingOrderCustomerId = button.dataset.editOrderCustomer;
      openOrderId = button.dataset.editOrderCustomer;
      renderOrders();
    });
  });

  els.ordersList.querySelectorAll("[data-close-order-customer]").forEach((button) => {
    button.addEventListener("click", () => {
      if (editingOrderCustomerId === button.dataset.closeOrderCustomer) editingOrderCustomerId = "";
      openOrderId = button.dataset.closeOrderCustomer;
      renderOrders();
    });
  });


  els.ordersList.querySelectorAll("[data-budget-customer-name]").forEach((input) => {
    input.addEventListener("change", () => updateBudget(input.dataset.budgetCustomerName, {
      customer: input.value.trim(),
      customerName: input.value.trim()
    }));
  });

  els.ordersList.querySelectorAll("[data-budget-customer-phone]").forEach((input) => {
    input.addEventListener("change", () => updateBudget(input.dataset.budgetCustomerPhone, { customerPhone: input.value.trim() }));
  });

  els.ordersList.querySelectorAll("[data-budget-customer-location]").forEach((input) => {
    input.addEventListener("change", () => updateBudget(input.dataset.budgetCustomerLocation, { customerLocation: input.value.trim() }));
  });

  els.ordersList.querySelectorAll("[data-budget-delivery]").forEach((select) => {
    select.addEventListener("change", () => updateBudget(select.dataset.budgetDelivery, {
      deliveryType: select.value,
      transport: select.value === "Transporte" ? getBudgetTransportValue(select.dataset.budgetDelivery) : "",
      deliveryNotes: select.value === "A coordinar" ? getBudgetDeliveryNotesValue(select.dataset.budgetDelivery) : "",
      shippingCost: 0
    }));
  });

  els.ordersList.querySelectorAll("[data-budget-transport]").forEach((input) => {
    input.addEventListener("change", () => updateBudget(input.dataset.budgetTransport, { transport: input.value.trim() }));
  });

  els.ordersList.querySelectorAll("[data-budget-delivery-notes]").forEach((input) => {
    input.addEventListener("change", () => updateBudget(input.dataset.budgetDeliveryNotes, { deliveryNotes: input.value.trim() }));
  });

  els.ordersList.querySelectorAll("[data-budget-shipping-cost]").forEach((input) => {
    input.addEventListener("input", () => updateBudgetShippingDraft(input.dataset.budgetShippingCost, Number(input.value) || 0));
    input.addEventListener("change", () => commitBudgetShipping(input.dataset.budgetShippingCost, Number(input.value) || 0));
  });

  els.ordersList.querySelectorAll("[data-budget-payment]").forEach((select) => {
    select.addEventListener("change", () => updateBudget(select.dataset.budgetPayment, { paymentMethod: select.value }));
  });

  els.ordersList.querySelectorAll("[data-budget-discount-value]").forEach((input) => {
    input.addEventListener("input", () => updateBudgetDiscountDraft(input.dataset.budgetDiscountValue, Number(input.value) || 0));
    input.addEventListener("change", () => commitBudgetDiscount(input.dataset.budgetDiscountValue, Number(input.value) || 0));
  });

  els.ordersList.querySelectorAll("[data-budget-discount-type]").forEach((select) => {
    select.addEventListener("change", () => updateBudgetDiscountType(select.dataset.budgetDiscountType, select.value));
  });

  els.ordersList.querySelectorAll("[data-budget-search]").forEach((input) => {
    input.addEventListener("input", () => renderBudgetProductMatches(input.dataset.budgetSearch, input.value));
  });

  els.ordersList.querySelectorAll("[data-budget-search-results]").forEach((container) => {
    container.addEventListener("click", (event) => {
      const decrease = event.target.closest("[data-budget-search-decrease]");
      const increase = event.target.closest("[data-budget-search-increase]");
      const button = event.target.closest("[data-budget-pick-product]");
      const result = event.target.closest("[data-budget-search-result]");
      const quantityInput = result?.querySelector("[data-budget-search-quantity]");
      if (decrease || increase) {
        if (!quantityInput) return;
        const current = Math.max(1, Math.round(Number(quantityInput.value) || 1));
        quantityInput.value = String(Math.max(1, current + (increase ? 1 : -1)));
        return;
      }
      if (!button) return;
      const quantity = Math.max(1, Math.round(Number(quantityInput?.value) || 1));
      addBudgetItem(container.dataset.budgetSearchResults, button.dataset.budgetPickProduct, quantity);
    });
  });

  els.ordersList.querySelectorAll("[data-budget-qty]").forEach((input) => {
    input.addEventListener("change", () => updateBudgetItemQty(input.dataset.budgetQty, input.dataset.product, Number(input.value)));
  });

  els.ordersList.querySelectorAll("[data-budget-change-product]").forEach((select) => {
    select.addEventListener("change", () => changeBudgetItemProduct(select.dataset.budgetChangeProduct, select.dataset.product, select.value));
  });

  els.ordersList.querySelectorAll("[data-budget-presentation]").forEach((input) => {
    input.addEventListener("change", () => updateBudgetItemPresentation(input.dataset.budgetPresentation, input.dataset.product, input.value));
  });

  els.ordersList.querySelectorAll("[data-budget-price]").forEach((input) => {
    input.addEventListener("change", () => updateBudgetItemPrice(input.dataset.budgetPrice, input.dataset.product, Number(input.value)));
  });

  els.ordersList.querySelectorAll("[data-budget-remove]").forEach((button) => {
    button.addEventListener("click", () => removeBudgetItem(button.dataset.budgetRemove, button.dataset.product));
  });
  els.ordersList.querySelectorAll("[data-edit-budget-item]").forEach((button) => {
    button.addEventListener("click", () => openBudgetItemEditor(button.dataset.editBudgetItem, button.dataset.product));
  });

  els.ordersList.querySelectorAll("[data-close-budget-item-edit]").forEach((button) => {
    button.addEventListener("click", closeBudgetItemEditor);
  });

  els.ordersList.querySelector("[data-budget-item-edit-overlay]")?.addEventListener("click", (event) => {
    if (event.target.matches("[data-budget-item-edit-overlay]")) closeBudgetItemEditor();
  });

  els.ordersList.querySelectorAll("[data-edit-item-quantity], [data-edit-item-price]").forEach((input) => {
    input.addEventListener("input", updateBudgetItemEditSubtotal);
  });

  els.ordersList.querySelectorAll("[data-save-budget-item-edit]").forEach((button) => {
    button.addEventListener("click", () => saveBudgetItemEdit(button.dataset.saveBudgetItemEdit, button.dataset.product));
  });

  els.ordersList.querySelectorAll("[data-save-order]").forEach((button) => {
    button.addEventListener("click", () => {
      const order = orders.find((item) => item.id === button.dataset.saveOrder);
      if (!order) return;
      if (!canEditOrder(order)) return;
      openOrderId = button.dataset.saveOrder;
      if (order.manualDraft) {
        saveManualConsultation(order);
        return;
      }
      order.updatedAt = new Date().toISOString();
      recalculateBudget(order);
      syncClientsFromOrders();
      saveOrders();
      saveClients();
      openOrderId = order.id;
      showToast("Cambios guardados", "success");
    });
  });

  els.ordersList.querySelectorAll("[data-close-order]").forEach((button) => {
    button.addEventListener("click", () => {
      closeOrderDetail(button.dataset.closeOrder);
    });
  });

  els.ordersList.querySelectorAll("[data-preview-budget]").forEach((button) => {
    button.addEventListener("click", () => showBudgetPreview(button.dataset.previewBudget, "send"));
  });

  els.ordersList.querySelectorAll("[data-view-receipt]").forEach((button) => {
    button.addEventListener("click", () => showBudgetPreview(button.dataset.viewReceipt, "view"));
  });

  els.ordersList.querySelectorAll("[data-send-budget]").forEach((button) => {
    button.addEventListener("click", () => sendBudgetByWhatsapp(button.dataset.sendBudget));
  });

  els.ordersList.querySelectorAll("[data-close-preview]").forEach((button) => {
    button.addEventListener("click", () => closeBudgetPreview(button.dataset.closePreview));
  });

  els.ordersList.querySelectorAll("[data-send-preview-budget]").forEach((button) => {
    button.addEventListener("click", () => sendBudgetPreviewByWhatsapp(button.dataset.sendPreviewBudget));
  });

  els.ordersList.querySelectorAll("[data-send-preview-pdf]").forEach((button) => {
    button.addEventListener("click", () => sendBudgetPreviewPdfByWhatsapp(button.dataset.sendPreviewPdf));
  });

  els.ordersList.querySelector("[data-budget-preview-overlay]")?.addEventListener("click", (event) => {
    if (event.target.matches("[data-budget-preview-overlay]")) {
      closeBudgetPreview(previewOrderId);
    }
  });
  els.ordersList.querySelectorAll("[data-view-document]").forEach((button) => {
    button.addEventListener("click", () => viewOrderDocument(button.dataset.viewDocument));
  });

  els.ordersList.querySelectorAll("[data-cancel-order]").forEach((button) => {
    button.addEventListener("click", () => cancelOrder(button.dataset.cancelOrder));
  });
}

function renderClients() {
  if (!els.clientsList) return;
  const sortedClients = getSortedClients();
  const selectedClient = clients.find((client) => client.phone === selectedClientPhone);
  if (!sortedClients.length) {
    els.clientsList.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state compact">Todavía no hay clientes registrados.</div>
        </td>
      </tr>
    `;
    if (els.clientDetail) els.clientDetail.innerHTML = "";
    return;
  }

  els.clientsList.innerHTML = sortedClients.map((client) => `
    <tr class="${selectedClientPhone === client.phone ? "selected-row" : ""}">
      <td data-label="Cliente"><strong>${escapeHtml(client.name || "Sin nombre")}</strong></td>
      <td data-label="Teléfono">${escapeHtml(client.phone)}</td>
      <td data-label="Localidad">${escapeHtml(client.location || "Sin localidad")}</td>
      <td data-label="Pedidos">${client.purchaseCount || 0}</td>
      <td data-label="Total comprado">${formatMoney(client.totalPurchased || 0)}</td>
      <td data-label="Última compra">${client.lastPurchaseAt ? escapeHtml(formatShortDate(client.lastPurchaseAt)) : "Sin compras"}</td>
      <td data-label="Ver"><button class="secondary-button small-button" type="button" data-view-client="${escapeHtml(client.phone)}">Ver</button></td>
    </tr>
  `).join("");
  bindClientActions();
  renderClientDetail(selectedClient || null);
}

function getSortedClients() {
  const query = (els.clientsSearch?.value || "").trim().toLowerCase();
  const sort = els.clientsSort?.value || "total";
  return clients.filter((client) => {
    if (!query) return true;
    return `${client.name} ${client.phone} ${client.location}`.toLowerCase().includes(query);
  }).sort((a, b) => {
    if (sort === "purchases") return (b.purchaseCount || 0) - (a.purchaseCount || 0);
    if (sort === "last") return new Date(b.lastPurchaseAt || 0) - new Date(a.lastPurchaseAt || 0);
    if (sort === "location") return String(a.location || "").localeCompare(String(b.location || ""), "es") || String(a.name || "").localeCompare(String(b.name || ""), "es");
    return (b.totalPurchased || 0) - (a.totalPurchased || 0);
  });
}

function bindClientActions() {
  els.clientsList.querySelectorAll("[data-view-client]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedClientPhone = button.dataset.viewClient;
      editingClientPhone = "";
      renderClients();
    });
  });
}

function renderClientDetail(client) {
  if (!els.clientDetail) return;
  if (!client) {
    els.clientDetail.innerHTML = "";
    return;
  }
  const clientOrders = getClientOrders(client);
  const stats = getClientStats(client, clientOrders);
  const isEditing = editingClientPhone === client.phone;
  els.clientDetail.innerHTML = `
    <section class="client-detail-card">
      <div class="client-detail-head">
        <div>
          <span class="eyebrow">Ficha del cliente</span>
          <h3>${escapeHtml(client.name || "Sin nombre")}</h3>
          <p>${escapeHtml(client.phone || "Sin teléfono")} · ${escapeHtml(client.location || "Sin localidad")}</p>
        </div>
        <button class="secondary-button small-button" type="button" data-close-client>Ocultar ficha</button>
      </div>

      <div class="client-detail-grid">
        <section class="client-panel">
          <h4>Datos del cliente</h4>
          ${isEditing ? renderClientEditForm(client) : renderClientReadOnly(client)}
        </section>
        <section class="client-panel client-summary-panel">
          <h4>Resumen</h4>
          <div class="client-summary-grid">
            <span><em>Primer pedido</em><strong>${stats.firstOrderAt ? escapeHtml(formatShortDate(stats.firstOrderAt)) : "Sin pedidos"}</strong></span>
            <span><em>Último pedido</em><strong>${stats.lastOrderAt ? escapeHtml(formatShortDate(stats.lastOrderAt)) : "Sin pedidos"}</strong></span>
            <span><em>Cantidad de pedidos</em><strong>${stats.orderCount}</strong></span>
            <span><em>Total comprado</em><strong>${formatMoney(stats.totalPurchased)}</strong></span>
            <span><em>Promedio por pedido</em><strong>${formatMoney(stats.averageOrder)}</strong></span>
          </div>
        </section>
      </div>

      <section class="client-panel">
        <h4>Historial de pedidos</h4>
        ${renderClientOrderHistory(clientOrders)}
      </section>

      <section class="client-actions-panel">
        <a class="primary-button small-button" href="${buildClientWhatsappLink(client)}" target="_blank" rel="noreferrer">WhatsApp</a>
        ${isEditing
          ? `<button class="primary-button small-button" type="button" data-save-client="${escapeHtml(client.phone)}">Guardar cliente</button>
             <button class="secondary-button small-button" type="button" data-cancel-client-edit>Cancelar</button>`
          : `<button class="secondary-button small-button" type="button" data-edit-client="${escapeHtml(client.phone)}">Editar cliente</button>`}
      </section>
    </section>
  `;
  bindClientDetailActions();
}

function renderClientReadOnly(client) {
  return `
    <div class="client-data-list">
      <span><em>Nombre</em><strong>${escapeHtml(client.name || "Sin nombre")}</strong></span>
      <span><em>Teléfono</em><strong>${escapeHtml(client.phone || "Sin teléfono")}</strong></span>
      <span><em>Localidad</em><strong>${escapeHtml(client.location || "Sin localidad")}</strong></span>
      <span><em>Dirección</em><strong>${escapeHtml(client.address || "Sin dirección")}</strong></span>
      <span><em>Observaciones</em><strong>${escapeHtml(client.notes || "Sin observaciones")}</strong></span>
    </div>
  `;
}

function renderClientEditForm(client) {
  return `
    <div class="client-edit-form">
      <label>Nombre<input type="text" value="${escapeHtml(client.name || "")}" data-client-field="name"></label>
      <label>Teléfono<input type="tel" value="${escapeHtml(client.phone || "")}" data-client-field="phone" disabled></label>
      <label>Localidad<input type="text" value="${escapeHtml(client.location || "")}" data-client-field="location"></label>
      <label>Dirección<input type="text" value="${escapeHtml(client.address || "")}" data-client-field="address"></label>
      <label class="wide-field">Observaciones<textarea rows="3" data-client-field="notes">${escapeHtml(client.notes || "")}</textarea></label>
    </div>
  `;
}

function renderClientOrderHistory(clientOrders) {
  if (!clientOrders.length) return `<div class="empty-state compact">Este cliente todavía no tiene pedidos registrados.</div>`;
  return `
    <div class="client-history-list">
      ${clientOrders.map((order) => `
        <div class="client-history-row">
          <strong>${escapeHtml(formatRecordNumber(order))}</strong>
          <span>${escapeHtml(formatShortDate(order.createdAt || order.updatedAt))}</span>
          <span>${formatMoney(order.total || 0)}</span>
          <span class="status-pill status-${getStatusKey(order.status)}">${escapeHtml(order.status || "En revisión")}</span>
          <button class="secondary-button small-button" type="button" data-client-open-order="${order.id}">Ver pedido</button>
        </div>
      `).join("")}
    </div>
  `;
}

function bindClientDetailActions() {
  els.clientDetail.querySelector("[data-close-client]")?.addEventListener("click", () => {
    selectedClientPhone = "";
    editingClientPhone = "";
    renderClients();
  });
  els.clientDetail.querySelector("[data-edit-client]")?.addEventListener("click", (event) => {
    editingClientPhone = event.currentTarget.dataset.editClient;
    renderClients();
  });
  els.clientDetail.querySelector("[data-cancel-client-edit]")?.addEventListener("click", () => {
    editingClientPhone = "";
    renderClients();
  });
  els.clientDetail.querySelector("[data-save-client]")?.addEventListener("click", (event) => saveClientDetail(event.currentTarget.dataset.saveClient));
  els.clientDetail.querySelectorAll("[data-client-open-order]").forEach((button) => {
    button.addEventListener("click", () => {
      setView("pedidos", true);
      openOrderDetail(button.dataset.clientOpenOrder);
    });
  });
}

function saveClientDetail(phone) {
  const client = clients.find((item) => item.phone === phone);
  if (!client || !els.clientDetail) return;
  els.clientDetail.querySelectorAll("[data-client-field]").forEach((field) => {
    const key = field.dataset.clientField;
    if (key !== "phone") client[key] = field.value.trim();
  });
  const now = new Date().toISOString();
  client.sourceUpdatedAt = now;
  client.updatedAt = now;
  editingClientPhone = "";
  saveClients();
  renderClients();
  showToast("Cliente guardado correctamente");
}

function getClientOrders(client) {
  const phone = normalizeClientPhone(client.phone);
  return orders.filter((order) => isInternalOrder(order) && normalizeClientPhone(order.customerPhone) === phone)
    .sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0));
}

function getClientStats(client, clientOrders) {
  const paidOrders = clientOrders.filter((order) => isConfirmed(order.status));
  const orderDates = clientOrders.map((order) => order.createdAt || order.updatedAt).filter(Boolean).sort((a, b) => new Date(a) - new Date(b));
  const totalPurchased = paidOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  return {
    firstOrderAt: orderDates[0] || "",
    lastOrderAt: orderDates[orderDates.length - 1] || "",
    orderCount: clientOrders.length,
    totalPurchased,
    averageOrder: paidOrders.length ? Math.round(totalPurchased / paidOrders.length) : 0
  };
}

function buildClientWhatsappLink(client) {
  const phone = normalizeArgentinaWhatsappNumber(client.phone || "");
  return phone ? `https://wa.me/${phone}` : "#";
}

function exportClientsToExcel() {
  if (!hasPermission("importExport")) return;
  const headers = ["Nombre", "Teléfono", "Localidad", "Dirección", "Observaciones", "Fecha de alta", "Cantidad de pedidos", "Total comprado", "Última compra"];
  const rows = getSortedClients().map((client) => [
    client.name || "",
    client.phone || "",
    client.location || "",
    client.address || "",
    client.notes || "",
    client.createdAt ? formatShortDate(client.createdAt) : "",
    client.purchaseCount || 0,
    client.totalPurchased || 0,
    client.lastPurchaseAt ? formatShortDate(client.lastPurchaseAt) : ""
  ]);
  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(";")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `clientes-gb-mayorista-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Clientes exportados para Excel");
}

function renderReports() {
  if (!els.reportGrid) return;
  const totals = getTotals();
  const confirmedOrders = orders.filter((order) => isConfirmed(order.status));
  const ticketAverage = confirmedOrders.length
    ? confirmedOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0) / confirmedOrders.length
    : 0;
  const stockMargin = totals.stockSaleValue - totals.stockCostValue;
  const topProducts = getProductSalesSummary().filter((item) => item.quantity > 0).slice(0, 10);

  els.reportGrid.innerHTML = `
    <section class="executive-report-section executive-sales">
      <div class="executive-section-head">
        <span>Resumen comercial</span>
        <strong>Ventas</strong>
      </div>
      <div class="executive-card-grid">
        ${renderExecutiveCard("Ventas de hoy", formatMoney(totals.todaySales))}
        ${renderExecutiveCard("Ventas del mes", formatMoney(totals.monthSales))}
        ${renderExecutiveCard("Ventas del año", formatMoney(totals.yearSales))}
        ${renderExecutiveCard("Ticket promedio", formatMoney(ticketAverage))}
      </div>
    </section>

    <section class="executive-report-section executive-stock">
      <div class="executive-section-head">
        <span>Inventario</span>
        <strong>Valor del stock</strong>
      </div>
      <div class="executive-card-grid three-cards">
        ${renderExecutiveCard("Stock a costo", formatMoney(totals.stockCostValue))}
        ${renderExecutiveCard("Stock a venta", formatMoney(totals.stockSaleValue))}
        ${renderExecutiveCard("Margen potencial", formatMoney(stockMargin), "highlight")}
      </div>
    </section>

    <section class="executive-report-section executive-products">
      <div class="executive-section-head">
        <span>Estadísticas de ventas</span>
        <strong>Top 10 más vendidos</strong>
      </div>
      ${renderTopProducts(topProducts)}
    </section>
  `;
}

function renderExecutiveCard(label, value, tone = "") {
  return `
    <article class="executive-card ${tone}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </article>
  `;
}

function renderTopProducts(items) {
  if (!items.length) return `<div class="empty-state compact">Todavía no hay productos vendidos.</div>`;
  return `
    <div class="executive-product-list">
      ${items.map((item, index) => `
        <article class="executive-product-row">
          <span>${index + 1}</span>
          <strong>${escapeHtml(item.name)}</strong>
          <em>${item.quantity} vendido(s)</em>
        </article>
      `).join("")}
    </div>
  `;
}

function getProductSalesSummary() {
  const sales = new Map(products.map((product) => [product.id, { id: product.id, name: product.name, quantity: 0 }]));
  orders.filter((order) => isConfirmed(order.status)).forEach((order) => {
    order.items.forEach((item) => {
      const entry = sales.get(item.id) || { id: item.id, name: item.name, quantity: 0 };
      entry.quantity += Math.max(0, Number(item.quantity) || 0);
      sales.set(item.id, entry);
    });
  });
  return [...sales.values()].sort((a, b) => b.quantity - a.quantity);
}

function getStockMovementSummary() {
  const summary = new Map();
  stockHistory.forEach((entry) => {
    const item = summary.get(entry.productId) || { name: entry.productName, up: 0, down: 0 };
    const delta = Number(entry.delta) || 0;
    if (delta > 0) item.up += delta;
    if (delta < 0) item.down += Math.abs(delta);
    summary.set(entry.productId, item);
  });
  const values = [...summary.values()];
  return {
    up: values.filter((item) => item.up > 0).map((item) => ({ name: item.name, quantity: item.up })).sort((a, b) => b.quantity - a.quantity),
    down: values.filter((item) => item.down > 0).map((item) => ({ name: item.name, quantity: item.down })).sort((a, b) => b.quantity - a.quantity)
  };
}

function renderCart() {
  const items = cart.map((item) => {
    if (item.catalogGroupId) return item;
    const product = products.find((entry) => entry.id === item.id);
    return product ? { ...product, quantity: item.quantity, cartId: item.id } : null;
  }).filter(Boolean);

  const totalUnits = getCartTotalQuantity(items);
  const totalPrice = getCartTotalPrice(items);
  const minimumReached = totalPrice >= WHOLESALE_MINIMUM;
  els.cartCount.textContent = totalUnits;
  if (els.openCart) {
    els.openCart.innerHTML = `Carrito <span id="cartCount">${totalUnits ? `(${totalUnits})` : "(0)"}</span>`;
    els.cartCount = document.querySelector("#cartCount");
  }
  if (els.floatingCartCount) els.floatingCartCount.textContent = totalUnits;
  els.floatingCartButton?.classList.toggle("has-items", totalUnits > 0);
  els.floatingCartButton?.setAttribute("aria-label", `Abrir carrito (${totalUnits})`);
  els.cartTotal.textContent = formatMoney(totalPrice);
  const cartCountSummary = items.length ? `${items.length} artículo${items.length === 1 ? "" : "s"} diferente${items.length === 1 ? "" : "s"} · ${totalUnits} unidad${totalUnits === 1 ? "" : "es"} totales` : "Sin productos";
  els.cartSubtitle.textContent = cartCountSummary;
  if (els.cartSummaryCounts) els.cartSummaryCounts.textContent = cartCountSummary;
  els.minimumStatus.className = `minimum-status ${minimumReached ? "reached" : "pending"}`;
  els.minimumStatus.textContent = minimumReached
    ? "✓ Compra mínima alcanzada"
    : `Te faltan ${formatMoney(WHOLESALE_MINIMUM - totalPrice)} para alcanzar la compra mínima`;
  clearCartError();

  if (!items.length) {
    els.cartItems.innerHTML = `<div class="empty-state compact">Agregá productos para preparar el carrito.</div>`;
    els.whatsappLink.classList.add("disabled");
    els.whatsappLink.href = "#";
    els.whatsappLink.onclick = null;
    return;
  }

  els.cartItems.innerHTML = items.map((item, index) => `
    <article class="cart-item compact-cart-item">
      <img class="cart-item-image" src="${escapeHtml(item.image || DEFAULT_PRODUCT_IMAGE)}" alt="${escapeHtml(item.name)}" onerror="this.onerror=null;this.src='${DEFAULT_PRODUCT_IMAGE}'">
      <div class="cart-item-main">
        <strong>${index + 1}. ${escapeHtml(item.name.toUpperCase())}</strong>
        <div class="cart-item-meta">
          ${renderCartVariantLine(item)}
          <span>Presentación: ${escapeHtml(formatCartPresentation(item))}</span>
          <span>Cantidad: ${escapeHtml(formatCartQuantity(item))}</span>
                  <span>Precio: ${escapeHtml(formatMoney(Number(item.price) || 0))}</span>
        </div>
      </div>
      <div class="cart-item-side">
        <strong>${escapeHtml(formatCartSubtotal(item))}</strong>
        <button class="cart-remove-button" type="button" data-remove="${item.cartId || item.id}" aria-label="Quitar ${escapeHtml(item.name)}">Quitar</button>
      </div>
    </article>
  `).join("");
  els.cartItems.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      cart = cart.filter((item) => (item.cartId || item.id) !== button.dataset.remove);
      saveCart();
      renderCart();
    });
  });

  const customer = getCustomerData();
  els.whatsappLink.href = minimumReached && customer.isComplete ? buildWhatsappUrl(items, totalPrice, customer) : "#";
  els.whatsappLink.classList.toggle("disabled", !minimumReached);
  els.whatsappLink.onclick = (event) => {
    const latestCustomer = getCustomerData();
    if (!minimumReached) {
      event.preventDefault();
      showToast(`Faltan ${formatMoney(WHOLESALE_MINIMUM - totalPrice)} para alcanzar la compra mínima`);
      return;
    }
    if (!latestCustomer.isComplete) {
      event.preventDefault();
      showCartError("⚠ Completar nombre, teléfono y localidad para continuar.");
      return;
    }
    event.preventDefault();
    const consultation = saveCatalogConsultation(items, totalPrice, latestCustomer);
    const whatsappUrl = buildWhatsappUrl(items, totalPrice, latestCustomer, formatConsultationNumber(consultation));
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    cart = [];
    saveCart();
    clearCustomerFields();
    closeCart();
    setView("catalogo");
    renderAll();
    showToast("Pedido registrado correctamente");
  };
}

function getCartTotalQuantity(items = cart) {
  return items.reduce((sum, item) => sum + Math.max(1, Number(item.quantity) || 1), 0);
}

function getCartTotalPrice(items = cart) {
  return items.reduce((sum, item) => sum + (Math.max(1, Number(item.quantity) || 1) * (Number(item.price) || 0)), 0);
}
function showCartError(message) {
  if (!els.cartError) return;
  els.cartError.textContent = message;
  els.cartError.classList.remove("hidden");
}

function clearCartError() {
  if (!els.cartError) return;
  els.cartError.textContent = "";
  els.cartError.classList.add("hidden");
}

function clearCustomerFields() {
  if (els.customerName) els.customerName.value = "";
  if (els.customerPhone) els.customerPhone.value = "";
  if (els.customerLocation) els.customerLocation.value = "";
  clearCartError();
}

function addCatalogGroupToCart(group, variant, quantity, internalProduct = null) {
  if (!group || !variant) return;
  const minimum = group.minimum || 1;
  const cleanQuantity = Math.max(minimum, Math.round(Number(quantity) || minimum));
  if (cleanQuantity < minimum) {
    showToast(`La compra mínima de ${group.name} es ${minimum}`);
    return;
  }

  const cartId = `${group.id}__${variant.id}`;
  const existing = cart.find((item) => item.cartId === cartId);
  if (existing) existing.quantity += cleanQuantity;
  else {
    cart.push({
      cartId,
      id: variant.productId,
      internalProductId: variant.productId,
      internalProductName: internalProduct?.name || variant.internalName || "",
      catalogGroupId: group.id,
      name: getCartProductNameFromCatalog(group, variant),
      brand: group.brand,
      category: group.category,
      image: group.image,
      variantLabel: variant.label,
      price: variant.price,
      saleType: variant.saleType,
      packQuantity: variant.packQuantity,
      presentation: variant.presentation,
      quantity: cleanQuantity
    });
  }
  saveCart();
  renderCart();
  showToast("Producto agregado al carrito");
}

function getCartProductNameFromCatalog(group, variant) {
  const label = String(variant?.label || "").trim();
  if (!label || isPresentationOnlyLabel(label)) return group.name;
  return `${group.name} - ${label}`;
}

function addToCart(product, quantity) {
  if (!product) return;
  if (quantity < product.minimum) {
    showToast(`La compra mínima de ${getProductArticleName(product)} es ${product.minimum}`);
    return;
  }

  const existing = cart.find((item) => item.id === product.id);
  if (existing) existing.quantity += quantity;
  else cart.push({ id: product.id, quantity });
  saveCart();
  renderCart();
  showToast("Producto agregado al carrito");
}

function saveCatalogConsultation(items, totalPrice, customer) {
  const order = makeBudgetFromCatalogItems(items, customer, "Consulta enviada desde el catálogo por WhatsApp.");
  order.catalogTotal = totalPrice;
  orders.unshift(order);
  syncClientsFromOrders();
  saveOrders();
  return order;
}

function updateProductField(id, field, value) {
  if (!hasPermission("editSaleData") && !canAccess("admin")) return;
  if (field === "cost" && !canAccess("admin")) return;
  const product = products.find((item) => item.id === id);
  if (!product) return;
  if (field === "variants") {
    product[field] = String(value || "").trim();
  } else {
    product[field] = Math.max(0, Math.round(value || 0));
  }
  saveProducts();
  renderAll();
  showToast("Producto actualizado");
}

function isInternalOrder(order) {
  return order.type === "order";
}

function setProductStock(id, nextStock, reason = "Ajuste manual", variantName = "Base / sin variante", options = {}) {
  if (!hasPermission("stock")) return;
  const product = products.find((item) => item.id === id);
  if (!product) return;
  const previousStock = getProductStock(product, variantName);
  const finalStock = Math.max(0, Math.round(nextStock || 0));
  setProductVariantStock(product, variantName, finalStock);
  recordStockMovement(product, finalStock - previousStock, previousStock, finalStock, reason, { variant: variantName });
  saveProducts();
  saveStockHistory();
  renderAll();
  if (!options.silent) showToast("Stock modificado");
}

function adjustProductStock(id, delta, variantName = "Base / sin variante") {
  if (!hasPermission("stock")) return;
  const product = products.find((item) => item.id === id);
  if (!product) return;
  const adjustment = Math.round(delta || 0);
  if (!adjustment) {
    showToast("Ingresá un ajuste distinto de 0");
    return;
  }
  const previousStock = getProductStock(product, variantName);
  const finalStock = Math.max(0, previousStock + adjustment);
  setProductVariantStock(product, variantName, finalStock);
  recordStockMovement(product, finalStock - previousStock, previousStock, finalStock, "Ajuste manual", { variant: variantName });
  saveProducts();
  saveStockHistory();
  renderAll();
  showToast("Movimiento de stock registrado");
}

function recordStockMovement(product, delta, previousStock, nextStock, reason, meta = {}) {
  if (!delta) return;
  stockHistory.unshift({
    id: crypto.randomUUID(),
    productId: product.id,
    productName: getProductArticleName(product),
    variant: meta.variant || "Base / sin variante",
    delta,
    previousStock,
    nextStock,
    reason,
    orderId: meta.orderId || "",
    createdAt: new Date().toISOString()
  });
  stockHistory = stockHistory.slice(0, 80);
}

function duplicateProduct(id) {
  if (!hasPermission("manageProducts")) return;
  const product = products.find((item) => item.id === id);
  if (!product) return;
  products.push({
    ...product,
    id: crypto.randomUUID(),
    name: `${getProductBaseName(product)} copia`,
    active: false,
    sortOrder: getNextSortOrder()
  });
  saveProducts();
  renderAll();
  showToast("Producto duplicado como oculto");
}

function toggleProduct(id) {
  if (!hasPermission("manageProducts")) return;
  const product = products.find((item) => item.id === id);
  if (!product) return;
  product.active = !product.active;
  saveProducts();
  renderAll();
  showToast(product.active ? "Producto visible en catalogo" : "Producto oculto del catalogo");
}

function moveProduct(id, direction) {
  if (!hasPermission("manageProducts")) return;
  const ordered = getOrderedProducts();
  const currentIndex = ordered.findIndex((product) => product.id === id);
  const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= ordered.length) return;

  const current = ordered[currentIndex];
  const next = ordered[nextIndex];
  const currentOrder = current.sortOrder;
  current.sortOrder = next.sortOrder;
  next.sortOrder = currentOrder;
  saveProducts();
  renderAll();
  showToast("Orden actualizado");
}

function getOrderedProducts() {
  return [...products].sort((a, b) => a.sortOrder - b.sortOrder);
}

function getNextSortOrder() {
  return products.reduce((max, product) => Math.max(max, product.sortOrder || 0), 0) + 1;
}

function getFileList(files) {
  return Array.from(files || []).filter((file) => file instanceof File && file.size);
}

async function prepareProductImageFile(file) {
  try {
    return await processProductImageFile(file);
  } catch (error) {
    console.warn("GB Mayorista image processing fallback:", error);
    return file;
  }
}

async function processProductImageToDataUrl(file) {
  const processedFile = await prepareProductImageFile(file);
  return readFileAsDataUrl(processedFile);
}

async function processProductImageFile(file) {
  if (!(file instanceof File) || !file.size) return file;
  const source = await loadImageSource(file);
  try {
    const scale = Math.min(1, CATALOG_IMAGE_MAX_SOURCE_SIZE / Math.max(source.width, source.height));
    const sourceWidth = Math.max(1, Math.round(source.width * scale));
    const sourceHeight = Math.max(1, Math.round(source.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = sourceWidth;
    canvas.height = sourceHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(source.image, 0, 0, sourceWidth, sourceHeight);

    const imageData = ctx.getImageData(0, 0, sourceWidth, sourceHeight);
    const data = imageData.data;
    const background = estimateImageBackground(data, sourceWidth, sourceHeight);
    const threshold = getBackgroundThreshold(background);
    const bounds = findForegroundBounds(data, sourceWidth, sourceHeight, background, threshold);
    replaceDetectedBackground(data, sourceWidth, sourceHeight, background, threshold);
    ctx.putImageData(imageData, 0, 0);

    const crop = expandBounds(bounds || { left: 0, top: 0, right: sourceWidth - 1, bottom: sourceHeight - 1 }, sourceWidth, sourceHeight);
    const output = document.createElement("canvas");
    output.width = CATALOG_IMAGE_SIZE;
    output.height = CATALOG_IMAGE_SIZE;
    const outputCtx = output.getContext("2d");
    outputCtx.fillStyle = "#ffffff";
    outputCtx.fillRect(0, 0, output.width, output.height);

    const cropWidth = Math.max(1, crop.right - crop.left + 1);
    const cropHeight = Math.max(1, crop.bottom - crop.top + 1);
    const maxContent = Math.round(CATALOG_IMAGE_SIZE * CATALOG_IMAGE_CONTENT_RATIO);
    const fitScale = Math.min(maxContent / cropWidth, maxContent / cropHeight);
    const drawWidth = Math.max(1, Math.round(cropWidth * fitScale));
    const drawHeight = Math.max(1, Math.round(cropHeight * fitScale));
    const drawX = Math.round((CATALOG_IMAGE_SIZE - drawWidth) / 2);
    const drawY = Math.round((CATALOG_IMAGE_SIZE - drawHeight) / 2);
    outputCtx.drawImage(canvas, crop.left, crop.top, cropWidth, cropHeight, drawX, drawY, drawWidth, drawHeight);

    const blob = await canvasToBlob(output, "image/jpeg", 0.92);
    const baseName = String(file.name || "producto").replace(/\.[^.]+$/, "").slice(0, 80) || "producto";
    return new File([blob], `${baseName}-catalogo.jpg`, { type: "image/jpeg" });
  } finally {
    source.close?.();
  }
}

async function loadImageSource(file) {
  if (window.createImageBitmap) {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { image: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close?.() };
    } catch (error) {
      // Fallback below for browsers/files that cannot create an ImageBitmap.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
    return { image, width: image.naturalWidth || image.width, height: image.naturalHeight || image.height, close: () => URL.revokeObjectURL(url) };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

function estimateImageBackground(data, width, height) {
  const samples = [];
  const sampleSize = Math.max(8, Math.min(32, Math.round(Math.min(width, height) * 0.035)));
  const corners = [
    [0, 0],
    [Math.max(0, width - sampleSize), 0],
    [0, Math.max(0, height - sampleSize)],
    [Math.max(0, width - sampleSize), Math.max(0, height - sampleSize)]
  ];
  corners.forEach(([startX, startY]) => {
    for (let y = startY; y < Math.min(height, startY + sampleSize); y += 2) {
      for (let x = startX; x < Math.min(width, startX + sampleSize); x += 2) {
        const index = (y * width + x) * 4;
        if (data[index + 3] > 12) samples.push([data[index], data[index + 1], data[index + 2]]);
      }
    }
  });
  if (!samples.length) return { r: 255, g: 255, b: 255, spread: 0 };
  const average = samples.reduce((acc, color) => {
    acc.r += color[0];
    acc.g += color[1];
    acc.b += color[2];
    return acc;
  }, { r: 0, g: 0, b: 0 });
  average.r /= samples.length;
  average.g /= samples.length;
  average.b /= samples.length;
  const spread = samples.reduce((sum, color) => sum + colorDistance(color[0], color[1], color[2], average), 0) / samples.length;
  return { ...average, spread };
}

function getBackgroundThreshold(background) {
  return Math.max(34, Math.min(78, 34 + background.spread * 1.7));
}

function findForegroundBounds(data, width, height, background, threshold) {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      if (!isBackgroundPixel(data, index, background, threshold)) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }
  }
  if (right < left || bottom < top) return null;
  const area = (right - left + 1) * (bottom - top + 1);
  return area < width * height * 0.008 ? null : { left, top, right, bottom };
}

function replaceDetectedBackground(data, width, height, background, threshold) {
  for (let index = 0; index < data.length; index += 4) {
    if (isBackgroundPixel(data, index, background, threshold)) {
      data[index] = 255;
      data[index + 1] = 255;
      data[index + 2] = 255;
      data[index + 3] = 255;
    } else if (data[index + 3] < 255) {
      data[index + 3] = 255;
    }
  }
}

function isBackgroundPixel(data, index, background, threshold) {
  const alpha = data[index + 3];
  if (alpha < 18) return true;
  return colorDistance(data[index], data[index + 1], data[index + 2], background) <= threshold;
}

function colorDistance(r, g, b, color) {
  return Math.sqrt((r - color.r) ** 2 + (g - color.g) ** 2 + (b - color.b) ** 2);
}

function expandBounds(bounds, width, height) {
  const pad = Math.round(Math.max(bounds.right - bounds.left + 1, bounds.bottom - bounds.top + 1) * 0.035);
  return {
    left: Math.max(0, bounds.left - pad),
    top: Math.max(0, bounds.top - pad),
    right: Math.min(width - 1, bounds.right + pad),
    bottom: Math.min(height - 1, bounds.bottom + pad)
  };
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("No se pudo procesar la imagen")), type, quality);
  });
}

async function getImagesFromProductForm(form, productId) {
  return uploadOrReadImageFiles(productId, getFileList(form.getAll("imageFile")));
}

async function uploadOrReadImageFiles(productId, files) {
  const images = [];
  for (const file of files) {
    const processedFile = await prepareProductImageFile(file);
    const image = await uploadProductImageToSupabase(productId, processedFile) || await readFileAsDataUrl(processedFile);
    if (image) images.push(image);
  }
  return images;
}

function normalizeProductImages(product) {
  const rawImages = [
    ...(Array.isArray(product?.images) ? product.images : []),
    product?.image
  ];
  return mergeProductImages(rawImages);
}

function mergeProductImages(...imageGroups) {
  const seen = new Set();
  const images = [];
  imageGroups.flat().forEach((image) => {
    const clean = getCatalogImage(image);
    if (!clean || clean === DEFAULT_PRODUCT_IMAGE || seen.has(clean)) return;
    seen.add(clean);
    images.push(clean);
  });
  return images;
}

function getStoredProductImages(product) {
  return normalizeProductImages(product);
}

function getProductImages(product) {
  const images = getStoredProductImages(product);
  return images.length ? images : [DEFAULT_PRODUCT_IMAGE];
}

function getPrimaryProductImage(product) {
  return getProductImages(product)[0] || DEFAULT_PRODUCT_IMAGE;
}

function setProductImages(product, images) {
  const cleanImages = mergeProductImages(images);
  product.images = cleanImages;
  product.image = cleanImages[0] || DEFAULT_PRODUCT_IMAGE;
}

async function handleProductImagePreview() {
  const files = getFileList(els.productImageInput?.files);
  processedProductImage = "";
  resetImagePreview(files.length ? "Cargando vista previa..." : undefined);
  if (!files.length) return;

  try {
    const previews = [];
    for (const file of files) previews.push(await processProductImageToDataUrl(file));
    processedProductImage = previews[0] || "";
    if (els.productImagePreview && processedProductImage) {
      els.productImagePreview.src = processedProductImage;
      els.productImagePreview.hidden = false;
    }
    if (els.imagePreviewText) els.imagePreviewText.textContent = `${previews.length} foto(s) procesada(s). La primera sera la principal.`;
    renderSelectedProductImageGallery(previews);
  } catch (error) {
    resetImagePreview();
    showToast("No se pudo cargar la imagen");
  }
}

function resetImagePreview(message = "La vista previa procesada aparecera antes de guardar.") {
  if (!message || !message.startsWith("Cargando")) processedProductImage = "";
  if (els.productImagePreview) {
    els.productImagePreview.removeAttribute("src");
    els.productImagePreview.hidden = true;
  }
  if (els.imagePreviewText) els.imagePreviewText.textContent = message || "La vista previa procesada aparecera antes de guardar.";
  if (els.productImageGallery) els.productImageGallery.innerHTML = "";
}

function renderSelectedProductImageGallery(images) {
  if (!els.productImageGallery) return;
  els.productImageGallery.innerHTML = images.map((image, index) => `
    <div class="gallery-thumb ${index === 0 ? "is-primary" : ""}">
      <img src="${escapeHtml(image)}" alt="Foto seleccionada ${index + 1}">
      <span>${index === 0 ? "Principal" : `Foto ${index + 1}`}</span>
    </div>
  `).join("");
}

function renderEditProductImageGallery(product) {
  if (!els.editProductImageGallery) return;
  els.editProductImageGallery.innerHTML = "";
  const images = getStoredProductImages(product);
  if (els.editProductImagePreview) els.editProductImagePreview.src = images[0] || DEFAULT_PRODUCT_IMAGE;
}

function markEditProductPhotoForRemoval() {
  if (!editingProductId) return;
  editProductRemoveImagePending = true;
  if (els.editProductImage) els.editProductImage.value = "";
  if (els.editProductImagePreview) els.editProductImagePreview.src = DEFAULT_PRODUCT_IMAGE;
  if (els.editProductImageLabel) els.editProductImageLabel.textContent = "Agregar foto";
}

function stepEditProductStock(delta) {
  if (!els.editProductStock) return;
  const current = Math.max(0, Math.round(Number(els.editProductStock.value) || 0));
  els.editProductStock.value = String(Math.max(0, current + delta));
}

function normalizeEditProductStockInput() {
  if (!els.editProductStock) return;
  const value = Math.max(0, Math.round(Number(els.editProductStock.value) || 0));
  els.editProductStock.value = String(value);
}

function updateEditProductStockLabels(product) {
  const stock = Math.max(0, Number(product?.stock) || 0);
  if (els.editProductStockCurrent) els.editProductStockCurrent.textContent = `Stock actual: ${formatProductStock(product, stock)}`;
  if (els.editProductStockUnit) els.editProductStockUnit.textContent = getStockUnitLabel(product, stock);
}

function getEditProductFormState() {
  if (!els.editProductForm || !editingProductId) return "";
  const product = products.find((item) => item.id === editingProductId);
  return JSON.stringify({
    name: els.editProductName?.value || "",
    option: els.editProductOption?.value || "",
    category: els.editProductCategory?.value || "",
    description: els.editProductDescription?.value || "",
    presentation: els.editProductPresentation?.value || "",
    cost: els.editProductCost?.value || "",
    price: els.editProductPrice?.value || "",
    stock: els.editProductStock?.value || "",
    catalog: els.editProductCatalog?.value || "",
    imageCount: getStoredProductImages(product).length,
    removeImage: editProductRemoveImagePending,
    newImage: Boolean(els.editProductImage?.files?.length)
  });
}

function hasEditProductUnsavedChanges() {
  if (!editingProductId || !editProductInitialState) return false;
  return getEditProductFormState() !== editProductInitialState;
}

function closeOpenProductDetailsMenu(options = {}) {
  const openDetails = document.querySelector(".more-product-actions[open], .edit-product-more-options[open]");
  if (!openDetails) return false;
  openDetails.open = false;
  if (productDetailsMenuHistoryActive) {
    productDetailsMenuHistoryActive = false;
    if (!options.skipHistory && window.history?.state?.modal === "productDetailsMenu") {
      productDetailsMenuClosingByCode = true;
      window.history.back();
    }
  }
  return true;
}

function pushProductDetailsMenuHistoryState() {
  if (!appHistoryReady || !window.history?.pushState) return;
  if (productDetailsMenuHistoryActive || window.history.state?.modal === "productDetailsMenu") return;
  productDetailsMenuHistoryActive = true;
  window.history.pushState({ ...makeAppHistoryState(currentView), modal: "productDetailsMenu" }, "", getCurrentHistoryUrl());
}

function setupProductDetailsMenus() {
  document.addEventListener("toggle", (event) => {
    const details = event.target;
    if (!(details instanceof HTMLDetailsElement) || !details.matches(".more-product-actions, .edit-product-more-options")) return;
    if (details.open) pushProductDetailsMenuHistoryState();
  }, true);
  document.addEventListener("click", (event) => {
    const details = event.target.closest?.(".more-product-actions, .edit-product-more-options");
    if (!details) closeOpenProductDetailsMenu();
    else if (!event.target.closest("summary")) window.setTimeout(() => closeOpenProductDetailsMenu(), 0);
  });
}

function handleProductGalleryAction(action, index) {
  const product = products.find((item) => item.id === editingProductId);
  if (!product || !hasPermission("manageProducts")) return;
  const images = getStoredProductImages(product);
  if (index < 0 || index >= images.length) return;

  if (action === "primary") {
    const [image] = images.splice(index, 1);
    images.unshift(image);
  } else if (action === "up" && index > 0) {
    [images[index - 1], images[index]] = [images[index], images[index - 1]];
  } else if (action === "down" && index < images.length - 1) {
    [images[index], images[index + 1]] = [images[index + 1], images[index]];
  } else if (action === "delete") {
    images.splice(index, 1);
  }

  setProductImages(product, images);
  saveProducts();
  renderCatalog();
  renderAdmin();
  renderEditProductImageGallery(product);
  showToast("Fotos actualizadas", "success");
}

async function replaceProductGalleryImage(index, file) {
  const product = products.find((item) => item.id === editingProductId);
  if (!product || !hasPermission("manageProducts") || !(file instanceof File) || !file.size) return;
  const images = getStoredProductImages(product);
  if (index < 0 || index >= images.length) return;
  const processedFile = await prepareProductImageFile(file);
  const replacement = await uploadProductImageToSupabase(product.id, processedFile) || await readFileAsDataUrl(processedFile);
  if (!replacement) return;
  images[index] = replacement;
  setProductImages(product, images);
  saveProducts();
  renderCatalog();
  renderAdmin();
  renderEditProductImageGallery(product);
  showToast("Foto reemplazada", "success");
}

function openImageLightbox(images, options = "Producto", startIndex = 0) {
  lightboxImages = mergeProductImages(images);
  if (!lightboxImages.length) lightboxImages = [DEFAULT_PRODUCT_IMAGE];
  const config = typeof options === "object" && options !== null ? options : { title: options };
  lightboxTitle = String(config.title || "Producto");
  lightboxDescription = String(config.description || "").trim();
  lightboxIndex = Math.max(0, Math.min(Number(startIndex) || 0, lightboxImages.length - 1));
  showLightboxImage(lightboxIndex);
  els.imageLightbox?.classList.remove("hidden");
  els.imageLightbox?.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  pushImageLightboxHistoryState();
}

function showLightboxImage(index) {
  if (!lightboxImages.length) return;
  lightboxIndex = (index + lightboxImages.length) % lightboxImages.length;
  if (els.imageLightboxImage) els.imageLightboxImage.src = lightboxImages[lightboxIndex];
  if (els.imageLightboxCaption) {
    const title = lightboxImages.length > 1
      ? `${lightboxTitle} (${lightboxIndex + 1}/${lightboxImages.length})`
      : lightboxTitle;
    els.imageLightboxCaption.innerHTML = `${escapeHtml(title)}${lightboxDescription ? `<span>${escapeHtml(lightboxDescription).replace(/\n/g, "<br>")}</span>` : ""}`;
  }
  const hasMultiple = lightboxImages.length > 1;
  els.imageLightboxPrev?.classList.toggle("hidden", !hasMultiple);
  els.imageLightboxNext?.classList.toggle("hidden", !hasMultiple);
}

function showNextLightboxImage() {
  if (lightboxImages.length > 1) {
    lightboxImages.splice(lightboxIndex, 1);
    showLightboxImage(Math.min(lightboxIndex, lightboxImages.length - 1));
    return;
  }
  if (els.imageLightboxImage?.src !== DEFAULT_PRODUCT_IMAGE) {
    els.imageLightboxImage.src = DEFAULT_PRODUCT_IMAGE;
  }
}

function closeImageLightbox(options = {}) {
  els.imageLightbox?.classList.add("hidden");
  els.imageLightbox?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  lightboxImages = [];
  lightboxIndex = 0;
  lightboxTitle = "";
  lightboxDescription = "";
  if (imageLightboxHistoryActive) {
    imageLightboxHistoryActive = false;
    if (!options.fromHistory && window.history?.state?.modal === "imageLightbox") {
      imageLightboxClosingByCode = true;
      window.history.back();
    }
  }
}

function pushImageLightboxHistoryState() {
  if (!appHistoryReady || !window.history?.pushState) return;
  if (imageLightboxHistoryActive || window.history.state?.modal === "imageLightbox") return;
  imageLightboxHistoryActive = true;
  window.history.pushState({ ...makeAppHistoryState(currentView), modal: "imageLightbox" }, "", getCurrentHistoryUrl());
}
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
function updateBudget(id, changes) {
  const order = orders.find((item) => item.id === id);
  if (!order) return;
  if (!canEditOrder(order)) return;
  openOrderId = id;
  Object.assign(order, changes);
  recalculateBudget(order);
  order.updatedAt = new Date().toISOString();
  syncClientsFromOrders();
  saveOrders();
  renderAll();
  showToast("Presupuesto actualizado");
}

function updateRecordStatus(id, status) {
  const order = orders.find((item) => item.id === id);
  if (!order || !statuses.includes(status)) return;
  const currentStatus = normalizeConsultationStatus(order.status);
  if (currentStatus === "Pagado") return;
  if (status === "Pagado" && !order.stockApplied) {
    markOrderPaidAndDiscountStock(id, "Pagado");
    return;
  }
  if (status === "En revisión" && order.stockApplied) {
    showToast("La consulta ya está pagada y el stock descontado");
    renderOrders();
    return;
  }
  order.status = status;
  if (currentStatus !== status) order.updatedAt = new Date().toISOString();
  syncClientsFromOrders();
  saveOrders();
  saveClients();
  renderAll();
  showToast("Estado actualizado");
}
function buildInternalOrderFromConsultation(id) {
  if (!hasPermission("orders")) return;
  const consultation = orders.find((item) => item.id === id);
  if (!consultation) return;
  openOrderDetail(consultation.id);
}

function getBudgetTransportValue(orderId) {
  const input = els.ordersList.querySelector(`[data-budget-transport="${CSS.escape(orderId)}"]`);
  return input?.value.trim() || "";
}

function getBudgetDeliveryNotesValue(orderId) {
  const input = els.ordersList.querySelector(`[data-budget-delivery-notes="${CSS.escape(orderId)}"]`);
  return input?.value.trim() || "";
}

function getBudgetShippingValue(orderId) {
  const input = els.ordersList.querySelector(`[data-budget-shipping-cost="${CSS.escape(orderId)}"]`);
  return Math.max(0, Number(input?.value) || 0);
}

function shouldChargeShipping(order) {
  return false;
}

function getNormalizedDeliveryType(deliveryType) {
  if (deliveryType === "Transporte" || deliveryType === "Envío") return "Transporte";
  if (deliveryType === "A coordinar" || deliveryType === "Comisionista") return "A coordinar";
  return "Retira en local";
}

function updateBudgetDiscountDraft(orderId, value) {
  const order = orders.find((item) => item.id === orderId);
  if (!order || !canEditOrder(order)) return;
  order.discountValue = Math.max(0, Number(value) || 0);
  const totals = calculateBudgetTotals(order);
  order.subtotal = totals.subtotal;
  order.discountAmount = totals.discountAmount;
  order.shippingCost = totals.shippingCost;
  order.total = totals.total;
  order.profit = totals.profit;
  updateBudgetTotalDisplay(order);
}

function updateBudgetShippingDraft(orderId, value) {
  const order = orders.find((item) => item.id === orderId);
  if (!order || !canEditOrder(order)) return;
  order.shippingCost = Math.max(0, Number(value) || 0);
  const totals = calculateBudgetTotals(order);
  order.subtotal = totals.subtotal;
  order.discountAmount = totals.discountAmount;
  order.shippingCost = totals.shippingCost;
  order.total = totals.total;
  order.profit = totals.profit;
  updateBudgetTotalDisplay(order);
}

function commitBudgetShipping(orderId, value) {
  const order = orders.find((item) => item.id === orderId);
  if (!order || !canEditOrder(order)) return;
  openOrderId = orderId;
  order.shippingCost = Math.max(0, Number(value) || 0);
  recalculateBudget(order);
  saveOrders();
  updateBudgetTotalDisplay(order);
  showToast("Costo de envío actualizado");
}

function commitBudgetDiscount(orderId, value) {
  const order = orders.find((item) => item.id === orderId);
  if (!order || !canEditOrder(order)) return;
  openOrderId = orderId;
  order.discountValue = Math.max(0, Number(value) || 0);
  recalculateBudget(order);
  saveOrders();
  updateBudgetTotalDisplay(order);
  showToast("Descuento actualizado");
}

function updateBudgetDiscountType(orderId, type) {
  const order = orders.find((item) => item.id === orderId);
  if (!order || !canEditOrder(order)) return;
  openOrderId = orderId;
  order.discountType = type === "percent" ? "percent" : "fixed";
  recalculateBudget(order);
  saveOrders();
  updateBudgetTotalDisplay(order);
  showToast("Tipo de descuento actualizado");
}

function updateBudgetTotalDisplay(order) {
  const subtotal = els.ordersList.querySelector(`[data-budget-subtotal="${CSS.escape(order.id)}"]`);
  const discount = els.ordersList.querySelector(`[data-budget-discount="${CSS.escape(order.id)}"]`);
  const shipping = els.ordersList.querySelector(`[data-budget-shipping="${CSS.escape(order.id)}"]`);
  const total = els.ordersList.querySelector(`[data-budget-total="${CSS.escape(order.id)}"]`);
  const cardTotal = els.ordersList.querySelector(`[data-order-card-total="${CSS.escape(order.id)}"]`);
  if (subtotal) subtotal.textContent = formatMoney(order.subtotal || 0);
  if (discount) discount.textContent = formatDiscountSummary(order);
  if (shipping) shipping.textContent = formatMoney(order.shippingCost || 0);
  if (total) total.textContent = formatMoney(order.total || 0);
  if (cardTotal) cardTotal.textContent = formatMoney(order.total || 0);

  if (previewOrderId === order.id) {
    const preview = els.ordersList.querySelector(`[data-budget-preview-text="${CSS.escape(order.id)}"]`);
    if (preview) preview.value = buildBudgetMessage(order);
  }
}

function renderBudgetProductMatches(orderId, query) {
  const container = els.ordersList.querySelector(`[data-budget-search-results="${CSS.escape(orderId)}"]`);
  if (!container) return;
  const terms = normalizeProductSearchText(query).split(" ").filter(Boolean);
  if (!terms.length) {
    container.innerHTML = "";
    return;
  }
  const matches = getOrderedProducts()
    .filter((product) => product.active !== false)
    .filter((product) => {
      const haystack = normalizeProductSearchText([
        product.name,
        product.baseName,
        product.optionName,
        product.brand,
        product.category,
        product.presentation,
        getProductPresentation(product)
      ].filter(Boolean).join(" "));
      return terms.every((term) => haystack.includes(term));
    });

  if (!matches.length) {
    container.innerHTML = `<div class="search-empty">Sin coincidencias</div>`;
    return;
  }

  container.innerHTML = matches.map((product) => `
    <div class="budget-search-result budget-search-result-with-quantity" data-budget-search-result="${product.id}">
      <div class="budget-search-result-info">
        <strong>${escapeHtml(getProductArticleName(product))}</strong>
        <span>${escapeHtml(product.category)} · ${formatMoney(product.price)}</span>
      </div>
      <div class="budget-search-result-actions">
        <label class="budget-search-quantity-label">
          Cantidad
          <span class="budget-search-quantity-stepper">
            <button class="quantity-stepper-button" type="button" data-budget-search-decrease="${product.id}" aria-label="Restar cantidad">−</button>
            <input type="number" min="1" step="1" value="1" inputmode="numeric" data-budget-search-quantity="${product.id}" aria-label="Cantidad de ${escapeHtml(getProductArticleName(product))}">
            <button class="quantity-stepper-button" type="button" data-budget-search-increase="${product.id}" aria-label="Sumar cantidad">+</button>
          </span>
        </label>
        <button class="primary-button small-button budget-search-add-button" type="button" data-budget-pick-product="${product.id}">Agregar</button>
      </div>
    </div>
  `).join("");
}

function normalizeProductSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getStatusKey(status) {
  return normalizeProductSearchText(status || "consulta recibida").replace(/\s+/g, "-");
}

function showBudgetPreview(id, mode = "view") {
  const order = orders.find((item) => item.id === id);
  if (!order) return;
  openOrderId = id;
  previewOrderId = id;
  previewMode = mode;
  pushBudgetPreviewHistoryState();
  renderOrders();
}

function closeBudgetPreview(orderId = previewOrderId, options = {}) {
  if (openOrderId !== orderId) openOrderId = orderId;
  if (previewOrderId === orderId) previewOrderId = "";
  if (budgetPreviewHistoryActive) {
    budgetPreviewHistoryActive = false;
    if (!options.fromHistory && window.history?.state?.modal === "budgetPreview") {
      budgetPreviewClosingByCode = true;
      window.history.back();
      return;
    }
  }
  renderOrders();
}

function pushBudgetPreviewHistoryState() {
  if (!appHistoryReady || !window.history?.pushState) return;
  if (budgetPreviewHistoryActive || window.history.state?.modal === "budgetPreview") return;
  budgetPreviewHistoryActive = true;
  window.history.pushState({ ...makeAppHistoryState(currentView), modal: "budgetPreview" }, "", getCurrentHistoryUrl());
}

function renderBudgetPreview(order) {
  return `
    <div class="budget-preview-modal" role="dialog" aria-modal="true" aria-label="Vista previa de WhatsApp" data-budget-preview-overlay>
      <section class="budget-preview-dialog">
        <div class="budget-preview-head">
          <div>
            <strong>Vista previa de WhatsApp</strong>
            <span>Revisá el mensaje antes de enviar.</span>
          </div>
          <button class="icon-button" type="button" data-close-preview="${order.id}" aria-label="Cerrar vista previa">×</button>
        </div>
        <label class="budget-preview-editor">
          Editar mensaje
          <textarea rows="12" data-budget-preview-text="${order.id}">${escapeHtml(buildBudgetMessage(order))}</textarea>
        </label>
        <div class="order-actions budget-preview-actions">
          <button class="primary-button small-button" type="button" data-send-preview-budget="${order.id}">Enviar por WhatsApp</button>
          <button class="secondary-button small-button" type="button" data-send-preview-pdf="${order.id}">Enviar PDF por WhatsApp</button>
          <button class="secondary-button small-button" type="button" data-close-preview="${order.id}">Cerrar</button>
        </div>
      </section>
    </div>
  `;
}
function markOrderPaidAndDiscountStock(id, nextStatus = "Pagado") {
  if (!hasPermission("orders")) return;
  const order = orders.find((item) => item.id === id);
  if (!order) return;
  if (order.stockApplied) {
    order.status = "Pagado";
    saveOrders();
    showToast("El stock de esta consulta ya fue descontado");
    renderAll();
    return;
  }
  order.status = "Pagado";
  order.paidAt = order.paidAt || new Date().toISOString();
  order.updatedAt = new Date().toISOString();
  recalculateBudget(order);
  applyBudgetStock(order, -1);
  order.stockApplied = true;
  recordClientPurchase(order);
  saveProducts();
  saveOrders();
  saveClients();
  saveStockHistory();
  renderAll();
  showToast("Consulta pagada, stock descontado y venta registrada");
}

function sendBudgetByWhatsapp(id) {
  const order = orders.find((item) => item.id === id);
  if (!order || order.stockApplied) return;
  const url = buildCustomerWhatsappUrl(order);
  if (!order.customerPhone || url === "#") {
    showToast("La consulta no tiene teléfono de cliente");
    return;
  }
  const opened = window.open(url, "_blank", "noreferrer");
  if (!opened) {
    showToast("No se pudo abrir WhatsApp");
    return;
  }
  if (normalizeConsultationStatus(order.status) !== "Pagado") order.status = "En revisión";
  order.updatedAt = new Date().toISOString();
  recalculateBudget(order);
  previewOrderId = "";
  saveOrders();
  renderAll();
  showToast("Mensaje enviado por WhatsApp");
}

function viewOrderDocument(id) {
  const order = orders.find((item) => item.id === id);
  if (!order) return;
  recalculateBudget(order);
  currentPrintOrderId = id;
  currentPrintDocument = buildOrderPrintDocument(order);
  const documentTitle = getOrderDocumentTitle(order);
  openPrintWindow(buildOrderDocumentHtml(order), "pedido", buildPdfFilename(documentTitle, order));
}

function buildOrderPrintDocument(order) {
  const items = order.items.map((item) => ({
    quantity: Math.max(1, Number(item.quantity) || 1),
    quantityLabel: formatDocumentQuantity(item),
    product: getDocumentItemName(item),
    price: Math.max(0, Number(item.price) || 0),
    subtotal: Math.max(0, Number(item.quantity) || 0) * Math.max(0, Number(item.price) || 0)
  }));
  return {
    title: getOrderDocumentTitle(order),
    record: formatRecordNumber(order),
    date: formatDocumentDateTime(order.createdAt),
    customer: getOrderCustomerName(order),
    phone: order.customerPhone || "Sin teléfono",
    location: order.customerLocation || "Sin localidad",
    subtotal: order.subtotal || 0,
    discount: formatDiscountSummary(order),
    total: order.total || 0,
    items
  };
}

function buildOrderDocumentHtml(order) {
  const document = buildOrderPrintDocument(order);
  const rows = document.items.map((item) => `
    <tr>
      <td class="doc-qty">${escapeHtml(item.quantityLabel)}</td>
      <td class="doc-product">${escapeHtml(item.product)}</td>
      <td class="doc-money">${formatMoney(item.price)}</td>
      <td class="doc-money">${formatMoney(item.subtotal)}</td>
    </tr>
  `).join("");
  return `
    <html>
      <head>
        <title>${escapeHtml(document.record)}</title>
        ${getPrintStyles()}
      </head>
      <body>
        <div class="document-shell compact-document-shell">
          <header class="compact-document-header">
            <div class="document-logo compact-document-logo">GB<br><span>Mayorista</span></div>
            <div class="compact-document-title">
              <h1>${escapeHtml(document.title)}</h1>
              <p>${escapeHtml(document.record)} | ${escapeHtml(document.date)} | ${escapeHtml(document.customer)} | ${escapeHtml(document.phone)} | ${escapeHtml(document.location)}</p>
            </div>
          </header>
          <table class="compact-document-table">
            <thead>
              <tr>
                <th>Cantidad</th>
                <th>Producto</th>
                <th>Precio unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <section class="compact-document-totals">
            <div><span>Subtotal</span><strong>${formatMoney(document.subtotal)}</strong></div>
            <div><span>Descuento</span><strong>${escapeHtml(document.discount)}</strong></div>
            <div class="compact-document-final"><span>Total final</span><strong>${formatMoney(document.total)}</strong></div>
          </section>
        </div>
      </body>
    </html>
  `;
}

function getDocumentItemName(item) {
  const base = String(item.baseName || item.productName || item.name || "Producto").trim().replace(/\s+/g, " ");
  const option = String(item.optionName || item.variant || item.option || "").trim().replace(/\s+/g, " ");
  if (!option) return base;
  const normalizedBase = normalizeProductSearchText(base);
  const normalizedOption = normalizeProductSearchText(option);
  return normalizedBase.includes(normalizedOption) ? base : `${base} ${option}`;
}

function formatDocumentQuantity(item) {
  const quantity = Math.max(1, Number(item.quantity) || 1);
  const presentation = String(getBudgetItemPresentation(item) || "Unidad").trim();
  const unit = getDocumentPresentationAbbreviation(presentation);
  return `${quantity} ${unit}`.trim();
}

function getDocumentPresentationAbbreviation(presentation) {
  const value = String(presentation || "").trim();
  if (/docenas?/i.test(value)) return "doc.";
  if (/unidad(es)?/i.test(value)) return "un.";
  return value || "un.";
}

function formatDocumentDateTime(value) {
  const date = value ? new Date(value) : new Date();
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function getOrderDocumentTitle(order) {
  return "Consulta";
}

function printOrder(id) {
  viewOrderDocument(id);
}

function printReceipt(id) {
  viewOrderDocument(id);
}

function openPrintWindow(html, type = "recibo", filename = "") {
  const didRender = renderInlinePrintPreview(html, type, filename);
  showToast(didRender ? "Vista imprimible lista" : "No se pudo preparar la impresión");
}

function renderInlinePrintPreview(html, type = "recibo", filename = "") {
  if (!els.printPreviewOverlay || !els.printPreviewBody) return false;
  clearPdfDownloadLink();
  currentPrintHtml = html;
  currentPrintType = type;
  currentPrintFilename = filename;
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  els.printPreviewTitle.textContent = titleMatch ? decodeHtml(titleMatch[1]) : "Vista imprimible";
  els.printPreviewBody.innerHTML = extractPrintableBody(html);
  preparePdfDownload(type);
  els.printPreviewOverlay.classList.remove("hidden");
  els.printPreviewOverlay.setAttribute("aria-hidden", "false");
  pushPrintPreviewHistoryState();
  return true;
}

function closeInlinePrintPreview(options = {}) {
  if (!els.printPreviewOverlay || !els.printPreviewBody) return;
  els.printPreviewOverlay.classList.add("hidden");
  els.printPreviewOverlay.setAttribute("aria-hidden", "true");
  els.printPreviewBody.innerHTML = "";
  clearPdfDownloadLink();
  currentPrintHtml = "";
  currentPrintType = "";
  currentPrintFilename = "";
  currentPrintDocument = null;
  currentPrintOrderId = "";
  if (printPreviewHistoryActive) {
    printPreviewHistoryActive = false;
    if (!options.fromHistory && window.history?.state?.modal === "printPreview") {
      printPreviewClosingByCode = true;
      window.history.back();
    }
  }
}

function pushPrintPreviewHistoryState() {
  if (!appHistoryReady || !window.history?.pushState) return;
  if (printPreviewHistoryActive || window.history.state?.modal === "printPreview") return;
  printPreviewHistoryActive = true;
  window.history.pushState({ ...makeAppHistoryState(currentView), modal: "printPreview" }, "", getCurrentHistoryUrl());
}

function printModalContent(type) {
  if (!els.printPreviewBody || !els.printPreviewBody.innerHTML.trim()) {
    showToast("No hay contenido para imprimir");
    return;
  }

  try {
    window.print();
    showToast("Abriendo impresión");
  } catch (error) {
    showToast("No se pudo abrir la impresión");
  }
}

window.printModalContent = printModalContent;

function preparePdfDownload(type) {
  if (!els.printPreviewBody || !els.printPreviewBody.innerText.trim()) {
    clearPdfDownloadLink();
    return false;
  }

  try {
    const title = els.printPreviewTitle?.textContent.trim() || (type === "pedido" ? "Consulta" : "Documento");
    const pdf = currentPrintDocument
      ? createOrderDocumentPdf(currentPrintDocument)
      : createSimplePdf(getPrintablePdfLines(els.printPreviewBody), title);
    currentPdfBlob = new Blob([pdf], { type: "application/pdf" });
    clearPdfDownloadLink({ keepBlob: true });
    currentPdfUrl = URL.createObjectURL(currentPdfBlob);
    currentPdfFilename = currentPrintFilename || `${slugifyFilename(title)}.pdf`;
    updateTopPdfLink(currentPdfUrl, currentPdfFilename);
    showPdfDownloadLink(currentPdfUrl, currentPdfFilename);
    return true;
  } catch (error) {
    clearPdfDownloadLink();
    return false;
  }
}

async function shareCurrentPdf() {
  if (!currentPdfBlob || !currentPdfFilename) {
    showToast("No se pudo preparar el PDF");
    return;
  }
  const order = currentPrintOrderId ? orders.find((item) => item.id === currentPrintOrderId) : null;
  const phone = normalizeArgentinaWhatsappNumber(order?.customerPhone || "");
  if (phone) {
    const opened = window.open("https://wa.me/" + phone, "_blank", "noreferrer");
    if (!opened) {
      showToast("No se pudo abrir WhatsApp");
      return;
    }
    showToast("WhatsApp del cliente abierto. PDF listo para adjuntar.", "success");
    return;
  }
  showToast("La consulta no tiene teléfono cargado.");
  const file = new File([currentPdfBlob], currentPdfFilename, { type: "application/pdf" });
  if (navigator.canShare?.({ files: [file] }) && navigator.share) {
    try {
      await navigator.share({ files: [file], title: "Consulta GB Mayorista", text: "Consulta GB Mayorista" });
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }
  showToast("Descargá el PDF y adjuntalo por WhatsApp.");
}

function showPdfDownloadLink(url, filename) {
  if (!els.pdfDownloadSlot) return;
  els.pdfDownloadSlot.innerHTML = "";
  els.pdfDownloadSlot.classList.add("hidden");
}

function updateTopPdfLink(url, filename) {
  if (!els.printPreviewPdf) return;
  els.printPreviewPdf.setAttribute("href", url);
  els.printPreviewPdf.setAttribute("download", filename);
  els.printPreviewPdf.classList.remove("disabled");
}


function clearPdfDownloadLink(options = {}) {
  if (currentPdfUrl) URL.revokeObjectURL(currentPdfUrl);
  currentPdfUrl = "";
  if (!options.keepBlob) {
    currentPdfBlob = null;
    currentPdfFilename = "";
  }
  if (els.printPreviewPdf) {
    els.printPreviewPdf.setAttribute("href", "#");
    els.printPreviewPdf.removeAttribute("download");
    els.printPreviewPdf.classList.add("disabled");
  }
  if (!els.pdfDownloadSlot) return;
  els.pdfDownloadSlot.innerHTML = "";
  els.pdfDownloadSlot.classList.add("hidden");
}

function getPrintablePdfLines(container) {
  const lines = [];
  const pushLine = (value = "") => {
    const text = String(value).replace(/\s+/g, " ").trim();
    if (text) lines.push(text);
  };

  container.querySelectorAll("h1, h2, p, tr, .total").forEach((node) => {
    if (node.matches("tr")) {
      const cells = Array.from(node.children).map((cell) => cell.textContent.trim()).filter(Boolean);
      pushLine(cells.join("  |  "));
      return;
    }
    pushLine(node.textContent);
  });

  return lines.length ? lines : container.innerText.split("\n").map((line) => line.trim()).filter(Boolean);
}

function createOrderDocumentPdf(document) {
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 30;
  const bottom = 34;
  const fontId = 1;
  const boldFontId = 2;
  const pages = [];
  let commands = [];
  let y = pageHeight - margin;

  const addText = (text, x, textY, size = 9, bold = false) => {
    commands.push(`BT /F${bold ? boldFontId : fontId} ${size} Tf ${x} ${textY} Td ${pdfHexString(text)} Tj ET`);
  };
  const addLine = (x1, y1, x2, y2, width = 0.7) => {
    commands.push(`${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
  };
  const renderPdfTableHeader = () => {
    addText("Cantidad", margin, y, 8, true);
    addText("Producto", margin + 72, y, 8, true);
    addText("Precio unit.", pageWidth - 190, y, 8, true);
    addText("Subtotal", pageWidth - 98, y, 8, true);
    y -= 8;
    addLine(margin, y, pageWidth - margin, y, 0.5);
    y -= 13;
  };
  const renderPdfHeader = (firstPage = true) => {
    addText("GB MAYORISTA", margin, y, 13, true);
    addText(firstPage ? document.title : `${document.title} - continuación`, pageWidth - 150, y, 12, true);
    y -= 16;
    addText(truncatePdfText(`${document.record} | ${document.date} | ${document.customer} | ${document.phone} | ${document.location}`, 105), margin, y, 9, false);
    y -= 10;
    addLine(margin, y, pageWidth - margin, y, 1);
    y -= 16;
    renderPdfTableHeader();
  };
  const newPage = () => {
    pages.push(commands);
    commands = [];
    y = pageHeight - margin;
    renderPdfHeader(false);
  };

  renderPdfHeader(true);
  document.items.forEach((item) => {
    if (y < bottom + 92) newPage();
    addText(truncatePdfText(item.quantityLabel, 13), margin, y, 8.4, false);
    addText(truncatePdfText(item.product, 55), margin + 72, y, 8.4, false);
    addText(formatMoney(item.price), pageWidth - 190, y, 8.4, false);
    addText(formatMoney(item.subtotal), pageWidth - 98, y, 8.4, true);
    y -= 15;
  });

  if (y < bottom + 72) newPage();
  y -= 4;
  addLine(pageWidth - 230, y, pageWidth - margin, y, 0.8);
  y -= 16;
  addText("Subtotal", pageWidth - 230, y, 9, false);
  addText(formatMoney(document.subtotal), pageWidth - 100, y, 9, true);
  y -= 15;
  addText("Descuento", pageWidth - 230, y, 9, false);
  addText(document.discount, pageWidth - 100, y, 9, true);
  y -= 19;
  addText("TOTAL FINAL", pageWidth - 230, y, 11, true);
  addText(formatMoney(document.total), pageWidth - 100, y, 12, true);
  pages.push(commands);

  return buildPdfFromPages(pages, pageWidth, pageHeight);
}

function truncatePdfText(value, maxChars) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(0, maxChars - 1)).trim()}...`;
}

function buildPdfFromPages(pageCommands, pageWidth, pageHeight) {
  const objects = [];
  const addObject = (body) => {
    objects.push(body);
    return objects.length;
  };
  const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const boldFontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const pageObjectIds = [];

  pageCommands.forEach((commands) => {
    const stream = commands.join("\n");
    const contentId = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const pageId = addObject(`<< /Type /Page /Parent 0 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageObjectIds.push(pageId);
  });

  const pagesId = addObject(`<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`);
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  pageObjectIds.forEach((id) => {
    objects[id - 1] = objects[id - 1].replace("/Parent 0 0 R", `/Parent ${pagesId} 0 R`);
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return pdf;
}

function createSimplePdf(lines, title) {
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 46;
  const lineHeight = 15;
  const maxChars = 86;
  const wrappedLines = lines.flatMap((line) => wrapPdfLine(line, maxChars));
  const pages = [];
  let currentPage = [];
  let y = pageHeight - margin;

  wrappedLines.forEach((line) => {
    if (y < margin) {
      pages.push(currentPage);
      currentPage = [];
      y = pageHeight - margin;
    }
    currentPage.push({ text: line, y });
    y -= lineHeight;
  });

  if (currentPage.length) pages.push(currentPage);
  if (!pages.length) pages.push([{ text: title, y: pageHeight - margin }]);

  const pageCommands = pages.map((pageLines) => pageLines.map(({ text, y: lineY }, index) => {
    const size = index === 0 && pageLines[0].text === lines[0] ? 16 : 11;
    return `BT /F1 ${size} Tf ${margin} ${lineY} Td ${pdfHexString(text)} Tj ET`;
  }));
  return buildPdfFromPages(pageCommands, pageWidth, pageHeight);
}

function wrapPdfLine(line, maxChars) {
  const words = String(line).split(" ");
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) lines.push(current);
  return lines;
}

function pdfHexString(text) {
  const normalized = normalizePdfText(text);
  let hex = "";
  for (const char of normalized) {
    const byte = getWinAnsiByte(char);
    if (byte === null) continue;
    hex += byte.toString(16).toUpperCase().padStart(2, "0");
  }
  return `<${hex}>`;
}

function normalizePdfText(value) {
  return String(value ?? "")
    .replace(/\uFEFF/g, "")
    .replace(/þÿ/g, "")
    .replace(/�/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[^\S\r\n]+/g, " ")
    .normalize("NFC");
}

function getWinAnsiByte(char) {
  const code = char.codePointAt(0);
  if (code <= 0x7f) return code;
  if (code >= 0xa0 && code <= 0xff) return code;
  const winAnsi = {
    0x20ac: 0x80,
    0x201a: 0x82,
    0x0192: 0x83,
    0x201e: 0x84,
    0x2026: 0x85,
    0x2020: 0x86,
    0x2021: 0x87,
    0x02c6: 0x88,
    0x2030: 0x89,
    0x0160: 0x8a,
    0x2039: 0x8b,
    0x0152: 0x8c,
    0x017d: 0x8e,
    0x2018: 0x91,
    0x2019: 0x92,
    0x201c: 0x93,
    0x201d: 0x94,
    0x2022: 0x95,
    0x2013: 0x96,
    0x2014: 0x97,
    0x02dc: 0x98,
    0x2122: 0x99,
    0x0161: 0x9a,
    0x203a: 0x9b,
    0x0153: 0x9c,
    0x017e: 0x9e,
    0x0178: 0x9f
  };
  return winAnsi[code] ?? 0x3f;
}

function buildPdfFilename(prefix, order) {
  const number = String(Math.max(1, Number(order?.number) || 1)).padStart(4, "0");
  return `${prefix}-Consulta-${number}.pdf`;
}

function slugifyFilename(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "gb-mayorista";
}

function extractPrintableBody(html) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1] : html;
}

function decodeHtml(value) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

function getPrintStyles() {
  return `
    <style>
      body { font-family: Arial, sans-serif; padding: 18px; color: #111; background: #f6f6f2; }
      .document-shell { max-width: 920px; margin: 0 auto; background: #fff; border: 1px solid #d8d8d0; border-radius: 8px; padding: 18px; }
      .compact-document-header { display: flex; align-items: center; gap: 12px; padding-bottom: 10px; border-bottom: 2px solid #111; }
      .compact-document-logo { width: 48px; height: 48px; border-radius: 7px; background: #111; color: #ffd21f; display: grid; place-items: center; text-align: center; font-size: 19px; font-weight: 900; line-height: 1; flex: 0 0 auto; }
      .compact-document-logo span { font-size: 9px; color: #fff; }
      .compact-document-title { min-width: 0; }
      h1 { margin: 0 0 4px; font-size: 20px; text-transform: uppercase; }
      p { margin: 0; font-size: 12px; color: #333; font-weight: 700; line-height: 1.35; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; table-layout: fixed; }
      th, td { border-bottom: 1px solid #deded8; padding: 5px 6px; text-align: left; font-size: 11.5px; vertical-align: top; }
      th { background: #fff1a6; color: #111; font-size: 10px; text-transform: uppercase; }
      .doc-qty { width: 70px; white-space: nowrap; }
      .doc-product { width: auto; line-height: 1.25; word-break: normal; overflow-wrap: anywhere; }
      .doc-money { width: 92px; text-align: right; white-space: nowrap; }
      .compact-document-totals { width: min(300px, 100%); margin: 14px 0 0 auto; display: grid; gap: 3px; }
      .compact-document-totals div { display: flex; justify-content: space-between; gap: 16px; padding: 4px 0; border-bottom: 1px solid #e4e4dc; font-size: 12px; }
      .compact-document-totals span { color: #333; font-weight: 800; }
      .compact-document-final { border: 2px solid #111 !important; border-radius: 6px; padding: 7px 9px !important; background: #ffd21f; align-items: center; }
      .compact-document-final span { color: #111; text-transform: uppercase; }
      .compact-document-final strong { color: #b00000; font-size: 18px; }
      @media (max-width: 640px) { body { padding: 8px; } .document-shell { padding: 10px; } .compact-document-header { align-items: flex-start; } h1 { font-size: 17px; } p { font-size: 10.5px; } th, td { padding: 4px; font-size: 10px; } .doc-qty { width: 48px; } .doc-money { width: 70px; } }
      @media print { body { background: #fff; padding: 0; } .document-shell { border: 0; padding: 0; max-width: none; } th { background: #f2f2f2 !important; } .compact-document-final { background: #f3f3f3 !important; } }
    </style>
  `;
}
function cancelOrder(id) {
  if (!hasPermission("orders")) return;
  const order = orders.find((item) => item.id === id);
  if (!order) return;
  if (!canEditOrder(order)) return;
  order.status = "Cancelado";
  order.updatedAt = new Date().toISOString();
  if (previewOrderId === id) previewOrderId = "";
  saveOrders();
  renderAll();
  showToast("Consulta cancelada");
}

function updateBudgetItemQty(orderId, productId, quantity) {
  const order = orders.find((item) => item.id === orderId);
  const item = order?.items.find((entry) => entry.id === productId);
  if (!order || !item) return;
  if (!canEditOrder(order)) return;
  openOrderId = orderId;
  restoreConfirmedStock(order);
  item.quantity = Math.max(1, Math.round(quantity || 1));
  recalculateBudget(order);
  reapplyConfirmedStock(order);
  saveProducts();
  saveOrders();
  renderAll();
  showToast("Cantidad actualizada");
}

function updateBudgetItemVariant(orderId, productId, variant) {
  const order = orders.find((item) => item.id === orderId);
  const item = order?.items.find((entry) => entry.id === productId);
  if (!order || !item) return;
  if (!canEditOrder(order)) return;
  item.variant = variant;
  order.updatedAt = new Date().toISOString();
  saveOrders();
  renderAll();
  showToast("Variante actualizada");
}

function changeBudgetItemProduct(orderId, oldProductId, newProductId) {
  const order = orders.find((item) => item.id === orderId);
  const item = order?.items.find((entry) => entry.id === oldProductId);
  const product = products.find((entry) => entry.id === newProductId);
  if (!order || !item || !product) return;
  if (!canEditOrder(order)) return;
  openOrderId = orderId;
  item.id = product.id;
  item.name = getProductBaseName(product);
  item.brand = product.brand;
  item.price = product.price;
  item.saleType = product.saleType;
  item.packQuantity = product.packQuantity;
  item.cost = product.cost || 0;
  item.variant = getProductOptionName(product);
  recalculateBudget(order);
  saveOrders();
  renderAll();
  showToast("Artículo actualizado");
}

function updateBudgetItemPrice(orderId, productId, price) {
  const order = orders.find((item) => item.id === orderId);
  const item = order?.items.find((entry) => entry.id === productId);
  if (!order || !item) return;
  if (!canEditOrder(order)) return;
  openOrderId = orderId;
  item.price = Math.max(1, Math.round(price || item.price || 1));
  recalculateBudget(order);
  saveOrders();
  renderAll();
  showToast("Precio actualizado");
}

function updateBudgetItemPresentation(orderId, productId, presentation) {
  const order = orders.find((item) => item.id === orderId);
  const item = order?.items.find((entry) => entry.id === productId);
  if (!order || !item) return;
  if (!canEditOrder(order)) return;
  const cleanPresentation = String(presentation || "").trim();
  if (!cleanPresentation) {
    renderAll();
    showToast("La presentación no puede quedar vacía");
    return;
  }
  openOrderId = orderId;
  item.presentation = cleanPresentation;
  item.saleType = getSaleTypeFromPresentation(cleanPresentation);
  item.packQuantity = getPackQuantityFromPresentation(cleanPresentation);
  order.updatedAt = new Date().toISOString();
  saveOrders();
  renderAll();
  showToast("Presentación actualizada");
}

function editBudgetItem(orderId, productId) {
  showToast("Eliminá el producto y agregá el correcto desde Agregar producto");
}

function findInternalProductBySearch(value) {
  const terms = normalizeProductSearchText(value).split(" ").filter(Boolean);
  if (!terms.length) return null;
  return getOrderedProducts().find((product) => {
    const haystack = normalizeProductSearchText([
      getProductBaseName(product),
      getProductOptionName(product),
      product.category,
      getProductPresentation(product)
    ].filter(Boolean).join(" "));
    return terms.every((term) => haystack.includes(term));
  }) || null;
}

function getCatalogVariantLabelFromProductName(name) {
  const parts = getCatalogProductParts(getProductDisplayName({ name }));
  return parts ? getCatalogVariantLabel(parts.variantRaw) : "";
}

function addBudgetItem(orderId, productId, quantity) {
  const order = orders.find((item) => item.id === orderId);
  const product = products.find((item) => item.id === productId);
  if (!order || !product) return;
  if (!canEditOrder(order)) return;
  openOrderId = orderId;
  previewOrderId = "";
  restoreConfirmedStock(order);

  const existing = order.items.find((item) => item.id === productId);
  if (existing) existing.quantity += Math.max(1, Math.round(quantity || 1));
  else {
    order.items.push({
      id: product.id,
      name: getProductBaseName(product),
      brand: product.brand,
      price: product.price,
      saleType: product.saleType,
      packQuantity: product.packQuantity,
      cost: product.cost || 0,
      variant: getProductOptionName(product),
      quantity: Math.max(1, Math.round(quantity || 1))
    });
  }

  recalculateBudget(order);
  reapplyConfirmedStock(order);
  saveProducts();
  saveOrders();
  renderAll();
  showToast("Producto agregado al presupuesto");
}

function removeBudgetItem(orderId, productId) {
  const order = orders.find((item) => item.id === orderId);
  if (!order) return;
  if (!canEditOrder(order)) return;
  openOrderId = orderId;
  restoreConfirmedStock(order);
  order.items = order.items.filter((item) => item.id !== productId);
  recalculateBudget(order);
  reapplyConfirmedStock(order);
  saveProducts();
  saveOrders();
  renderAll();
  showToast("Producto quitado del presupuesto");
}

function canEditOrder(order) {
  return hasPermission("orders") && normalizeConsultationStatus(order?.status) !== "Pagado" && order?.status !== "Cancelado" && !order?.stockApplied;
}

function canChangeOrderStatus(order) {
  return hasPermission("orders") && normalizeConsultationStatus(order?.status) !== "Pagado" && order?.status !== "Cancelado" && !order?.stockApplied;
}

function restoreConfirmedStock(order) {
  if (isConfirmed(order.status) && order.stockApplied) {
    applyBudgetStock(order, 1);
    order.stockApplied = false;
  }
}

function reapplyConfirmedStock(order) {
  if (isConfirmed(order.status)) {
    applyBudgetStock(order, -1);
    order.stockApplied = true;
  }
}

function applyBudgetStock(order, direction) {
  order.items.forEach((item) => {
    const product = products.find((entry) => entry.id === item.id);
    if (!product) return;
    const variantName = item.variant || "Base / sin variante";
    const previousStock = getProductStock(product, variantName);
    const delta = direction * item.quantity;
    const nextStock = Math.max(0, previousStock + delta);
    setProductVariantStock(product, variantName, nextStock);
    if (direction < 0) {
      recordStockMovement(product, nextStock - previousStock, previousStock, nextStock, `Pedido ${getOrderCustomerName(order)}`, {
        orderId: order.id,
        variant: variantName
      });
    }
  });
}

function applyPendingPaidStockDiscounts() {
  let changed = false;
  orders.forEach((order) => {
    if (normalizeConsultationStatus(order.status) !== "Pagado" || order.stockApplied) return;
    applyBudgetStock(order, -1);
    order.stockApplied = true;
    order.updatedAt = order.updatedAt || new Date().toISOString();
    changed = true;
  });
  if (!changed) return;
  saveProducts();
  saveOrders();
  saveStockHistory();
}

function buildWhatsappUrl(items, totalPrice, customer, consultationLabel = "") {
  const minimumReached = totalPrice >= WHOLESALE_MINIMUM;
  const cleanConsultationLabel = String(consultationLabel || "").trim();
  const consultationId = cleanConsultationLabel.replace(/^Consulta\s+/i, "");
  const productLines = items.flatMap((item) => {
    const option = shouldShowCartOptionLine(item) ? ` - ${item.variantLabel}` : "";
    const name = `${item.name}${option}`;
    return [
      `• ${formatWhatsappQuantity(item)} - ${name}`,
      `  Subtotal: ${formatCustomerLineSubtotal(item)}`,
      ""
    ];
  });
  const lines = [
    "🛒 PEDIDO GB MAYORISTA",
    "",
    ...(cleanConsultationLabel ? [cleanConsultationLabel, ""] : []),
    `Cliente: ${customer.name}`,
    `Teléfono: ${customer.phone}`,
    `Localidad: ${customer.location}`,
    "",
    "PRODUCTOS",
    "",
    ...productLines,
    "────────────────",
    "",
    "TOTAL DEL PEDIDO",
    formatMoney(totalPrice),
    "",
    minimumReached ? "✅ Compra mínima alcanzada" : "⚠ Compra mínima no alcanzada",
    "",
    "Gracias por elegir GB Mayorista.",
    "Nos comunicaremos a la brevedad.",
    ...(consultationId ? ["", `ID Consulta: ${consultationId}`] : [])
  ];
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}
function buildCustomerWhatsappUrl(order) {
  const phone = normalizeArgentinaWhatsappNumber(order.customerPhone || "");
  if (!phone || phone === "549") return "#";
  return `https://wa.me/${phone}?text=${encodeURIComponent(buildBudgetMessage(order))}`;
}

function buildBudgetMessage(order) {
  const totals = calculateBudgetTotals(order);
  const lines = [
    "GB Mayorista",
    "",
    `Cliente: ${getOrderCustomerName(order)}`,
    "",
    ...order.items.map((item) => {
      const label = `${item.name} x${item.quantity}`;
      return `* ${label} ${".".repeat(Math.max(4, 36 - label.length))} ${formatMoney(item.quantity * item.price)}`;
    }),
    "",
    `Subtotal: ${formatMoney(totals.subtotal)}`,
    ...(totals.discountAmount > 0 ? [`Descuento: ${formatMoney(totals.discountAmount)}`] : []),
    ...(shouldChargeShipping(order) ? [`Envío: ${formatMoney(totals.shippingCost)}`] : []),
    `Total: ${formatMoney(totals.total)}`,
    "",
    `Forma de entrega: ${getDeliveryLabel(order)}`,
    ...(getNormalizedDeliveryType(order.deliveryType) === "Transporte" ? [`Transporte: ${order.transport || "Sin definir"}`] : []),
    ...(getNormalizedDeliveryType(order.deliveryType) === "A coordinar" && order.deliveryNotes ? [`Observaciones de entrega: ${order.deliveryNotes}`] : []),
    `Forma de pago: ${order.paymentMethod || "Transferencia"}`
  ];
  return lines.join("\n");
}

function getDeliveryLabel(order) {
  return getNormalizedDeliveryType(order.deliveryType);
}

function normalizeArgentinaWhatsappNumber(number) {
  const digits = String(number).replace(/\D/g, "");
  if (digits.startsWith("549")) return digits;
  if (digits.startsWith("54")) return `549${digits.slice(2)}`;
  return `549${digits}`;
}

function getCustomerData() {
  const name = els.customerName.value.trim();
  const phone = els.customerPhone.value.trim();
  const location = els.customerLocation.value.trim();
  return {
    name,
    phone,
    location,
    isComplete: Boolean(name && phone && location)
  };
}

function normalizeClients(clientList) {
  const byPhone = new Map();
  (Array.isArray(clientList) ? clientList : []).forEach((client) => {
    const phone = normalizeClientPhone(client.phone);
    if (!phone) return;
    byPhone.set(phone, {
      name: client.name || "",
      phone,
      location: client.location || "",
      address: client.address || "",
      notes: client.notes || "",
      createdAt: client.createdAt || client.updatedAt || new Date().toISOString(),
      purchaseCount: Math.max(0, Number(client.purchaseCount) || 0),
      totalPurchased: Math.max(0, Number(client.totalPurchased) || 0),
      lastPurchaseAt: client.lastPurchaseAt || "",
      paidOrderIds: Array.isArray(client.paidOrderIds) ? client.paidOrderIds : [],
      sourceUpdatedAt: client.sourceUpdatedAt || client.updatedAt || "",
      updatedAt: client.updatedAt || new Date().toISOString()
    });
  });
  return [...byPhone.values()];
}

function syncClientsFromOrders() {
  const existingClients = normalizeClients(clients);
  clients = existingClients;
  orders.forEach((order) => {
    upsertClientFromOrder(order);
    if (isInternalOrder(order) && isConfirmed(order.status) && order.stockApplied) recordClientPurchase(order);
  });
  saveClients();
}

function upsertClientFromOrder(order) {
  const name = String(getOrderCustomerName(order) || "").trim();
  const phone = normalizeClientPhone(order.customerPhone);
  const location = String(order.customerLocation || "").trim();
  if (!name || !phone || !location) return null;

  let client = clients.find((item) => item.phone === phone);
  const sourceUpdatedAt = order.updatedAt || order.createdAt || new Date().toISOString();
  const createdAt = order.createdAt || sourceUpdatedAt;
  if (!client) {
    client = {
      name,
      phone,
      location,
      address: "",
      notes: "",
      createdAt,
      purchaseCount: 0,
      totalPurchased: 0,
      lastPurchaseAt: "",
      paidOrderIds: [],
      sourceUpdatedAt,
      updatedAt: new Date().toISOString()
    };
    clients.push(client);
  } else if (new Date(sourceUpdatedAt) >= new Date(client.sourceUpdatedAt || 0)) {
    client.name = name;
    client.location = location;
    client.sourceUpdatedAt = sourceUpdatedAt;
    client.updatedAt = new Date().toISOString();
  }
  return client;
}

function recordClientPurchase(order, options = {}) {
  const client = upsertClientFromOrder(order);
  if (!client) return;
  client.paidOrderIds = Array.isArray(client.paidOrderIds) ? client.paidOrderIds : [];
  if (client.paidOrderIds.includes(order.id)) return;
  if (options.onlyIfMissing && order.clientPurchaseRecorded) return;

  client.purchaseCount = Math.max(0, Number(client.purchaseCount) || 0) + 1;
  client.totalPurchased = Math.max(0, Number(client.totalPurchased) || 0) + Math.max(0, Number(order.total) || 0);
  const purchaseAt = order.paidAt || order.updatedAt || new Date().toISOString();
  if (!client.lastPurchaseAt || new Date(purchaseAt) > new Date(client.lastPurchaseAt)) {
    client.lastPurchaseAt = purchaseAt;
  }
  client.updatedAt = new Date().toISOString();
  client.paidOrderIds.push(order.id);
  order.clientPurchaseRecorded = true;
}

function normalizeClientPhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function getOrderCustomerName(order) {
  return order.customerName || order.customer || "Cliente WhatsApp";
}

function formatOrderItemMeta(item) {
  const sale = item.saleType === "pack" ? `Pack x${item.packQuantity}` : "Unidad";
  return item.variant ? `${sale} · ${item.variant}` : sale;
}

function getBudgetItemPresentation(item) {
  const product = products.find((entry) => entry.id === item.id);
  return item.presentation
    || product?.presentation
    || getProductPresentation({ ...item, name: item.name || "", presentation: item.presentation || "" });
}

function formatCartItemQuantity(item) {
  return formatCleanQuantity(item);
}

function formatCartQuantity(item) {
  return String(Math.max(1, Number(item?.quantity) || 1));
}

function formatCartPresentation(item) {
  const value = String(item?.presentation || "").trim();
  if (/docenas?/i.test(value)) return "Docena";
  if (/unidades?/i.test(value)) return "Unidad";
  if (item?.saleType === "pack") return "Docena";
  return value || "Unidad";
}

function renderCartVariantLine(item) {
  const label = String(item?.variantLabel || "").trim();
  if (!shouldShowCartOptionLine(item)) return "";
  return `<span>Talle: ${escapeHtml(label)}</span>`;
}

function shouldShowCartOptionLine(item) {
  const label = String(item?.variantLabel || "").trim();
  if (!label || isPresentationOnlyLabel(label)) return false;
  return !String(item?.name || "").toLowerCase().includes(label.toLowerCase());
}

function isPresentationOnlyLabel(value) {
  const text = String(value || "").trim().toLowerCase();
  return /^(?:\d+\s*)?(docena|docenas|unidad|unidades)$/.test(text)
    || /^pack\s*x\s*\d+$/.test(text);
}

function formatWhatsappQuantity(item) {
  const quantity = Math.max(1, Number(item?.quantity) || 1);
  const presentation = String(item?.presentation || "").trim().toLowerCase();
  if (presentation.includes("docena")) return `${quantity} ${quantity === 1 ? "docena" : "docenas"}`;
  if (presentation.includes("unidad")) return `${quantity} ${quantity === 1 ? "unidad" : "unidades"}`;
  if (presentation.includes("pack")) return `${quantity} ${quantity === 1 ? presentation : presentation.endsWith("s") ? presentation : `${presentation}s`}`;
  return `${quantity} ${quantity === 1 ? "unidad" : "unidades"}`;
}

function formatCartSubtotal(item) {
  const price = Number(item?.price) || 0;
  return price > 0 ? formatMoney(price * Math.max(1, Number(item.quantity) || 1)) : "Sin precio cargado";
}

function formatCleanQuantity(item) {
  const quantity = Math.max(1, Number(item.quantity) || 1);
  if (item.presentation) {
    const presentation = String(item.presentation || "").toLowerCase();
    if (presentation.includes("docena")) return `${quantity} ${quantity === 1 ? "Docena" : "Docenas"}`;
    if (presentation.includes("unidad")) return `${quantity} ${quantity === 1 ? "Unidad" : "Unidades"}`;
    return `${quantity} x ${presentation}`;
  }
  if (item.saleType === "pack") {
    return `${quantity} ${quantity === 1 ? "Docena" : "Docenas"}`;
  }
  return `${quantity} ${quantity === 1 ? "Unidad" : "Unidades"}`;
}

function formatCustomerLineSubtotal(item) {
  const price = Number(item?.price) || 0;
  return price > 0 ? formatMoney(price * Math.max(1, Number(item.quantity) || 1)) : "Sin precio cargado";
}

function setView(view, preserveRole = false, historyOptions = {}) {
  const managementViews = getManagementViews();
  if (!["catalogo", ...managementViews].includes(view)) view = "catalogo";
  let isManagementView = managementViews.includes(view);
  if (isManagementView && !isPrivateManagementRoute()) {
    view = "catalogo";
    isManagementView = false;
  }
  if (isPrivateManagementRoute() && !internalUnlocked) {
    showInternalLogin();
    return;
  }
  if (isManagementView && !internalUnlocked) {
    view = "catalogo";
    isManagementView = false;
  }
  if (view === "reportes" && !hasPermission("reports")) {
    showToast("Reportes disponible solo para Administrador");
    view = currentView && currentView !== "reportes" ? currentView : "admin";
    isManagementView = managementViews.includes(view);
  }
  if (view === "importacion" && !hasPermission("importExport")) {
    showToast("Importación Excel disponible solo para Administrador");
    view = currentView && currentView !== "importacion" ? currentView : "admin";
    isManagementView = managementViews.includes(view);
  }
  if (!preserveRole) {
    currentRole = isPrivateManagementRoute() && internalUnlocked && currentRole !== "client" ? currentRole : "client";
  }
  localStorage.setItem(STORAGE_ROLE, currentRole);
  currentView = view;
  document.body.classList.toggle("private-management-mode", isPrivateManagementRoute());
  document.body.classList.toggle("admin-catalog-preview", isPrivateManagementRoute() && internalUnlocked && view === "catalogo");
  els.internalLoginView?.classList.add("hidden");
  els.adminNav?.classList.toggle("hidden", !(isPrivateManagementRoute() && internalUnlocked));
  els.adminNavManagement?.classList.toggle("active", isManagementView);
  els.adminNavCatalog?.classList.toggle("active", view === "catalogo");
  els.backToManagement?.classList.toggle("hidden", !(isPrivateManagementRoute() && internalUnlocked && view === "catalogo"));
  els.catalogView.classList.toggle("hidden", view !== "catalogo");
  els.managementShell.classList.toggle("hidden", !isManagementView);
  els.adminView.classList.toggle("hidden", view !== "admin");
  els.stockView?.classList.toggle("hidden", view !== "stock");
  els.importView.classList.toggle("hidden", view !== "importacion");
  els.ordersView.classList.toggle("hidden", view !== "pedidos");
  els.clientsView?.classList.toggle("hidden", view !== "clientes");
  els.reportsView.classList.toggle("hidden", view !== "reportes");
  document.querySelectorAll("[data-catalog-only]").forEach((element) => {
    element.classList.toggle("hidden", view !== "catalogo");
  });
  els.topbar?.classList.toggle("hidden", isPrivateManagementRoute());
  els.siteFooter?.classList.toggle("hidden", isPrivateManagementRoute());
  applyRoleVisibility();
  if (isPrivateManagementRoute() && internalUnlocked) {
    setupSupabaseCatalogRealtime();
  }
  renderRole();
  renderNav();
  if (!historyOptions.skipHistory && !suppressHistoryUpdate) {
    updateAppHistory(view, historyOptions);
  }
}

function initializeAppHistory() {
  if (appHistoryReady || !window.history?.pushState) return;
  appHistoryReady = true;
  const url = getCurrentHistoryUrl();
  window.history.replaceState(makeAppHistoryState(currentView, true), "", url);
  window.history.pushState(makeAppHistoryState(currentView), "", url);
  window.addEventListener("popstate", handleAppPopState);
}

function updateAppHistory(view, options = {}) {
  if (!appHistoryReady || !window.history?.pushState) return;
  const url = getCurrentHistoryUrl();
  const currentState = window.history.state;
  const nextState = makeAppHistoryState(view);
  if (
    currentState?.gbMayorista
    && !currentState.guard
    && currentState.view === view
    && currentState.path === nextState.path
  ) {
    return;
  }
  if (options.replace) {
    window.history.replaceState(nextState, "", url);
    return;
  }
  window.history.pushState(nextState, "", url);
}

function handleAppPopState(event) {
  if (imageLightboxClosingByCode) {
    imageLightboxClosingByCode = false;
    return;
  }
  if (imageLightboxHistoryActive && els.imageLightbox && !els.imageLightbox.classList.contains("hidden")) {
    closeImageLightbox({ fromHistory: true });
    return;
  }
  if (addProductModalClosingByCode) {
    addProductModalClosingByCode = false;
    return;
  }
  if (addProductModalHistoryActive && els.addProductOverlay && !els.addProductOverlay.classList.contains("hidden")) {
    closeAddProductModal({ fromHistory: true });
    return;
  }
  if (stockModalClosingByCode) {
    stockModalClosingByCode = false;
    return;
  }
  if (stockModalHistoryActive && els.stockModalOverlay && !els.stockModalOverlay.classList.contains("hidden")) {
    closeStockModal({ fromHistory: true });
    return;
  }
  if (productDetailsMenuClosingByCode) {
    productDetailsMenuClosingByCode = false;
    return;
  }
  if (productDetailsMenuHistoryActive && closeOpenProductDetailsMenu({ skipHistory: true })) {
    return;
  }
  if (printPreviewClosingByCode) {
    printPreviewClosingByCode = false;
    return;
  }
  if (printPreviewHistoryActive && els.printPreviewOverlay && !els.printPreviewOverlay.classList.contains("hidden")) {
    closeInlinePrintPreview({ fromHistory: true });
    return;
  }
  if (budgetPreviewClosingByCode) {
    budgetPreviewClosingByCode = false;
    renderOrders();
    return;
  }
  if (budgetPreviewHistoryActive && previewOrderId) {
    closeBudgetPreview(previewOrderId, { fromHistory: true });
    return;
  }
  if (budgetItemEditClosingByCode) {
    budgetItemEditClosingByCode = false;
    renderOrders();
    return;
  }
  if (budgetItemEditHistoryActive && editingBudgetItem) {
    closeBudgetItemEditor({ fromHistory: true });
    return;
  }
  if (orderDetailClosingByCode) {
    orderDetailClosingByCode = false;
    renderOrders();
    return;
  }
  if (orderDetailHistoryActive && openOrderId) {
    closeOrderDetail(openOrderId, { fromHistory: true });
    return;
  }
  if (editProductModalClosingByCode) {
    editProductModalClosingByCode = false;
    return;
  }
  if (editProductModalHistoryActive && els.editProductOverlay && !els.editProductOverlay.classList.contains("hidden")) {
    closeEditProductModal({ fromHistory: true });
    return;
  }
  if (allowExternalBack) {
    allowExternalBack = false;
    return;
  }

  const state = event.state;
  if (state?.gbMayorista) {
    if (state.guard) {
      handleAppExitBack();
      return;
    }
    suppressHistoryUpdate = true;
    setView(state.view || getInitialView(), true, { skipHistory: true });
    suppressHistoryUpdate = false;
    return;
  }

  handleAppExitBack();
}

function handleAppExitBack() {
  const now = Date.now();
  if (now - lastExitBackPress <= 2000) {
    allowExternalBack = true;
    window.history.back();
    return;
  }
  lastExitBackPress = now;
  showToast("Presioná atrás otra vez para salir.");
  window.history.pushState(makeAppHistoryState(currentView), "", getCurrentHistoryUrl());
}

function makeAppHistoryState(view, guard = false) {
  return {
    gbMayorista: true,
    guard,
    view,
    path: normalizeRoutePath(window.location.pathname)
  };
}

function getCurrentHistoryUrl() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function getInitialView() {
  return isPrivateManagementRoute() ? "admin" : "catalogo";
}

function isPrivateManagementRoute() {
  return normalizeRoutePath(window.location.pathname) === PRIVATE_MANAGEMENT_PATH;
}

function normalizeRoutePath(pathname) {
  const normalized = `/${String(pathname || "").replace(/^\/+|\/+$/g, "")}`;
  return normalized === "/" ? "/" : normalized.toLowerCase();
}

function showInternalLogin(showError = false) {
  currentRole = "client";
  currentView = "gestion-login";
  document.body.classList.add("private-management-mode");
  document.body.classList.remove("admin-catalog-preview");
  els.topbar?.classList.add("hidden");
  els.siteFooter?.classList.add("hidden");
  els.adminNav?.classList.add("hidden");
  els.backToManagement?.classList.add("hidden");
  els.catalogView?.classList.add("hidden");
  els.managementShell?.classList.add("hidden");
  els.adminView?.classList.add("hidden");
  els.stockView?.classList.add("hidden");
  els.importView?.classList.add("hidden");
  els.ordersView?.classList.add("hidden");
  els.clientsView?.classList.add("hidden");
  els.reportsView?.classList.add("hidden");
  document.querySelectorAll("[data-catalog-only]").forEach((element) => element.classList.add("hidden"));
  els.internalLoginView?.classList.remove("hidden");
  els.internalLoginError?.classList.toggle("hidden", !showError);
  window.setTimeout(() => els.internalPassword?.focus(), 0);
}

async function handleInternalLogin(event) {
  event.preventDefault();
  const selectedRole = String(els.internalUserRole?.value || "admin");
  const password = String(els.internalPassword?.value || "");
  const user = userProfiles.find((profile) => profile.active && profile.role === selectedRole && profile.password === password);
  if (!user) {
    if (els.internalPassword) {
      els.internalPassword.value = "";
      els.internalPassword.focus();
    }
    showInternalLogin(true);
    return;
  }
  internalUnlocked = true;
  currentRole = user.role;
  els.internalLoginError?.classList.add("hidden");
  if (els.internalPassword) els.internalPassword.value = "";
  renderAll();
  setView("admin");
  await refreshCatalogFromSupabase("gestion-login", { silent: true });
}

function getManagementViews() {
  return ["admin", "pedidos", "clientes", "reportes", "importacion"];
}

function applyRoleVisibility() {
  document.querySelectorAll("[data-min-role]").forEach((element) => {
    element.classList.toggle("hidden", !canAccess(element.dataset.minRole));
  });
  document.querySelectorAll("[data-owner-only]").forEach((element) => {
    element.classList.toggle("hidden", !canAccess("admin"));
  });
  document.querySelectorAll("[data-admin-only]").forEach((element) => {
    element.classList.toggle("hidden", !canAccess("admin"));
  });
  document.querySelectorAll("[data-manage-products-only]").forEach((element) => {
    element.classList.toggle("hidden", !hasPermission("manageProducts"));
  });
  document.querySelectorAll("[data-reports-only]").forEach((element) => {
    element.classList.toggle("hidden", !hasPermission("reports"));
  });
  document.querySelectorAll("[data-import-export-only]").forEach((element) => {
    element.classList.toggle("hidden", !hasPermission("importExport"));
  });
}

function canAccess(role) {
  if (role === "owner") role = "admin";
  if (role === "client") return true;
  if (currentRole === "admin") return true;
  return currentRole === role;
}

function hasPermission(permission) {
  return (rolePermissions[currentRole] || []).includes(permission);
}

function openCart() {
  els.cartDrawer.classList.add("open");
  document.body.classList.add("cart-is-open");
  els.cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  els.cartDrawer.classList.remove("open");
  document.body.classList.remove("cart-is-open");
  els.cartDrawer.setAttribute("aria-hidden", "true");
}

function getCategories() {
  return getVisibleCategories();
}

function normalizeCategory(category) {
  const value = String(category || "").trim();
  if (value === "Ropa Interior > Hombre") return "Ropa Interior Hombre";
  if (value === "Ropa Interior > Dama") return "Ropa Interior Dama";
  if (["Ropa Interior > Niño", "Ropa Interior > Niños", "Ropa Interior Niños"].includes(value)) return "Ropa Interior Niño";
  if (value === "Ropa Interior") return "Ropa Interior Hombre";
  if (value.toLowerCase() === "soquetes") return "Medias";
  if (value.toLowerCase() === "accesorios") return "Medias";
  const existing = categories.find((item) => item.name.toLowerCase() === value.toLowerCase());
  if (existing) return existing.name;
  return getVisibleCategories()[0] || defaultProductCategories[0];
}

function normalizeCategories(categoryList) {
  const source = Array.isArray(categoryList) ? categoryList : defaultProductCategories;
  const normalized = [];
  source.forEach((category) => {
    const item = typeof category === "string" ? { name: category, active: true } : category;
    const categoryRenames = {
      "Ropa Interior > Hombre": "Ropa Interior Hombre",
      "Ropa Interior > Dama": "Ropa Interior Dama",
      "Ropa Interior > Niño": "Ropa Interior Niño",
      "Ropa Interior > Niños": "Ropa Interior Niño",
      "Ropa Interior Niños": "Ropa Interior Niño",
      "Ropa Interior": "Ropa Interior Hombre",
      "Soquetes": "Medias",
      "Accesorios": "Medias"
    };
    const rawName = String(item.name || "").trim();
    const name = categoryRenames[rawName] || rawName;
    if (!name || normalized.some((entry) => entry.name.toLowerCase() === name.toLowerCase())) return;
    normalized.push({ name, active: item.active !== false });
  });
  defaultProductCategories.forEach((name) => {
    if (!normalized.some((entry) => entry.name.toLowerCase() === name.toLowerCase())) {
      normalized.push({ name, active: true });
    }
  });
  return normalized;
}

function getVisibleCategories() {
  return categories.filter((category) => category.active !== false).map((category) => category.name);
}

function isCategoryVisible(name) {
  const category = categories.find((item) => item.name === name);
  return !category || category.active !== false;
}

function addCategory(name, options = {}) {
  const cleanName = String(name || "").trim();
  if (!cleanName) return false;
  const existing = categories.find((category) => normalizeCategoryNameForCompare(category.name) === normalizeCategoryNameForCompare(cleanName));
  if (existing) {
    if (options.makeVisible) existing.active = true;
    saveCategories();
    return false;
  }
  categories.push({ name: cleanName, active: true });
  saveCategories();
  return true;
}

function normalizeCategoryNameForCompare(value) {
  return String(value || "").trim().toLowerCase();
}

function getTodayConfirmedOrders() {
  const today = new Date().toDateString();
  return orders.filter((order) => isConfirmed(order.status) && new Date(getOrderSaleDate(order)).toDateString() === today);
}

function getMonthConfirmedOrders() {
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  return orders.filter((order) => {
    const date = new Date(getOrderSaleDate(order));
    return isConfirmed(order.status) && date.getMonth() === month && date.getFullYear() === year;
  });
}

function getOrderSaleDate(order) {
  return order.paidAt || order.updatedAt || order.createdAt;
}

function getTotals() {
  const today = new Date().toDateString();
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  const confirmedOrders = orders.filter((order) => isConfirmed(order.status));
  const todayOrders = confirmedOrders.filter((order) => new Date(getOrderSaleDate(order)).toDateString() === today);
  const monthOrders = confirmedOrders.filter((order) => {
    const date = new Date(getOrderSaleDate(order));
    return date.getMonth() === month && date.getFullYear() === year;
  });
  const yearOrders = confirmedOrders.filter((order) => new Date(getOrderSaleDate(order)).getFullYear() === year);

  return {
    todaySales: todayOrders.reduce((sum, order) => sum + order.total, 0),
    monthSales: monthOrders.reduce((sum, order) => sum + order.total, 0),
    yearSales: yearOrders.reduce((sum, order) => sum + order.total, 0),
    monthProfit: monthOrders.reduce((sum, order) => sum + order.profit, 0),
    stockSaleValue: products.reduce((sum, product) => sum + product.price * getProductTotalStock(product), 0),
    stockCostValue: products.reduce((sum, product) => sum + product.cost * getProductTotalStock(product), 0)
  };
}

function makeBudgetFromItems(items, customer, status = "En revisión", notes = "") {
  const customerData = typeof customer === "string"
    ? { name: customer, phone: "", location: "" }
    : customer;
  const orderItems = items.map(({ product, quantity }) => ({
    id: product.id,
    name: getProductBaseName(product),
    brand: product.brand,
    price: product.price,
    saleType: product.saleType,
    packQuantity: product.packQuantity,
    cost: product.cost || 0,
    variant: getProductOptionName(product),
    quantity
  }));

  const budget = {
    id: crypto.randomUUID(),
    type: "order",
    number: getNextConsultationNumber(),
    customer: customerData.name,
    customerName: customerData.name,
    customerPhone: customerData.phone || "",
    customerLocation: customerData.location || "",
    deliveryType: "Retira en local",
    transport: "",
    shippingCost: 0,
    paymentMethod: "Transferencia",
    discountType: "fixed",
    discountValue: 0,
    discountAmount: 0,
    status,
    notes,
    stockApplied: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: orderItems,
    subtotal: 0,
    total: 0,
    profit: 0
  };
  recalculateBudget(budget);
  return budget;
}

function makeBudgetFromCatalogItems(items, customer, notes = "") {
  const order = makeBudgetFromItems([], customer, "En revisión", notes);
  order.type = "consultation";
  order.items = items.map((item) => {
    const internalProduct = products.find((product) => product.id === (item.internalProductId || item.id));
    return {
      id: internalProduct?.id || item.internalProductId || item.id,
      name: internalProduct?.name || item.internalProductName || item.name,
      brand: internalProduct?.brand || item.brand || "GB Mayorista",
      price: Math.max(0, Number(item.price) || Number(internalProduct?.price) || 0),
      saleType: internalProduct?.saleType || item.saleType || "pack",
      packQuantity: internalProduct?.packQuantity || item.packQuantity || 12,
      cost: Number(internalProduct?.cost) || 0,
      variant: item.variantLabel || "",
      catalogProduct: item.name || "",
      quantity: Math.max(1, Math.round(Number(item.quantity) || 1))
    };
  });
  recalculateBudget(order);
  return order;
}

function makeConsultation(customer, notes = "") {
  const customerData = typeof customer === "string"
    ? { name: customer, phone: "", location: "" }
    : customer;
  return {
    id: crypto.randomUUID(),
    type: "consultation",
    number: getNextConsultationNumber(),
    customer: customerData.name,
    customerName: customerData.name,
    customerPhone: customerData.phone || "",
    customerLocation: customerData.location || "",
    status: "En revisión",
    notes,
    stockApplied: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [],
    subtotal: 0,
    total: 0,
    profit: 0
  };
}

function getNextConsultationNumber() {
  return orders.reduce((max, order) => Math.max(max, Number(order.number) || 0), 0) + 1;
}

function formatConsultationNumber(order) {
  const number = Math.max(1, Number(order.number) || 1);
  return `Consulta #${String(number).padStart(4, "0")}`;
}

function formatRecordNumber(order) {
  const number = Math.max(1, Number(order.number) || 1);
  return `Consulta #${String(number).padStart(4, "0")}`;
}

function recalculateBudget(order) {
  const totals = calculateBudgetTotals(order);
  order.subtotal = totals.subtotal;
  order.discountAmount = totals.discountAmount;
  order.shippingCost = totals.shippingCost;
  order.total = totals.total;
  order.profit = totals.profit;
  order.updatedAt = new Date().toISOString();
}

function calculateBudgetTotals(order) {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const rawDiscount = Math.max(0, Number(order.discountValue) || 0);
  const discountAmount = order.discountType === "percent"
    ? Math.round(subtotal * Math.min(rawDiscount, 100) / 100)
    : Math.min(Math.round(rawDiscount), subtotal);
  const shippingCost = shouldChargeShipping(order) ? Math.max(0, Number(order.shippingCost) || 0) : 0;
  const profitBeforeDiscount = order.items.reduce((sum, item) => sum + (item.price - item.cost) * item.quantity, 0);
  return {
    subtotal,
    discountAmount,
    shippingCost,
    total: Math.max(0, subtotal - discountAmount + shippingCost),
    profit: profitBeforeDiscount - discountAmount + shippingCost
  };
}

function formatDiscountSummary(order) {
  const discountAmount = Math.max(0, Number(order.discountAmount) || 0);
  const discountValue = Math.max(0, Number(order.discountValue) || 0);
  if (!discountAmount) return "$ 0";
  if (order.discountType === "percent") {
    return `${discountValue}% (-${formatMoney(discountAmount)})`;
  }
  return `${formatMoney(discountAmount)} descuento`;
}

function sampleBudgets(productList) {
  return [
    makeConsultation({ name: "Autoservicio Sol", phone: "2477000001", location: "Pergamino" }, "Cliente pidió confirmar disponibilidad por WhatsApp."),
    makeConsultation({ name: "Kiosco Centro", phone: "2477000002", location: "Colón" }, "Consulta de prueba sin productos.")
  ].map((order, index) => ({ ...order, number: index + 1 }));
}

function freshSampleProducts() {
  return sampleProducts.map((product, index) => ({ ...product, id: crypto.randomUUID(), active: true, sortOrder: index + 1 }));
}

function makeDefinitiveProduct(product, index = 0) {
  const presentation = product.presentation || "1 Docena";
  const name = product.name || "";
  const identity = getProductIdentityFromName(name, product.optionName);
  return {
    id: crypto.randomUUID(),
    image: name.includes("Lody Adulto Art. 742") ? LODY_742_IMAGE : DEFAULT_PRODUCT_IMAGE,
    name: identity.baseName,
    baseName: identity.baseName,
    optionName: identity.optionName,
    brand: getBrandFromProductName(name),
    category: product.category,
    presentation,
    description: product.description || "",
    saleType: getSaleTypeFromPresentation(presentation),
    price: 0,
    packQuantity: getPackQuantityFromPresentation(presentation),
    variants: "",
    variantStock: {},
    stock: 0,
    minimum: 1,
    cost: 0,
    active: true,
    showInCatalog: true,
    sortOrder: index + 1
  };
}

function getDefinitiveProductDescription(name) {
  const product = definitiveProductCatalog.find((item) => item.name.toLowerCase() === String(name || "").toLowerCase());
  return product?.description || "";
}

function normalizeProducts(productList) {
  return productList.map((product, index) => {
    const explicitBaseName = String(product.baseName || product.product || "").trim();
    const explicitOptionName = String(product.optionName || product.option || "").trim();
    const identity = explicitOptionName
      ? getProductIdentityFromName(explicitBaseName || product.name || "", explicitOptionName)
      : getProductIdentityFromName(product.name || explicitBaseName || "");
    const presentation = product.presentation || getProductPresentation(product);
    return {
      ...product,
      name: identity.baseName,
      baseName: identity.baseName,
      optionName: identity.optionName,
      brand: product.brand || "",
      category: normalizeCategory(product.category),
      presentation,
      description: product.description || "",
      variants: product.variants || "",
      variantStock: product.variantStock || {},
      saleType: product.saleType || getSaleTypeFromPresentation(presentation),
      packQuantity: Math.max(1, Number(product.packQuantity) || getPackQuantityFromPresentation(presentation)),
      stock: Math.max(0, Number(product.stock) || 0),
      cost: Number.isFinite(Number(product.cost)) ? Number(product.cost) : 0,
      image: getPrimaryProductImage(product),
      images: normalizeProductImages(product),
      active: product.active !== false,
      showInCatalog: product.showInCatalog !== false,
      sortOrder: Number.isFinite(product.sortOrder) ? product.sortOrder : index + 1
    };
  });
}

function normalizeBudgets(budgetList) {
  let nextNumber = budgetList.reduce((max, order) => Math.max(max, Number(order.number) || 0), 0) + 1;
  return budgetList.map((order) => {
    const legacyStatusMap = {
      "Presupuesto armado": "En revisión",
      "Presupuesto finalizado": "En revisión",
      "Consulta recibida": "En revisión",
      "Presupuesto enviado": "Presupuesto enviado",
      "Pedido confirmado": "Pendiente de pago",
      "Confirmado": "Pendiente de pago",
      "Preparado": "Pagado",
      "Preparando": "Pagado",
      "Retirado": "Entregado",
      "Entregado": "Entregado",
      "Enviado": "En revisión",
      "Cancelado": "Cancelado",
      "Pendiente": "Pendiente de pago"
    };
    const status = legacyStatusMap[order.status] || order.status;
    const recordType = order.type === "consultation" ? "consultation" : "order";
    const deliveryType = getNormalizedDeliveryType(order.deliveryType);
    const normalized = {
      ...order,
      type: recordType,
      number: Number(order.number) || nextNumber++,
      status: statuses.includes(status) ? status : "En revisión",
      customerName: order.customerName || order.customer || "Cliente WhatsApp",
      customerPhone: order.customerPhone || "",
      customerLocation: order.customerLocation || "",
      deliveryType,
      transport: order.transport || "",
      deliveryNotes: order.deliveryNotes || "",
      shippingCost: 0,
      paymentMethod: ["Efectivo", "Transferencia", "Cuenta corriente", "Otro"].includes(order.paymentMethod) ? order.paymentMethod : "Transferencia",
      discountType: order.discountType === "percent" ? "percent" : "fixed",
      discountValue: Math.max(0, Number(order.discountValue) || 0),
      discountAmount: Math.max(0, Number(order.discountAmount) || 0),
      subtotal: Math.max(0, Number(order.subtotal) || Number(order.total) || 0),
      notes: order.notes || "",
      consultedItems: Array.isArray(order.consultedItems) ? order.consultedItems : [],
      catalogTotal: Math.max(0, Number(order.catalogTotal) || 0),
      stockApplied: Boolean(order.stockApplied),
      updatedAt: order.updatedAt || order.createdAt || new Date().toISOString(),
      items: (order.items || []).map((item) => ({
        ...item,
        brand: item.brand || "",
        saleType: item.saleType === "pack" ? "pack" : "unit",
        packQuantity: item.saleType === "pack" ? Math.max(1, Number(item.packQuantity) || 1) : 1,
        variant: item.variant || "",
        cost: Number.isFinite(item.cost) ? item.cost : 0
      }))
    };
    recalculateBudget(normalized);
    return normalized;
  });
}

function renderProductPrice(product) {
  if (product.saleType !== "pack") {
    return `
      <div class="pack-price">
        <div class="pack-main-price">${formatMoney(product.price)}</div>
      </div>
    `;
  }

  return `
    <div class="pack-price">
      <div class="pack-main-price">${formatMoney(product.price)}</div>
      <div class="pack-unit-price">Pagás por unidad: ${formatMoney(product.price / product.packQuantity)}</div>
    </div>
  `;
}

function getProductMargin(product) {
  if (!product.price) return 0;
  return ((product.price - product.cost) / product.price) * 100;
}

function getProductEstimatedProfit(product) {
  return Math.max(0, product.stock) * (product.price - product.cost);
}

async function importProductsFromFile(event) {
  if (!hasPermission("importExport")) return;
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const rows = parseDelimitedRows(text);
    const newCategories = getNewCategoriesFromImportRows(rows);
    if (newCategories.length) {
      const shouldCreate = window.confirm(`Se detectó una categoría nueva. ¿Desea crearla?\n\n${newCategories.join("\n")}`);
      if (!shouldCreate) {
        showToast("Importación cancelada");
        return;
      }
      newCategories.forEach((category) => addCategory(category, { makeVisible: true }));
    }
    const imported = buildImportedProducts(rows);

    if (!imported.length) {
      showToast("No se encontraron productos para importar");
      return;
    }

    products.push(...imported);
    saveProducts();
    currentAdminCategory = imported[0].category;
    renderAll();
    showToast(`${imported.length} producto(s) importados`);
  } catch (error) {
    showToast("No se pudo importar la planilla");
  } finally {
    event.target.value = "";
  }
}

function buildImportedProducts(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map(normalizeHeader);
  const productIndex = headers.indexOf("producto");
  const optionIndex = headers.indexOf("talle");
  const legacyOptionIndex = headers.indexOf("opcion");
  const categoryIndex = headers.indexOf("categoria");
  const costIndex = headers.indexOf("precio costo");
  const priceIndex = headers.indexOf("precio venta");
  const presentationIndex = headers.indexOf("presentacion");
  const stockIndex = headers.indexOf("stock");
  const showInCatalogIndex = headers.indexOf("mostrar catalogo");
  let nextSortOrder = getNextSortOrder();

  return rows.slice(1).map((row) => {
    const rawName = String(row[productIndex] || "").trim();
    const rawOption = optionIndex >= 0
      ? String(row[optionIndex] || "").trim()
      : legacyOptionIndex >= 0
        ? String(row[legacyOptionIndex] || "").trim()
        : "";
    const identity = getProductIdentityFromName(rawName, rawOption);
    const name = identity.baseName;
    const category = String(row[categoryIndex] || "").trim();
    const price = parseImportNumber(row[priceIndex]);
    const presentation = String(row[presentationIndex] || "").trim() || "1 Docena";
    if (!name || !category || price <= 0) return null;

    return {
      id: crypto.randomUUID(),
      image: DEFAULT_PRODUCT_IMAGE,
      name,
      baseName: identity.baseName,
      optionName: identity.optionName,
      brand: "",
      category: normalizeCategory(category),
      presentation,
      description: "",
      saleType: "pack",
      price,
      packQuantity: getPackQuantityFromPresentation(presentation),
      variants: "",
      variantStock: {},
      stock: Math.max(0, parseImportNumber(row[stockIndex])),
      minimum: 1,
      cost: Math.max(0, parseImportNumber(row[costIndex])),
      active: true,
      showInCatalog: parseImportCatalogVisibility(row[showInCatalogIndex], true),
      sortOrder: nextSortOrder++
    };
  }).filter(Boolean);
}

function getNewCategoriesFromImportRows(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map(normalizeHeader);
  const categoryIndex = headers.indexOf("categoria");
  const known = new Set(categories.map((category) => normalizeCategoryNameForCompare(category.name)));
  return [...new Set(rows.slice(1)
    .map((row) => String(row[categoryIndex] || "").trim())
    .filter(Boolean)
    .filter((category) => !known.has(normalizeCategoryNameForCompare(category))))];
}

function parseDelimitedRows(text) {
  const delimiter = text.includes(";") ? ";" : ",";
  return text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => parseDelimitedLine(line, delimiter).map((cell) => cell.trim()))
    .filter((row) => row.some(Boolean));
}

function parseDelimitedLine(line, delimiter) {
  const cells = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const next = line[index + 1];
    if (character === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === delimiter && !quoted) {
      cells.push(cell);
      cell = "";
    } else {
      cell += character;
    }
  }

  cells.push(cell);
  return cells;
}

function normalizeHeader(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function parseImportNumber(value) {
  const normalized = String(value || "").replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".").trim();
  const number = Number(normalized);
  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : 0;
}

function parseImportCatalogVisibility(value, fallback = true) {
  const normalized = normalizeHeader(value);
  if (!normalized) return fallback;
  if (normalized === "si") return true;
  if (normalized === "no") return false;
  return fallback;
}

function formatCatalogVisibility(value) {
  return value === false ? "No" : "Sí";
}

function downloadImportTemplate() {
  if (!hasPermission("importExport")) return;
  const headers = [
    "Producto",
    "Talle",
    "Categoría",
    "Precio costo",
    "Precio venta",
    "Presentación",
    "Stock",
    "Mostrar catálogo"
  ];
  const example = [
    "Boxer Adulto Lody Art. 742",
    "Talle 1",
    "Ropa Interior Hombre",
    "42000",
    "60000",
    "1 Docena",
    "24",
    "Sí"
  ];
  const csv = [headers, example].map((row) => row.map(escapeCsv).join(";")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "plantilla-productos-gb-mayorista.csv";
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Plantilla CSV lista para Excel");
}

function exportProductsToExcel() {
  if (!hasPermission("importExport")) return;
  const headers = [
    "Producto",
    "Talle",
    "Categoría",
    "Precio costo",
    "Precio venta",
    "Presentación",
    "Stock",
    "Mostrar catálogo"
  ];
  const rows = getOrderedProducts().map((product) => [
    getProductBaseName(product),
    getProductOptionName(product),
    product.category,
    product.cost || 0,
    product.price || 0,
    getProductPresentation(product),
    getProductTotalStock(product),
    formatCatalogVisibility(product.showInCatalog)
  ]);
  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(";")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `productos-gb-mayorista-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Productos exportados para Excel");
}

function exportSalesToExcel() {
  if (!hasPermission("importExport")) return;
  const headers = ["Pedido", "Fecha", "Cliente", "Teléfono", "Localidad", "Subtotal", "Descuento", "Envío", "Total final", "Productos"];
  const rows = orders.filter((order) => isConfirmed(order.status)).map((order) => [
    formatConsultationNumber(order),
    formatShortDate(getOrderSaleDate(order)),
    getOrderCustomerName(order),
    order.customerPhone || "",
    order.customerLocation || "",
    order.subtotal || 0,
    order.discountAmount || 0,
    order.shippingCost || 0,
    order.total || 0,
    order.items.map((item) => `${item.name} x${item.quantity}`).join(" | ")
  ]);
  downloadCsv(`ventas-gb-mayorista-${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
  showToast("Ventas exportadas para Excel");
}

function exportStockToExcel() {
  if (!hasPermission("importExport")) return;
  const headers = ["Producto", "Categoría", "Precio costo", "Precio venta", "Presentación", "Stock", "Valor costo", "Valor venta", "Margen potencial"];
  const rows = getOrderedProducts().map((product) => {
    const stock = getProductTotalStock(product);
    const costValue = (Number(product.cost) || 0) * stock;
    const saleValue = (Number(product.price) || 0) * stock;
    return [
      product.name,
      product.category,
      product.cost || 0,
      product.price || 0,
      getProductPresentation(product),
      stock,
      costValue,
      saleValue,
      saleValue - costValue
    ];
  });
  downloadCsv(`stock-gb-mayorista-${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
  showToast("Stock exportado para Excel");
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(escapeCsv).join(";")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function escapeCsv(value) {
  const text = String(value);
  return /[;"\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function getSaleLabel(product) {
  return product.saleType === "pack" ? `Pack x${product.packQuantity}` : "Unidad";
}

function isConfirmed(status) {
  return confirmedStatuses.includes(status);
}

function formatMoney(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(value);
}

function formatPercent(value) {
  return `${Math.round(value)}%`;
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("es-AR").format(new Date(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message, type = "") {
  window.clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.toggle("success", type === "success");
  els.toast.classList.add("show");
  toastTimer = window.setTimeout(() => {
    els.toast.classList.remove("show");
    els.toast.classList.remove("success");
  }, 2200);
}
