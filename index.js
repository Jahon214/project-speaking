function startQuestions(moduleNumber, timeLimit) {
    const questionInput = document.getElementById(`questionInput${moduleNumber}`);
    const timerDisplay = document.getElementById(`timer${moduleNumber}`);
    const circle = document.getElementById(`circle${moduleNumber}`);
    let questions = questionInput.value.split('\n').filter(q => q.trim() !== "");
    let currentQuestionIndex = 0;

    if (questions.length === 0) {
        alert("Iltimos, savollarni kiriting.");
        return;
    }

    // Har bir savolni o'qish va yozib olishni boshqarish
    function readNextQuestion() {
        if (currentQuestionIndex >= questions.length) {
            showCustomAlert("Barcha savollar o'qildi.");
            return;
        }

        const currentQuestion = questions[currentQuestionIndex];
        const utterance = new SpeechSynthesisUtterance(currentQuestion);
        utterance.lang = 'tr-TR';
        utterance.rate = 1; // Savolni sekinroq o'qish
        speechSynthesis.speak(utterance);

        // Savol o'qib bo'lgach, yozib olishni boshlash yoki kichik taymerni ishga tushirish
        utterance.onend = () => {
            if (moduleNumber === 1 || moduleNumber === 2) {
                // 1 va 2-dastur: O'qib bo'lgandan keyin yozib olish
                showCustomAlert("Yozib olish boshlandi", 30000); // Alert 30 sekund ko'rinadi
                startRecording(timeLimit, timerDisplay, circle, () => {
                    currentQuestionIndex++;
                    readNextQuestion(); // Keyingi savolga o'tish
                });
            } else if (moduleNumber === 3 || moduleNumber === 4) {
                // 3 va 4-dastur: Kichik taymerni ishga tushirish
                showCustomAlert("Tayyorlanish uchun 1 daqiqa vaqt berildi", 10000); // Yangi alert qo'shildi
                startSmallTimer(moduleNumber, 60, () => {
                    showCustomAlert("Yozib olish boshlandi", 30000); // Alert 30 sekund ko'rinadi
                    startRecording(120, timerDisplay, circle, () => {
                        currentQuestionIndex++;
                        readNextQuestion(); // Keyingi savolga o'tish
                    });
                });
            }
        };
    }

    // Dastlabki savolni o'qish
    readNextQuestion();
}

// Kichik taymerni boshqarish (60s)
function startSmallTimer(moduleNumber, duration, callback) {
    let timeLeft = duration;
    const smallTimerDisplay = document.getElementById(`smallTimer${moduleNumber}`);
    smallTimerDisplay.innerText = `${timeLeft}s`;

    const smallInterval = setInterval(() => {
        timeLeft--;
        smallTimerDisplay.innerText = `${timeLeft}s`;

        if (timeLeft === 0) {
            clearInterval(smallInterval);
            callback(); // Kichik taymer tugaganda callbackni chaqirish
        }
    }, 1000);
}

// Katta taymerni boshqarish (120s)
function startRecording(duration, timerDisplay, circle, callback) {
    let timeLeft = duration;
    timerDisplay.innerText = `${timeLeft}s`; // Taymerni boshlanish vaqti
    const interval = 314 / duration; // Doiradagi progress barni yangilash uchun interval

    const countdown = setInterval(() => {
        timeLeft--; // Taymerni orqaga qarab kamaytirish
        timerDisplay.innerText = `${timeLeft}s`; // Taymerni yangilash

        // Doiraning progress barini yangilash
        circle.style.strokeDashoffset = interval * (duration - timeLeft);

        // Taymer tugaganda yozib olishni to'xtatish
        if (timeLeft === 0) {
            clearInterval(countdown);
            showCustomAlert("Yozib olish to'xtatildi", 30000); // Alert 30 sekund ko'rinadi
            callback(); // Keyingi savolga o'tish
        }
    }, 1000); // Har 1000ms (1 sekund)da yangilanadi

    // Yozib olish jarayonini boshlash
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const recorder = new MediaRecorder(stream);
            recorder.start();

            recorder.ondataavailable = () => { }; // Yozib olish ma'lumotlarini saqlash

            // Yozib olishni belgilangan muddat (duration) bo'yicha to'xtatish
            setTimeout(() => recorder.stop(), duration * 1000); // Duration * 1000 ms = taymerning tugashi
        })
        .catch(error => console.error("Mikrofonga kirish xatosi:", error));
}

// OK tugmasiz avtomatik alert funksiyasi
function showCustomAlert(message, duration = 40000) { // 40 sekundlik alert
    const alertBox = document.createElement("div");
    alertBox.classList.add("custom-alert");
    alertBox.innerText = message;
    document.body.appendChild(alertBox);

    setTimeout(() => {
        alertBox.remove();
    }, duration);
}
