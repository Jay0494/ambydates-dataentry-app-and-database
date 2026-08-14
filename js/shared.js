// ---- Shared state ----
let customers = [];   // {Customer_key, Customer_name}
let products = [];    // {Product_key, Product}

// ---- Load dropdown data (populates whichever selects exist on the page) ----
async function loadCustomers(){
  const { data, error } = await sb.from(CUST_TABLE).select('*').order('Customer_name');
  if(error){ console.error(error); return; }
  customers = data;
  fillSelect('customerSelect', customers, 'Customer_key', 'Customer_name', 'Select customer…');
  fillSelect('vCustomer', customers, 'Customer_key', 'Customer_name', 'All customers');
}

async function loadProducts(){
  const { data, error } = await sb.from(PROD_TABLE).select('*').order('Product');
  if(error){ console.error(error); return; }
  products = data;
  fillSelect('productSelect', products, 'Product_key', 'Product', 'Select product…');
  fillSelect('vProduct', products, 'Product_key', 'Product', 'All products');
}

function fillSelect(id, rows, keyField, labelField, placeholder){
  const el = document.getElementById(id);
  if(!el) return; // this select doesn't exist on the current page
  const current = el.value;
  el.innerHTML = '<option value="">' + placeholder + '</option>' +
    rows.map(r => `<option value="${r[keyField]}">${escapeHtml(r[labelField])}</option>`).join('');
  el.value = current;
}

// ---- Small utilities ----
function escapeHtml(s){
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function fmtMoney(v){
  if(v === null || v === undefined || v === '') return '—';
  return Number(v).toLocaleString(undefined, { minimumFractionDigits: 0 });
}

function setStatus(el, msg, kind, busy){
  el.className = 'status show ' + (kind || '');
  el.innerHTML = (busy ? '<span class="spinner"></span>' : '') + msg;
}

function clearStatus(el){
  el.className = 'status';
  el.innerHTML = '';
}