async function runSearch(){
  const statusEl = document.getElementById('viewStatus');
  const body = document.getElementById('resultsBody');
  body.innerHTML = '<tr class="empty-row"><td colspan="9">Loading…</td></tr>';
  clearStatus(statusEl);

  let query = sb.from(SALES_TABLE).select('*').order('purchase_id', { ascending: false });

  const cust = document.getElementById('vCustomer').value;
  const prod = document.getElementById('vProduct').value;
  const from = document.getElementById('vFrom').value;
  const to = document.getElementById('vTo').value;

  if(cust) query = query.eq('Customer_key', cust);
  if(prod) query = query.eq('Product_key', prod);
  if(from) query = query.gte('Purchase_date', from);
  if(to) query = query.lte('Purchase_date', to);

  const { data, error } = await query;
  if(error){ setStatus(statusEl, 'Error: ' + error.message, 'err'); body.innerHTML = ''; return; }

  renderResults(data);
}

function renderResults(rows){
  const body = document.getElementById('resultsBody');
  const totalsBar = document.getElementById('totalsBar');
  const custMap = Object.fromEntries(customers.map(c => [c.Customer_key, c.Customer_name]));
  const prodMap = Object.fromEntries(products.map(p => [p.Product_key, p.Product]));

  if(!rows.length){
    body.innerHTML = '<tr class="empty-row"><td colspan="9">No sales match those filters.</td></tr>';
    totalsBar.innerHTML = '';
    return;
  }

  body.innerHTML = rows.map(r => `
    <tr onclick="openForEdit(${r.purchase_id})">
      <td>#${r.purchase_id}</td>
      <td>${escapeHtml(custMap[r.Customer_key] || '—')}</td>
      <td>${escapeHtml(prodMap[r.Product_key] || '—')}</td>
      <td class="num">${r.Quantity ?? ''}</td>
      <td class="num">${fmtMoney(r.cost)}</td>
      <td class="num">${fmtMoney(r.Shipping_cost)}</td>
      <td class="num">${fmtMoney(r.Revenue)}</td>
      <td class="num ${r.Balance > 0 ? 'balance-due' : ''}">${fmtMoney(r.Balance)}</td>
      <td>${r.Purchase_date ?? ''}</td>
    </tr>
  `).join('');

  const sum = f => rows.reduce((a, r) => a + (Number(r[f]) || 0), 0);
  totalsBar.innerHTML = `
    <span><b>${rows.length}</b> sale${rows.length === 1 ? '' : 's'}</span>
    <span>Revenue: <b>${fmtMoney(sum('Revenue'))}</b></span>
    <span>Balance outstanding: <b>${fmtMoney(sum('Balance'))}</b></span>
  `;
}

function openForEdit(id){
  // Navigate to the Entry & Update page with this sale pre-loaded
  window.location.href = 'index.html?edit=' + id;
}

function clearSearch(){
  document.getElementById('vCustomer').value = '';
  document.getElementById('vProduct').value = '';
  document.getElementById('vFrom').value = '';
  document.getElementById('vTo').value = '';
  runSearch();
}

// ---------- Init ----------
(async function init(){
  await Promise.all([loadCustomers(), loadProducts()]);
  runSearch();
})();