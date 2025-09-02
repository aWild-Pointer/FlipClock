// ==================== 全局变量初始化 ====================
// 初始化时钟对象
var timeClock = null;        // 时间模式时钟
var countupClock = null;     // 正计时模式时钟
var countdownClock = null;   // 倒计时模式时钟

// 倒计时全局变量
var countdownTime = 60;      // 默认1分钟倒计时

// 当前激活的时钟模式
var activeMode = 'time';     // 可选值: 'time', 'countup', 'countdown'

// 音频元素
var backgroundMusic = document.getElementById('background-music');
var musicToggle = document.getElementById('music-toggle');
var isMusicPlaying = false;  // 音乐播放状态标志


// ==================== 音乐控制功能 ====================
// 切换音乐播放状态
function toggleMusic() {
    const icon = musicToggle.querySelector('i');
    
    if (isMusicPlaying) {
        backgroundMusic.pause();
        icon.className = 'fas fa-volume-mute';
        musicToggle.classList.remove('playing');
        isMusicPlaying = false;
    } else {
        backgroundMusic.play().then(() => {
            icon.className = 'fas fa-volume-up';
            musicToggle.classList.add('playing');
            isMusicPlaying = true;
        }).catch(function(error) {
            console.log('音乐播放失败:', error);
            icon.className = 'fas fa-volume-mute';
            musicToggle.classList.remove('playing');
            isMusicPlaying = false;
        });
    }
}


// ==================== 日期信息功能 ====================
// 更新日期信息的函数
function updateDateInfo() {
    const now = new Date();
    
    // 获取公历年月日
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    // 获取星期几
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[now.getDay()];
    
    // 显示公历日期
    $('#gregorian-date').text(`${year}年${month}月${day}日`);
    
    // 显示星期几
    $('#weekday').text(weekday);
    
    // 使用lunar-javascript库获取农历日期
    const solar = Solar.fromYmd(year, parseInt(month), parseInt(day));
    const lunar = solar.getLunar();
    $('#lunar-date').text(`${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`);
}


// ==================== 页面初始化 ====================
$(document).ready(function() {
    // 隐藏加载动画
    $('#loading-overlay').fadeOut();
    
    // 初始化按钮状态
    $('#start-countup').prop('disabled', false);
    $('#stop-countup').prop('disabled', true);
    $('#start-countdown').prop('disabled', false);
    $('#stop-countdown').prop('disabled', true);
    
    // 延迟初始化时钟，确保页面完全加载
    setTimeout(function() {
        // 初始化时间时钟
        try {
            timeClock = $('#time-clock').FlipClock({
                clockFace: 'TwentyFourHourClock',
                callbacks: {
                    interval: function() {
                        // 每10秒更新一次日期信息，减轻性能负担
                        if (new Date().getSeconds() % 10 === 0) {
                            updateDateInfo();
                        }
                    }
                }
            });
        } catch (e) {
            console.error('时间时钟初始化失败:', e);
        }

        // 初始化正计时时钟（默认隐藏）
        try {
            countupClock = $('#countup-clock').FlipClock(0, {
                clockFace: 'HourlyCounter'
            });
            countupClock.stop(); // 默认停止
        } catch (e) {
            console.error('正计时时钟初始化失败:', e);
        }

        // 初始化倒计时时钟（默认隐藏）
        try {
            countdownClock = $('#countdown-clock').FlipClock(60, { // 默认1分钟倒计时
                clockFace: 'HourlyCounter',
                countdown: true
            });
            countdownClock.stop(); // 默认停止
        } catch (e) {
            console.error('倒计时时钟初始化失败:', e);
        }
    }, 100); // 延迟100毫秒初始化

    // 初始更新日期信息
    updateDateInfo();

    
    // ==================== 导航栏功能 ====================
    // 导航栏点击事件
    $('.navbar a').on('click', function(e) {
        e.preventDefault();
        
        // 移除所有激活状态
        $('.navbar a').removeClass('active');
        
        // 添加当前激活状态
        $(this).addClass('active');
        
        // 隐藏所有时钟
        $('.clock').addClass('hidden');
        $('.controls').addClass('hidden');
        $('#date-info').addClass('hidden');
        
        // 获取模式
        var mode = $(this).data('mode');
        activeMode = mode;
        
        // 显示对应的时钟和控制按钮
        if (mode === 'time') {
            $('#time-clock').removeClass('hidden');
            $('#date-info').removeClass('hidden');
        } else if (mode === 'countup') {
            $('#countup-clock').removeClass('hidden');
            $('#countup-container .controls').removeClass('hidden');
        } else if (mode === 'countdown') {
            $('#countdown-clock').removeClass('hidden');
            $('#countdown-container .controls').removeClass('hidden');
        }
    });

    // ==================== 正计时控制功能 ====================
    // 正计时控制按钮
    $('#start-countup').on('click', function() {
        // 禁用按钮以防止重复点击
        $(this).prop('disabled', true);
        $('#stop-countup').prop('disabled', false);
        
        // 确保每次开始时都从0开始计时
        if (!countupClock.running) {
            countupClock.setTime(0);
        }
        countupClock.start();
    });
    
    $('#stop-countup').on('click', function() {
        // 禁用按钮以防止重复点击
        $(this).prop('disabled', true);
        $('#start-countup').prop('disabled', false);
        
        countupClock.stop();
    });
    
    $('#reset-countup').on('click', function() {
        countupClock.stop();
        countupClock.setTime(0);
        // 重新设置时间显示
        countupClock.face.reset();
        
        // 重置按钮状态
        $('#start-countup').prop('disabled', false);
        $('#stop-countup').prop('disabled', true);
        
        // 初始化倒计时按钮状态  
        $('#start-countdown').prop('disabled', false);
        $('#stop-countdown').prop('disabled', true);
    });


    // ==================== 倒计时控制功能 ====================
    $('#stop-countdown').on('click', function() {
        // 禁用按钮以防止重复点击
        $(this).prop('disabled', true);
        $('#start-countdown').prop('disabled', false);
        
        countdownClock.stop();
    });

    $('#reset-countdown').on('click', function() {
        // 重置为全局倒计时时间
        countdownClock.setTime(countdownTime);
        countdownClock.stop();
    
        // 添加回调清理
        countdownClock.timer.callbacks.interval = null;
        
        // 重置按钮状态
        $('#start-countdown').prop('disabled', false);
        $('#stop-countdown').prop('disabled', true);
    });

    
    // ==================== 音乐控制功能 ====================
    // 音乐控制按钮
    $('#music-toggle').on('click', function() {
        toggleMusic();
    });

    // 快捷选项按钮事件处理
    $('.quick-btn').on('click', function() {
        var minutes = parseInt($(this).data('minutes'));
        countdownTime = minutes * 60; // 设置全局倒计时时间
        
        countdownClock.setTime(countdownTime);

        // 如果时钟正在运行，重新开始
        if (countdownClock.running) {
            countdownClock.stop();
            countdownClock.start();
        }
    });
    
    
    // 倒计时开始按钮事件处理
    $('#start-countdown').on('click', function() {
        // 禁用按钮以防止重复点击
        $(this).prop('disabled', true);
        $('#stop-countdown').prop('disabled', false);
        
        // 禁用所有时间调整按钮
        $('.time-btn').prop('disabled', true);
        
        // 禁用所有快捷按钮
        $('.quick-btn').prop('disabled', true);
        
        // 先停止时钟再设置新时间
        countdownClock.stop();
        countdownClock.setTime(countdownTime);
        
        // 只在回调未设置时添加倒计时结束回调
        if (!countdownClock.timer.callbacks.interval) {
            countdownClock.timer.callbacks.interval = function() {
                // 检查倒计时是否结束
                if (countdownClock.getTime().time <= 0) {
                    // 播放倒计时结束音效
                    const chimeSound = new Audio('media/chime1.mp3');
                    chimeSound.play();
                    
                    // 暂停音乐
                    if (isMusicPlaying) {
                        toggleMusic();
                    }
                    
                    // 停止时钟
                    countdownClock.stop();
                    
                    // 重置按钮状态
                    $('#start-countdown').prop('disabled', false);
                    $('#stop-countdown').prop('disabled', true);
                    
                    // 重新启用时间调整按钮
                    $('.time-btn').prop('disabled', false);
                    
                    // 重新启用快捷按钮
                    $('.quick-btn').prop('disabled', false);
                    
                    // 1秒后恢复原来的时间
                    setTimeout(function() {
                        countdownClock.setTime(countdownTime);
                        // 清除回调以防止重复执行
                        countdownClock.timer.callbacks.interval = null;
                    }, 1000);
                }
            };
        }
        
        
        countdownClock.start();
    });

    $('#stop-countdown').on('click', function() {
        // 禁用按钮以防止重复点击
        $(this).prop('disabled', true);
        $('#start-countdown').prop('disabled', false);
        
        countdownClock.stop();
    });

    $('#reset-countdown').on('click', function() {
        // 重置为全局倒计时时间
        countdownClock.setTime(countdownTime);
        countdownClock.stop();

        // 添加回调清理
        countdownClock.timer.callbacks.interval = null;
        
        // 重置按钮状态
        $('#start-countdown').prop('disabled', false);
        $('#stop-countdown').prop('disabled', true);

        // 重新启用时间调整按钮
        $('.time-btn').prop('disabled', false);

        // 重新启用快捷按钮
        $('.quick-btn').prop('disabled', false);
    });

    // 重新启用快捷按钮
    $('.quick-btn').prop('disabled', false);
});


// ==================== 音乐切换器功能 ====================
// 音乐切换器显示/隐藏
var musicSwitcherTimeout;

$('#music-toggle').on('mouseenter', function() {
    // 清除之前的定时器
    clearTimeout(musicSwitcherTimeout);
    $('#music-switcher').removeClass('hidden');
});

$('#music-controls').on('mouseleave', function() {
    // 设置延迟隐藏定时器
    musicSwitcherTimeout = setTimeout(function() {
        $('#music-switcher').addClass('hidden');
    }, 2000); // 2秒延迟
});

// 音乐切换功能
$('.music-option').on('click', function() {
    // 移除所有激活状态
    $('.music-option').removeClass('active');
    
    // 添加当前激活状态
    $(this).addClass('active');
    
    // 获取选择的音乐文件和名称
    const musicSrc = $(this).data('src');
    const musicName = $(this).data('name');
    
    // 更新音频源
    const currentTime = backgroundMusic.currentTime;
    $('#background-music source').attr('src', musicSrc);
    backgroundMusic.load();
    backgroundMusic.currentTime = currentTime;
    
    // 更新显示的音乐名称
    $('#music-name').text(musicName);
    
    // 如果之前在播放，则继续播放
    if (isMusicPlaying) {
        backgroundMusic.play();
    }
});

// 初始化第一个音乐选项为激活状态
$('.music-option:first').addClass('active');
// 初始化显示第一个音乐的名称
$('#music-name').text($('.music-option:first').data('name'));


// ==================== 整点报时功能 ====================
// 添加整点、半点，分时报时功能
function checkHourlyChime() {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // 普通音效触发分钟
    const targetMinutesA = [0, 30];
    // 特殊音效触发分钟
    const targetMinutesB = [15, 45];

    if (seconds === 0 && (targetMinutesA.includes(minutes) || targetMinutesB.includes(minutes))) {
        const currentTime = `${now.getHours()}:${minutes}`;

        // 避免重复触发
        const lastChimeTime = localStorage.getItem('lastChimeTime');
        if (lastChimeTime !== currentTime) {
            localStorage.setItem('lastChimeTime', currentTime);

            let msg = '';
            let soundSrc = 'media/chime2.mp3';

            if (minutes === 0) msg = '整点';
            else if (minutes === 30) msg = '半点';
            else if (targetMinutesB.includes(minutes)) {
                msg = '分时报时';
                soundSrc = 'media/chime3.mp3';

            } else msg = '报时';

            console.log(`${msg}: ${now.getHours()}点${minutes}分`);

            // 播放对应音效
            const chimeSound = new Audio(soundSrc);
            chimeSound.play().catch(e => console.log('音频播放失败:', e));
        }
    }
}

// 启动报时检测（对齐到整分钟）
function startChimeChecker() {
    const now = new Date();
    const delay = (60 - now.getSeconds()) * 1000; // 距离下一个整分的毫秒数

    setTimeout(function() {
        checkHourlyChime(); // 在 xx:xx:00 执行一次
        setInterval(checkHourlyChime, 60000); // 之后每分钟执行一次
    }, delay);
}

// 页面初始化时调用
startChimeChecker();


// ==================== 时间同步功能 ====================
// 时间同步
setInterval(function() {
    console.log('时间同步和整点报时功能开始执行');
    
    // 时间同步功能
    console.log('时间同步功能开始执行');
    // 获取当前系统时间
    var now = new Date();
    console.log('当前系统时间:', now);
    
    // 更新FlipClock的时间基准
    console.log('timeClock object:', timeClock);
    if (timeClock) {
        // 正确访问factory对象，它在face对象中
        console.log('timeClock.face:', timeClock.face);
        if (timeClock.face && timeClock.face.factory) {
            // 更新factory的original时间为当前时间
            timeClock.face.factory.original = now;
            // 重新创建time对象以确保时间正确
            timeClock.face.factory.time = new FlipClock.Time(timeClock.face.factory, now);
            console.log('FlipClock时间基准已更新');
        } else {
            console.error('timeClock.face.factory未定义');
        }
    } else {
        console.error('timeClock未定义');
    }
    
    // 验证时间是否正确设置
    if (timeClock && timeClock.face && timeClock.face.factory && timeClock.face.factory.time) {
        // 使用getDateObject获取更准确的时间表示
        var updatedTime = timeClock.face.factory.time.getDateObject();
        console.log('更新后的时间:', updatedTime);
    }
    
    // 整点报时功能
    // checkHourlyChime();
}, 60000); // 每分钟执行一次

    
// ==================== 时间调整功能 ====================
// 时间调整按钮的事件处理
$('.time-btn').on('click', function() {
    var type = $(this).data('type');
    var action = $(this).data('action');
    
    // 使用全局变量而不是时钟当前时间，避免时钟运行状态的影响
    var currentTime = countdownTime; // 使用全局变量而不是 countdownClock.getTime().time
    var hours = Math.floor(currentTime / 3600);
    var minutes = Math.floor((currentTime % 3600) / 60);
    var seconds = currentTime % 60;
    
    // 根据按钮类型和操作调整时间
    if (type === 'hour') {
        if (action === 'plus') {
            hours = (hours + 1) % 24;
        } else if (action === 'minus') {
            hours = (hours - 1 + 24) % 24;
        }
        // 保持分钟和秒数不变
        minutes = Math.floor((countdownTime % 3600) / 60);
        seconds = countdownTime % 60;
    } else if (type === 'minute') {
        if (action === 'plus') {
            minutes = (minutes + 1) % 60;
        } else if (action === 'minus') {
            minutes = (minutes - 1 + 60) % 60;
        }
        // 保持小时和秒数不变
        hours = Math.floor(countdownTime / 3600);
        seconds = countdownTime % 60;
    } else if (type === 'second') {
        if (action === 'plus') {
            seconds = (seconds + 1) % 60;
        } else if (action === 'minus') {
            seconds = (seconds - 1 + 60) % 60;
        }
        // 保持小时和分钟不变
        hours = Math.floor(countdownTime / 3600);
        minutes = Math.floor((countdownTime % 3600) / 60);
    }
    
    // 计算新的总秒数
    var newTime = hours * 3600 + minutes * 60 + seconds;
    
    // 更新全局倒计时时间
    countdownTime = newTime;
    
    // 更新时钟显示
    countdownClock.setTime(newTime);
    
    // 如果时钟正在运行，重新开始
    if (countdownClock.running) {
        countdownClock.stop();
        countdownClock.start();
    }
});


// ==================== 屏幕常亮功能 ====================
// 注意：此功能已定义但未使用，HTML中没有对应的触发按钮
let wakeLock = null;

// 请求屏幕常亮
async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    console.log('Wake Lock is active');
    
    // 监听释放事件
    wakeLock.addEventListener('release', () => {
      console.log('Wake Lock was released');
    });
  } catch (err) {
    console.error(`${err.name}, ${err.message}`);
  }
}

// 释放屏幕常亮
async function releaseWakeLock() {
  if (wakeLock) {
    await wakeLock.release();
    wakeLock = null;
    console.log('Wake Lock released');
  }
}

// 需要用户交互来激活（例如按钮点击）
// document.getElementById('keepScreenOnBtn').addEventListener('click', requestWakeLock);


// ==================== 辅助功能函数 ====================
// 添加辅助函数，确保当前激活模式的内容可见
function showActiveModeContent() {
    // 隐藏所有时钟和控制
    $('.clock').addClass('hidden');
    $('.controls').addClass('hidden');
    $('#date-info').addClass('hidden');
    
    // 显示当前激活模式的内容
    if (activeMode === 'time') {
        $('#time-clock').removeClass('hidden');
        $('#date-info').removeClass('hidden');
    } else if (activeMode === 'countup') {
        $('#countup-clock').removeClass('hidden');
        $('#countup-container .controls').removeClass('hidden');
    } else if (activeMode === 'countdown') {
        $('#countdown-clock').removeClass('hidden');
        $('#countdown-container .controls').removeClass('hidden');
    }
    
    // 在移动设备上重新执行数字分组
    if (isMobile()) {
        setTimeout(groupClockDigits, 100);
    }
}


// ==================== 全屏功能 ====================
// 全屏功能实现
function toggleFullScreen() {
    const element = document.documentElement;
    const fullscreenToggle = document.getElementById('fullscreen-toggle');
    const icon = fullscreenToggle.querySelector('i');
    
    if (!document.fullscreenElement) {
        // 进入全屏
        if (element.requestFullscreen) {
            element.requestFullscreen().catch(err => {
                console.error(`全屏请求错误: ${err.message}`);
            });
        } else if (element.webkitRequestFullscreen) { /* Safari */
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { /* IE11 */
            element.msRequestFullscreen();
        }
        
        // 更新按钮图标
        icon.className = 'fas fa-compress';
        // 添加全屏模式类
        document.body.classList.add('fullscreen-mode');
        // 在全屏模式下，确保当前激活的模式内容可见
        showActiveModeContent();
    } else {
        // 退出全屏
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
        
        // 更新按钮图标
        icon.className = 'fas fa-expand';
        // 移除全屏模式类
        document.body.classList.remove('fullscreen-mode');
    }
}

// 添加全屏按钮点击事件
document.addEventListener('DOMContentLoaded', function() {
    const fullscreenToggle = document.getElementById('fullscreen-toggle');
    if (fullscreenToggle) {
        fullscreenToggle.addEventListener('click', toggleFullScreen);
    }
    
    // 监听全屏状态变化
    document.addEventListener('fullscreenchange', function() {
        const fullscreenToggle = document.getElementById('fullscreen-toggle');
        const icon = fullscreenToggle.querySelector('i');
        
        if (document.fullscreenElement) {
            icon.className = 'fas fa-compress';
            document.body.classList.add('fullscreen-mode');
            // 在全屏模式下，确保当前激活的模式内容可见
            showActiveModeContent();
        } else {
            icon.className = 'fas fa-expand';
            document.body.classList.remove('fullscreen-mode');
        }
    });
    
    // 添加全屏模式下的模式切换快捷键
    document.addEventListener('keydown', function(e) {
        if (document.fullscreenElement) {
            // 按1键切换到时间模式
            if (e.key === '1') {
                activeMode = 'time';
                showActiveModeContent();
            }
            // 按2键切换到正计时模式
            else if (e.key === '2') {
                activeMode = 'countup';
                showActiveModeContent();
            }
            // 按3键切换到倒计时模式
            else if (e.key === '3') {
                activeMode = 'countdown';
                showActiveModeContent();
            }
            // 按M键切换音乐播放状态
            else if (e.key === 'm' || e.key === 'M') {
                toggleMusic();
            }
        }
    });
});


// ==================== 设备检测功能 ====================
// 设备检测
function isMobile() {
    return /Mobi|Android|iPhone/i.test(navigator.userAgent);
}

document.addEventListener('DOMContentLoaded', function() {
    if (isMobile()) {
        document.body.classList.add('mobile-device');
    } else {
        document.body.classList.add('desktop-device');
    }
});


// ==================== 数字分组功能 ====================
// 移动设备数字分组功能
function groupClockDigits() {
    // 获取所有时钟容器
    const wrappers = document.querySelectorAll('.flip-clock-wrapper');
    
    wrappers.forEach(wrapper => {
        // 清除旧的分组
        wrapper.querySelectorAll('.flip-group').forEach(g => g.remove());

        // 筛选出所有数字翻页元素
        const digitElements = Array.from(wrapper.children).filter(child => 
            child.tagName === 'UL' && child.classList.contains('flip')
        );

        // 筛选出所有分隔符元素
        const dividerElements = Array.from(wrapper.children).filter(child => 
            child.tagName === 'SPAN' && child.classList.contains('flip-clock-divider')
        );

        // 根据数字翻页元素的数量进行分组
        if (digitElements.length >= 4) {
            let groups = [];
            
            if (digitElements.length >= 6) {
                // 时:分:秒 格式 (6个数字翻页元素)
                groups = [
                    [digitElements[0], digitElements[1]], // 小时
                    [digitElements[2], digitElements[3]], // 分钟
                    [digitElements[4], digitElements[5]]  // 秒
                ];
            } else if (digitElements.length >= 4) {
                // 分:秒 格式 (4个数字翻页元素)
                groups = [
                    [digitElements[0], digitElements[1]], // 分钟
                    [digitElements[2], digitElements[3]]  // 秒
                ];
            }
            
            // 创建分组容器
            groups.forEach(dset => {
                const groupDiv = document.createElement('div');
                groupDiv.classList.add('flip-group');
                dset.forEach(d => groupDiv.appendChild(d));
                wrapper.appendChild(groupDiv);
            });

            // 隐藏所有分隔符
            dividerElements.forEach(divider => {
                divider.style.display = 'none';
            });
        }
    });
}

// 初始化后执行
document.addEventListener('DOMContentLoaded', () => {
    if (isMobile()) {
        setTimeout(groupClockDigits, 600); // 等待 FlipClock 渲染完成再执行
    }
});


// ==================== 颜色切换功能 ====================
// 颜色切换功能
function toggleColorPicker() {
    const colorPicker = document.getElementById('color-picker');
    colorPicker.classList.toggle('hidden');
}

function changeClockColor(color) {
    if (color === 'default') {
        // 恢复默认颜色
        restoreDefaultColor();
        return;
    }
    
    // 采用更可靠的方法：直接修改FlipClock的CSS类
    const styleId = 'clock-color-style';
    let styleElement = document.getElementById(styleId);
    
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
    }
    
    // 设置所有时钟数字的颜色
    styleElement.textContent = `
        .flip-clock-wrapper ul li a div div.inn {
            color: ${color} !important;
            text-shadow: 0 1px 2px ${color}33 !important;
        }
        
        /* 翻转动画中的数字颜色 */
        .flip-clock-wrapper ul.play li.flip-clock-active .down div.inn,
        .flip-clock-wrapper ul.play li.flip-clock-before .up div.inn {
            color: ${color} !important;
            text-shadow: 0 1px 2px ${color}33 !important;
        }
        
        /* 日期信息颜色 */
        #date-info div {
            color: ${color} !important;
        }
        
        /* 调色盘按钮颜色 */
        .color-btn {
            background: linear-gradient(135deg, ${color} 0%, ${darkenColor(color, 20)} 100%) !important;
        }
        
        /* 按钮文字颜色 */
        .controls button,
        .quick-btn,
        .time-btn {
            color: ${color} !important;
        }
        
        /* 导航栏链接颜色 */
        .navbar a {
            color: ${color} !important;
        }
        

    `;
    
    // 隐藏颜色选择器
    document.getElementById('color-picker').classList.add('hidden');
    
    // 保存颜色偏好
    localStorage.setItem('clockColor', color);
}

function restoreDefaultColor() {
    // 移除自定义颜色样式
    const styleElement = document.getElementById('clock-color-style');
    if (styleElement) {
        styleElement.remove();
    }
    
    // 恢复调色盘按钮默认颜色
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    });
    
    // 隐藏颜色选择器
    document.getElementById('color-picker').classList.add('hidden');
    
    // 清除颜色偏好
    localStorage.removeItem('clockColor');
}

function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (
        0x1000000 +
        (R < 0 ? 0 : R) * 0x10000 +
        (G < 0 ? 0 : G) * 0x100 +
        (B < 0 ? 0 : B)
    ).toString(16).slice(1);
}

// 初始化颜色偏好
function initColorPreference() {
    const savedColor = localStorage.getItem('clockColor');
    if (savedColor) {
        if (savedColor === 'default') {
            // 如果是默认颜色，清除设置
            localStorage.removeItem('clockColor');
        } else {
            // 延迟执行以确保时钟完全加载
            setTimeout(() => {
                changeClockColor(savedColor);
            }, 300);
        }
    }
}

// 添加颜色选项点击事件
document.addEventListener('DOMContentLoaded', function() {
    const colorToggle = document.getElementById('color-toggle');
    if (colorToggle) {
        colorToggle.addEventListener('click', toggleColorPicker);
    }
    
    // 添加颜色选项点击事件
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            const color = this.getAttribute('data-color');
            if (color === 'default') {
                restoreDefaultColor();
            } else {
                changeClockColor(color);
            }
        });
        
        // 设置按钮背景色（排除默认颜色按钮）
        const color = option.getAttribute('data-color');
        if (color !== 'default') {
            option.style.backgroundColor = color;
        }
    });
    
    // 初始化颜色偏好
    initColorPreference();
});