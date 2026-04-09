/**
 * 🎨 AZRAD INTERACTIVE ENGINE v6.0
 * محرك التفاعل البصري، نظام الإعلانات، وفحص جودة البيانات لحظياً.
 */

// --- [1] نظام الإعلان التعريفي (Intro Slider Logic) ---
let currentSlideIndex = 1;

window.currentSlide = function(n) {
    showSlides(currentSlideIndex = n);
};

function showSlides(n) {
    let i;
    const slides = document.getElementsByClassName("intro-slide");
    const dots = document.getElementsByClassName("dot");
    
    if (n > slides.length) { currentSlideIndex = 1 }
    if (n < 1) { currentSlideIndex = slides.length }
    
    // إخفاء جميع الشرائح
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
        slides[i].classList.remove("active");
    }
    
    // إزالة الحالة النشطة من النقاط
    for (i = 0; i < dots.length; i++) {
        dots[i].classList.remove("active");
    }
    
    // إظهار الشريحة المطلوبة
    slides[currentSlideIndex - 1].style.display = "block";
    slides[currentSlideIndex - 1].classList.add("active");
    dots[currentSlideIndex - 1].classList.add("active");
}

window.closeIntro = function() {
    const overlay = document.getElementById('introOverlay');
    overlay.style.opacity = '0';
    overlay.style.transition = '0.5s';
    setTimeout(() => {
        overlay.style.display = 'none';
        // حفظ في ذاكرة المتصفح أن المستخدم شاهد الإعلان
        localStorage.setItem('azrad_intro_viewed', 'true');
    }, 500);
};

// تشغيل الإعلان تلقائياً عند أول زيارة فقط
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('azrad_intro_viewed')) {
        document.getElementById('introOverlay').style.display = 'flex';
        showSlides(currentSlideIndex);
    } else {
        document.getElementById('introOverlay').style.display = 'none';
    }
});

// --- [2] نظام تبديل التبويبات (Auth Tab Switcher) ---
window.switchTab = function(mode) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');

    if (mode === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        loginTab.classList.remove('active');
        signupTab.classList.add('active');
    }
};

// --- [3] محرك قياس قوة كلمة المرور (Security Meter) ---
window.checkPassStrength = function(pass) {
    const bar = document.getElementById('strengthBar');
    let strength = 0;

    if (pass.length >= 8) strength += 25;
    if (/[A-Z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 25;

    bar.style.width = strength + "%";

    // تغيير الألوان بناءً على القوة
    if (strength <= 25) {
        bar.style.background = "#d32f2f"; // أحمر
    } else if (strength <= 50) {
        bar.style.background = "#f57c00"; // برتقالي
    } else if (strength <= 75) {
        bar.style.background = "#fbc02d"; // أصفر
    } else {
        bar.style.background = "#2e7d32"; // أخضر ملكي
    }
};

// --- [4] تأثيرات بصرية عند التركيز على المدخلات ---
document.querySelectorAll('.input-group input').forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.style.borderColor = "#1b5e20";
        input.parentElement.style.transform = "scale(1.02)";
        input.parentElement.style.transition = "0.3s";
    });
    
    input.addEventListener('blur', () => {
        input.parentElement.style.borderColor = "#edf0ee";
        input.parentElement.style.transform = "scale(1)";
    });
});

// --- [5] نظام معالجة الأزرار أثناء التحميل (Loading States) ---
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function() {
        const btn = this.querySelector('.btn-primary');
        if (btn) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التوثيق...';
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.8';
            
            // إعادة الزر لحالته لو فشل الطلب أو تأخر
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.pointerEvents = 'all';
                btn.style.opacity = '1';
            }, 5000);
        }
    });
});

/**
 * 💡 ملاحظة ختامية للمطور:
 * هذا الملف يضمن أن تطبيق AZRAD ليس مجرد أكواد، بل تجربة مستخدم فخمة.
 * تم دمج الأنيميشن مع الحماية لضمان تجربة سلسة تليق بمنصة مساعدات.
 */
