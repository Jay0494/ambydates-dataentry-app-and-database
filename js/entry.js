let editingId = null; // purchase_id currently loaded for edit, or null = new

// ---------- Inline add customer/product ----------
function toggleInline(kind){
  document.getElementById(kind + 'Add').classList.toggle('open');
}

async function addCustomer(){
  const nameEl = document.getElementById('newCustomerName');
  const name = nameEl.value.trim();
  if(!name) return;
  const nextKey = customers.length ? Math.max(...customers.map(c => c.Customer_key)) + 1 : 1;
  const { error } = await sb.from(CUST_TABLE).insert({ Customer_key: nextKey, Customer_name: name });
  if(error){ alert('Could not add customer: ' + error.message); return; }
  await loadCustomers();
  document.getElementById('customerSelect').value = nextKey;
  nameEl.value = '';
  document.getElementById('customerAdd').classList.remove('open');
}

async function addProduct(){
  const nameEl = document.getElementById('newProductName');
  const name = nameEl.value.trim();
  if(!name) return;
  const nextKey = products.length ? Math.max(...products.map(p => p.Product_key)) + 1 : 1;
  const { error } = await sb.from(PROD_TABLE).insert({ Product_key: nextKey, Product: name });
  if(error){ alert('Could not add product: ' + error.message); return; }
  await loadProducts();
  document.getElementById('productSelect').value = nextKey;
  nameEl.value = '';
  document.getElementById('productAdd').classList.remove('open');
}

// ---------- Form <-> data ----------
function readForm(){
  return {
    Customer_key: Number(document.getElementById('customerSelect').value) || null,
    Product_key: Number(document.getElementById('productSelect').value) || null,
    Quantity: numOrNull('fQuantity'),
    cost: numOrNull('fCost'),
    Shipping_cost: numOrNull('fShipping'),
    Revenue: numOrNull('fRevenue'),
    Balance: numOrNull('fBalance'),
    Purchase_date: document.getElementById('fDate').value || null
  };
}

function numOrNull(id){
  const v = document.getElementById(id).value;
  return v === '' ? null : Number(v);
}

function fillForm(row){
  document.getElementById('customerSelect').value = row.Customer_key ?? '';
  document.getElementById('productSelect').value = row.Product_key ?? '';
  document.getElementById('fQuantity').value = row.Quantity ?? '';
  document.getElementById('fCost').value = row.cost ?? '';
  document.getElementById('fShipping').value = row.Shipping_cost ?? '';
  document.getElementById('fRevenue').value = row.Revenue ?? '';
  document.getElementById('fBalance').value = row.Balance ?? '';
  document.getElementById('fDate').value = row.Purchase_date ?? '';
}

function resetForm(){
  editingId = null;
  document.getElementById('lookupId').value = '';
  fillForm({});
  document.getElementById('formTitle').textContent = 'New sale';
  document.getElementById('formHint').textContent = 'Fill in the details and save. Fields marked in the labels are required.';
  document.getElementById('saveBtn').textContent = 'Save new sale';
  document.getElementById('deleteBtn').style.display = 'none';
  clearStatus(document.getElementById('lookupStatus'));
  clearStatus(document.getElementById('saveStatus'));
}

// ---------- Lookup existing sale ----------
async function lookupSale(){
  const idEl = document.getElementById('lookupId');
  const statusEl = document.getElementById('lookupStatus');
  const id = idEl.value.trim();
  if(!id){ setStatus(statusEl, 'Enter a Purchase ID first.', 'err'); return; }
  setStatus(statusEl, 'Looking up…', '', true);
  const { data, error } = await sb.from(SALES_TABLE).select('*').eq('purchase_id', id).maybeSingle();
  if(error){ setStatus(statusEl, 'Error: ' + error.message, 'err'); return; }
  if(!data){ setStatus(statusEl, 'No sale found with that Purchase ID.', 'err'); return; }
  editingId = data.purchase_id;
  fillForm(data);
  document.getElementById('formTitle').textContent = 'Editing sale #' + editingId;
  document.getElementById('formHint').textContent = 'Update the fields below and save your changes.';
  document.getElementById('saveBtn').textContent = 'Save changes';
  document.getElementById('deleteBtn').style.display = '';
  setStatus(statusEl, 'Loaded sale #' + editingId + '.', 'ok');
}

// ---------- Save / Update / Delete ----------
async function saveSale(){
  const statusEl = document.getElementById('saveStatus');
  const payload = readForm();

  if(!payload.Customer_key || !payload.Product_key){
    setStatus(statusEl, 'Please select a customer and a product.', 'err');
    return;
  }

  setStatus(statusEl, editingId ? 'Saving changes…' : 'Saving new sale…', '', true);
  document.getElementById('saveBtn').disabled = true;

  try{
    if(editingId){
      const { error } = await sb.from(SALES_TABLE).update(payload).eq('purchase_id', editingId);
      if(error) throw error;
      setStatus(statusEl, 'Sale #' + editingId + ' updated.', 'ok');
    } else {
      const { data: existing, error: fetchErr } = await sb.from(SALES_TABLE).select('purchase_id');
      if(fetchErr) throw fetchErr;
      const nextId = existing.length ? Math.max(...existing.map(r => r.purchase_id)) + 1 : 1;
      const { error } = await sb.from(SALES_TABLE).insert({ purchase_id: nextId, ...payload });
      if(error) throw error;
      editingId = nextId;
      document.getElementById('lookupId').value = nextId;
      document.getElementById('formTitle').textContent = 'Editing sale #' + nextId;
      document.getElementById('saveBtn').textContent = 'Save changes';
      document.getElementById('deleteBtn').style.display = '';
      setStatus(statusEl, 'Sale #' + nextId + ' saved.', 'ok');
    }
  } catch(err){
    setStatus(statusEl, 'Error: ' + err.message, 'err');
  } finally {
    document.getElementById('saveBtn').disabled = false;
  }
}

async function deleteSale(){
  if(!editingId) return;
  if(!confirm('Delete sale #' + editingId + '? This cannot be undone.')) return;
  const statusEl = document.getElementById('saveStatus');
  setStatus(statusEl, 'Deleting…', '', true);
  const { error } = await sb.from(SALES_TABLE).delete().eq('purchase_id', editingId);
  if(error){ setStatus(statusEl, 'Error: ' + error.message, 'err'); return; }
  setStatus(statusEl, 'Sale deleted.', 'ok');
  resetForm();
}

// ---------- Init ----------
(async function init(){
  await Promise.all([loadCustomers(), loadProducts()]);

  // If we arrived here from the View page with ?edit=ID, load that sale
  const params = new URLSearchParams(window.location.search);
  const editParam = params.get('edit');
  if(editParam){
    document.getElementById('lookupId').value = editParam;
    lookupSale();
  }
})();