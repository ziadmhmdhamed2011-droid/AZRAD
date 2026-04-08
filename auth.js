// --- نظام إدارة الهوية الرقمية لـ AZRAD ---

// 1. إنشاء حساب جديد بالإيميل والباسورد
document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newEmail').value;
    const pass = document.getElementById('newPass').value;
    const name = document.getElementById('newName').value;

    auth.createUserWithEmailAndPassword(email, pass)
    .then((userCredential) => {
        return userCredential.user.updateProfile({ displayName: name });
    })
    .then(() => {
        auth.currentUser.sendEmailVerification();
        alert("أهلاً بك في AZRAD! تفقد بريدك لتفعيل الحساب.");
        saveToDB(auth.currentUser);
    })
    .catch((error) => alert(error.message));
});

// 2. تسجيل الدخول العادي
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;

    auth.signInWithEmailAndPassword(email, pass)
    .then(() => console.log("تم الدخول بنجاح"))
    .catch((error) => alert("خطأ: " + error.message));
});

// 3. الدخول بواسطة جوجل
function initSignInWithGoogle() {
    auth.signInWithPopup(googleProvider)
    .then((result) => saveToDB(result.user))
    .catch((error) => alert(error.message));
}

// 4. حفظ البيانات في الـ Database بتاعتك
function saveToDB(user) {
    const userRef = db.collection("users").doc(user.uid);
    userRef.set({
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
}

// 5. مراقب الحالة (تحويل الشاشات)
auth.onAuthStateChanged((user) => {
    const authBox = document.getElementById('authContainer');
    const appBox = document.getElementById('appContainer');

    if (user) {
        authBox.classList.add('hidden');
        appBox.classList.remove('hidden');
        document.getElementById('userNamePlaceholder').innerText = user.displayName;
        document.getElementById('userEmailPlaceholder').innerText = user.email;
        document.getElementById('userAvatar').src = user.photoURL || 'https://via.placeholder.com/100/1b5e20/ffffff?text=A';
    } else {
        authBox.classList.remove('hidden');
        appBox.classList.add('hidden');
    }
});

function initSignOut() {
    auth.signOut().then(() => location.reload());
}
