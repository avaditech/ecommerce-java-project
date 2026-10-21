const products = [
  {id:1,name:"AirLite Headphones",category:"Electronics",price:89,oldPrice:119,rating:4.8,reviews:241,emoji:"🎧",stock:18,featured:true,newest:8,description:"Lightweight wireless headphones with rich sound, active noise reduction and up to 32 hours of battery life.",tags:["audio","wireless","headphones"]},
  {id:2,name:"Minimal Backpack",category:"Fashion",price:54,oldPrice:72,rating:4.7,reviews:186,emoji:"🎒",stock:24,featured:true,newest:7,description:"A clean everyday backpack with padded laptop storage, water-resistant fabric and smart organization.",tags:["bag","travel","backpack"]},
  {id:3,name:"Smart Watch Pro",category:"Electronics",price:129,oldPrice:159,rating:4.9,reviews:418,emoji:"⌚",stock:12,featured:true,newest:10,description:"Track workouts, notifications, sleep and daily activity with a bright always-on display.",tags:["watch","fitness","smart"]},
  {id:4,name:"Everyday Sneakers",category:"Fashion",price:74,oldPrice:99,rating:4.6,reviews:153,emoji:"👟",stock:31,featured:false,newest:6,description:"Comfort-first sneakers designed for daily commutes, walks and weekends.",tags:["shoes","sneakers","fashion"]},
  {id:5,name:"Ceramic Coffee Set",category:"Home",price:36,oldPrice:45,rating:4.8,reviews:91,emoji:"☕",stock:20,featured:true,newest:5,description:"A minimalist ceramic set for slow mornings, afternoon coffee and elegant hosting.",tags:["coffee","ceramic","kitchen"]},
  {id:6,name:"Desk Lamp",category:"Home",price:42,oldPrice:55,rating:4.5,reviews:78,emoji:"💡",stock:9,featured:false,newest:4,description:"Adjustable warm-to-cool desk lighting with a compact footprint for focused work.",tags:["lamp","office","desk"]},
  {id:7,name:"Classic Sunglasses",category:"Accessories",price:39,oldPrice:59,rating:4.7,reviews:205,emoji:"🕶️",stock:45,featured:false,newest:3,description:"Timeless UV-protective sunglasses with a lightweight frame and versatile shape.",tags:["sunglasses","summer","accessories"]},
  {id:8,name:"Portable Speaker",category:"Electronics",price:65,oldPrice:80,rating:4.8,reviews:317,emoji:"🔊",stock:16,featured:true,newest:9,description:"Compact Bluetooth speaker with punchy sound, splash resistance and all-day battery.",tags:["speaker","bluetooth","audio"]},
  {id:9,name:"Soft Knit Hoodie",category:"Fashion",price:59,oldPrice:79,rating:4.6,reviews:122,emoji:"🧥",stock:27,featured:false,newest:2,description:"A soft everyday layer with a relaxed fit and premium-feel knit.",tags:["hoodie","clothing","winter"]},
  {id:10,name:"Aroma Diffuser",category:"Home",price:48,oldPrice:60,rating:4.4,reviews:65,emoji:"🪴",stock:7,featured:false,newest:1,description:"Quiet room diffuser with a subtle ambient glow and multiple mist settings.",tags:["home","diffuser","decor"]},
  {id:11,name:"Leather Card Holder",category:"Accessories",price:29,oldPrice:39,rating:4.9,reviews:144,emoji:"👛",stock:33,featured:false,newest:11,description:"Slim genuine-leather card holder built for minimal carry and daily durability.",tags:["wallet","leather","cards"]},
  {id:12,name:"Mechanical Keyboard",category:"Electronics",price:149,oldPrice:189,rating:4.9,reviews:392,emoji:"⌨️",stock:8,featured:true,newest:12,description:"Tactile mechanical keyboard with hot-swappable switches, compact layout and RGB lighting.",tags:["keyboard","gaming","office"]}
];

const categories = [
  {name:"Electronics",emoji:"🎧",desc:"Smart tech & audio"},
  {name:"Fashion",emoji:"👟",desc:"Everyday essentials"},
  {name:"Home",emoji:"☕",desc:"Make home better"},
  {name:"Accessories",emoji:"🕶️",desc:"Complete your look"}
];

const state = {
  category:"All", query:"", sort:"featured", maxPrice:500, rating:0, inStock:false, saleOnly:false,
  cart:JSON.parse(localStorage.getItem("shoply-cart")||"[]"),
  wishlist:JSON.parse(localStorage.getItem("shoply-wishlist")||"[]"),
  visible:8
};

const $ = id => document.getElementById(id);
const money = n => `$${n.toFixed(2)}`;

function save(){
  localStorage.setItem("shoply-cart",JSON.stringify(state.cart));
  localStorage.setItem("shoply-wishlist",JSON.stringify(state.wishlist));
  updateBadges(); renderCart(); renderWishlist();
}

function updateBadges(){
  $("cart-count").textContent=state.cart.reduce((s,i)=>s+i.qty,0);
  $("wishlist-count").textContent=state.wishlist.length;
}

function categoriesUI(){
  $("category-grid").innerHTML=categories.map(c=>`
    <button class="category-card" data-category="${c.name}">
      <span class="emoji">${c.emoji}</span><b>${c.name}</b><small>${c.desc}</small>
    </button>`).join("");
  $("category-filters").innerHTML=["All",...categories.map(c=>c.name)].map(c=>
    `<button class="filter-pill ${c===state.category?"active":""}" data-category="${c}">${c}</button>`).join("");
}

function getFiltered(){
  let list=products.filter(p=>{
    const text=(p.name+" "+p.category+" "+p.tags.join(" ")).toLowerCase();
    return (state.category==="All"||p.category===state.category)
      && text.includes(state.query.toLowerCase())
      && p.price<=state.maxPrice
      && p.rating>=state.rating
      && (!state.inStock||p.stock>0)
      && (!state.saleOnly||p.oldPrice>p.price);
  });
  if(state.sort==="price-low") list.sort((a,b)=>a.price-b.price);
  if(state.sort==="price-high") list.sort((a,b)=>b.price-a.price);
  if(state.sort==="rating") list.sort((a,b)=>b.rating-a.rating);
  if(state.sort==="newest") list.sort((a,b)=>b.newest-a.newest);
  if(state.sort==="featured") list.sort((a,b)=>Number(b.featured)-Number(a.featured));
  return list;
}

function productCard(p){
  const liked=state.wishlist.includes(p.id);
  const discount=Math.round((1-p.price/p.oldPrice)*100);
  return `<article class="product-card">
    <div class="product-media"><span>${p.emoji}</span>${discount>0?`<b class="discount-tag">-${discount}%</b>`:""}
      <div class="quick">
        <button class="${liked?"liked":""}" title="Wishlist" data-wish="${p.id}">${liked?"♥":"♡"}</button>
        <button title="Quick view" data-view="${p.id}">⌕</button>
      </div>
    </div>
    <div class="product-body">
      <span class="product-cat">${p.category}</span><h3>${p.name}</h3>
      <div class="rating">★ ${p.rating} <span>(${p.reviews})</span></div>
      <div class="price-line"><div class="price">${money(p.price)} <span class="old-price">${money(p.oldPrice)}</span></div><button class="add-btn" data-add="${p.id}">Add</button></div>
    </div>
  </article>`;
}

function renderProducts(){
  const list=getFiltered(), visible=list.slice(0,state.visible);
  $("product-grid").innerHTML=visible.map(productCard).join("");
  $("results-count").textContent=`${list.length} product${list.length!==1?"s":""}`;
  $("empty-state").classList.toggle("hidden",list.length!==0);
  $("load-more").classList.toggle("hidden",visible.length>=list.length||list.length===0);
  const active=[];
  if(state.category!=="All") active.push(state.category);
  if(state.query) active.push(`"${state.query}"`);
  if(state.maxPrice<500) active.push(`≤ ${money(state.maxPrice)}`);
  if(state.rating) active.push(`${state.rating}+ stars`);
  $("active-filter-text").textContent=active.length?active.join(" • "):"";
  $("filter-active-dot").classList.toggle("active",state.maxPrice<500||state.rating>0||state.inStock||state.saleOnly);
}

function renderCart(){
  const wrap=$("cart-items");
  if(!state.cart.length){wrap.innerHTML=`<div class="drawer-empty"><div style="font-size:45px">🛒</div><p>Your cart is empty.</p></div>`;$("cart-subtotal").textContent="$0.00";return}
  wrap.innerHTML=state.cart.map(item=>{
    const p=products.find(x=>x.id===item.id); if(!p)return "";
    return `<div class="cart-row"><div class="cart-thumb">${p.emoji}</div><div><h4>${p.name}</h4><small>${money(p.price)}</small><div class="qty"><button data-qty="${p.id}" data-delta="-1">−</button><span>${item.qty}</span><button data-qty="${p.id}" data-delta="1">+</button></div></div><button class="remove" data-remove="${p.id}">Remove</button></div>`;
  }).join("");
  const total=state.cart.reduce((s,i)=>s+(products.find(p=>p.id===i.id)?.price||0)*i.qty,0);
  $("cart-subtotal").textContent=money(total);
}

function renderWishlist(){
  const wrap=$("wishlist-items");
  const list=state.wishlist.map(id=>products.find(p=>p.id===id)).filter(Boolean);
  if(!list.length){wrap.innerHTML=`<div class="drawer-empty"><div style="font-size:45px">♡</div><p>Your wishlist is empty.</p></div>`;return}
  wrap.innerHTML=list.map(p=>`<div class="wishlist-row"><div class="wishlist-thumb">${p.emoji}</div><div><b>${p.name}</b><small style="display:block;color:var(--muted)">${money(p.price)}</small></div><button class="add-btn" data-add="${p.id}">Add</button></div>`).join("");
}

function addToCart(id){
  const item=state.cart.find(i=>i.id===id);
  if(item)item.qty++; else state.cart.push({id,qty:1});
  save(); toast("Added to cart","success"); openDrawer("cart-drawer");
}

function changeQty(id,delta){
  const item=state.cart.find(i=>i.id===id); if(!item)return;
  item.qty+=delta;if(item.qty<=0)state.cart=state.cart.filter(i=>i.id!==id);save();
}

function toggleWish(id){
  const i=state.wishlist.indexOf(id);
  if(i>=0){state.wishlist.splice(i,1);toast("Removed from wishlist")}else{state.wishlist.push(id);toast("Saved to wishlist","success")}
  save();renderProducts();
}

function showProduct(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  $("product-modal-content").innerHTML=`<div class="product-detail"><div class="detail-art">${p.emoji}</div><div class="detail-info"><span class="product-cat">${p.category}</span><h2>${p.name}</h2><div class="rating">★ ${p.rating} (${p.reviews} reviews)</div><div class="detail-price">${money(p.price)} <span class="old-price">${money(p.oldPrice)}</span></div><p>${p.description}</p><p><b>${p.stock>0?"In stock":"Out of stock"}</b> • ${p.stock>0?`${p.stock} available`:"Currently unavailable"}</p><button class="btn btn-primary full" data-modal-add="${p.id}" ${p.stock===0?"disabled":""}>Add to cart</button></div></div>`;
  openModal();
}

function openModal(){$("modal-backdrop").classList.add("show");$("product-modal").classList.add("show");document.body.style.overflow="hidden"}
function closeModal(){$("modal-backdrop").classList.remove("show");$("product-modal").classList.remove("show");document.body.style.overflow=""}
function openDrawer(id){closeModal();$("overlay")?.classList.remove("show");$(id).classList.add("open");document.body.classList.add("drawer-open")}
function closeDrawers(){document.querySelectorAll(".drawer").forEach(x=>x.classList.remove("open"));document.body.classList.remove("drawer-open")}

function toast(message,type=""){
  const t=document.createElement("div");t.className=`toast ${type}`;t.textContent=message;$("toast-container").appendChild(t);
  setTimeout(()=>t.remove(),2200);
}

function resetFilters(){
  state.category="All";state.query="";state.sort="featured";state.maxPrice=500;state.rating=0;state.inStock=false;state.saleOnly=false;state.visible=8;
  $("search-input").value="";$("sort-select").value="featured";$("price-range").value=500;$("price-value").textContent="$500";
  document.querySelector('input[name="rating"][value="0"]').checked=true;$("in-stock-only").checked=false;$("sale-only").checked=false;
  categoriesUI();renderProducts();
}

function startCountdown(){
  const target=new Date();target.setDate(target.getDate()+3);target.setHours(23,59,59,999);
  function tick(){let d=Math.max(0,target-new Date());const sec=Math.floor(d/1000);$("days").textContent=String(Math.floor(sec/86400)).padStart(2,"0");$("hours").textContent=String(Math.floor(sec%86400/3600)).padStart(2,"0");$("minutes").textContent=String(Math.floor(sec%3600/60)).padStart(2,"0");$("seconds").textContent=String(sec%60).padStart(2,"0")}
  tick();setInterval(tick,1000);
}

document.addEventListener("click",e=>{
  const cat=e.target.closest("[data-category]");if(cat){state.category=cat.dataset.category;state.visible=8;categoriesUI();renderProducts();location.hash="shop";return}
  const add=e.target.closest("[data-add]");if(add){addToCart(Number(add.dataset.add));return}
  const wish=e.target.closest("[data-wish]");if(wish){toggleWish(Number(wish.dataset.wish));return}
  const view=e.target.closest("[data-view]");if(view){showProduct(Number(view.dataset.view));return}
  const qty=e.target.closest("[data-qty]");if(qty){changeQty(Number(qty.dataset.qty),Number(qty.dataset.delta));return}
  const rem=e.target.closest("[data-remove]");if(rem){state.cart=state.cart.filter(i=>i.id!==Number(rem.dataset.remove));save();return}
  const modalAdd=e.target.closest("[data-modal-add]");if(modalAdd){addToCart(Number(modalAdd.dataset.modalAdd));return}
  if(e.target.matches("[data-close-modal]")||e.target.id==="modal-backdrop")closeModal();
});

$("cart-btn").onclick=()=>openDrawer("cart-drawer");
$("wishlist-btn").onclick=()=>openDrawer("wishlist-drawer");
$("close-cart").onclick=closeDrawers;$("close-wishlist").onclick=closeDrawers;
$("filter-toggle").onclick=()=>$("filter-panel").classList.add("open");
$("close-filter").onclick=()=>$("filter-panel").classList.remove("open");
$("apply-filters").onclick=()=>{$("filter-panel").classList.remove("open");renderProducts();toast("Filters applied","success")};
$("price-range").oninput=e=>{$("price-value").textContent=money(Number(e.target.value));state.maxPrice=Number(e.target.value);renderProducts()};
document.querySelectorAll('input[name="rating"]').forEach(r=>r.onchange=()=>{state.rating=Number(r.value);renderProducts()});
$("in-stock-only").onchange=e=>{state.inStock=e.target.checked;renderProducts()};
$("sale-only").onchange=e=>{state.saleOnly=e.target.checked;renderProducts()};
$("sort-select").onchange=e=>{state.sort=e.target.value;state.visible=8;renderProducts()};
$("clear-filters-btn").onclick=resetFilters;$("reset-search").onclick=resetFilters;
$("load-more").onclick=()=>{state.visible+=4;renderProducts()};
$("view-deals-btn").onclick=()=>location.hash="deals";$("shop-sale-btn").onclick=()=>{state.saleOnly=true;state.visible=8;renderProducts();location.hash="shop"};
$("theme-btn").onclick=()=>{const dark=document.documentElement.dataset.theme==="dark";document.documentElement.dataset.theme=dark?"":"dark";localStorage.setItem("shoply-theme",dark?"light":"dark");$("theme-btn").textContent=dark?"☾":"☀"};
$("mobile-menu-btn").onclick=()=>$("mobile-nav").classList.toggle("open");

$("search-input").addEventListener("input",e=>{
  state.query=e.target.value.trim();state.visible=8;renderProducts();
  const q=state.query.toLowerCase();const matches=q?products.filter(p=>(p.name+" "+p.category).toLowerCase().includes(q)).slice(0,5):[];
  $("search-suggestions").innerHTML=matches.map(p=>`<div class="suggestion" data-view="${p.id}"><span>${p.emoji}</span><div><b>${p.name}</b><small style="display:block;color:var(--muted)">${money(p.price)}</small></div></div>`).join("");
  $("search-suggestions").classList.toggle("show",matches.length>0);
});
document.addEventListener("click",e=>{if(!e.target.closest(".header-search"))$("search-suggestions").classList.remove("show")});

$("newsletter-form").onsubmit=e=>{e.preventDefault();toast(`Thanks! ${$("newsletter-email").value} is subscribed.`,"success");e.target.reset()};
$("checkout-btn").onclick=()=>state.cart.length?toast("Checkout demo ready — connect Stripe/PayPal here.","success"):toast("Your cart is empty.");

const savedTheme=localStorage.getItem("shoply-theme");if(savedTheme==="dark"){$("theme-btn").textContent="☀";document.documentElement.dataset.theme="dark"}
categoriesUI();renderProducts();renderCart();renderWishlist();updateBadges();startCountdown();
