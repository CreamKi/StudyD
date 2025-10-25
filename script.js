// ⭐️ START: Firebase Imports ⭐️
// Import ฟังก์ชันที่จำเป็นจาก Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
// ⭐️ END: Firebase Imports ⭐️


document.addEventListener('DOMContentLoaded', () => {

    // ⭐️ START: Firebase Config & Initialization ⭐️
    const firebaseConfig = {
      apiKey: "AIzaSyDnxQFgkPP58E6PEh358yWViTDWGsfAq9A",
      authDomain: "studyd2025.firebaseapp.com",
      projectId: "studyd2025",
      storageBucket: "studyd2025.firebasestorage.app",
      messagingSenderId: "578916582783",
      appId: "1:578916582783:web:fdb02f9dd978650307c64a",
      measurementId: "G-LWYXCWKKR5"
    };

    // เริ่มต้น Firebase
    const app = initializeApp(firebaseConfig);
    // ⭐️ สำคัญ: ต้องส่ง (app) เข้าไปด้วย ⭐️
    const auth = getAuth(app); 
    // ⭐️ END: Firebase Config ⭐️
    

    // --- ฟังก์ชัน Helper (สำหรับระบบสถิติ) ---
    const getStoredData = (key, defaultValue) => {
        const userSpecificKey = `${currentUserId}_${key}`;
        const data = localStorage.getItem(userSpecificKey);
        return data ? JSON.parse(data) : defaultValue;
    };

    const setStoredData = (key, value) => {
        /* ⭐️ CHANGE: สร้าง Key ที่ระบุตัวตนผู้ใช้ */
        const userSpecificKey = `${currentUserId}_${key}`;
        localStorage.setItem(userSpecificKey, JSON.stringify(value));
    };

    // --- ตัวแปรเก็บสถานะ (State) ---
    const defaultSubjects = [
        { name: 'Math', icon: `<img src="Math.png" data-animated-src="Math.gif" alt="Math Icon">` },
        { name: 'English', icon: `<img src="Eng.png" data-animated-src="Eng.gif" alt="Eng Icon">` },
        { name: 'Physics', icon: `<img src="friction-static.png" data-animated-src="friction-unscreen.gif" alt="Physics Icon">` }
    ];

    // ⭐️ CHANGE 2: เปลี่ยน subjects ให้เป็น array ว่างเปล่า เพื่อรอการโหลดข้อมูล
    let subjects = [];

    const addButtonData = { name: 'Add', icon: `<img src="plus.png" alt="Add Icon">`, isAddButton: true };

    const subjectIconMap = {
        'art': `<img src="Art.png" data-animated-src="Art.gif" alt="Art Icon">`,
        'history': `<img src="History.png" data-animated-src="History2.png" alt="History Icon">`,
        'chemistry': `<img src="Chemistry.png" data-animated-src="Chemistry2.png" alt="Chemistry Icon">`,
        'biology': `<img src="Bio.png" data-animated-src="Bio.gif" alt="Biology Icon">`,
        'music': `<img src="Music.png" data-animated-src="Music.gif" alt="Music Icon">`,
        'thai': `<img src="Thai.png" data-animated-src="Thai2.png" alt="Thai Icon">`,
        'programming': `<img src="Programming.png" data-animated-src="Programming2.png" alt="Programming Icon">`,
        'geography': `<img src="Geography.png" data-animated-src="Geography.gif" alt="Geography Icon">`,
        'social': `<img src="Social.png" data-animated-src="Social.gif" alt="Social Icon">`,
        'science': `<img src="Science.png" data-animated-src="Science.gif" alt="Science Icon">`,
        'astronomy': `<img src="Astronomy.png" data-animated-src="Astronomy.gif" alt="Astronomy Icon">`
    };

    const defaultIcon = `<img src="Book2.png" data-animated-src="Book2.gif" alt="Book2 Icon">`;

    let currentSubject = 'Physics';
    let currentMode = 'timing';
    let timerInterval;
    let timeLeft = 0;
    let initialTime = 0; 
    let isPaused = true;
    let totalExercises = 20;
    let currentCount = 0;
    let currentlyDisplayedDate = new Date();
    let currentBackgroundVideoSrc = 'none';
    // เพิ่มตัวแปรนี้เพื่อเก็บ ID ของผู้ใช้ปัจจุบัน (ถ้าไม่ได้ login จะเป็น 'guest')
    let currentUserId = 'guest';

    // --- เลือก Element ที่ต้องใช้ทั้งหมด ---
    const timingBtn = document.getElementById('timing-btn');
    const countingBtn = document.getElementById('counting-btn');
    const timingModeBox = document.getElementById('timing-mode-box');
    const countingModeBox = document.getElementById('counting-mode-box');
    const startBtn = document.getElementById('start-btn');
    
    const hrInput = document.getElementById('hr-input');
    const minInput = document.getElementById('min-input');
    const secInput = document.getElementById('sec-input');
    const exerciseInput = document.getElementById('exercise-input');

    const mainApp = document.getElementById('main-app');
    const timerScreen = document.getElementById('timer-screen');
    const counterScreen = document.getElementById('counter-screen');

    const timerDisplayActive = timerScreen.querySelector('.timer-display-active');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const timerSubjectDisplay = document.getElementById('timer-subject-display');
    const timerControls = document.getElementById('timer-controls');
    const finishTimerBtn = document.getElementById('finish-timer-btn');

    const counterDisplayActive = counterScreen.querySelector('.counter-display-active');
    const countUpBtn = document.getElementById('count-up-btn');
    const backFromCounterBtn = document.getElementById('back-from-counter-btn'); 
    const counterSubjectDisplay = document.getElementById('counter-subject-display');
    const counterControls = document.getElementById('counter-controls');
    const finishCounterBtn = document.getElementById('finish-counter-btn');
    
    const subjectListContainer = document.getElementById('subject-list-container');
    const levelUpSound = document.getElementById('level-up-sound');
    
    const streakCounter = document.getElementById('streak-counter');
    const statsBtn = document.getElementById('stats-btn');
    const statsModal = document.getElementById('stats-modal');
    const closeStatsModalBtn = document.getElementById('close-stats-modal');
    const statsDisplayArea = document.getElementById('stats-display-area');
    const statsTabs = document.querySelector('.stats-tabs');

    const backgroundToggleBtn = document.getElementById('background-toggle-btn');
    const backgroundPanel = document.getElementById('background-panel');
    const previewVideo = document.getElementById('preview-video');
    const placeholderBox = document.querySelector('.placeholder-box');
    const videoPreviewContainer = document.getElementById('video-previews-panel');
    const timerBgVideo = timerScreen.querySelector('.fullscreen-bg-video');
    const counterBgVideo = counterScreen.querySelector('.fullscreen-bg-video');

    const addSubjectModal = document.getElementById('add-subject-modal');
    const closeAddSubjectModalBtn = document.getElementById('close-add-subject-modal');
    const newSubjectNameInput = document.getElementById('new-subject-name-input');
    const confirmAddSubjectBtn = document.getElementById('confirm-add-subject-btn');

    // ⭐️ START: Selectors สำหรับ Auth (ระบบจริง) ⭐️
    const authBtn = document.getElementById('auth-btn');
    const logoText = document.getElementById('logo-text');
    
    // Sign In Modal
    const signinModal = document.getElementById('signin-modal');
    const closeSigninModalBtn = document.getElementById('close-signin-modal');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username-input'); // Input อีเมล
    const passwordInput = document.getElementById('password-input');
    const loginErrorMessage = document.getElementById('login-error-message'); // ⭐️ CHANGE: เพิ่ม Selector นี้
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const showSignupLink = document.getElementById('show-signup-link');
    
    // Sign Up Modal (ต้องมีใน HTML)
    const signupModal = document.getElementById('signup-modal');
    const closeSignupModalBtn = document.getElementById('close-signup-modal');
    const signupForm = document.getElementById('signup-form');
    const signupEmailInput = document.getElementById('signup-email-input');
    const signupPasswordInput = document.getElementById('signup-password-input');
    const showSigninLink = document.getElementById('show-signin-link');
    // ⭐️ END: Selectors สำหรับ Auth ⭐️


    // --- ระบบสถิติและ Streak ---
    // ⭐️ START: NEW FUNCTION ⭐️
    /**
     * (ฟังก์ชันใหม่)
     * ใช้สำหรับ "แสดงผล" streak ปัจจุบันเท่านั้น (ไม่บันทึก)
     * จะตรวจสอบว่า streak ขาดหรือไม่ ถ้าขาดจะแสดง 0
     */
    const displayCurrentStreak = () => {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
        
        // 1. โหลดข้อมูล streak ของ user คนนี้
        const streakData = getStoredData('streakData', { current: 0, lastDate: null });
        
        let displayStreak = 0; // ค่าที่จะแสดงผล เริ่มต้นที่ 0
        
        // 2. ตรวจสอบว่า streak ล่าสุดคือ "วันนี้" หรือ "เมื่อวานนี้" หรือไม่
        if (streakData.lastDate === today || streakData.lastDate === yesterday) {
            // ถ้าใช่ streak ยังไม่ขาด
            displayStreak = streakData.current;
        }
        // (ถ้าไม่ใช่ 2 วันนี้ แสดงว่า streak ขาดไปแล้ว ค่า displayStreak จะเป็น 0)
        
        // 3. แสดงผลบน UI
        streakCounter.innerHTML = `🔥 ${displayStreak} Day${displayStreak !== 1 ? 's' : ''}`;
    };
    // ⭐️ END: NEW FUNCTION ⭐️

    // ⭐️ START: MODIFIED FUNCTION ⭐️
    /**
     * (ฟังก์ชันที่แก้ไข)
     * ใช้สำหรับ "อัปเดตและบันทึก" streak เท่านั้น
     * จะถูกเรียกใช้โดย saveActivity() เมื่อเรียนเสร็จ
     */
    const updateStreak = () => {
        const today = new Date().toISOString().split('T')[0];
        
        // 1. โหลดข้อมูล streak ของ user คนนี้
        const streakData = getStoredData('streakData', { current: 0, lastDate: null });

        // 2. ตรวจสอบว่าวันนี้ได้บันทึกไปหรือยัง
        if (streakData.lastDate === today) {
            // วันนี้บันทึกไปแล้ว ไม่ต้องทำอะไร
        } else {
            // วันนี้ยังไม่ได้บันทึก
            const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
            
            if (streakData.lastDate === yesterday) {
                // ถ้าครั้งล่าสุดคือเมื่อวาน (ต่อ streak)
                streakData.current++;
            } else {
                // ถ้า streak ขาด หรือเริ่มใหม่
                streakData.current = 1;
            }
            
            // 3. บันทึกวันที่ของวันนี้
            streakData.lastDate = today;
            setStoredData('streakData', streakData); // บันทึกข้อมูลใหม่
        }
        
        // 4. แสดงผล streak ที่อัปเดตแล้วบน UI
        streakCounter.innerHTML = `🔥 ${streakData.current} Day${streakData.current !== 1 ? 's' : ''}`;
    };
    // ⭐️ END: MODIFIED FUNCTION ⭐️

    const saveActivity = (subject, mode, value) => {
        const today = new Date().toISOString().split('T')[0];
        const history = getStoredData('studyHistory', {});

        if (!history[today]) {
            history[today] = {};
        }
        if (!history[today][subject]) {
            history[today][subject] = { time: 0, exercises: 0 };
        }

        if (mode === 'timing') {
            history[today][subject].time += value;
        } else {
            history[today][subject].exercises += value;
        }
        
        setStoredData('studyHistory', history);
        if (currentUserId !== 'guest') {
            updateStreak();
        }
    };
    const renderDailyView = (dateString, fromCalendar = false, calendarDate) => {
        statsDisplayArea.innerHTML = '';
        const history = getStoredData('studyHistory', {});
        const dayData = history[dateString];
        const date = new Date(dateString + 'T00:00:00'); 
        const formattedDate = date.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        let totalTime = 0;
        let totalExercises = 0;
        let detailHTML = `<div class="daily-stats-detail"><h3>Details for ${formattedDate}</h3>`;

        if (dayData) {
            Object.values(dayData).forEach(subject => {
                totalTime += subject.time;
                totalExercises += subject.exercises;
            });

            detailHTML += `<div class="summary">
                <p><strong>Total Time:</strong> ${Math.floor(totalTime / 3600)}h ${Math.floor((totalTime % 3600) / 60)}m</p>
                <p><strong>Total Exercises:</strong> ${totalExercises}</p>
            </div><div class="subject-list">`;
            
            for(const subject in dayData){
                 detailHTML += `<div class="subject-item">
                    <span><strong>${subject}</strong></span>
                    <span>${Math.floor(dayData[subject].time / 3600)}h ${Math.floor((dayData[subject].time % 3600) / 60)}m / ${dayData[subject].exercises} exercises</span>
                 </div>`;
            }
            detailHTML += `</div>`;

        } else {
            detailHTML += `<p>No activity recorded for this day.</p>`;
        }
        
        if(fromCalendar){
            detailHTML += `<button class="back-to-calendar-btn">← Back to Calendar</button>`;
        }
        detailHTML += `</div>`;
        statsDisplayArea.innerHTML = detailHTML;

        if(fromCalendar){
            document.querySelector('.back-to-calendar-btn').addEventListener('click', () => {
                renderMonthlyView(calendarDate);
            });
        }
    };
    const renderMonthlyView = (dateToShow) => {
        statsDisplayArea.innerHTML = '';
        const history = getStoredData('studyHistory', {});
        const year = dateToShow.getFullYear();
        const month = dateToShow.getMonth();
        
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.innerHTML = `
            <button class="cal-nav-btn" id="prev-month-btn">&lt;</button>
            <h3>${monthNames[month]} ${year}</h3>
            <button class="cal-nav-btn" id="next-month-btn">&gt;</button>
        `;
        statsDisplayArea.appendChild(header);
        
        document.getElementById('prev-month-btn').addEventListener('click', () => {
            currentlyDisplayedDate.setMonth(currentlyDisplayedDate.getMonth() - 1);
            renderMonthlyView(currentlyDisplayedDate);
        });

        document.getElementById('next-month-btn').addEventListener('click', () => {
            currentlyDisplayedDate.setMonth(currentlyDisplayedDate.getMonth() + 1);
            renderMonthlyView(currentlyDisplayedDate);
        });

        const grid = document.createElement('div');
        grid.className = 'calendar-grid';

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(name => {
            const dayNameCell = document.createElement('div');
            dayNameCell.className = 'calendar-day-name';
            dayNameCell.textContent = name;
            grid.appendChild(dayNameCell);
        });

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day other-month';
            grid.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';
            dayCell.innerHTML = `<span>${day}</span>`;
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            if (history[dateString]) {
                dayCell.classList.add('has-activity');
            }
            
            dayCell.addEventListener('click', () => renderDailyView(dateString, true, dateToShow));
            
            grid.appendChild(dayCell);
        }
        statsDisplayArea.appendChild(grid);
    };
    const renderYearlyView = (year) => {
        statsDisplayArea.innerHTML = '';
        const history = getStoredData('studyHistory', {});
        
        let totalTime = 0;
        let totalExercises = 0;
        const subjectStats = {};

        for (const date in history) {
            if (date.startsWith(year)) {
                for(const subject in history[date]){
                    if(!subjectStats[subject]){
                        subjectStats[subject] = {time: 0, exercises: 0};
                    }
                    const {time, exercises} = history[date][subject];
                    subjectStats[subject].time += time;
                    subjectStats[subject].exercises += exercises;
                    totalTime += time;
                    totalExercises += exercises;
                }
            }
        }

        let summaryHTML = `<div class="yearly-summary"><h3>Summary for ${year}</h3>`;
        summaryHTML += `<p><strong>Total Study Time:</strong> ${Math.floor(totalTime / 3600)}h ${Math.floor((totalTime % 3600) / 60)}m</p>`;
        summaryHTML += `<p><strong>Total Exercises Completed:</strong> ${totalExercises}</p><hr>`;
        for(const subject in subjectStats){
            summaryHTML += `<h4>${subject}</h4>`;
            summaryHTML += `<p>Time: ${Math.floor(subjectStats[subject].time / 3600)}h ${Math.floor((subjectStats[subject].time % 3600) / 60)}m</p>`;
            summaryHTML += `<p>Exercises: ${subjectStats[subject].exercises}</p>`;
        }
        summaryHTML += '</div>';
        statsDisplayArea.innerHTML = summaryHTML;
    };
    
    statsBtn.addEventListener('click', () => {
        statsModal.classList.remove('hidden');
        document.querySelector('.tab-btn.active').classList.remove('active');
        document.querySelector('.tab-btn[data-view="daily"]').classList.add('active');
        const todayString = new Date().toISOString().split('T')[0];
        renderDailyView(todayString);
    });

    // ⭐️ START: NEW EVENT LISTENER FOR STREAK ⭐️
    streakCounter.addEventListener('click', () => {
        // ตรวจสอบว่าผู้ใช้เป็น 'guest' หรือไม่
        if (currentUserId === 'guest') {
            // ถ้าใช่, ให้เปิด Modal สมัครสมาชิก
            openSigninModal();
        }
        // ถ้า (else) แสดงว่า login อยู่ ก็ไม่ต้องทำอะไร
    });
    // ⭐️ END: NEW EVENT LISTENER ⭐️

    closeStatsModalBtn.addEventListener('click', () => statsModal.classList.add('hidden'));
    statsModal.addEventListener('click', (e) => {
        if(e.target === statsModal) statsModal.classList.add('hidden');
    });

    statsTabs.addEventListener('click', (e) => {
        if(e.target.classList.contains('tab-btn')){
            document.querySelector('.tab-btn.active').classList.remove('active');
            e.target.classList.add('active');
            const view = e.target.dataset.view;
            if(view === 'daily') {
                const todayString = new Date().toISOString().split('T')[0];
                renderDailyView(todayString);
            } else if (view === 'monthly') {
                currentlyDisplayedDate = new Date();
                renderMonthlyView(currentlyDisplayedDate);
            } else {
                renderYearlyView(new Date().getFullYear());
            }
        }
    });
    // --- จบส่วนระบบสถิติ --- 


    // --- ⭐️ START: Firebase Authentication Logic (ระบบจริง) ⭐️ ---
    // --- ฟังก์ชันสำหรับเปิด/ปิด Modals ---
    function openSigninModal() {
        if(signupModal) signupModal.classList.add('hidden'); // ปิด Sign up
        if(signinModal) signinModal.classList.remove('hidden'); // เปิด Sign in
        if(usernameInput) usernameInput.focus();
        if(loginErrorMessage) loginErrorMessage.classList.add('hidden'); // ⭐️ CHANGE: ซ่อน Error เมื่อเปิด
    }
    function closeSigninModal() {
        if(signinModal) signinModal.classList.add('hidden');
        if(loginForm) loginForm.reset();
        if(loginErrorMessage) loginErrorMessage.classList.add('hidden'); // ⭐️ CHANGE: ซ่อน Error เมื่อปิด
    }
    function openSignupModal() {
        if(signinModal) signinModal.classList.add('hidden'); // ปิด Sign in
        if(signupModal) signupModal.classList.remove('hidden'); // เปิด Sign up
        if(signupEmailInput) signupEmailInput.focus();
    }
    function closeSignupModal() {
        if(signupModal) signupModal.classList.add('hidden');
        if(signupForm) signupForm.reset();
    }

    // --- ฟังก์ชันจัดการ Auth ---
    function handleSignUp(e) {
        e.preventDefault();
        const email = signupEmailInput.value;
        const password = signupPasswordInput.value;

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log("Created user:", userCredential.user);
                closeSignupModal(); // ปิด Modal
            })
            .catch((error) => {
                alert(error.message); 
            });
    }

    function handleLogin(e) {
        e.preventDefault();
        const email = usernameInput.value;
        const password = passwordInput.value;
        
        loginErrorMessage.classList.add('hidden'); // ⭐️ CHANGE: ซ่อนข้อความ Error เก่าก่อน

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log("Logged in user:", userCredential.user);
                closeSigninModal(); // ปิด Modal
            })
            .catch((error) => {
                // ⭐️ START: CHANGE BLOCK ⭐️
                // alert("Invalid email or password."); // ลบ alert นี้
                console.error("Login Error:", error.code);
                
                // ตรวจสอบ Error code จาก Firebase
                if (error.code === 'auth/wrong-password' || 
                    error.code === 'auth/user-not-found' || 
                    error.code === 'auth/invalid-credential') {

                    loginErrorMessage.textContent = "The password is incorrect. Please try again.";
                } else {
                    // สำหรับ Error อื่นๆ เช่น network
                    loginErrorMessage.textContent = "The email or password is incorrect. Please try again.";
                }
                loginErrorMessage.classList.remove('hidden'); // แสดงข้อความ Error
                // ⭐️ END: CHANGE BLOCK ⭐️
            });
    }

    function handleLogout() {
        signOut(auth).then(() => {
            console.log("User signed out.");
        }).catch((error) => {
            console.error("Sign out error:", error);
        });
    }

    function handleForgotPassword(e) {
        e.preventDefault();
        const email = prompt("Please enter your email to reset your password:");
        if (email) {
            sendPasswordResetEmail(auth, email)
                .then(() => {
                    alert("Password reset email sent! Please check your inbox.");
                })
                .catch((error) => {
                    alert(error.message);
                });
        }
    }

    // ⭐️⭐️⭐️ ตัวดักจับสถานะ Log In (หัวใจสำคัญ) ⭐️⭐️⭐️
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // --- ผู้ใช้ล็อกอินอยู่ ---
            authBtn.textContent = 'Log out';
            authBtn.classList.remove('signup-btn');
            authBtn.classList.add('logout-btn');
            
            const username = user.email.split('@')[0];
            logoText.textContent = `StudyD | ${username}`;
            
            authBtn.removeEventListener('click', openSigninModal); 
            authBtn.addEventListener('click', handleLogout);
            
            // ⭐️ CHANGE: ตั้งค่า ID ผู้ใช้ปัจจุบัน
            currentUserId = user.uid;

            // ⭐️ START: CHANGE ⭐️
            // แสดงปุ่ม Streak และโหลดข้อมูล
            streakCounter.classList.remove('hidden');
            streakCounter.classList.remove('locked');
            displayCurrentStreak(); 
            // ⭐️ END: CHANGE ⭐️

        } else {
            // --- ผู้ใช้ล็อกเอาต์ ---
            authBtn.textContent = 'Sign in';
            authBtn.classList.remove('logout-btn');
            authBtn.classList.add('signup-btn');
            logoText.textContent = 'StudyD';
            
            authBtn.removeEventListener('click', handleLogout); 
            authBtn.addEventListener('click', openSigninModal);
            
            // ⭐️ CHANGE: ตั้งค่าเป็น 'guest'
            currentUserId = 'guest';

            // ⭐️ START: CHANGE ⭐️
            // ซ่อนปุ่ม Streak
            streakCounter.classList.remove('hidden');
            streakCounter.classList.add('locked');
            // 3. เปลี่ยนข้อความ
            streakCounter.innerHTML = `🔥 -`;
            // ⭐️ END: CHANGE ⭐️
        }

        loadUserSubjects(); // โหลดวิชาที่ถูกต้องสำหรับ User คนนี้

        // ถ้า Modal สถิติเปิดอยู่, ให้ re-render view ปัจจุบัน
        // เพื่อให้ข้อมูลเปลี่ยนตาม User ทันที
        if (!statsModal.classList.contains('hidden')) {
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab) {
                // ใช้ .click() เพื่อ trigger event listener ของ tab เดิม
                activeTab.click(); 
            } else {
                // Fallback: ถ้าไม่มี tab active ให้ render daily view
                const todayString = new Date().toISOString().split('T')[0];
                renderDailyView(todayString);
            }
        }
    });

    // --- Event Listeners สำหรับ Auth Forms & Modals ---
    if(loginForm) loginForm.addEventListener('submit', handleLogin);
    if(signupForm) signupForm.addEventListener('submit', handleSignUp);
    
    // ⭐️ CHANGE: เพิ่ม Listeners เพื่อซ่อน Error เมื่อผู้ใช้พิมพ์ ⭐️
    if(usernameInput) usernameInput.addEventListener('input', () => loginErrorMessage.classList.add('hidden'));
    if(passwordInput) passwordInput.addEventListener('input', () => loginErrorMessage.classList.add('hidden'));
    
    if(forgotPasswordLink) forgotPasswordLink.addEventListener('click', handleForgotPassword);

    // ปุ่มสลับ Modal
    if(showSignupLink) showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        openSignupModal();
    });
    if(showSigninLink) showSigninLink.addEventListener('click', (e) => {
        e.preventDefault();
        openSigninModal();
    });

    // ปุ่มปิด Modals
    if(closeSigninModalBtn) closeSigninModalBtn.addEventListener('click', closeSigninModal);
    if(signinModal) signinModal.addEventListener('click', (e) => {
        if (e.target === signinModal) closeSigninModal();
    });
    if(closeSignupModalBtn) closeSignupModalBtn.addEventListener('click', closeSignupModal);
    if(signupModal) signupModal.addEventListener('click', (e) => {
        if (e.target === signupModal) closeSignupModal();
    });

    // --- ⭐️ END: Firebase Authentication Logic ⭐️ ---


    // ⭐️ START: Event Listener สำหรับแผงควบคุม ⭐️
    backgroundToggleBtn.addEventListener('click', () => {
        backgroundPanel.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (backgroundPanel.classList.contains('active')) {
            if (!e.target.closest('#background-panel') && !e.target.closest('#background-toggle-btn')) {
                backgroundPanel.classList.remove('active');
            }
        }
    });

    videoPreviewContainer.addEventListener('click', (e) => {
        const selectedOption = e.target.closest('.video-option');
        if (!selectedOption) return;

        const oldActive = videoPreviewContainer.querySelector('.video-option.active');
        if (oldActive) oldActive.classList.remove('active');

        selectedOption.classList.add('active');
        currentBackgroundVideoSrc = selectedOption.dataset.videoSrc;

        if (currentBackgroundVideoSrc === 'none') {
            previewVideo.classList.add('hidden');
            previewVideo.src = '';
            placeholderBox.style.backgroundColor = 'var(--pink-bg)';
        } else {
            previewVideo.src = currentBackgroundVideoSrc;
            previewVideo.classList.remove('hidden');
            previewVideo.play();
            placeholderBox.style.backgroundColor = '#000';
        }
        
        videoPreviewContainer.querySelectorAll('video').forEach(vid => vid.pause());
        const activeVideoInPanel = selectedOption.querySelector('video');
        if (activeVideoInPanel) activeVideoInPanel.play();
    });
    // ⭐️ END: Event Listener ⭐️


    function triggerConfetti() {
        levelUpSound.currentTime = 0; 
        levelUpSound.play();
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    }

    // ⭐️ START: อัปเดตฟังก์ชัน Add Subject ⭐️
    const addNewSubject = () => {
        addSubjectModal.classList.remove('hidden');
        newSubjectNameInput.value = '';
        newSubjectNameInput.focus();
    };

    const confirmAddSubject = () => {
        const newSubjectName = newSubjectNameInput.value;
        if (newSubjectName && newSubjectName.trim() !== '') {
            if (!subjects.some(s => s.name === newSubjectName)) {
                const subjectKey = newSubjectName.trim().toLowerCase(); 
                const newIcon = subjectIconMap[subjectKey] || defaultIcon;
                const newSubject = {
                    name: newSubjectName,
                    icon: newIcon
                };
                
                subjects.push(newSubject);
                // ถ้าผู้ใช้ "ไม่ใช่" guest (คือ login อยู่) ถึงจะบันทึก
                if (currentUserId !== 'guest') {
                    setStoredData('subjects', subjects); // บันทึก array วิชาใหม่ลง localStorage
                }
                currentSubject = newSubject.name;
                renderSubjects();
                addSubjectModal.classList.add('hidden');
            } else {
                alert("Subject already exists!");
            }
        }
    };

    closeAddSubjectModalBtn.addEventListener('click', () => {
        addSubjectModal.classList.add('hidden');
    });
    addSubjectModal.addEventListener('click', (e) => {
        if(e.target === addSubjectModal) {
            addSubjectModal.classList.add('hidden');
        }
    });
    confirmAddSubjectBtn.addEventListener('click', confirmAddSubject);
    newSubjectNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            confirmAddSubject();
        }
    });
    // ⭐️ END: อัปเดตฟังก์ชัน Add Subject ⭐️

    // ⭐️⭐️⭐️ START OF NEW FUNCTION ⭐️⭐️⭐️
    function loadUserSubjects() {
        // ⭐️⭐️⭐️ START: CHANGE ⭐️⭐️⭐️
        if (currentUserId === 'guest') {
            // ถ้าเป็น 'guest', ให้ใช้ 'defaultSubjects' (ตัวเริ่มต้น) เสมอ
            // เราใช้ '...' (spread) เพื่อเป็นการ "copy" array
            // เพื่อให้ 'guest' เพิ่มวิชาชั่วคราวได้ โดยไม่ไปยุ่งกับตัวต้นฉบับ
            subjects = [...defaultSubjects]; 
        } else {
            // ถ้า login อยู่ (ไม่ใช่ guest), ให้โหลดข้อมูลของ user คนนั้น
            // (ถ้าไม่มีข้อมูล, ก็ให้ใช้ defaultSubjects)
            subjects = getStoredData('subjects', defaultSubjects);
        }
        // ⭐️⭐️⭐️ END: CHANGE ⭐️⭐️⭐️
        // ป้องกัน Error: ถ้าวิชาที่เคยเลือกไว้ (เช่น Physics) หายไป
        // ให้ตั้งค่า currentSubject เป็นวิชาแรกในลิสต์เสมอ
        if (subjects.length > 0) {
            // ตรวจสอบว่า currentSubject ปัจจุบัน ยังมีอยู่ในลิสต์หรือไม่
            const currentExists = subjects.some(s => s.name === currentSubject);
            if (!currentExists) {
                currentSubject = subjects[0].name;
            }
        } else {
            currentSubject = null; // กรณีไม่มีวิชาเลย
        }

        // สั่งอัปเดต UI ของแถบวิชา
        renderSubjects();
    }
    // ⭐️⭐️⭐️ END OF NEW FUNCTION ⭐️⭐️⭐️
    
    const renderSubjects = () => {
        subjectListContainer.innerHTML = ''; 
        subjects.forEach(subject => {
            const subjectBtn = document.createElement('button');
            subjectBtn.className = 'subject-btn';
            subjectBtn.innerHTML = `${subject.icon}<span>${subject.name}</span>`;
            
            if (subject.name === currentSubject) {
                subjectBtn.classList.add('active');
            }

            subjectBtn.addEventListener('click', () => {
                currentSubject = subject.name;
                renderSubjects(); 
            });

            const imgIcon = subjectBtn.querySelector('img');
            if (imgIcon) {
                const staticSrc = imgIcon.src;
                const animatedSrc = imgIcon.dataset.animatedSrc; 
                if(animatedSrc) {
                    subjectBtn.addEventListener('mouseenter', () => { imgIcon.src = animatedSrc; });
                    subjectBtn.addEventListener('mouseleave', () => { imgIcon.src = staticSrc; });
                }
            }

            subjectListContainer.appendChild(subjectBtn);
        });

        const addBtnElement = document.createElement('button');
        addBtnElement.className = 'subject-btn add-btn';
        addBtnElement.innerHTML = `${addButtonData.icon}<span>${addButtonData.name}</span>`;
        addBtnElement.addEventListener('click', addNewSubject); 
        subjectListContainer.appendChild(addBtnElement);
    };

    function updateSidebarDisplay() {
        if (currentMode === 'timing') {
            timingBtn.classList.add('active');
            countingBtn.classList.remove('active');
            timingModeBox.classList.remove('hidden');
            countingModeBox.classList.add('hidden');
        } else {
            timingBtn.classList.remove('active');
            countingBtn.classList.add('active');
            timingModeBox.classList.add('hidden');
            countingModeBox.classList.remove('hidden');
        }
    }

    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
    }

    timingBtn.addEventListener('click', () => {
        currentMode = 'timing';
        updateSidebarDisplay();
    });

    countingBtn.addEventListener('click', () => {
        currentMode = 'counting';
        updateSidebarDisplay();
    });
    
    startBtn.addEventListener('click', () => {
        timerSubjectDisplay.textContent = currentSubject;
        counterSubjectDisplay.textContent = currentSubject;

        const setBackground = (screenElement, videoElement) => {
            if (currentBackgroundVideoSrc !== 'none') {
                videoElement.src = currentBackgroundVideoSrc;
                videoElement.style.display = 'block';
                videoElement.play();
                screenElement.style.backgroundColor = 'transparent';
            } else {
                videoElement.style.display = 'none';
                videoElement.src = '';
                screenElement.style.backgroundColor = 'var(--pink-bg)';
            }
        };

        if (currentMode === 'timing') {
            const hours = parseInt(hrInput.value) || 0;
            const minutes = parseInt(minInput.value) || 0;
            const seconds = parseInt(secInput.value) || 0;
            timeLeft = (hours * 3600) + (minutes * 60) + seconds;
            initialTime = timeLeft;
            if (timeLeft <= 0) {
                alert("Please enter a valid time.");
                return;
            }
            mainApp.classList.add('hidden');
            isPaused = true;
            timerDisplayActive.textContent = formatTime(timeLeft);
            playPauseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>`;
            
            setBackground(timerScreen, timerBgVideo);
            
            timerScreen.classList.remove('hidden');
            timerControls.classList.remove('hidden');
            finishTimerBtn.classList.add('hidden');
        } else { 
            totalExercises = parseInt(exerciseInput.value);
            if (!totalExercises || totalExercises <= 0) {
                alert("Please enter a valid number of exercises.");
                return;
            }
            mainApp.classList.add('hidden');
            currentCount = 0;
            counterDisplayActive.textContent = `${currentCount}/${totalExercises}`;

            setBackground(counterScreen, counterBgVideo);

            counterScreen.classList.remove('hidden');
            counterControls.classList.remove('hidden');
            finishCounterBtn.classList.add('hidden');
        }
    });

    playPauseBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        if (!isPaused) {
            playPauseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>`;
            timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    timerDisplayActive.textContent = formatTime(timeLeft);
                } else {
                    clearInterval(timerInterval);
                    triggerConfetti();
                    saveActivity(currentSubject, 'timing', initialTime);
                    timerControls.classList.add('hidden');
                    finishTimerBtn.classList.remove('hidden');
                }
            }, 1000);
        } else {
            playPauseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>`;
            clearInterval(timerInterval);
        }
    });

    const stopAllBackgroundVideos = () => {
        timerBgVideo.pause();
        timerBgVideo.src = '';
        timerBgVideo.style.display = 'none';
        counterBgVideo.pause();
        counterBgVideo.src = '';
        counterBgVideo.style.display = 'none';
    };

    stopBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        const timeSpent = initialTime - timeLeft;
        if (timeSpent > 0) {
            saveActivity(currentSubject, 'timing', timeSpent);
        }
        timerScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        stopAllBackgroundVideos();
        hrInput.value = '00';
        minInput.value = '00';
        secInput.value = '00';
    });

    countUpBtn.addEventListener('click', () => {
        if (currentCount < totalExercises) {
            currentCount++;
            counterDisplayActive.textContent = `${currentCount}/${totalExercises}`;
        }
        if (currentCount === totalExercises) {
             triggerConfetti();
             saveActivity(currentSubject, 'counting', totalExercises);
             counterControls.classList.add('hidden');
             finishCounterBtn.classList.remove('hidden');
        }
    });

    backFromCounterBtn.addEventListener('click', () => {
        if(currentCount > 0){
             saveActivity(currentSubject, 'counting', currentCount);
        }
        counterScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        stopAllBackgroundVideos();
        exerciseInput.value = '00';
    });

    finishTimerBtn.addEventListener('click', () => {
        timerScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        stopAllBackgroundVideos();
        hrInput.value = '00';
        minInput.value = '00';
        secInput.value = '00';
    });

    finishCounterBtn.addEventListener('click', () => {
        counterScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        stopAllBackgroundVideos();
        exerciseInput.value = '00';
    });

    const handleInputFocus = (input) => {
        if (input.value === '00') {
            input.value = '';
        }
    };

    hrInput.addEventListener('focus', () => handleInputFocus(hrInput));
    minInput.addEventListener('focus', () => handleInputFocus(minInput));
    secInput.addEventListener('focus', () => handleInputFocus(secInput));
    exerciseInput.addEventListener('focus', () => handleInputFocus(exerciseInput));
    
    const handleTimeInputBlur = (input) => {
        if (input.value === '') {
            input.value = '00';
        }
    };
    hrInput.addEventListener('blur', () => handleTimeInputBlur(hrInput));
    minInput.addEventListener('blur', () => handleTimeInputBlur(minInput));
    secInput.addEventListener('blur', () => handleTimeInputBlur(secInput));
    exerciseInput.addEventListener('blur', () => handleTimeInputBlur(exerciseInput));
    
    // --- เริ่มต้นการทำงานของแอป ---
    // (ลบ updateAuthUI(); ของเก่าออกแล้ว)
    updateSidebarDisplay();
    
    videoPreviewContainer.querySelector('.video-option[data-video-src="none"]').classList.add('active');
});
