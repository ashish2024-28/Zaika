// ============================================
//  ZAIKA — Application Logic
//  Key fixes:
//  - No page re-render when adding/changing qty (DOM patch only)
//  - Toast notification on add-to-cart
//  - 3-state veg toggle: all → veg → nonveg
// ============================================

// ---- VEG TOGGLE STATE (3-cycle) ----
// 0 = all, 1 = veg only, 2 = nonveg only
var vegState = 0;

window.onload = function() {
  parseXML();
  populateLandingPreview();
  updateCartBadge();
  var urlTable = getTableFromURL();
  if (urlTable) { selectedTable = urlTable; showQRTableConfirm(urlTable); }
};

// ---- LANDING PREVIEW ----
function populateLandingPreview() {
  var grid = document.getElementById('previewGrid');
  if (!grid) return;
  var picks = menuItems.filter(function(i) { return i.recommended || i.mostOrdered; }).slice(0, 4);
  if (!picks.length) picks = menuItems.slice(0, 4);
  var html = '';
  picks.forEach(function(item) {
    html += '<div class="preview-card">' +
      '<div class="pc-img"><img src="' + item.photo + '" alt="' + escHtml(item.name) + '" loading="lazy" onerror="this.parentNode.classList.add(\'img-err\')"/></div>' +
      '<div class="pc-body">' +
        '<div class="pc-type ' + item.type + '"></div>' +
        '<div class="pc-name">' + escHtml(item.name) + '</div>' +
        '<div class="pc-price">&#8377;' + item.price + '</div>' +
      '</div></div>';
  });
  grid.innerHTML = html;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ---- QR TABLE ----
function showQRTableConfirm(tableNum) {
  var t = document.getElementById('modalTitle'), s = document.getElementById('modalSub');
  if (t) t.textContent = 'You are at Table ' + tableNum;
  if (s) s.textContent = 'Your order will be delivered to this table';
  var grid = document.getElementById('tableGrid');
  grid.innerHTML = '<div class="qr-confirm-box">' +
    '<div class="qr-table-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="10" rx="2"/><path d="M6 8V5a3 3 0 016 0v3M12 8V5a3 3 0 016 0v3"/></svg></div>' +
    '<div class="qr-table-num">Table ' + tableNum + '</div>' +
    '<div class="qr-table-sub">Scanned from your table QR code</div>' +
    '</div>';
  document.getElementById('tableModal').classList.remove('hidden');
}

function enterRestaurant() {
  var urlTable = getTableFromURL();
  if (urlTable) { selectedTable = urlTable; launchApp(); return; }
  showTableModal();
}

function showTableModal() {
  var t = document.getElementById('modalTitle'), s = document.getElementById('modalSub');
  if (t) t.textContent = 'Select Your Table';
  if (s) s.textContent = 'Choose your table number to begin ordering';
  var grid = document.getElementById('tableGrid'), html = '';
  TABLES.forEach(function(n) {
    html += '<button class="table-btn" onclick="selectTable(' + n + ')" id="tbl-' + n + '">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="10" rx="2"/><path d="M6 8V5a3 3 0 016 0v3M12 8V5a3 3 0 016 0v3"/></svg>' +
      '<span>' + n + '</span></button>';
  });
  grid.innerHTML = html;
  document.getElementById('tableModal').classList.remove('hidden');
}

function selectTable(n) {
  document.querySelectorAll('.table-btn').forEach(function(b) { b.classList.remove('selected'); });
  var btn = document.getElementById('tbl-' + n);
  if (btn) btn.classList.add('selected');
  selectedTable = n;
  document.getElementById('tableError').classList.add('hidden');
}

function confirmTable() {
  if (!selectedTable) { document.getElementById('tableError').classList.remove('hidden'); return; }
  document.getElementById('tableModal').classList.add('hidden');
  launchApp();
}

function launchApp() {
  var lp = document.getElementById('landingPage');
  lp.style.transition = 'opacity .4s ease'; lp.style.opacity = '0';
  setTimeout(function() {
    lp.style.display = 'none';
    var app = document.getElementById('appWrapper');
    app.classList.remove('hidden'); app.style.opacity = '0'; app.style.transition = 'opacity .3s ease';
    setTimeout(function() { app.style.opacity = '1'; }, 20);
    setTableUI(); renderMenu();
  }, 420);
}

function setTableUI() {
  var t = selectedTable || '--';
  var e1=document.getElementById('hdrTableNum'), e2=document.getElementById('menuTableLabel'), e3=document.getElementById('cartTableNum');
  if (e1) e1.textContent = t;
  if (e2) e2.textContent = 'Table ' + t;
  if (e3) e3.textContent = t;
}

// ---- NAVIGATION ----
function showPage(id) {
  document.querySelectorAll('.app-page').forEach(function(p) { p.classList.add('hidden'); });
  var pg = document.getElementById(id);
  if (pg) { pg.classList.remove('hidden'); window.scrollTo(0,0); }
}
function goToMenu() {
  showPage('menuPage');
  // If there's an active order, show the FAB
  if (currentOrder && currentOrder.status < ORDER_STATUSES.length - 1) {
    updateTrackFab(currentOrder);
  }
}
function openCart()   { hideTrackFab(); renderCart(); showPage('cartPage'); }
function goToAdmin()  { hideTrackFab(); showPage('adminLoginPage'); setAdminHeaderMode(true); }
function trackOrder() { hideTrackFab(); renderTrackOrder(); showPage('trackPage'); }

// ---- VEG TOGGLE (3-state cycle: all → veg → nonveg → all) ----
function cycleVegToggle() {
  vegState = (vegState + 1) % 3;  // 0=all, 1=veg, 2=nonveg
  var states = ['all','veg','nonveg'];
  var labels  = ['Veg Mode', 'Veg Only', 'Non-Veg'];
  dietFilter  = states[vegState];

  var track   = document.getElementById('vtsTrack');
  var label   = document.getElementById('vegToggleLabel');
  var wrap    = document.querySelector('.veg-toggle-wrap');

  if (track) {
    track.className = 'vts-track' + (vegState===1 ? ' state-veg' : vegState===2 ? ' state-nonveg' : '');
  }
  if (label) label.textContent = labels[vegState];
  if (wrap)  wrap.className = 'veg-toggle-wrap' + (vegState===1 ? ' state-veg' : vegState===2 ? ' state-nonveg' : '');

  // Sync sidebar
  syncSidebarToState();
  // Re-render menu WITHOUT resetting scroll
  rerenderGridsOnly();
}

function setSidebarDiet(f) {
  var map = { all:0, veg:1, nonveg:2 };
  vegState   = map[f] !== undefined ? map[f] : 0;
  dietFilter = f;
  var states = ['all','veg','nonveg'];
  var labels  = ['Veg Mode', 'Veg Only', 'Non-Veg'];
  var track   = document.getElementById('vtsTrack');
  var label   = document.getElementById('vegToggleLabel');
  var wrap    = document.querySelector('.veg-toggle-wrap');
  if (track) track.className = 'vts-track' + (vegState===1?' state-veg':vegState===2?' state-nonveg':'');
  if (label) label.textContent = labels[vegState];
  if (wrap)  wrap.className = 'veg-toggle-wrap' + (vegState===1?' state-veg':vegState===2?' state-nonveg':'');
  syncSidebarToState();
  rerenderGridsOnly();
}

function syncSidebarToState() {
  var states = ['all','veg','nonveg'];
  var ids    = ['vsb-all','vsb-veg','vsb-nonveg'];
  ids.forEach(function(id,i) {
    var el = document.getElementById(id);
    if (el) { if (i===vegState) el.classList.add('vsb-active'); else el.classList.remove('vsb-active'); }
  });
}

// ---- CATEGORY FILTER ----
function renderCatPills() {
  var seen={}, cats=[];
  menuItems.forEach(function(i){ if(!seen[i.category]){seen[i.category]=true;cats.push(i.category);} });
  var container=document.getElementById('categoryPills');
  if (!container) return;
  var html = '<button class="cat-pill'+(catFilter==='all'?' active':'')+'" onclick="setCatFilter(\'all\')">'+CAT_ICONS['all']+'<span>All</span></button>';
  cats.forEach(function(c){
    html += '<button class="cat-pill'+(catFilter===c?' active':'')+'" onclick="setCatFilter(\''+c+'\')">'+
      (CAT_ICONS[c]||'')+'<span>'+(CAT_LABELS[c]||c)+'</span></button>';
  });
  container.innerHTML = html;
}

function setCatFilter(c) { catFilter = c; renderCatPills(); rerenderGridsOnly(); }

// Search triggered from the menu search box — no full re-render
function filterMenuOnly() { rerenderGridsOnly(); }

// ---- FILTERED ITEMS ----
function getFiltered() {
  var inp = document.getElementById('searchInput');
  var q   = inp ? inp.value.toLowerCase().trim() : '';
  return menuItems.filter(function(item) {
    var d = (dietFilter==='all') || (item.type===dietFilter);
    var c = (catFilter==='all')  || (item.category===catFilter);
    var s = !q || item.name.toLowerCase().indexOf(q)!==-1 || item.desc.toLowerCase().indexOf(q)!==-1;
    return d && c && s;
  });
}

// ---- CARD BUILDER ----
function makeCard(item, compact) {
  if (!item || typeof item.id === 'undefined') return '';
  var qty = getQty(item.id);
  var catLabel  = CAT_LABELS[item.category] || item.category;
  var fallback  = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='220'%3E%3Crect fill='%23f0ede8' width='400' height='220'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239c8f84' font-size='14' font-family='sans-serif'%3E" + encodeURIComponent(item.name) + "%3C/text%3E%3C/svg%3E";
  var qtyCtrl = qty===0
    ? '<button class="btn-add" onclick="addToCart('+item.id+',event)">Add</button>'
    : '<div class="qty-ctl" id="qc-'+item.id+'">'+
        '<button onclick="decQty('+item.id+',event)">&#8722;</button>'+
        '<span id="qspan-'+item.id+'">'+qty+'</span>'+
        '<button onclick="incQty('+item.id+',event)">&#43;</button>'+
      '</div>';
  return '<div class="food-card'+(compact?' compact':'')+'" id="card-'+item.id+'">' +
    '<div class="fc-img-wrap">' +
      '<img class="fc-img" src="'+item.photo+'" alt="'+escHtml(item.name)+'" loading="lazy" onerror="this.src=\''+fallback+'\'">' +
      '<div class="fc-type-badge '+item.type+'"><div class="ftb-square '+item.type+'"><div class="ftb-dot"></div></div></div>' +
    '</div>' +
    '<div class="fc-body">' +
      '<div class="fc-cat">'+catLabel+'</div>' +
      '<div class="fc-name">'+escHtml(item.name)+'</div>' +
      '<div class="fc-desc">'+escHtml(item.desc)+'</div>' +
      '<div class="fc-foot"><span class="fc-price">&#8377;'+item.price+'</span>'+qtyCtrl+'</div>' +
    '</div>' +
  '</div>';
}

// ---- FULL RENDER (called only on init, page switch, filter change) ----
function renderMenu() {
  renderCatPills();
  rerenderGridsOnly();
}

// ---- GRID-ONLY RE-RENDER (no scroll jump) ----
function rerenderGridsOnly() {
  var filtered = getFiltered();
  var rec = filtered.filter(function(i){ return i.recommended; });
  var mo  = filtered.filter(function(i){ return i.mostOrdered; });

  var recSec=document.getElementById('recommendedSection'),
      moSec =document.getElementById('mostOrderedSection'),
      recGrid=document.getElementById('recommendedGrid'),
      moGrid =document.getElementById('mostOrderedGrid'),
      fullGrid=document.getElementById('menuGrid');
  if (!recSec||!moSec||!recGrid||!moGrid||!fullGrid) return;

  if (rec.length>0) { recSec.classList.remove('hidden'); recGrid.innerHTML=rec.map(function(i){return makeCard(i,true);}).join(''); }
  else recSec.classList.add('hidden');

  if (mo.length>0) { moSec.classList.remove('hidden'); moGrid.innerHTML=mo.map(function(i){return makeCard(i,true);}).join(''); }
  else moSec.classList.add('hidden');

  fullGrid.innerHTML = filtered.length>0
    ? filtered.map(function(i){return makeCard(i,false);}).join('')
    : '<div class="no-results">No dishes match your filter.</div>';
}

// ---- PATCH A SINGLE CARD'S FOOTER (no scroll, no re-render) ----
function patchCardQty(id) {
  var qty = getQty(id);
  // Patch all instances of this card (full grid + horizontal scroll rows)
  document.querySelectorAll('#card-'+id+' .fc-foot').forEach(function(foot) {
    var priceSpan = foot.querySelector('.fc-price');
    var priceHtml = priceSpan ? priceSpan.outerHTML : '';
    var qtyHtml;
    if (qty === 0) {
      qtyHtml = '<button class="btn-add" onclick="addToCart('+id+',event)">Add</button>';
    } else {
      qtyHtml = '<div class="qty-ctl" id="qc-'+id+'">' +
        '<button onclick="decQty('+id+',event)">&#8722;</button>' +
        '<span id="qspan-'+id+'">'+qty+'</span>' +
        '<button onclick="incQty('+id+',event)">&#43;</button>' +
        '</div>';
    }
    foot.innerHTML = priceHtml + qtyHtml;
  });
}

// ---- CART HELPERS ----
function getQty(id) {
  for (var i=0;i<cart.length;i++) { if(cart[i].id===id) return cart[i].qty; }
  return 0;
}

function addToCart(id, evt) {
  if (evt) evt.stopPropagation();
  var item = null;
  menuItems.forEach(function(m){ if(m.id===id) item=m; });
  if (!item) return;

  var found = false;
  cart.forEach(function(c){ if(c.id===id){c.qty++;found=true;} });
  if (!found) cart.push({id:item.id,name:item.name,price:item.price,photo:item.photo,type:item.type,qty:1});

  updateCartBadge();
  patchCardQty(id);     // ← patch only the changed card, NO scroll reset
  showToast(item.name, item.price);
}

function incQty(id, evt) {
  if (evt) evt.stopPropagation();
  cart.forEach(function(c){ if(c.id===id) c.qty++; });
  updateCartBadge();
  patchCardQty(id);
}

function decQty(id, evt) {
  if (evt) evt.stopPropagation();
  for (var i=0;i<cart.length;i++) {
    if (cart[i].id===id) {
      cart[i].qty--;
      if (cart[i].qty<=0) cart.splice(i,1);
      break;
    }
  }
  updateCartBadge();
  patchCardQty(id);
}

function cartInc(id) { cart.forEach(function(c){if(c.id===id)c.qty++;}); updateCartBadge(); renderCart(); }
function cartDec(id) {
  for(var i=0;i<cart.length;i++){if(cart[i].id===id){cart[i].qty--;if(cart[i].qty<=0)cart.splice(i,1);break;}}
  updateCartBadge(); renderCart();
}
function removeItem(id) { cart=cart.filter(function(c){return c.id!==id;}); updateCartBadge(); renderCart(); }

function updateCartBadge() {
  var total=0; cart.forEach(function(c){total+=c.qty;});
  var badge=document.getElementById('cartCount');
  if (!badge) return;
  badge.textContent=total;
  if(total>0) badge.classList.remove('hidden'); else badge.classList.add('hidden');
}

function cartTotal() { var t=0; cart.forEach(function(c){t+=c.price*c.qty;}); return t; }

function renderCart() {
  var emEl=document.getElementById('cartEmpty'),
      liEl=document.getElementById('cartItemsList'),
      ftEl=document.getElementById('cartFooter');
  if (!emEl||!liEl||!ftEl) return;
  if (cart.length===0){emEl.classList.remove('hidden');liEl.innerHTML='';ftEl.classList.add('hidden');return;}
  emEl.classList.add('hidden'); ftEl.classList.remove('hidden');
  liEl.innerHTML=cart.map(function(item){
    return '<div class="cart-row">' +
      '<div class="cr-left">' +
        '<div class="cr-img-wrap"><img src="'+item.photo+'" class="cr-img" alt="'+escHtml(item.name)+'" onerror="this.style.display=\'none\'"/></div>' +
        '<div><div class="cr-name">'+escHtml(item.name)+'</div><div class="cr-unit">&#8377;'+item.price+' per item</div></div>' +
      '</div>' +
      '<div class="cr-right">' +
        '<div class="qty-ctl"><button onclick="cartDec('+item.id+')">&#8722;</button><span>'+item.qty+'</span><button onclick="cartInc('+item.id+')">&#43;</button></div>' +
        '<div class="cr-sub">&#8377;'+(item.price*item.qty)+'</div>' +
        '<button class="cr-del" onclick="removeItem('+item.id+')">&#x2715;</button>' +
      '</div></div>';
  }).join('');
  var t=cartTotal();
  document.getElementById('cartSubtotal').textContent='₹'+t;
  document.getElementById('cartTotal').textContent='₹'+t;
}

// ---- TOAST ----
var toastTimer = null;
function showToast(name, price) {
  var el    = document.getElementById('toastNotif');
  var title = document.getElementById('toastTitle');
  var sub   = document.getElementById('toastSub');
  if (!el) return;
  if (title) title.textContent = name + ' added to cart';
  if (sub)   sub.textContent   = '₹' + price + ' · Tap Cart to review';
  el.classList.remove('hidden','hiding');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ hideToast(); }, 3000);
}
function hideToast() {
  var el = document.getElementById('toastNotif');
  if (!el) return;
  el.classList.add('hiding');
  setTimeout(function(){ el.classList.add('hidden'); el.classList.remove('hiding'); }, 260);
}

// ---- ORDER ----
function genOrderId(){ return 'ZK'+Math.floor(1000+Math.random()*9000); }

function placeOrder() {
  if (!cart.length) return;
  var id    = genOrderId();
  var items = cart.map(function(c){return {id:c.id,name:c.name,price:c.price,photo:c.photo,qty:c.qty};});
  var total = cartTotal();
  var order = {id:id,items:items,total:total,status:0,table:selectedTable,time:new Date().toLocaleTimeString()};
  orders.push(order); currentOrder=order;
  document.getElementById('orderId').textContent      = id;
  document.getElementById('confirmTable').textContent = 'Table '+selectedTable;
  document.getElementById('confirmItems').innerHTML   = items.map(function(i){
    return '<div class="cbox-item"><img src="'+i.photo+'" class="cbox-item-img" onerror="this.style.display=\'none\'"/><span>'+escHtml(i.name)+' &times; '+i.qty+'</span><span>&#8377;'+(i.price*i.qty)+'</span></div>';
  }).join('');
  document.getElementById('confirmTotal').textContent='₹'+total;
  cart=[]; updateCartBadge(); renderMenu();
  showPage('confirmPage');
  // Start live order engine — drives the bar + delivery popup
  startLiveOrderEngine(order);
}

// ---- TRACK ORDER ----
var trackTimer=null;
function renderTrackOrder() {
  if (!currentOrder) return;
  if (trackTimer) clearTimeout(trackTimer);
  document.getElementById('trackOrderId').textContent =currentOrder.id;
  document.getElementById('trackTableNum').textContent=currentOrder.table;
  updateChefCaption(currentOrder.status);
  var icons=[
    "<svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><circle cx='12' cy='12' r='10'/><path d='M12 6v6l4 2'/></svg>",
    "<svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M18 8h1a4 4 0 010 8h-1'/><path d='M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z'/><line x1='6' y1='1' x2='6' y2='4'/><line x1='10' y1='1' x2='10' y2='4'/><line x1='14' y1='1' x2='14' y2='4'/></svg>",
    "<svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M12 2a5 5 0 015 5c0 3-2 5-5 8-3-3-5-5-5-8a5 5 0 015-5z'/></svg>",
    "<svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><rect x='3' y='8' width='18' height='10' rx='2'/><path d='M6 8V5a3 3 0 016 0v3M12 8V5a3 3 0 016 0v3'/></svg>",
    "<svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M22 11.08V12a10 10 0 11-5.93-9.14'/><polyline points='22 4 12 14.01 9 11.01'/></svg>"
  ];
  var chk="<svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3'><path d='M20 6L9 17l-5-5'/></svg>";
  document.getElementById('trackSteps').innerHTML=ORDER_STATUSES.map(function(label,idx){
    var done=idx<currentOrder.status,cur=idx===currentOrder.status;
    var tbl=(idx===3&&(done||cur))?'<div class="tstep-table">Delivering to <strong>Table '+currentOrder.table+'</strong></div>':'';
    return '<div class="tstep '+(done?'done ':'')+(cur?'current':'')+'">' +
      '<div class="tstep-dot">'+(done?chk:icons[idx])+'</div>' +
      '<div class="tstep-content"><div class="tstep-lbl">'+label+'</div>'+(cur?'<div class="tstep-sub">In progress&hellip;</div>':'')+tbl+'</div>' +
    '</div>';
  }).join('');
  // Status is driven by startLiveOrderEngine — no separate timer here
}

// ---- ADMIN AUTH ----
function adminLogin() {
  var u=document.getElementById('adminUser').value.trim(),
      p=document.getElementById('adminPass').value.trim(),
      er=document.getElementById('loginError');
  if(u===ADMIN_CREDS.username&&p===ADMIN_CREDS.password){er.classList.add('hidden');loadDashboard();showPage('adminDashboard');startAdminAutoRefresh();setAdminHeaderMode(true);}
  else er.classList.remove('hidden');
}
function adminLogout(){stopAdminAutoRefresh();document.getElementById('adminUser').value='';document.getElementById('adminPass').value='';setAdminHeaderMode(false);goToMenu();}

function showAdminSection(sec) {
  document.querySelectorAll('.adm-sec').forEach(function(s){s.classList.add('hidden');});
  document.querySelectorAll('.aa-navbtn').forEach(function(b){b.classList.remove('active');});
  var s=document.getElementById('section-'+sec),b=document.getElementById('sb-'+sec);
  if(s)s.classList.remove('hidden'); if(b)b.classList.add('active');
  if(sec==='dashboard')loadDashboard();
  if(sec==='manageMenu')renderMenuTable();
  if(sec==='orders')renderOrdersTable();
}

function tblChip(n){return '<span class="tbl-chip"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="8" width="18" height="10" rx="2"/><path d="M6 8V5a3 3 0 016 0v3M12 8V5a3 3 0 016 0v3"/></svg> Table '+n+'</span>';}

function loadDashboard(){
  document.getElementById('totalItems').textContent=menuItems.length;
  document.getElementById('totalOrders').textContent=orders.length;
  var rev=0;orders.forEach(function(o){rev+=o.total;});
  document.getElementById('totalRevenue').textContent='₹'+rev;
  var tbody=document.getElementById('dashOrdersBody');
  if(!orders.length){tbody.innerHTML='<tr><td colspan="5" style="text-align:center;color:var(--ink-3);padding:28px">No orders yet</td></tr>';return;}
  tbody.innerHTML=orders.slice().reverse().slice(0,8).map(function(o){
    return '<tr><td><strong>'+o.id+'</strong></td><td>'+tblChip(o.table)+'</td><td>'+o.items.map(function(i){return i.name;}).join(', ')+'</td><td>&#8377;'+o.total+'</td><td><span class="st-badge">'+ORDER_STATUSES[o.status]+'</span></td></tr>';
  }).join('');
}

function renderMenuTable(){
  document.getElementById('menuTableBody').innerHTML=menuItems.map(function(item){
    return '<tr>'+
      '<td><img src="'+item.photo+'" class="tbl-thumb" alt="'+escHtml(item.name)+'" onerror="this.style.display=\'none\'"/></td>'+
      '<td>'+escHtml(item.name)+'</td>'+
      '<td>'+(CAT_LABELS[item.category]||item.category)+'</td>'+
      '<td><span class="type-tag '+item.type+'">'+(item.type==='veg'?'Vegetarian':'Non-Veg')+'</span></td>'+
      '<td>&#8377;'+item.price+'</td>'+
      '<td><button class="btn-tbl-del" onclick="deleteMenuItem('+item.id+')">Remove</button></td>'+
    '</tr>';
  }).join('');
}

function deleteMenuItem(id){if(!confirm('Remove this dish?'))return;menuItems=menuItems.filter(function(i){return i.id!==id;});renderMenuTable();}

function addFoodItem(){
  var name=document.getElementById('newFoodName').value.trim(),
      price=parseInt(document.getElementById('newFoodPrice').value,10),
      cat=document.getElementById('newFoodCategory').value,
      type=document.getElementById('newFoodType').value,
      desc=document.getElementById('newFoodDesc').value.trim(),
      photo=document.getElementById('newFoodImg').value.trim(),
      rec=document.getElementById('newFoodRecommended').checked,
      mo=document.getElementById('newFoodMostOrdered').checked;
  if(!name||!price){alert('Name and price are required.');return;}
  menuItems.push({id:nextId++,name:name,price:price,category:cat,type:type,desc:desc||'Freshly prepared to order.',photo:photo||'',recommended:rec,mostOrdered:mo});
  ['newFoodName','newFoodPrice','newFoodDesc','newFoodImg'].forEach(function(id){document.getElementById(id).value='';});
  document.getElementById('newFoodRecommended').checked=false;
  document.getElementById('newFoodMostOrdered').checked=false;
  var msg=document.getElementById('addFoodMsg');msg.classList.remove('hidden');
  setTimeout(function(){msg.classList.add('hidden');},3000);
}

function renderOrdersTable(){
  var tbody=document.getElementById('ordersTableBody');
  if(!orders.length){tbody.innerHTML='<tr><td colspan="6" style="text-align:center;color:var(--ink-3);padding:28px">No orders yet</td></tr>';return;}
  tbody.innerHTML=orders.slice().reverse().map(function(o){
    var opts=ORDER_STATUSES.map(function(s,i){return '<option value="'+i+'"'+(o.status===i?' selected':'')+'>'+s+'</option>';}).join('');
    return '<tr>'+
      '<td><strong>'+o.id+'</strong></td>'+
      '<td>'+tblChip(o.table)+'</td>'+
      '<td>'+o.items.map(function(i){return escHtml(i.name)+' &times;'+i.qty;}).join(', ')+'</td>'+
      '<td>&#8377;'+o.total+'</td>'+
      '<td><span class="st-badge">'+ORDER_STATUSES[o.status]+'</span></td>'+
      '<td><select class="sel-small" onchange="updateStatus(\''+o.id+'\',this.value)">'+opts+'</select></td>'+
    '</tr>';
  }).join('');
}

function updateStatus(orderId,val){
  orders.forEach(function(o){
    if(o.id===orderId){
      o.status=parseInt(val,10);
      // If this is the active order, sync the live bar
      if(currentOrder && currentOrder.id===orderId){
        currentOrder.status = o.status;
        updateLiveBar(currentOrder);
        if(currentOrder.status===ORDER_STATUSES.length-1){
          if(liveOrderInterval) clearInterval(liveOrderInterval);
          setTimeout(function(){ showDeliveryModal(currentOrder); },800);
        }
      }
    }
  });
  // Refresh visible admin section
  refreshAdminIfVisible();
}

// ============================================================
//  LIVE ORDER ENGINE
//  - Auto-advances order status every ~5s
//  - Updates the sticky bar on the menu page
//  - Auto-refreshes admin panel when visible
//  - Shows delivery popup when status reaches "Completed"
// ============================================================

var liveOrderInterval = null;   // main progression timer
var adminRefreshInterval = null; // admin auto-refresh timer
var STEP_DURATION = 5000;        // ms per stage (5 seconds for demo)

// Step icons for the bar (single-quoted SVGs)
var LOB_ICONS = [
  "<svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5'><circle cx='12' cy='12' r='10'/><path d='M12 6v6l4 2'/></svg>",
  "<svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5'><path d='M18 8h1a4 4 0 010 8h-1'/><path d='M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z'/></svg>",
  "<svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5'><path d='M12 2a5 5 0 015 5c0 3-2 5-5 8-3-3-5-5-5-8a5 5 0 015-5z'/></svg>",
  "<svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5'><rect x='3' y='8' width='18' height='10' rx='2'/><path d='M6 8V5a3 3 0 016 0v3M12 8V5a3 3 0 016 0v3'/></svg>",
  "<svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5'><path d='M20 6L9 17l-5-5'/></svg>"
];
var CHECK_ICON = "<svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3'><path d='M20 6L9 17l-5-5'/></svg>";

// ---- Start the live order engine after order placed ----
function startLiveOrderEngine(order) {
  // Clear any previous timers
  if (liveOrderInterval) clearInterval(liveOrderInterval);

  // Show the sticky bar + FAB
  updateLiveBar(order);
  showTrackFab(order);

  // Auto-advance status
  liveOrderInterval = setInterval(function() {
    if (!order || order.status >= ORDER_STATUSES.length - 1) {
      clearInterval(liveOrderInterval);
      return;
    }
    order.status++;
    updateLiveBar(order);
    updateTrackFab(order);

    // If track page is open, refresh it too
    var tp = document.getElementById('trackPage');
    if (tp && !tp.classList.contains('hidden')) {
      renderTrackOrder();
    }

    // Auto-refresh admin if it's open
    refreshAdminIfVisible();

    // Fire delivery popup when completed
    if (order.status === ORDER_STATUSES.length - 1) {
      clearInterval(liveOrderInterval);
      setTimeout(function() {
        showDeliveryModal(order);
      }, 800);
    }
  }, STEP_DURATION);
}

// ---- updateLiveBar: lob-float removed; only updates FAB ----
function updateLiveBar(order) {
  updateTrackFab(order);
}
function hideLiveBar()    { /* lob-float element removed */ }
function dismissLiveBar() { /* lob-float element removed */ }

// ---- Inline tracker removed from DOM; stub kept for safety ----
function updateInlineTracker(order) {
  return; // element removed
  var tracker = document.getElementById('inlineOrderTracker');
  var iotId   = document.getElementById('iotOrderId');
  var iotSt   = document.getElementById('iotStatus');
  var iotFill = document.getElementById('iotBarFill');
  var iotRows = document.getElementById('iotStepsRow');
  if (!tracker) return;

  tracker.classList.remove('hidden');
  if (iotId) iotId.textContent = order.id;
  if (iotSt) iotSt.textContent = ORDER_STATUSES[order.status];

  // Progress bar fill %
  var pct = (order.status / (ORDER_STATUSES.length - 1)) * 100;
  if (iotFill) iotFill.style.width = pct + '%';

  // Step nodes with check icon for done
  var CHECK_SM = "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3'><path d='M20 6L9 17l-5-5'/></svg>";
  var DOT_ICONS = [
    "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><circle cx='12' cy='12' r='10'/><path d='M12 6v6l4 2'/></svg>",
    "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M18 8h1a4 4 0 010 8h-1'/><path d='M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z'/></svg>",
    "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M12 2a5 5 0 015 5c0 3-2 5-5 8-3-3-5-5-5-8a5 5 0 015-5z'/></svg>",
    "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><rect x='3' y='8' width='18' height='10' rx='2'/><path d='M6 8V5a3 3 0 016 0v3M12 8V5a3 3 0 016 0v3'/></svg>",
    "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M20 6L9 17l-5-5'/></svg>"
  ];
  var SHORT = ['Received','Preparing','Cooking','Serving','Done'];

  if (iotRows) {
    var html = '';
    ORDER_STATUSES.forEach(function(label, idx) {
      var done   = idx < order.status;
      var active = idx === order.status;
      var cls    = done ? 'done' : (active ? 'active' : '');
      html += '<div class="iot-step-node ' + cls + '">' +
        '<div class="iot-step-dot">' + (done ? CHECK_SM : DOT_ICONS[idx]) + '</div>' +
        '<div class="iot-step-name">' + SHORT[idx] + '</div>' +
      '</div>';
    });
    iotRows.innerHTML = html;
  }
}

// ---- Inline tracker removed; stub kept ----
function hideInlineTracker() { /* element removed */ }

// ---- Show delivery popup ----
function showDeliveryModal(order) {
  var modal = document.getElementById('deliveryModal');
  if (!modal) return;

  // Build items list
  var itemsHtml = order.items.map(function(i) {
    return '<div class="delivery-item-row">' +
      '<img src="' + i.photo + '" class="delivery-item-img" onerror="this.style.display=\'none\'"/>' +
      '<span class="delivery-item-name">' + escHtml(i.name) + '</span>' +
      '<span class="delivery-item-qty">&times; ' + i.qty + '</span>' +
    '</div>';
  }).join('');

  var subText = order.items.map(function(i) {
    return i.name + (i.qty > 1 ? ' \u00D7' + i.qty : '');
  }).join(', ') + ' delivered to your table!';

  var subEl   = document.getElementById('deliverySubText');
  var itemsEl = document.getElementById('deliveryItems');
  var tableEl = document.getElementById('deliveryTable');

  if (subEl)   subEl.textContent = subText;
  if (itemsEl) itemsEl.innerHTML = itemsHtml;
  if (tableEl) tableEl.innerHTML =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="10" rx="2"/><path d="M6 8V5a3 3 0 016 0v3M12 8V5a3 3 0 016 0v3"/></svg>' +
    ' Delivered to Table <strong>' + order.table + '</strong>';

  modal.classList.remove('hidden');
  hideLiveBar();
  hideInlineTracker();
  hideTrackFab();
}

function closeDeliveryModal() {
  var modal = document.getElementById('deliveryModal');
  if (modal) {
    modal.style.animation = 'fadeOut .25s ease forwards';
    setTimeout(function() {
      modal.classList.add('hidden');
      modal.style.animation = '';
    }, 260);
  }
  currentOrder = null;
}

// ---- Admin auto-refresh every 4 seconds when admin panel is visible ----
function startAdminAutoRefresh() {
  if (adminRefreshInterval) clearInterval(adminRefreshInterval);
  adminRefreshInterval = setInterval(function() {
    refreshAdminIfVisible();
  }, 4000);
}

function stopAdminAutoRefresh() {
  if (adminRefreshInterval) clearInterval(adminRefreshInterval);
}

function refreshAdminIfVisible() {
  var dash = document.getElementById('adminDashboard');
  if (!dash || dash.classList.contains('hidden')) return;

  // Re-render whichever section is active
  var ordersSection = document.getElementById('section-orders');
  var dashSection   = document.getElementById('section-dashboard');

  if (ordersSection && !ordersSection.classList.contains('hidden')) {
    renderOrdersTable();
  }
  if (dashSection && !dashSection.classList.contains('hidden')) {
    loadDashboard();
  }
}

// ===================================================
//  FLOATING TRACK ORDER FAB
// ===================================================

function showTrackFab(order) {
  var fab = document.getElementById('trackOrderFab');
  if (!fab) return;
  fab.classList.remove('hidden', 'fab-hiding');
  updateTrackFab(order);
}

function updateTrackFab(order) {
  var fab    = document.getElementById('trackOrderFab');
  var status = document.getElementById('fabStatus');
  var fill   = document.getElementById('fabBarFill');
  if (!fab) return;

  if (status) status.textContent = ORDER_STATUSES[order.status];

  // Progress %
  var pct = Math.round((order.status / (ORDER_STATUSES.length - 1)) * 100);
  if (fill) fill.style.width = pct + '%';

  // Only visible on the menu page
  var menuPage = document.getElementById('menuPage');
  if (menuPage && !menuPage.classList.contains('hidden')) {
    fab.classList.remove('hidden');
  } else {
    fab.classList.add('hidden');
  }
}

function hideTrackFab() {
  var fab = document.getElementById('trackOrderFab');
  if (!fab || fab.classList.contains('hidden')) return;
  fab.classList.add('fab-hiding');
  setTimeout(function() { fab.classList.add('hidden'); fab.classList.remove('fab-hiding'); }, 300);
}

// ===================================================
//  ADMIN HEADER MODE — hide/show table + cart for admin
// ===================================================
function setAdminHeaderMode(isAdmin) {
  document.querySelectorAll('.user-only').forEach(function(el) {
    if (isAdmin) el.classList.add('hidden'); else el.classList.remove('hidden');
  });
  document.querySelectorAll('.admin-only').forEach(function(el) {
    if (isAdmin) el.classList.remove('hidden'); else el.classList.add('hidden');
  });
}

// ===================================================
//  ADMIN FROM LANDING PAGE
// ===================================================
function openAdminFromLanding() {
  // Hide landing page and go straight to admin login
  var lp = document.getElementById('landingPage');
  lp.style.transition = 'opacity .35s ease';
  lp.style.opacity = '0';
  setTimeout(function() {
    lp.style.display = 'none';
    var app = document.getElementById('appWrapper');
    app.classList.remove('hidden');
    app.style.opacity = '0';
    app.style.transition = 'opacity .3s ease';
    setTimeout(function() { app.style.opacity = '1'; }, 20);
    // No table needed for admin — go straight to login
    showPage('adminLoginPage');
    setAdminHeaderMode(true);
  }, 350);
}

// ===================================================
//  RETURN TO LANDING PAGE
// ===================================================
function returnToLanding() {
  setAdminHeaderMode(false);
  stopAdminAutoRefresh();
  // Show landing page again
  var app = document.getElementById('appWrapper');
  var lp  = document.getElementById('landingPage');
  app.style.transition = 'opacity .3s ease';
  app.style.opacity = '0';
  setTimeout(function() {
    app.classList.add('hidden');
    app.style.opacity = '1';
    lp.style.display = '';
    lp.style.opacity = '0';
    lp.style.transition = 'opacity .35s ease';
    setTimeout(function() { lp.style.opacity = '1'; }, 20);
  }, 300);
}

// ===================================================
//  CHEF ILLUSTRATION CAPTION
//  Updates the caption text based on order stage
// ===================================================
var CHEF_CAPTIONS = [
  'Our chefs have received your order and are getting ready…',
  'Your dishes are being prepared with care…',
  'Cooking in progress — the kitchen smells amazing!',
  'Almost there — your food is ready to serve!',
  'Order complete — bon appétit!'
];

function updateChefCaption(status) {
  var el = document.getElementById('chefCaptionText');
  if (!el) return;
  var caption = CHEF_CAPTIONS[Math.min(status, CHEF_CAPTIONS.length - 1)];
  // Fade out then in
  el.style.transition = 'opacity .3s ease';
  el.style.opacity = '0';
  setTimeout(function() {
    el.textContent = caption;
    el.style.opacity = '1';
  }, 300);
}