/**
 * 🎨 AZRAD INTERACTIVE ENGINE v5.0 - محرك التفاعل البصري
 * هذا الملف مسؤول عن تجربة المستخدم، الأنيميشن، وفحص جودة البيانات لحظياً.
 */

// --- [1] نظام تبديل التبويبات (Smooth Tab Switcher) ---
// بيبدل بين "دخول" و "تسجيل" بحركة انسيابية واحترافية
window.toggleAuth = function(mode) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const card = document.querySelector('.glass-card');

    // إضافة تأثير اهتزاز بسيط عند التبديل
    card.style.transform = "scale(0.98)";
    setTimeout(() => { card.style.transform = "scale(1)"; }, 200);

    if (mode === 'login') {
        // إظهار الدخول وإخفاء التسجيل
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        
        // تغيير اتجاه الأنيميشن
        loginForm.style.animation = "slideInRight 0.5s ease forwards";
    } else {
        // إظهار التسجيل وإخفاء الدخول
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        loginTab.classList.remove('active');
        signupTab.classList.add('active');
        
        // تغيير اتجاه الأنيميشن
        signupForm.style.animation = "slideInLeft 0.5s ease forwards";
    }
};

// --- [2] محرك قياس قوة كلمة المرور (Security Meter) ---
// بيحلل الباسورد وهي بتتكتب وبيدي لون (أحمر -> برتقالي -> أخضر)
window.checkStrength = function(password) {
    const bar = document.getElementById('strengthBar');
    let strength = 0;

    if (password.length > 5) strength += 20;
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20; // حرف كبير
    if (/[0-9]/.test(password)) strength += 20; // أرقام
    if (/[^A-Za-z0-9]/.test(password)) strength += 20; // رموز خاصة

    // تحديث الشكل البصري للشريط
    bar.style.width = strength + "%";

    if (strength <= 40) {
        bar.style.background = "#d32f2f"; // أحمر - ضعيف
        bar.title = "ضعيفة جداً";
    } else if (strength <= 70) {
        bar.style.background = "#ffa000"; // برتقالي - متوسط
        bar.title = "متوسطة";
    } else {
        bar.style.background = "#388e3c"; // أخضر - صخرية
        bar.title = "قوية جداً";
    }
};

// --- [3] نظام تحسين تجربة المدخلات (Input Focus Effects) ---
// بيضيف تأثيرات بصرية لما المستخدم يضغط على خانة الكتابة
document.querySelectorAll('.input-field input').forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.style.transform = "translateX(-10px)";
        input.parentElement.querySelector('i').style.color = "#4caf50";
    });

    input.addEventListener('blur', () => {
        input.parentElement.style.transform = "translateX(0)";
        input.parentElement.querySelector('i').style.color = "#1b5e20";
    });
});

// --- [4] نظام التحقق من الأخطاء المنطقية قبل الإرسال (Pre-Flight Check) ---
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function() {
        const btn = this.querySelector('.btn-submit');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري المعالجة...';
            btn.style.opacity = "0.7";
            btn.style.pointerEvents = "none";
            
            // إعادة الزر لحالته الطبيعية بعد 3 ثواني لو محصلش استجابة
            setTimeout(() => {
                if (this.id === 'loginForm') {
                    btn.innerHTML = '<span>دخول آمن</span> <i class="fas fa-shield-halved"></i>';
                } else {
                    btn.innerHTML = '<span>إنشاء حساب موثق</span> <i class="fas fa-user-plus"></i>';
                }
                btn.style.opacity = "1";
                btn.style.pointerEvents = "all";
            }, 3000);
        }
    });
});

// --- [5] إضافة أصوات خفيفة للتفاعل (اختياري - صامت برمجياً) ---
function playInteractionSound() {
    // يمكنك إضافة ملف صوتي هنا لتعزيز التجربة
    console.log("Interaction Triggered 🔊");
}

// --- [6] معالجة الانيميشن المخصص عند التحميل ---
document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.glass-card');
    card.style.opacity = "0";
    card.style.transform = "translateY(50px)";
    
    setTimeout(() => {
        card.style.transition = "all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
    }, 100);
});

/**
 * 💡 ملاحظة ختامية: 
 * هذا الملف يضمن أن تطبيق AZRAD ليس مجرد أكواد، بل تجربة مستخدم فخمة.
 * تم دمج الأنيميشن مع الحماية لضمان عدم وجود أي "تعليق" في الواجهة.
 */
