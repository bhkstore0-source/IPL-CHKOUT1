// ══════════════════════════════════════════
//  BHK STORE — script.js
// ══════════════════════════════════════════

const PRODUCT_PRICE      = 12000;
const PRODUCT_NAME       = 'جهاز IPL لإزالة الشعر — 1,000,000 ومضة';
const SCRIPT_URL         = 'https://script.google.com/macros/s/AKfycbyCk3cExZUbSajHtMnSsX-aCe-4xytiGk8ZFhS-ZzkvQ52CTviwgRkRYaZKK6zzLaWFQQ/exec';
const WHATSAPP_NUM       = '213553096569';
const RESTRICTED_WILAYAS = ['52', '56', '57'];

let selectedDelivery = 'home';
let communeData      = {};

// تحميل البلديات من communes.json
fetch('communes.json')
  .then(r => r.json())
  .then(data => { communeData = data; })
  .catch(() => console.warn('communes.json غير موجود'));

// ── اختيار نوع التوصيل
function selectDelivery(type) {
  selectedDelivery = type;
  document.getElementById('homeBox').classList.toggle('active', type === 'home');
  document.getElementById('officeBox').classList.toggle('active', type === 'office');
  updateTotal();
}

// ── تحديث قائمة البلديات
function updateCommunes() {
  const w         = document.getElementById('wilayaSelect').value;
  const cSelect   = document.getElementById('communeSelect');
  const officeBox = document.getElementById('officeBox');

  cSelect.innerHTML = '<option value="">اختر البلدية</option>';
  if (communeData[w]) {
    communeData[w].forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      cSelect.appendChild(opt);
    });
  }

  // إخفاء المكتب للولايات المقيدة
  if (RESTRICTED_WILAYAS.includes(w)) {
    officeBox.style.display = 'none';
    selectDelivery('home');
  } else {
    officeBox.style.display = '';
  }

  updateTotal();
}

// ── تحديث ملخص السعر
function updateTotal() {
  const pp = document.getElementById('productPrice');
  const dp = document.getElementById('deliveryPrice');
  const tp = document.getElementById('totalPrice');
  if (pp) pp.textContent = PRODUCT_PRICE.toLocaleString();
  if (dp) dp.innerHTML   = 'مجانا 🎁';
  if (tp) tp.textContent = PRODUCT_PRICE.toLocaleString();
}

// ── إرسال الطلب
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

  const btn = document.getElementById('submitBtn');
  btn.disabled      = true;
  btn.innerText     = '⏳ جاري إرسال الطلب...';
  btn.style.opacity = '0.6';

 const formData = {
    product:        PRODUCT_NAME,
    name:           name,
    phone:          phone,
    wilaya_num:     wilayaSel.value, // هنا يبعث رقم الولاية (مثلاً 30)
    wilaya_name:    wilayaSel.options[wilayaSel.selectedIndex].text, // هنا يبعث اسم الولاية (مثلاً ورقلة)
    commune:        commune,
    delivery_type:  selectedDelivery === 'home' ? 'توصيل للمنزل' : 'توصيل للمكتب',
    delivery_price: 'مجاناً',
    total:          PRODUCT_PRICE.toLocaleString() + ' دج'
};
  
  fetch(SCRIPT_URL, {
    method:  'POST',
    mode:    'no-cors',
    cache:   'no-cache',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(formData)
  })
  .then(() => {
    const modal = document.getElementById('successModal');
    if (modal) { modal.classList.add('show'); modal.style.display = 'flex'; }
    btn.disabled      = false;
    btn.innerText     = 'تأكيد الطلب';
    btn.style.opacity = '1';
  })
  .catch(() => {
    alert('حدث خطأ، حاول مرة أخرى');
    btn.disabled      = false;
    btn.innerText     = 'تأكيد الطلب';
    btn.style.opacity = '1';
  });
}

// ── إغلاق مودال النجاح + فتح واتساب
function closeSuccessModal() {
  const modal = document.getElementById('successModal');
  if (modal) { modal.classList.remove('show'); modal.style.display = 'none'; }
  const msg = 'شكراً على تعاملكم معنا. يرجى التواصل معنا من أجل أي استفسار بخصوص طلبك الأخير.';
  window.open('https://wa.me/' + WHATSAPP_NUM + '?text=' + encodeURIComponent(msg), '_blank');
  setTimeout(() => location.reload(), 1000);
}

// ── تهيئة الصفحة
window.addEventListener('DOMContentLoaded', () => {
  const ph = document.getElementById('phoneInput');
  if (ph) {
    ph.addEventListener('keypress', e => { if (!/[0-9]/.test(e.key)) e.preventDefault(); });
    ph.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '').substring(0, 10);
    });
  }
  updateTotal();
});
