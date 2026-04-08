// --- تحسينات واجهة مستخدم AZRAD ---

// 1. التبديل بين الدخول والإنشاء (انميشن سلس)
function showAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');

    if (tab === 'login') {
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
}

// 2. فحص قوة كلمة المرور (أخضر للأمان)
function checkPassStrength(pass) {
    const bar = document.getElementById('passStrengthIndicator');
    let strength = 0;
    
    if (pass.length > 6) strength += 40;
    if (/[A-Z]/.test(pass)) strength += 30;
    if (/[0-9]/.test(pass)) strength += 30;

    bar.style.width = strength + "%";
    
    if (strength < 50) bar.style.background = "#d32f2f"; // أحمر (ضعيف)
    else if (strength < 80) bar.style.background = "#ffa000"; // برتقالي (متوسط)
    else bar.style.background = "#4caf50"; // أخضر (قوي جداً)
}

// 3. منع ضياع البيانات عند كتابة إيميل غلط
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('invalid', (e) => {
        e.target.classList.add('error-bounce');
        setTimeout(() => e.target.classList.remove('error-bounce'), 500);
    });
});
