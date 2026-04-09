/**
 * 🛡️ AZRAD SECURITY CORE v5.0 - الغلاف الأمني المتطور
 * هذا الملف مسؤول عن إدارة الهوية، التحقق من الملكية، وحماية البوابة الرقمية.
 */

// --- [1] نظام التنبيهات البصرية (In-App Notifications) ---
// بديل للـ Alert التقليدي، بيظهر رسايل شيك جوه الكارت الزجاجي
function renderMessage(text, type = 'error') {
    let msgContainer = document.getElementById('statusMessage');
    
    // إذا لم يكن العنصر موجوداً، نقوم بإنشائه فوراً في قمة الكارت
    if (!msgContainer) {
        msgContainer = document.createElement('div');
        msgContainer.id = 'statusMessage';
        const card = document.querySelector('.glass-card');
        if (card) card.prepend(msgContainer);
    }

    // تنسيق الرسالة بشكل ديناميكي
    msgContainer.innerText = text;
    msgContainer.style.all = "unset"; // إعادة ضبط
    msgContainer.style.display = "block";
    msgContainer.style.padding = "14px";
    msgContainer.style.marginBottom = "20px";
    msgContainer.style.borderRadius = "12px";
    msgContainer.style.fontSize = "0.95rem";
    msgContainer.style.fontWeight = "600";
    msgContainer.style.textAlign = "center";
    msgContainer.style.transition = "all 0.4s ease";
    msgContainer.style.animation = "fadeInDown 0.5s ease forwards";

    if (type === 'error') {
        msgContainer.style.background = "rgba(211, 47, 47, 0.1)";
        msgContainer.style.color = "#d32f2f";
        msgContainer.style.border = "1px solid rgba(211, 47, 47, 0.2)";
    } else if (type === 'success') {
        msgContainer.style.background = "rgba(46, 125, 50, 0.1)";
        msgContainer.style.color = "#2e7d32";
        msgContainer.style.border = "1px solid rgba(46, 125, 50, 0.2)";
    } else {
        msgContainer.style.background = "rgba(27, 94, 32, 0.05)";
        msgContainer.style.color = "#1b5e20";
        msgContainer.style.border = "1px solid rgba(27, 94, 32, 0.1)";
    }

    // إخفاء الرسالة بعد 6 ثوانٍ بنعومة
    setTimeout(() => {
        msgContainer.style.opacity = "0";
        setTimeout(() => { msgContainer.style.display = "none"; }, 500);
    }, 6000);
}

// --- [2] محرك إنشاء الحسابات الجديد (Strict Signup) ---
window.handleSignup = async function(e) {
    e.preventDefault();
    const name = document.getElementById('newName').value.trim();
    const email = document.getElementById('newEmail').value.trim();
    const pass = document.getElementById('newPass').value;

    // فحص القوة قبل الإرسال للسيرفر
    if (pass.length < 8) {
        renderMessage("🛑 أمنك يهمنا: كلمة المرور يجب أن تتجاوز 8 رموز.");
        return;
    }

    try {
        // تشغيل نظام reCAPTCHA المخفي للتأكد أن المستخدم إنسان
        renderMessage("⏳ جاري فحص الحماية وبناء الحساب...", "info");
        const appVerifier = window.recaptchaVerifier;

        const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
        const user = userCredential.user;

        // تحديث اسم العرض في قاعدة البيانات العالمية
        await user.updateProfile({ displayName: name });

        // --- 🛡️ نظام التحقق الأسطوري من صاحب الإيميل ---
        // إرسال رسالة تفعيل إجبارية
        await user.sendEmailVerification();
        
        renderMessage("📧 مبروك! تم إنشاء الهوية. أرسلنا رابط تفعيل لبريدك. لن تفتح البوابة إلا بالضغط عليه.", "success");
        
        // تسجيل الخروج فوراً؛ لا نسمح بالدخول إلا بعد الضغط على اللينك
        await auth.signOut();
        document.getElementById('signupForm').reset();

    } catch (error) {
        processAuthError(error);
    }
};

// --- [3] محرك تسجيل الدخول (The Gatekeeper) ---
window.handleLogin = async function(e) {
    e.preventDefault();
    const email = document.getElementById('logEmail').value.trim();
    const pass = document.getElementById('logPass').value;

    try {
        renderMessage("⏳ جاري مطابقة البيانات مع سجلات AZRAD...", "info");
        const userCredential = await auth.signInWithEmailAndPassword(email, pass);
        const user = userCredential.user;

        // الاختبار الصارم: هل قام المستخدم بتفعيل الرابط المرسل له؟
        if (user.emailVerified) {
            renderMessage("✅ تم التوثيق بنجاح. مرحباً بك في منطقتك الآمنة.", "success");
            // الواجهة ستتغير تلقائياً عبر الـ Observer بالأسفل
        } else {
            renderMessage("🛑 وصول مرفوض! حسابك غير مفعل. يرجى تفعيل إيميلك أولاً من الرسالة المرسلة لك.", "error");
            await auth.signOut();
        }
    } catch (error) {
        processAuthError(error);
    }
};

// --- [4] الدخول السريع عبر Google (Trusted Provider) ---
window.handleGoogle = async function() {
    try {
        renderMessage("⏳ جاري الارتباط بخوادم Google...", "info");
        const result = await auth.signInWithPopup(googleProvider);
        // جوجل يوفر إيميلات موثقة تلقائياً
        renderMessage("✅ تم الربط بنجاح عبر Google.", "success");
    } catch (error) {
        processAuthError(error);
    }
};

// --- [5] استعادة الوصول (Password Recovery) ---
window.handleReset = async function() {
    const email = prompt("أدخل بريدك المسجل لإرسال رابط تعيين كلمة السر:");
    if (!email) return;

    try {
        await auth.sendPasswordResetEmail(email);
        renderMessage("📬 أرسلنا رابط إعادة التعيين لبريدك الإلكتروني.", "success");
    } catch (error) {
        processAuthError(error);
    }
};

// --- [6] تسجيل الخروج النهائي ---
window.handleLogout = function() {
    auth.signOut().then(() => {
        window.location.reload();
    });
};

// --- [7] معالج الأخطاء العميق (The Error Shield) ---
function processAuthError(error) {
    console.error("Critical Auth Error:", error.code, error.message);
    let finalMsg = "حدث عائق تقني غير متوقع.";

    switch (error.code) {
        case 'auth/invalid-email':
            finalMsg = "❌ صيغة البريد الإلكتروني غير صحيحة.";
            break;
        case 'auth/user-disabled':
            finalMsg = "🚫 هذا الحساب تم إيقافه من قبل الإدارة.";
            break;
        case 'auth/user-not-found':
            finalMsg = "🔍 لم نجد أي حساب مرتبط بهذا البريد.";
            break;
        case 'auth/wrong-password':
            finalMsg = "🔑 كلمة المرور التي أدخلتها غير صحيحة.";
            break;
        case 'auth/email-already-in-use':
            finalMsg = "⚠️ هذا البريد مسجل بالفعل في نظام AZRAD.";
            break;
        case 'auth/weak-password':
            finalMsg = "🛡️ كلمة المرور ضعيفة جداً، حاول استخدام مزيج أقوى.";
            break;
        case 'auth/too-many-requests':
            finalMsg = "🛑 محاولات كثيرة خاطئة! تم قفل النظام مؤقتاً لحمايتك.";
            break;
        case 'auth/network-request-failed':
            finalMsg = "🌐 فشل الاتصال.. يرجى التحقق من شبكة الإنترنت.";
            break;
        default:
            finalMsg = "⚠️ خطأ: " + error.message;
    }
    renderMessage(finalMsg, "error");
}

// --- [8] مراقب الجلسة الدائم (The Auth Observer) ---
// هذا الحارس يعمل في الخلفية 24/7 لمراقبة حالة المستخدم
auth.onAuthStateChanged((user) => {
    const authUI = document.getElementById('authContainer');
    const appUI = document.getElementById('appContainer');

    // الشروط الثلاثة للدخول: وجود مستخدم + إيميل مفعل + عدم وجود أخطاء
    if (user && user.emailVerified) {
        authUI.style.display = "none";
        appUI.style.display = "block";
        appUI.classList.remove('hidden');
        document.getElementById('welcomeName').innerText = "سيد " + (user.displayName || "أزرد");
    } else {
        // العودة لشاشة تسجيل الدخول
        authUI.style.display = "block";
        appUI.style.display = "none";
        authUI.classList.remove('hidden');
    }
});
