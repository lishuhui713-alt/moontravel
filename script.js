// ==========================================
// 🔴 配置区域：DeepSeek 官方 API
// ==========================================
const API_KEY = 'sk-aeac0b10fa294806bb6a8d7d89232685'; // 记得填回你的 Key
const API_URL = 'https://api.deepseek.com/chat/completions';
const MODEL_NAME = 'deepseek-chat';

// ==========================================
// 🖼️ 氛围感图片库 (国内可访问的高清图)
// ==========================================
const imageLibrary = {
    // 🌊 海洋/岛屿/湖泊
    sea: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80',
        'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1080&q=80',
        'https://images.unsplash.com/photo-1437719417032-8595fd9e9dc6?auto=format&fit=crop&w=1080&q=80',
        'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&w=1080&q=80'
    ],
    // ⛰️ 山川/自然/森林/草原
    nature: [
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1080&q=80',
        'https://images.unsplash.com/photo-1506260408121-e353d10b87c7?auto=format&fit=crop&w=1080&q=80',
        'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1080&q=80',
        'https://images.unsplash.com/photo-1501854140884-074cf27f606b?auto=format&fit=crop&w=1080&q=80'
    ],
    // 🏙️ 城市/现代/夜景
    city: [
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1080&q=80',
        'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1080&q=80',
        'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1080&q=80',
        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1080&q=80'
    ],
    // 🏮 古镇/历史/人文/寺庙
    ancient: [
        'https://images.unsplash.com/photo-1523589327685-61884dc40d7c?auto=format&fit=crop&w=1080&q=80',
        'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1080&q=80',
        'https://images.unsplash.com/photo-1626084478832-72a392095f68?auto=format&fit=crop&w=1080&q=80',
        'https://images.unsplash.com/photo-1599571343722-1d50c7c343e0?auto=format&fit=crop&w=1080&q=80'
    ]
};

// ==========================================

const starPositions = [
    { id: 'ningbo', top: 15, left: 15 },
    { id: 'shangrila', top: 25, left: 80 },
    { id: 'mangshi', top: 12, left: 65 },
    { id: 'xichang', top: 40, left: 8 },
    { id: 'quanzhou', top: 8, left: 45 },
    { id: 'fuzhou', top: 20, left: 92 },
    { id: 'huizhou', top: 32, left: 22 },
    { id: 'bazhong', top: 10, left: 58 }
];

let travelData = [];
let visitedCities = JSON.parse(localStorage.getItem('visitedCities')) || [];
let customData = JSON.parse(localStorage.getItem('customData')) || [];
window.currentGuideData = null;

document.addEventListener('DOMContentLoaded', () => {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            travelData = data;
            initSequence();
        })
        .catch(error => console.error('Error loading data:', error));

    const input = document.getElementById("aiInput");
    const btn = document.getElementById("searchBtn");

    if (input) {
        input.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                searchDestination();
            }
        });
    }
    if (btn) {
        btn.addEventListener("click", searchDestination);
    }
});

function initSequence() {
    setTimeout(() => {
        showStars();
        const searchBox = document.getElementById('searchBox');
        if (searchBox) {
            searchBox.style.opacity = '1';
            searchBox.style.pointerEvents = 'auto';
        }
    }, 5000);
}

function showStars() {
    const container = document.getElementById('starsContainer');
    container.innerHTML = '';

    starPositions.forEach((pos, index) => {
        const cityData = travelData.find(d => d.id === pos.id);
        if (!cityData) return;
        createStarElement(container, cityData, pos.top, pos.left, index * 0.2);
    });

    customData.forEach((cityData, index) => {
        if (!cityData.position) {
            cityData.position = {
                top: Math.random() * 45 + 5,
                left: Math.random() * 80 + 10
            };
            localStorage.setItem('customData', JSON.stringify(customData));
        }
        createStarElement(container, cityData, cityData.position.top, cityData.position.left, (starPositions.length + index) * 0.2);
    });
}

function createStarElement(container, data, top, left, delay) {
    const isVisited = visitedCities.includes(data.id);
    const starWrapper = document.createElement('div');
    starWrapper.className = `star-wrapper ${isVisited ? 'visited' : ''}`;
    starWrapper.id = `star-${data.id}`;
    starWrapper.style.top = top + '%';
    starWrapper.style.left = left + '%';
    starWrapper.style.transitionDelay = delay + 's';

    const displayName = isVisited ? `👣 ${data.city}` : data.city;

    starWrapper.innerHTML = `
        <div class="star"></div>
        <div class="city-name">${displayName}</div>
    `;
    starWrapper.onclick = () => openGuide(data);
    container.appendChild(starWrapper);
    setTimeout(() => { starWrapper.style.opacity = 1; }, 100);
}

// 辅助函数：根据类型获取一张随机图片
function getRandomImageByType(type) {
    // 默认类型
    if (!type || !imageLibrary[type]) type = 'nature';
    const images = imageLibrary[type];
    // 随机取一张
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
}

function openGuide(data) {
    if (!data) return;
    window.currentGuideData = data;

    const modalContent = document.querySelector('.modal-content');

    // 图片处理逻辑
    if (data.image) {
        // 如果数据里已经有了图片（无论是本地json的还是之前AI生成存下来的），直接用
        modalContent.style.backgroundImage = `url('${data.image}')`;
    } else {
        // 如果没有图片，根据 data.type 去图库里配一张
        // 如果 data.type 也没有（旧数据），默认用 nature
        const imageUrl = getRandomImageByType(data.type || 'nature');
        modalContent.style.backgroundImage = `url('${imageUrl}')`;
        // 把选中的图存进去，保证下次打开还是这张
        data.image = imageUrl;
    }

    // 设置半透明深色底色，保证文字清晰
    modalContent.style.backgroundColor = 'rgba(2, 11, 26, 0.6)';

    const modalBody = document.getElementById('modalBody');
    const checkId = data.id || data.city;

    const isNative = travelData.some(d => d.id === checkId);
    const isSaved = customData.some(d => d.id === checkId);
    const isVisited = visitedCities.includes(checkId);

    let html = `<div class="modal-inner-scroll">`;
    html += `<h2 class="modal-title">${data.title}</h2>`;

    // 按钮区域
    html += `<div class="action-buttons">`;

    if (!isNative) {
        const starBtnClass = isSaved ? 'action-btn star-btn active' : 'action-btn star-btn';
        const starBtnText = isSaved ? '🌟 已入星图' : '⭐ 收入星图';
        html += `<button id="starBtn" class="${starBtnClass}" onclick="toggleStar('${checkId}')">
                    ${starBtnText}
                 </button>`;
    }

    const visitBtnClass = isVisited ? 'action-btn visit-btn visited' : 'action-btn visit-btn';
    const visitBtnText = isVisited ? '✨ 已曾踏足' : '👣 标记足迹';
    html += `<button id="visitBtn" class="${visitBtnClass}" onclick="toggleVisit('${checkId}')">
                ${visitBtnText}
             </button>`;
    html += `</div>`;

    html += `<div class="modal-tags">`;
    if (data.tags) {
        data.tags.forEach(tag => { html += `<span>${tag}</span>`; });
    }
    html += `</div>`;

    html += `<div class="modal-text">`;
    if (Array.isArray(data.content)) {
        data.content.forEach(p => { html += `<p>${p}</p>`; });
    } else {
        html += `<p>${data.content}</p>`;
    }
    html += `</div>`;

    if (data.tips && data.tips.length > 0) {
        html += `<div class="modal-tips"><h4>✨ 旅行小贴士</h4><ul>`;
        data.tips.forEach(tip => { html += `<li>${tip}</li>`; });
        html += `</ul></div>`;
    }
    html += `</div>`;

    modalBody.innerHTML = html;
    document.getElementById('modal').classList.add('active');
}

window.toggleStar = function (id) {
    const btn = document.getElementById('starBtn');
    const isSaved = customData.some(d => d.id === id);

    if (isSaved) {
        customData = customData.filter(d => d.id !== id);
        btn.className = 'action-btn star-btn';
        btn.innerHTML = '⭐ 收入星图';
    } else {
        if (window.currentGuideData) {
            if (!window.currentGuideData.id) window.currentGuideData.id = id;
            customData.push(window.currentGuideData);
            btn.className = 'action-btn star-btn active';
            btn.innerHTML = '🌟 已入星图';
        }
    }
    localStorage.setItem('customData', JSON.stringify(customData));
    showStars();
}

window.toggleVisit = function (id) {
    const btn = document.getElementById('visitBtn');
    const starBtn = document.getElementById('starBtn');

    if (visitedCities.includes(id)) {
        visitedCities = visitedCities.filter(cityId => cityId !== id);
        btn.className = 'action-btn visit-btn';
        btn.innerHTML = '👣 标记足迹';
    } else {
        visitedCities.push(id);
        btn.className = 'action-btn visit-btn visited';
        btn.innerHTML = '✨ 已曾踏足';

        const isNative = travelData.some(d => d.id === id);
        const isSaved = customData.some(d => d.id === id);

        if (!isNative && !isSaved && window.currentGuideData) {
            if (!window.currentGuideData.id) window.currentGuideData.id = id;
            customData.push(window.currentGuideData);
            localStorage.setItem('customData', JSON.stringify(customData));
            if (starBtn) {
                starBtn.className = 'action-btn star-btn active';
                starBtn.innerHTML = '🌟 已入星图';
            }
        }
    }
    localStorage.setItem('visitedCities', JSON.stringify(visitedCities));
    showStars();
    // 强制刷新当前星星状态显示
    updateStarAppearance(id);
}

function updateStarAppearance(id) {
    const starWrapper = document.getElementById(`star-${id}`);
    if (starWrapper) {
        const isVisited = visitedCities.includes(id);
        const nameDiv = starWrapper.querySelector('.city-name');
        let rawName = nameDiv.innerText.replace('👣 ', '');

        if (isVisited) {
            starWrapper.classList.add('visited');
            nameDiv.innerHTML = `👣 ${rawName}`;
        } else {
            starWrapper.classList.remove('visited');
            nameDiv.innerHTML = rawName;
        }
    }
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

document.getElementById('modal').onclick = (e) => {
    if (e.target.id === 'modal') closeModal();
}

async function searchDestination() {
    const input = document.getElementById('aiInput');
    const btn = document.getElementById('searchBtn');
    const city = input.value.trim();

    if (!city) return;
    if (!API_KEY || API_KEY.includes('xxx')) {
        alert("请在 script.js 第5行填入 API Key！");
        return;
    }

    input.disabled = true;
    const originalPlaceholder = input.placeholder;
    input.value = "星辰链接中...";
    const originalBtnContent = btn.innerHTML;
    btn.innerHTML = `<svg class="loading-spin" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>`;

    try {
        const existingData = [...travelData, ...customData].find(d => d.city === city || d.id === city);
        if (existingData) {
            openGuide(existingData);
            return;
        }

        // 🌟 修改 Prompt: 让AI判断地点类型
        const prompt = `
            请为"${city}"这个地方写一份旅游攻略。
            角色设定：你是一位热爱生活、文笔温柔的旅行博主。
            要求：
            1. 判断该地点最符合以下哪种类型：['sea', 'nature', 'city', 'ancient'] (只能选一个)。
            2. 严格返回纯 JSON 格式，不要包含 Markdown。
            
            JSON结构如下：
            {
                "id": "${city}",
                "city": "${city}",
                "type": "类型(如sea)",
                "title": "标题",
                "tags": ["#标签1", "#标签2"],
                "content": ["第一段...", "第二段..."],
                "tips": ["贴士1", "贴士2"]
            }
        `;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [
                    { role: "system", content: "你是一个输出 JSON 格式的旅行助手。" },
                    { role: "user", content: prompt }
                ],
                temperature: 0.8,
                stream: false
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        let aiContent = data.choices[0].message.content;
        aiContent = aiContent.replace(/```json/g, '').replace(/```/g, '').trim();

        const guideData = JSON.parse(aiContent);
        if (!guideData.id) guideData.id = city;

        // 🌟 关键点：我们不生成AI图了，而是根据AI判断的type，去库里拿一张高清图
        // 这样100%有图，而且很美
        // 如果AI没返回type，默认用nature
        guideData.image = getRandomImageByType(guideData.type);

        openGuide(guideData);

    } catch (error) {
        console.error("AI Error:", error);
        alert("连接星辰失败：" + error.message);
    } finally {
        input.disabled = false;
        input.value = "";
        input.placeholder = originalPlaceholder;
        btn.innerHTML = originalBtnContent;
        input.focus();
    }
}