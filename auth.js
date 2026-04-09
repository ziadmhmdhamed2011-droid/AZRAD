// --- محرك الأمان والسيادة الرقمية لـ AZRAD v2.0 ---

/**
 * 1. دالة التحقق من صحة المدخلات (Client-side Validation)
 * تمنع إرسال بيانات فارغة أو غير منطقية لفايربيز لتقليل الأخطاء
 */
const validateInput = (email, password, name = null) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("⚠️ يرجى إدخال بريد إلكتروني صحيح.");
        return false;
    }
    if (password.length < 8) {
        alert("⚠️ كلمة المرور يجب أن تكون 8 أحرف على الأقل.");
        return false;
    }
    if (name !== null && name.trim().length < 3) {
        alert("⚠️ الاسم يجب أن يكون 3 أحرف على الأقل.");
        return false;
    }
    return true;
};

/**
 * 2. نظام إنشاء الحساب (التحقق المزدوج)
 */
window.registerUser = async function(e) {
    e.preventDefault();
    const name = document.getElementById('newName').value;
    const email = document.getElementById('newEmail').value;
    const pass = document.getElementById('newPass').value;

    if (!validateInput(email, pass, name)) return;

    try {
        // التحقق من الروبوت قبل البدء
        const token = await window.recaptchaVerifier.execute();
        
        const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
        const user = userCredential.user;

        // تحديث بروفايل المستخدم
        await user.updateProfile({ displayName: name });

        // إرسال رابط تفعيل الإيميل
        await user.sendEmailVerification();
        
        alert("✅ تم إنشاء الحساب! أرسلنا رابط تحقق إلى: " + email + "\nيرجى تفعيل حسابك لتتمكن من الدخول.");
        
        // تسجيل خروج فوري لمنع الدخول قبل التفعيل
        await auth.signOut();
        location.reload(); 

    } catch (error) {
        handleAuthErrors(error);
    }
};

/**
 * 3. نظام تسجيل الدخول (بوابة العبور الآمنة)
 */
window.loginUser = async function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;

    if (!validateInput(email, pass)) return;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, pass);
        const user = userCredential.user;

        // التحقق القاتل: هل فعل الإيميل؟
        if (!user.emailVerified) {
            alert("🛑 وصول مرفوض: يرجى تفعيل حسابك من البريد الإلكتروني أولاً.");
            await auth.signOut();
            return;
        }

        console.log("تم الدخول بنجاح: " + user.displayName);
        // التوجيه يتم تلقائياً عبر AuthObserver
    } catch (error) {
        handleAuthErrors(error);
    }
};

/**
 * 4. نظام تسجيل الخروج (تأمين الجلسة)
 */
window.initSignOut = function() {
    if (confirm("هل أنت متأكد من تسجيل الخروج من AZRAD؟")) {
        auth.signOut().then(() => {
            console.log("User Signed Out");
            alert("تم تسجيل الخروج بأمان.");
            location.reload();
        }).catch((error) => {
            console.error("Logout Error: ", error);
        });
    }
};

/**
 * 5. الدخول بواسطة جوجل (التحقق التلقائي)
 */
window.initSignInWithGoogle = async function() {
    try {
        const result = await auth.signInWithPopup(googleProvider);
        const user = result.user;
        // جوجل لا يحتاج تحقق إضافي لأنه موثق سلفاً
        console.log("Google Auth Success: " + user.displayName);
    } catch (error) {
        handleAuthErrors(error);
    }
};

/**
 * 6. معالج الأخطاء الشامل (Error Dictionary)
 */
function handleAuthErrors(error) {
    console.error("Auth Error Code:", error.code);
    let message = "حدث خطأ غير متوقع.";

    switch (error.code) {
        case 'auth/user-not-found':
            message = "❌ هذا الحساب غير موجود في سجلاتنا.";
            break;
        case 'auth/wrong-password':
            message = "❌ كلمة المرور التي أدخلتها غير صحيحة.";
            break;
        case 'auth/email-already-in-use':
            message = "❌ هذا البريد الإلكتروني مسجل بالفعل بحساب آخر.";
            break;
        case 'auth/too-many-requests':
            message = "🛑 تم حظرك مؤقتاً بسبب محاولات كثيرة خاطئة. حاول لاحقاً.";
            break;
        case 'auth/network-request-failed':
            message = "🌐 خطأ في الاتصال بالإنترنت. تحقق من شبكتك.";
            break;
        case 'auth/popup-closed-by-user':
            message = "⚠️ تم إغلاق نافذة تسجيل الدخول قبل الإكمال.";
            break;
        default:
            message = error.message;
    }
    alert(message);
}

/**
 * 7. مراقب الحالة الدائم (The Observer)
 */
auth.onAuthStateChanged((user) => {
    const authBox = document.getElementById('authContainer');
    const appBox = document.getElementById('appContainer');

    if (user && user.emailVerified) {
        // المستخدم مفعل وجاهز
        authBox.style.display = 'none';
        appBox.style.display = 'block';
        document.getElementById('userNamePlaceholder').innerText = user.displayName || "مستخدم أزرد";
        
        // حفظ آخر ظهور في الداتابيز (إضافة اختيارية)
        db.collection("users").doc(user.uid).set({
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

    } else {
        // غير مسجل دخول أو لم يفعل الإيميل
        authBox.style.display = 'block';
        appBox.style.display = 'none';
    }
});
