// --- محرك الأمان والتحقق لتطبيق AZRAD ---

// 1. إنشاء الحساب مع إرسال رابط تحقق للإيميل (Verification)
document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newEmail').value;
    const pass = document.getElementById('newPass').value;
    const name = document.getElementById('newName').value;

    // تفعيل حماية الروبوت
    const appVerifier = window.recaptchaVerifier;

    auth.createUserWithEmailAndPassword(email, pass)
    .then((userCredential) => {
        const user = userCredential.user;
        // تحديث اسم المستخدم في سجلات فايربيز
        user.updateProfile({ displayName: name });
        
        // --- السحر هنا: إرسال رابط التحقق للإيميل ---
        user.sendEmailVerification().then(() => {
            alert("تم إنشاء الحساب بنجاح! 📧 أرسلنا رابط تحقق لبريدك الإلكتروني. يرجى تفعيله قبل تسجيل الدخول.");
            auth.signOut(); // نخرجه عشان ميدخلش إلا لما يفعل
        });
    })
    .catch((error) => alert("خطأ في الإنشاء: " + error.message));
});

// 2. تسجيل الدخول (مع شرط إن الإيميل يكون متفعل)
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;

    auth.signInWithEmailAndPassword(email, pass)
    .then((userCredential) => {
        const user = userCredential.user;
        
        // فحص: هل المستخدم ضغط على الرابط في إيميله؟
        if (user.emailVerified) {
            console.log("تم الدخول بنجاح! الإيميل موثق ✅");
            // هنا التطبيق هيفتح أوتوماتيك
        } else {
            alert("الحساب غير مفعل! ⚠️ يرجى الضغط على الرابط المرسل لبريدك الإلكتروني أولاً.");
            auth.signOut();
        }
    })
    .catch((error) => alert("خطأ في الدخول: " + error.message));
});

// 3. دالة استعادة كلمة المرور (عشان نصلح الـ Error اللي ظهرلك)
window.resetPassword = function() {
    const email = prompt("أدخل بريدك الإلكتروني لإرسال رابط تعيين كلمة مرور جديدة:");
    if (email) {
        auth.sendPasswordResetEmail(email)
        .then(() => alert("تم إرسال الرابط! تفقد بريدك الوارد."))
        .catch((error) => alert(error.message));
    }
};

// 4. الدخول بواسطة جوجل (موثق تلقائياً)
window.initSignInWithGoogle = function() {
    auth.signInWithPopup(googleProvider)
    .then((result) => {
        console.log("تم الدخول بجوجل بنجاح");
    }).catch((error) => alert(error.message));
};

// 5. مراقب حالة المستخدم (Auth Observer)
auth.onAuthStateChanged((user) => {
    const authBox = document.getElementById('authContainer');
    const appBox = document.getElementById('appContainer');

    // لا يفتح التطبيق إلا لو المستخدم موجود "ومفعل الإيميل"
    if (user && user.emailVerified) {
        authBox.classList.add('hidden');
        appBox.classList.remove('hidden');
        document.getElementById('userNamePlaceholder').innerText = user.displayName || "مستخدم أزرد";
    } else {
        authBox.classList.remove('hidden');
        appBox.classList.add('hidden');
    }
});
