
/* ================= LÓGICA DO APP (JS) ================= */

// DADOS DE EVOLUÇÃO (LINHAS CORRETAS)
const evolutionLines = {
    4: [ { lvl: 1, name: "Charmander", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/4.gif" }, { lvl: 16, name: "Charmeleon", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/5.gif" }, { lvl: 36, name: "Charizard", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/6.gif" } ],
    656: [ { lvl: 1, name: "Froakie", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/656.gif" }, { lvl: 16, name: "Frogadier", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/657.gif" }, { lvl: 36, name: "Greninja", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/658.gif" } ],
    390: [ { lvl: 1, name: "Chimchar", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/390.gif" }, { lvl: 14, name: "Monferno", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/391.gif" }, { lvl: 36, name: "Infernape", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/392.gif" } ],
    447: [ { lvl: 1, name: "Riolu", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/447.gif" }, { lvl: 25, name: "Lucario", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/448.gif" }, { lvl: 50, name: "Mega Lucario", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/10048.gif" } ],
    92: [ { lvl: 1, name: "Gastly", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/92.gif" }, { lvl: 25, name: "Haunter", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/93.gif" }, { lvl: 40, name: "Gengar", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/94.gif" } ],
    207: [ { lvl: 1, name: "Gligar", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/207.gif" }, { lvl: 25, name: "Gliscor", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/472.gif" }, { lvl: 50, name: "Gliscor V", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/shiny/472.gif" } ]
};

// EQUIPE PADRÃO COM ITENS VINCULADOS
const defaultTeam = [ 
    { id: 4, name: "Charmander", item: "Notebook", lvl: 1, xp: 0, max: 100 }, 
    { id: 656, name: "Froakie", item: "Livros", lvl: 1, xp: 0, max: 100 }, 
    { id: 390, name: "Chimchar", item: "Haltere", lvl: 1, xp: 0, max: 100 }, 
    { id: 447, name: "Riolu", item: "Coração", lvl: 1, xp: 0, max: 100 }, 
    { id: 92, name: "Gastly", item: "Meditação", lvl: 1, xp: 0, max: 100 }, 
    { id: 207, name: "Gligar", item: "Casa", lvl: 1, xp: 0, max: 100 } 
];

const defaultData = {
    missions: [{ name: "Estudar 30min", xp: 50, coins: 20, icon: "📚", linkedItem: "Livros" }],
    defeats: [{ name: "Procrastinei", xp: -20, coins: 0, icon: "💤" }],
    badges: Array(7).fill({ name: "Bloqueado", img: "🔒", desc: "Meta a definir", unlocked: false }),
    shop: [{ name: "Chocolate", cost: 50 }]
};

let player = {
    gold: 0, activeSlot: 0,
    team: JSON.parse(JSON.stringify(defaultTeam)),
    agenda: [], xpHistory: [], dailyMissions: {}
};

let config = JSON.parse(JSON.stringify(defaultData));
let myChart = null;
let tempMissionIndex = null;

// INICIALIZAÇÃO
window.onload = function() { loadData(); renderAll(); };

function loadData() {
    const lsC = localStorage.getItem('carlos_rpg_conf_v40');
    const lsP = localStorage.getItem('carlos_rpg_play_v40');
    if(lsC) config = JSON.parse(lsC);
    if(lsP) player = JSON.parse(lsP);
    if(!config.missions) config.missions = [];
    if(!player.team || player.team.length === 0) player.team = JSON.parse(JSON.stringify(defaultTeam));
    // Garante compatibilidade de itens
    player.team.forEach((p, i) => { if(!p.item) p.item = defaultTeam[i].item; });
}

window.saveData = function(silent = false) {
    localStorage.setItem('carlos_rpg_conf_v40', JSON.stringify(config));
    localStorage.setItem('carlos_rpg_play_v40', JSON.stringify(player));
    renderAll();
    if(!silent) showModal("SISTEMA", "Dados Salvos!", "", [{text:"OK", class:"btn-green", action:"closeModal"}]);
}

function renderAll() {
    updateStats();
    renderPartyBar();
    
    // MISSÕES
    const listM = document.getElementById('list-missions'); 
    listM.innerHTML = '';
    
    if (config.missions.length === 0) {
        listM.innerHTML = '<div style="text-align:center; padding:10px;">Sem missões.</div>';
    } else {
        let html = '';
        config.missions.forEach((m, i) => {
            let icon = getIconHtml(m.icon);
            let linkTag = m.linkedItem ? `<span class="item-tag">${m.linkedItem}</span>` : '';
            html += `
            <div class="mission-row" onclick="window.clickMission(${i})">
                <div style="display:flex; align-items:center;">
                    <span class="arrow-cursor">►</span> ${icon}
                    <div style="margin-left:5px; display:flex; flex-direction:column; align-items:flex-start;">
                        <span>${m.name}</span>
                        ${linkTag}
                    </div>
                </div>
                <span>+${m.xp}XP</span>
            </div>`;
        });
        listM.innerHTML = html;
    }

    // FALHAS
    const listD = document.getElementById('list-defeats'); 
    let htmlD = '';
    config.defeats.forEach((d, i) => {
        let icon = getIconHtml(d.icon);
        htmlD += `<div class="fail-btn" onclick="window.clickDefeat(${i})"><div class="fail-left">${icon} <span style="margin-left:5px;">${d.name}</span></div><span class="fail-xp">${d.xp} XP</span></div>`;
    });
    listD.innerHTML = htmlD;

    // BADGES
    const listB = document.getElementById('list-badges'); listB.innerHTML = '';
    config.badges.forEach((b, i) => {
        let content = getIconHtml(b.img, true);
        let unlockedClass = b.unlocked ? 'unlocked' : '';
        let todayIdx = new Date().getDay();
        let todayKey = new Date().toLocaleDateString('pt-BR');
        let progress = "";
        if(i === todayIdx) {
            let count = player.dailyMissions[todayKey] || 0;
            progress = `<br>(${count}/${b.goal})`;
        }
        listB.innerHTML += `<div class="badge-slot ${unlockedClass}">${content}<div class="badge-tooltip"><b>${b.name}</b><br>${b.desc}${progress}</div></div>`;
    });

    // LOJA
    const listS = document.getElementById('list-shop'); listS.innerHTML = '';
    config.shop.forEach((s, i) => {
        let canBuy = player.gold >= s.cost;
        listS.innerHTML += `
        <div class="shop-item">
            <span style="font-weight:bold; color:#333;">${s.name}</span>
            <span style="font-family:monospace; font-weight:bold; color:#d32f2f;">${s.cost} &#8369;</span>
            <button class="btn-buy" ${!canBuy?'disabled style="background:#ccc"':''} onclick="buyItem(${i})">COMPRAR</button>
        </div>`;
    });

    // AGENDA
    const listA = document.getElementById('list-agenda'); listA.innerHTML = '';
    player.agenda.slice().reverse().forEach(a => {
        listA.innerHTML += `<div style="border-bottom:1px solid #ccc; padding:5px; margin-bottom:5px;"><b style="color:#dc0a2d;">${a.date}</b> - ${a.text} <br><i style="color:#666;">${a.note||''}</i></div>`;
    });

    renderAdmin();
}

// --- LOGICA DE MISSÃO E XP VINCULADO ---
window.clickMission = function(index) {
    tempMissionIndex = index;
    let m = config.missions[index];
    let targetPoke = player.team.find(p => p.item === m.linkedItem);
    let targetName = targetPoke ? targetPoke.name : "Atual";
    let itemText = m.linkedItem ? `<br><small style="color:#555;">(Vai para: ${m.linkedItem} - ${targetName})</small>` : '';

    let html = `
        <p style="margin-bottom:10px;">Concluir: <b>${m.name}</b>${itemText}</p>
        <p style="font-size:0.8em; color:#666;">Recompensa: +${m.xp}XP | +${m.coins}₱</p>
        <input type="text" id="modal-note" class="modal-input" placeholder="Comentário opcional...">
    `;
    showModal("VITÓRIA!", null, html, [{text:"CONFIRMAR", class:"btn-green", action:"confirmMission"}]);
}

window.confirmMission = function() {
    if(tempMissionIndex === null) return;
    let m = config.missions[tempMissionIndex];
    
    // Procura Pokemon pelo Item
    let targetPoke = player.team.find(p => p.item === m.linkedItem);
    // Se não tiver item vinculado, vai pro ativo
    if (!targetPoke) targetPoke = player.team[player.activeSlot];
    
    let note = document.getElementById('modal-note').value;
    let date = new Date().toLocaleDateString('pt-BR');

    // Recompensa
    targetPoke.xp += parseInt(m.xp);
    player.gold += parseInt(m.coins);
    
    player.agenda.push({ date: date, text: `${m.name} -> ${targetPoke.name}`, note: note });
    player.xpHistory.push({ date: date.slice(0,5), xp: targetPoke.xp }); 

    // Badge Diária
    if(!player.dailyMissions[date]) player.dailyMissions[date] = 0;
    player.dailyMissions[date]++;
    let dayIndex = new Date().getDay();
    let badge = config.badges[dayIndex];
    if(badge.goal && player.dailyMissions[date] >= badge.goal && !badge.unlocked) {
        badge.unlocked = true;
        setTimeout(() => { showModal("CONQUISTA!", `Insígnia de ${badge.name} desbloqueada!`, "", [{text:"UHU!", class:"btn-green", action:"closeModal"}]); }, 600);
    }

    // Efeito Visual
    const container = document.getElementById('pokedex-box');
    container.classList.remove('success-effect');
    void container.offsetWidth; // Trigger reflow
    container.classList.add('success-effect');

    // Se o pokemon upou, checkLevel retorna true
    let leveledUp = checkLevel(targetPoke);
    
    saveData(true); 
    updateStats(); 
    
    // Só fecha o modal se não houve Level Up (pq o Level Up abre outro modal)
    if(!leveledUp) {
        closeModal();
    }
}

window.clickDefeat = function(index) {
    let d = config.defeats[index];
    let activePoke = player.team[player.activeSlot];
    
    const container = document.getElementById('pokedex-box');
    container.classList.remove('shake-effect');
    void container.offsetWidth;
    container.classList.add('shake-effect');

    activePoke.xp += parseInt(d.xp);
    if(activePoke.xp < 0) activePoke.xp = 0;
    
    saveData(true);
    updateStats();
}

window.buyItem = function(index) {
    let s = config.shop[index];
    if(player.gold >= s.cost) {
        player.gold -= parseInt(s.cost);
        let date = new Date().toLocaleDateString('pt-BR');
        player.agenda.push({ date: date, text: `Comprou: ${s.name}`, note: `-${s.cost} &#8369;` });
        showModal("LOJA", `Você comprou ${s.name}!`, "", [{text:"OK", class:"btn-green", action:"closeModal"}]);
        saveData(true);
    }
}

// Checa Nivel de um Pokemon Especifico
function checkLevel(poke) {
    let target = poke || player.team[player.activeSlot];
    let leveled = false;
    let oldLvl = target.lvl;

    while (target.xp >= target.max) {
        target.lvl++;
        target.xp -= target.max;
        target.max = Math.floor(target.max * 1.5);
        leveled = true;
    }

    if (leveled) {
        let evoData = evolutionLines[target.id];
        let isEvo = false;
        
        if (oldLvl < evoData[1].lvl && target.lvl >= evoData[1].lvl) {
            showModal("EVOLUÇÃO!", `${target.name} (Item: ${target.item}) evoluiu para ${evoData[1].name}!`, "", [{text:"INCRÍVEL!", class:"btn-green", action:"closeModal"}]);
            isEvo = true;
        } else if (oldLvl < evoData[2].lvl && target.lvl >= evoData[2].lvl) {
            showModal("EVOLUÇÃO!", `${target.name} (Item: ${target.item}) evoluiu para ${evoData[2].name}!`, "", [{text:"LENDÁRIO!", class:"btn-green", action:"closeModal"}]);
            isEvo = true;
        }

        if (!isEvo) {
            showModal("LEVEL UP!", `${target.name} (${target.item}) subiu para o Nível ${target.lvl}!`, "", [{text:"OK", class:"btn-green", action:"closeModal"}]);
        }
    }
    return leveled;
}

// --- UI HELPERS ---
function getIconHtml(txt, isBadge=false) {
    if(!txt) return '';
    if(txt.match(/^http/i)) return `<img src="${txt}" class="${isBadge?'badge-img':'list-icon-img'}">`;
    return `<span class="${isBadge?'badge-emoji-lg':'list-icon-emoji'}">${txt}</span>`;
}

function updateStats() {
    let activePoke = player.team[player.activeSlot];
    let evoData = evolutionLines[activePoke.id];
    let currentForm = evoData[0];
    if(activePoke.lvl >= evoData[1].lvl) currentForm = evoData[1];
    if(activePoke.lvl >= evoData[2].lvl) currentForm = evoData[2];

    document.getElementById('ui-img').src = currentForm.img;
    document.getElementById('ui-name').innerText = currentForm.name; 
    document.getElementById('ui-item').innerText = activePoke.item;
    document.getElementById('ui-lvl').innerText = activePoke.lvl;
    document.getElementById('ui-xp').innerText = activePoke.xp;
    document.getElementById('ui-next').innerText = activePoke.max;
    document.getElementById('ui-gold').innerText = player.gold;
    let pct = Math.min((activePoke.xp / activePoke.max) * 100, 100);
    document.getElementById('ui-xp-fill').style.width = pct + '%';
}

function renderPartyBar() {
    const bar = document.getElementById('party-bar'); bar.innerHTML = '';
    player.team.forEach((p, i) => {
        let evoData = evolutionLines[p.id];
        let currentForm = evoData[0];
        if(p.lvl >= evoData[1].lvl) currentForm = evoData[1];
        if(p.lvl >= evoData[2].lvl) currentForm = evoData[2];
        let activeClass = i === player.activeSlot ? 'active' : '';
        bar.innerHTML += `<div class="party-ball ${activeClass}" onclick="switchPoke(${i})" title="${p.name} - ${p.item}"><img src="${currentForm.img}"></div>`;
    });
}

function renderAdmin() {
    const tm = document.getElementById('admin-team'); tm.innerHTML = '';
    player.team.forEach((p, i) => {
        tm.innerHTML += `
        <div class="admin-row">
            <span style="font-size:0.7em; width:80px;">${p.name}</span>
            <input value="${p.item}" oninput="player.team[${i}].item=this.value" placeholder="Item/Área">
        </div>`;
    });

    const ms = document.getElementById('admin-missions'); ms.innerHTML = '';
    config.missions.forEach((m, i) => {
        let options = `<option value="">-- Item --</option>`;
        player.team.forEach(t => {
            let sel = t.item === m.linkedItem ? 'selected' : '';
            options += `<option value="${t.item}" ${sel}>${t.item}</option>`;
        });
        ms.innerHTML += `
        <div class="admin-row" style="flex-wrap:wrap;">
            <input value="${m.name}" oninput="config.missions[${i}].name=this.value" style="width:40%" placeholder="Missão">
            <input type="number" value="${m.xp}" oninput="config.missions[${i}].xp=this.value" style="width:15%" placeholder="XP">
            <input type="number" value="${m.coins}" oninput="config.missions[${i}].coins=this.value" style="width:15%" placeholder="$">
            <select onchange="config.missions[${i}].linkedItem=this.value" style="width:20%">${options}</select>
            <button class="btn-mini" onclick="removeItem('missions', ${i})">X</button>
        </div>`;
    });
    
    // Outros renders do admin...
    const ld = document.getElementById('admin-defeats'); ld.innerHTML = '';
    config.defeats.forEach((d, i) => {
        ld.innerHTML += `<div class="admin-row"><input value="${d.name}" oninput="config.defeats[${i}].name=this.value"><button class="btn-mini" onclick="removeItem('defeats', ${i})">X</button></div>`;
    });
    const lb = document.getElementById('admin-badges'); lb.innerHTML = '';
    config.badges.forEach((b, i) => {
        lb.innerHTML += `<div class="admin-row"><span>${b.name}</span><input type="number" value="${b.goal}" oninput="config.badges[${i}].goal=this.value" style="width:50px"></div>`;
    });
    const sh = document.getElementById('admin-shop'); sh.innerHTML = '';
    config.shop.forEach((s, i) => {
        sh.innerHTML += `<div class="admin-row"><input value="${s.name}" oninput="config.shop[${i}].name=this.value"><input type="number" value="${s.cost}" oninput="config.shop[${i}].cost=this.value" style="width:50px"><button class="btn-mini" onclick="removeItem('shop', ${i})">X</button></div>`;
    });
}

window.switchPoke = function(index) { player.activeSlot = index; renderAll(); }
window.addNew = function(type) {
    if(type==='missions') config.missions.push({name:'Nova', xp:10, coins:5, icon:'📝', linkedItem:''});
    if(type==='defeats') config.defeats.push({name:'Falha', xp:-10, icon:''});
    if(type==='shop') config.shop.push({name:'Item', cost:100});
    renderAll();
}
window.removeItem = function(type, index) { config[type].splice(index, 1); renderAll(); }
window.resetData = function() { if(confirm("Apagar tudo?")) { localStorage.clear(); location.reload(); } }
window.toggleAdmin = function() { const p = document.getElementById('admin-panel'); p.style.display = p.style.display === 'none' ? 'block' : 'none'; }
window.changePage = function(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('page-'+page).classList.add('active');
    document.getElementById('btn-'+page).classList.add('active');
    if(page === 'data') setTimeout(renderChart, 100);
}
function renderChart() {
    const ctx = document.getElementById('xpChart');
    if(!ctx) return;
    if(myChart) myChart.destroy();
    const labels = player.xpHistory.map(h => h.date);
    const data = player.xpHistory.map(h => h.xp);
    myChart = new Chart(ctx, { type: 'line', data: { labels: labels, datasets: [{ label: 'XP', data: data, borderColor: '#dc0a2d', backgroundColor: 'rgba(220,10,45,0.1)', fill: true }] }, options: { responsive: true, maintainAspectRatio: false } });
}
window.showModal = function(title, msg, html, buttons) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-msg').innerText = msg || '';
    document.getElementById('modal-extra-content').innerHTML = html || '';
    const footer = document.getElementById('modal-actions'); footer.innerHTML = '';
    buttons.forEach(b => {
        let btn = document.createElement('button');
        btn.className = `btn-modal ${b.class}`;
        btn.innerText = b.text;
        btn.onclick = window[b.action];
        footer.appendChild(btn);
    });
    document.getElementById('modal-container').classList.add('active');
    document.getElementById('modal-container').style.display = 'flex';
}
window.closeModal = function() { document.getElementById('modal-container').classList.remove('active'); document.getElementById('modal-container').style.display = 'none'; }