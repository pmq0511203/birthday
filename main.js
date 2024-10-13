document.addEventListener('DOMContentLoaded', function() {
    const playButton = document.getElementById('playButton');
    const rewindButton = document.getElementById('rewindButton');
    const forwardButton = document.getElementById('forwardButton');
    const audio = document.getElementById('audio');
    const progressBar = document.getElementById('progressBar');
    const currentTimeDisplay = document.getElementById('currentTime');
    const durationDisplay = document.getElementById('duration');
    const volumeSlider = document.getElementById('volumeSlider');
    const canvas = document.getElementById('waveform');
    const canvasContext = canvas.getContext('2d');

    let isPlaying = false;
    let audioContext;
    let analyser;

    // Đặt nguồn âm thanh mặc định là "Sweet Dream"
    audio.play();

    // Sự kiện khi nhấn nút Play
    playButton.addEventListener('click', function() {
        if (isPlaying) {
            audio.pause();
            playButton.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const source = audioContext.createMediaElementSource(audio);
                analyser = audioContext.createAnalyser();
                source.connect(analyser);
                analyser.connect(audioContext.destination);
                analyser.fftSize = 2048; // Kích thước FFT
            }
            audio.play();
            playButton.innerHTML = '<i class="fas fa-pause"></i>';
            drawWaveform();
        }
        isPlaying = !isPlaying;
    });

    // Sự kiện khi nhấn nút tua lại
    rewindButton.addEventListener('click', function() {
        audio.currentTime = Math.max(0, audio.currentTime - 10); // Tua lại 10 giây
    });

    // Sự kiện khi nhấn nút tiến tới
    forwardButton.addEventListener('click', function() {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 10); // Tiến tới 10 giây
    });

    // Hàm vẽ sóng âm thanh
    function drawWaveform() {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const draw = () => {
            requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray); // Lấy dữ liệu tần số

            canvasContext.fillStyle = 'rgba(255, 255, 255, 0.1)'; // Màu nền
            canvasContext.fillRect(0, 0, canvas.width, canvas.height); // Xóa canvas

            const barWidth = (canvas.width / bufferLength) * 2.5; // Chiều rộng cột
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = dataArray[i] / 2; // Chiều cao cột
                const color = getRainbowColor(i / bufferLength); // Lấy màu sắc từ hàm màu cầu vồng
                canvasContext.fillStyle = color; // Thiết lập màu cho cột
                canvasContext.fillRect(x, canvas.height - barHeight, barWidth, barHeight); // Vẽ cột

                x += barWidth + 1; // Di chuyển x để vẽ cột tiếp theo
            }
        };

        draw();
    }

    // Hàm lấy màu cầu vồng
    function getRainbowColor(value) {
        const hue = Math.floor(value * 360); // Tính màu sắc từ 0 đến 360
        return `hsl(${hue}, 100%, 50%)`; // Trả về màu sắc theo định dạng hsl
    }

    // Cập nhật thời gian khi metadata được tải
    audio.addEventListener('loadedmetadata', function() {
        durationDisplay.textContent = formatTime(audio.duration);
    });

    // Cập nhật thời gian hiện tại và thanh tiến trình
    audio.addEventListener('timeupdate', function() {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.value = progress;
        currentTimeDisplay.textContent = formatTime(audio.currentTime);
    });

    // Điều chỉnh thời gian khi người dùng kéo thanh tiến trình
    progressBar.addEventListener('input', function() {
        const newTime = (progressBar.value / 100) * audio.duration;
        audio.currentTime = newTime;
    });

    // Điều chỉnh âm lượng khi người dùng thay đổi thanh âm lượng
    volumeSlider.addEventListener('input', () => {
        audio.volume = volumeSlider.value;
    });

    // Hàm định dạng thời gian
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    // Đếm ngược thời gian
    setInterval(countdown, 1000);

    function countdown() {
        const today = new Date();
        const targetDate = new Date('2024-11-05T00:00:00');
        const timeDiff = targetDate - today;
        const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hoursLeft = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const secondsLeft = Math.floor((timeDiff % (1000 * 60)) / 1000);

        document.getElementById('today').textContent = `Ngày hôm nay: ${today.toLocaleDateString('vi-VN')}`;
        document.getElementById('targetDate').textContent = `Ngày nào đó: ${targetDate.toLocaleDateString('vi-VN')}`;
        document.getElementById('daysLeft').textContent = 
            `Còn lại: ${daysLeft} ngày ${hoursLeft} giờ ${minutesLeft} phút ${secondsLeft} giây`;
    }

    // Thêm sự kiện cho các bài hát trong danh sách
    const musicListItems = document.querySelectorAll('.music-list li');

    const songTitle = document.getElementById('songTitle');

    musicListItems.forEach(item => {
        item.addEventListener('click', function() {
            const src = this.getAttribute('data-src');
            audio.src = src;
            audio.play();
            
            musicListItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Cập nhật tên bài nhạc
            songTitle.textContent = `Đang phát: ${this.textContent}`;
            
            console.log(`Đang phát bài: ${this.textContent}`);
        });
    });

});
