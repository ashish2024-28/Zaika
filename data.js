// ============================================
//  ZAIKA — Data Store (XML parsed to JS)
// ============================================

// NOTE: <photo> used instead of <img> because DOMParser/application/xml
//       treats <img> as a void element and loses the text content.
const XML_DATA = `<?xml version="1.0" encoding="UTF-8"?>
<zaika>
  <menu>
    <item id="1" category="starters" type="veg" recommended="true" mostOrdered="false">
      <n>Paneer Tikka</n><price>180</price>
      <desc>Grilled cottage cheese marinated in spiced yogurt, charred in tandoor</desc>
      <photo>https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&amp;q=80</photo>
    </item>
    <item id="2" category="starters" type="nonveg" recommended="false" mostOrdered="true">
      <n>Chicken Tikka</n><price>220</price>
      <desc>Tender chicken pieces char-grilled with aromatic Indian spices</desc>
      <photo>https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=400&amp;q=80</photo>
    </item>
    <item id="3" category="starters" type="veg" recommended="false" mostOrdered="false">
      <n>Veg Spring Rolls</n><price>140</price>
      <desc>Crispy golden rolls filled with seasoned fresh vegetables</desc>
      <photo>https://images.unsplash.com/photo-1544025162-d76694265947?w=400&amp;q=80</photo>
    </item>
    <item id="4" category="starters" type="nonveg" recommended="true" mostOrdered="false">
      <n>Seekh Kebab</n><price>260</price>
      <desc>Minced mutton kebabs on skewers with ginger, garlic and spices</desc>
      <photo>https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&amp;q=80</photo>
    </item>
    <item id="5" category="main-course" type="veg" recommended="true" mostOrdered="true">
      <n>Paneer Butter Masala</n><price>220</price>
      <desc>Soft paneer in rich tomato-butter gravy with cream and kasuri methi</desc>
      <photo>https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&amp;q=80</photo>
    </item>
    <item id="6" category="main-course" type="nonveg" recommended="true" mostOrdered="true">
      <n>Chicken Biryani</n><price>260</price>
      <desc>Aromatic basmati layered with spiced chicken, saffron and caramelised onions</desc>
      <photo>https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&amp;q=80</photo>
    </item>
    <item id="7" category="main-course" type="veg" recommended="false" mostOrdered="true">
      <n>Dal Makhani</n><price>190</price>
      <desc>Slow-cooked black lentils in velvety butter and tomato sauce</desc>
      <photo>https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&amp;q=80</photo>
    </item>
    <item id="8" category="main-course" type="veg" recommended="false" mostOrdered="true">
      <n>Butter Naan</n><price>50</price>
      <desc>Soft tandoor-baked flatbread brushed generously with salted butter</desc>
      <photo>https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&amp;q=80</photo>
    </item>
    <item id="9" category="main-course" type="nonveg" recommended="true" mostOrdered="false">
      <n>Mutton Rogan Josh</n><price>320</price>
      <desc>Kashmiri-style slow-cooked mutton in bold spiced aromatic gravy</desc>
      <photo>https://images.unsplash.com/photo-1545247181-516773cae754?w=400&amp;q=80</photo>
    </item>
    <item id="10" category="main-course" type="veg" recommended="false" mostOrdered="false">
      <n>Veg Biryani</n><price>200</price>
      <desc>Fragrant basmati with seasonal vegetables and whole spices</desc>
      <photo>https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&amp;q=80</photo>
    </item>
    <item id="11" category="drinks" type="veg" recommended="false" mostOrdered="true">
      <n>Cold Coffee</n><price>120</price>
      <desc>Chilled espresso blended with milk, ice cream and chocolate syrup</desc>
      <photo>https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&amp;q=80</photo>
    </item>
    <item id="12" category="drinks" type="veg" recommended="true" mostOrdered="false">
      <n>Mango Lassi</n><price>100</price>
      <desc>Alphonso mango blended with creamy yogurt, lightly sweetened</desc>
      <photo>https://images.unsplash.com/photo-1605197161470-5d4f3b75f684?w=400&amp;q=80</photo>
    </item>
    <item id="13" category="drinks" type="veg" recommended="false" mostOrdered="false">
      <n>Masala Chai</n><price>60</price>
      <desc>Spiced Indian tea with ginger, cardamom and fresh milk</desc>
      <photo>https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=400&amp;q=80</photo>
    </item>
    <item id="14" category="drinks" type="veg" recommended="false" mostOrdered="false">
      <n>Fresh Lime Soda</n><price>80</price>
      <desc>Freshly squeezed lime with sparkling water, mint and a pinch of salt</desc>
      <photo>https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&amp;q=80</photo>
    </item>
    <item id="15" category="desserts" type="veg" recommended="true" mostOrdered="true">
      <n>Gulab Jamun</n><price>80</price>
      <desc>Soft milk dumplings soaked in rose-cardamom syrup, served warm</desc>
      <photo>https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&amp;q=80</photo>
    </item>
    <item id="16" category="desserts" type="veg" recommended="false" mostOrdered="false">
      <n>Rasgulla</n><price>70</price>
      <desc>Spongy cottage cheese balls in light sugar syrup, served chilled</desc>
      <photo>https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&amp;q=80</photo>
    </item>
    <item id="17" category="desserts" type="veg" recommended="true" mostOrdered="false">
      <n>Chocolate Brownie</n><price>150</price>
      <desc>Fudgy dark chocolate brownie served with vanilla bean ice cream</desc>
      <photo>https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&amp;q=80</photo>
    </item>
    <item id="18" category="snacks" type="veg" recommended="false" mostOrdered="true">
      <n>Samosa</n><price>60</price>
      <desc>Crispy pastry filled with spiced potatoes, served with tamarind chutney</desc>
      <photo>https://images.unsplash.com/photo-1601050690117-94f5f7a7b3fe?w=400&amp;q=80</photo>
    </item>
    <item id="19" category="snacks" type="nonveg" recommended="false" mostOrdered="false">
      <n>Chicken Sandwich</n><price>160</price>
      <desc>Grilled chicken with fresh lettuce, tomato and herb mayo on toasted bread</desc>
      <photo>https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=400&amp;q=80</photo>
    </item>
    <item id="20" category="snacks" type="veg" recommended="false" mostOrdered="true">
      <n>Masala Fries</n><price>100</price>
      <desc>Golden fries tossed in signature Indian spice blend with chaat masala</desc>
      <photo>https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&amp;q=80</photo>
    </item>
  </menu>
</zaika>`;

// ---- App State ----
var menuItems    = [];
var cart         = [];
var orders       = [];
var currentOrder = null;
var nextId       = 21;
var dietFilter   = 'all';
var catFilter    = 'all';
var selectedTable = null;

var ADMIN_CREDS    = { username: 'admin', password: 'admin123' };
var ORDER_STATUSES = ['Order Received','Preparing Food','Cooking','Ready to Serve','Completed'];
var CAT_LABELS     = { all:'All', starters:'Starters', 'main-course':'Main Course', drinks:'Drinks', desserts:'Desserts', snacks:'Snacks' };
var TABLES         = [1,2,3,4,5,6,7,8,9,10,11,12];

// SVG category icons — contextual, single-quoted, safe for innerHTML
var CAT_ICONS = {
  // All: four-quadrant grid of food items
  all: "<svg width='17' height='17' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z'/></svg>",
  // Starters: small bowl with steam — appetiser feel
  starters: "<svg width='17' height='17' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M2 19h20'/><path d='M4 19c0-4 3-7 8-7s8 3 8 7'/><path d='M8 6c0-1 1-2 1-3M12 5c0-1 1-2 1-3M16 6c0-1 1-2 1-3'/></svg>",
  // Main course: plate with fork and knife
  'main-course': "<svg width='17' height='17' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><circle cx='11' cy='12' r='7'/><path d='M20 12h2'/><path d='M18.5 7.5l1.5-1.5'/><path d='M18.5 16.5l1.5 1.5'/></svg>",
  // Drinks: tall mocktail glass with straw
  drinks: "<svg width='17' height='17' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M7 2h10l-2 7H9L7 2z'/><path d='M9 9c0 5.5 2 9 3 9s3-3.5 3-9'/><line x1='14' y1='5' x2='17' y2='2'/><path d='M12 18v3M9 21h6'/></svg>",
  // Desserts: ice cream cone
  desserts: "<svg width='17' height='17' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M12 22l-4-8h8l-4 8z'/><path d='M8 14a4 4 0 008 0'/><circle cx='12' cy='10' r='4'/></svg>",
  // Snacks: french fries box
  snacks: "<svg width='17' height='17' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M4 11h16l-2 9H6L4 11z'/><path d='M8 11V6a1 1 0 012 0v5M12 11V4a1 1 0 012 0v7M16 11V6a1 1 0 012 0v5'/></svg>"
};

// ---- XML Parser ----
// Uses <photo> tag instead of <img> because DOMParser treats <img> as void
function parseXML() {
  var parser = new DOMParser();
  var doc    = parser.parseFromString(XML_DATA, 'application/xml');
  // Check for parse error
  var parseError = doc.querySelector('parsererror');
  if (parseError) {
    console.error('XML parse error:', parseError.textContent);
    return;
  }
  menuItems = [];
  var items = doc.querySelectorAll('item');
  items.forEach(function(el) {
    var nEl     = el.querySelector('n');
    var priceEl = el.querySelector('price');
    var descEl  = el.querySelector('desc');
    var photoEl = el.querySelector('photo');
    menuItems.push({
      id:          parseInt(el.getAttribute('id'), 10),
      category:    el.getAttribute('category') || '',
      type:        el.getAttribute('type')      || 'veg',
      recommended: el.getAttribute('recommended') === 'true',
      mostOrdered: el.getAttribute('mostOrdered') === 'true',
      name:        nEl     ? nEl.textContent.trim()     : '',
      price:       priceEl ? parseInt(priceEl.textContent, 10) : 0,
      desc:        descEl  ? descEl.textContent.trim()  : '',
      photo:       photoEl ? photoEl.textContent.trim() : ''
    });
  });
  console.log('Parsed', menuItems.length, 'menu items. Sample:', menuItems[0]);
}

// ---- URL table detection (?table=N) ----
function getTableFromURL() {
  try {
    var params = new URLSearchParams(window.location.search);
    var t = parseInt(params.get('table'), 10);
    if (!isNaN(t) && t >= 1 && t <= 12) return t;
  } catch(e) {}
  return null;
}