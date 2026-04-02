<script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
        import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

        // إعدادات القاعدة (نفس بيانات مشروعك)
        const firebaseConfig = {
            apiKey: "AIzaSyBDWT4ygUDKlmuelK6EXcyigkeNyQNCFtjW",
            authDomain: "azrad-global.firebaseapp.com",
            projectId: "azrad-global",
            appId: "1:727549676844:web:8b474f550e664f34397089"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();

        // ربط الـ Client ID اللي إنت بعته في الصورة
        provider.setCustomParameters({
            'client_id': '727549676844-a3i6n3s14pqlmtti184s74453uief9r9.apps.googleusercontent.com'
        });

        // وظيفة تسجيل الدخول
        window.signInWithGoogle = async () => {
            try {
                const result = await signInWithPopup(auth, provider);
                const user = result.user;
                
                // الانتقال للشاشة التانية
                document.getElementById('login-page').classList.add('hidden');
                document.getElementById('app-page').classList.remove('hidden');
                document.getElementById('welcome-msg').innerText = `مرحباً بك يا بطل: ${user.displayName}`;
                
                console.log("تم الدخول بنجاح");
            } catch (error) {
                console.error("خطأ:", error.message);
                alert("فشل الدخول! تأكد من إضافة رابط الـ GitHub في Authorized Domains داخل Firebase");
            }
        };

        // نظام الإعلانات التلقائي (تظهر كل 10 ثواني لو اتقفلت)
        setInterval(() => {
            const adArea = document.getElementById('ad-area');
            if (adArea.children.length === 0) {
                adArea.innerHTML = `
                    <div class="ad-card">
                        <button class="close-ad" onclick="this.parentElement.remove()">×</button>
                        <i class="fas fa-bolt"></i>
                        <h4>تحديث جديد</h4>
                        <p style="font-size: 0.8rem;">تم تفعيل نظام الرادار السريع في منطقة عملياتك.</p>
                    </div>`;
            }
        }, 15000);
    </script>
</body>
</html>
