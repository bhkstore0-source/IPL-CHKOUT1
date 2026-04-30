// ══════════════════════════════════════════
//  BHK STORE — script.js
// ══════════════════════════════════════════

const PRODUCT_PRICE      = 12000;
const PRODUCT_NAME       = 'جهاز IPL لإزالة الشعر — 1,000,000 ومضة';
const SCRIPT_URL         = 'https://script.google.com/macros/s/AKfycby9k67Izvu5mXKwS10hhuiiKZy_yIY-okcPWM-URLC7m5yWGjicKr7XimKbd_X0evKtxQ/exec';
const WHATSAPP_NUM       = '213553096569';
const RESTRICTED_WILAYAS = ['52', '56', '57'];

let selectedDelivery = 'home';
let communeData      = {};

fetch('communes.json')
  .then(r => r.json())
  .then(data => { communeData = data; });

// ══════════════════════════════════════════
function selectDelivery(type) {
  selectedDelivery = type;
  document.getElementById('homeBox').classList.toggle('active',   type === 'home');
  document.getElementById('officeBox').classList.toggle('active', type === 'office');
  updateTotal();
}

// ══════════════════════════════════════════
function updateCommunes() {
  const w         = document.getElementById('wilayaSelect').value;
  const cSelect   = document.getElementById('communeSelect');
  const officeBox = document.getElementById('officeBox');

  cSelect.innerHTML = '<option value="">اختر البلدية</option>';
  (communeData[w] || []).forEach(name => {
    const o = document.createElement('option');
    o.value = name; o.textContent = name;
    cSelect.appendChild(o);
  });

  if (RESTRICTED_WILAYAS.includes(w)) {
    officeBox.style.display = 'none';
    selectDelivery('home');
  } else {
    officeBox.style.display = '';
  }
  updateTotal();
}

// ══════════════════════════════════════════
function updateTotal() {
  const pp = document.getElementById('productPrice');
  const dp = document.getElementById('deliveryPrice');
  const tp = document.getElementById('totalPrice');
  const hint = document.getElementById('deliveryHint');

  if (pp) pp.textContent = PRODUCT_PRICE.toLocaleString();
  if (dp) { dp.innerHTML = 'مجانا 🎁'; dp.style.color = '#27ae60'; }
  if (tp) tp.textContent = PRODUCT_PRICE.toLocaleString() + ' دج';
  if (hint) hint.classList.remove('visible');
}

// ══════════════════════════════════════════
function finalSubmit() {
  const name      = document.getElementById('cust_name').value.trim();
  const phone     = document.getElementById('phoneInput').value.trim();
  const wilayaSel = document.getElementById('wilayaSelect');
  const commune   = document.getElementById('communeSelect').value;
  const regex     = /^0[567][0-9]{8}$/;

  if (!name)              return alert('اكتب الاسم من فضلك');
  if (!regex.test(phone)) return alert('رقم الهاتف يجب أن يكون 10 أرقام ويبدأ بـ 05 أو 06 أو 07');
  if (!wilayaSel.value)   return alert('إختر الولاية من فضلك');
  if (!commune)           return alert('إختر البلدية من فضلك');

  const fullWilaya = wilayaSel.options[wilayaSel.selectedIndex].text;
  const wParts     = fullWilaya.split('-');
  const wilayaNum  = wParts[0] ? String(parseInt(wParts[0].trim(), 10)) : wilayaSel.value;
  const wilayaName = wParts[1] ? wParts[1].trim() : fullWilaya;

  const btn = document.getElementById('submitBtn');
  btn.disabled      = true;
  btn.innerText     = '⏳ جاري إرسال الطلب...';
  btn.style.opacity = '0.6';

  // ✅ التوصيل مجانا — delivery_price = 0
  const payload = JSON.stringify({
    product:        PRODUCT_NAME,
    name:           name,
    phone:          phone,
    wilaya_num:     wilayaNum,
    wilaya_name:    wilayaName,
    commune:        commune,
    delivery_type:  selectedDelivery === 'home' ? 'توصيل للمنزل' : 'توصيل للمكتب',
    delivery_price: '0',
    total:          String(PRODUCT_PRICE)
  });

  const xhr = new XMLHttpRequest();
  xhr.open('POST', SCRIPT_URL, true);
  xhr.setRequestHeader('Content-Type', 'text/plain;charset=utf-8');

  const onSuccess = () => {
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Purchase', {
        value:        PRODUCT_PRICE,
        currency:     'DZD',
        content_name: PRODUCT_NAME
      });
    }
    const modal = document.getElementById('successModal');
    if (modal) { modal.classList.add('show'); modal.style.display = 'flex'; }
    btn.disabled      = false;
    btn.innerText     = 'تأكيد الطلب';
    btn.style.opacity = '1';
  };

  xhr.onload  = onSuccess;
  xhr.onerror = onSuccess;
  xhr.send(payload);
}

// ══════════════════════════════════════════
function closeSuccessModal() {
  const modal = document.getElementById('successModal');
  if (modal) { modal.classList.remove('show'); modal.style.display = 'none'; }
  const msg = 'شكراً على تعاملكم معنا. يرجى التواصل معنا من أجل أي استفسار بخصوص طلبك الأخير.';
  window.open('https://wa.me/' + WHATSAPP_NUM + '?text=' + encodeURIComponent(msg), '_blank');
  setTimeout(() => location.reload(), 1000);
}

// ══════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  updateTotal();

  const ph = document.getElementById('phoneInput');
  if (ph) {
    ph.addEventListener('keypress', e => { if (!/[0-9]/.test(e.key)) e.preventDefault(); });
    ph.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '').substring(0, 10);
    });
  }

  document.getElementById('wilayaSelect').addEventListener('change', updateCommunes);
});
