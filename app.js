/* --- DADOS INICIAIS --- */
const pokemonDB = { 1: "Bulbasaur" }; 
const evolutionLines = {
    1: [ { lvl: 1, name: "Bulbasaur", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/1.gif" } ],
    4: [ { lvl: 1, name: "Charmander", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/4.gif" }, { lvl: 16, name: "Charmeleon", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/5.gif" }, { lvl: 36, name: "Charizard", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/6.gif" } ],
    7: [ { lvl: 1, name: "Squirtle", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/7.gif" } ],
    25: [ { lvl: 1, name: "Pichu", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/172.gif" } ],
    133: [ { lvl: 1, name: "Eevee", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/133.gif" } ],
    656: [ { lvl: 1, name: "Froakie", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/656.gif" } ],
    390: [ { lvl: 1, name: "Chimchar", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/390.gif" } ],
    447: [ { lvl: 1, name: "Riolu", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/447.gif" } ],
    92: [ { lvl: 1, name: "Gastly", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/92.gif" } ],
    207: [ { lvl: 1, name: "Gligar", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/207.gif" } ],
    150: [ { lvl: 1, name: "Mewtwo", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/150.gif" } ],
    149: [ { lvl: 1, name: "Dratini", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/147.gif" } ]
};

const defaultTeam = [ 
    { id: 4, name: "Charmander", item: "Carreira e estudos", lvl: 1, xp: 0, max: 100 }, 
    { id: 656, name: "Froakie", item: "Saúde física", lvl: 1, xp: 0, max: 100 }, 
    { id: 390, name: "Chimchar", item: "Relacionamentos", lvl: 1, xp: 0, max: 100 }, 
    { id: 447, name: "Riolu", item: "Propósito e espiritualidade", lvl: 1, xp: 0, max: 100 }, 
    { id: 92, name: "Gastly", item: "Finanças", lvl: 1, xp: 0, max: 100 }, 
    { id: 207, name: "Gligar", item: "Saúde mental e emocional", lvl: 1, xp: 0, max: 100 } 
];

const defaultData = {
    missions: [],
    defeats: [],
    badges: Array(7).fill({ name: "Bloqueado", img: "🔒", desc: "Meta a definir", unlocked: false }),
    shop: []
};

// --- ESTADO DO APP ---
let player = {
    gold: 0, activeSlot: 0,
    team: JSON.parse(JSON.stringify(defaultTeam)),
    agenda: [], xpHistory: [], dailyMissions: {}, dailyStats: {}
};

let config = JSON.parse(JSON.stringify(defaultData));
let myChart = null;
let tempMissionIndex = null;

// --- DOM CACHE (Melhoria de Performance) ---
const elListMissions = document.getElementById('list-missions');
const elListDefeats = document.getElementById('list-defeats');
const elListBadges = document.getElementById('list-badges');
const elListShop = document.getElementById('list-shop');
const elListAgenda = document.getElementById('list-agenda');

// --- INICIALIZAÇÃO ---
window.onload = function() { loadData(); checkDailyExpiry(); renderAll(); };

function loadData() {
    try {
        const lsC = localStorage.getItem('pokeday_conf_v57');
        const lsP = localStorage.getItem('pokeday_play_v57');
        
        // MIGRATION: Tenta pegar dados da versão V56 se não houver V57
        if (!lsC) {
            const oldC = localStorage.getItem('pokeday_conf_v56');
            if (oldC) config = JSON.parse(oldC);
        } else {
            config = JSON.parse(lsC);
        }

        if (!lsP) {
            const oldP = localStorage.getItem('pokeday_play_v56');
            if (oldP) player = JSON.parse(oldP);
        } else {
            player = JSON.parse(lsP);
        }

        if(!config.missions) config.missions = [];
        if(!player.team || player.team.length === 0 || !player.team[0].item) {
             player.team = JSON.parse(JSON.stringify(defaultTeam));
        }
        if(!player.dailyStats) player.dailyStats = {};
        config.missions.forEach(m => { if(!m.createdAt) m.createdAt = new Date().toISOString(); });
        
        player.team.forEach(p => {
            if(!evolutionLines[p.id]) {
                 evolutionLines[p.id] = [ { lvl: 1, name: p.name, img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${p.id}.gif` } ];
            }
        });
    } catch(e) { console.log("Reset or First Load"); }
}

window.saveData = function(silent = false) {
    localStorage.setItem('pokeday_conf_v57', JSON.stringify(config));
    localStorage.setItem('pokeday_play_v57', JSON.stringify(player));
    renderAll();
    if(!silent) showModal("SISTEMA", "Dados Salvos!", "", [{text:"OK", class:"btn-green", action:"closeModal"}]);
}

// --- FUNÇÕES DE IMPORTAR E EXPORTAR SAVE ---
window.exportSave = function() {
    const dataToExport = {
        config: config,
        player: player,
        version: "v57"
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "save_pokeday.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

window.importSave = function(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData.config && importedData.player) {
                if(confirm("Isso irá substituir todos os dados atuais. Tem certeza?")) {
                    config = importedData.config;
                    player = importedData.player;
                    saveData(true);
                    alert("Save importado com sucesso!");
                    location.reload();
                }
            } else {
                alert("Arquivo de save inválido.");
            }
        } catch(error) {
            alert("Erro ao ler o arquivo.");
        }
    };
    reader.readAsText(file);
}

function checkDailyExpiry() {
    let now = new Date();
    let missionsToRemove = [];
    config.missions.forEach((m, index) => {
        if (m.type === 'daily' && m.createdAt) {
            let created = new Date(m.createdAt);
            let expireDate = new Date(created);
            expireDate.setDate(expireDate.getDate() + 1);
            expireDate.setHours(5, 0, 0, 0);
            if (now >= expireDate) {
                missionsToRemove.push(index);
                player.agenda.push({ date: new Date().toLocaleDateString('pt-BR'), text: `Expirou: ${m.name}`, note: "Não completada a tempo." });
            }
        }
    });
    for (let i = missionsToRemove.length - 1; i >= 0; i--) {
        config.missions.splice(missionsToRemove[i], 1);
    }
    if(missionsToRemove.length > 0) saveData(true);
}

// --- FETCH ASYNC/AWAIT (MODERNO) ---
window.fetchPokemon = async function(index) {
    let idInput = document.getElementById(`poke-id-${index}`);
    let id = idInput.value;
    if(!id) return;
    
    let btn = document.getElementById(`btn-search-${index}`);
    let originalText = btn.innerText;
    btn.innerText = "⌛";

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!response.ok) throw new Error('Pokémon não encontrado');
        
        const data = await response.json();
        let name = data.name.charAt(0).toUpperCase() + data.name.slice(1);
        let sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${data.id}.gif`;
        
        player.team[index].id = data.id;
        player.team[index].name = name;
        evolutionLines[data.id] = [{ lvl: 1, name: name, img: sprite }];
        
        saveData(true);
        btn.innerText = "✅";
    } catch (error) {
        alert("Erro: Pokémon não encontrado!");
        btn.innerText = "❌";
    } finally {
        setTimeout(() => btn.innerText = originalText, 1000);
    }
}

function renderAll() {
    updateStats();
    renderPartyBar();
    
    // RENDERIZAÇÃO OTIMIZADA DAS LISTAS
    
    // 1. MISSÕES
    let htmlMissions = '';
    if (config.missions.length === 0) {
        htmlMissions = '<div style="text-align:center; padding:10px;">Sem missões.</div>';
    } else {
        config.missions.forEach((m, i) => {
            let icon = getIconHtml(m.icon);
            let linkTag = m.linkedItem ? `<span class="item-tag">${m.linkedItem}</span>` : '';
            let typeIcon = m.type === 'story' ? '📖' : '📅';
            htmlMissions += `
            <div class="mission-row" onclick="window.clickMission(${i})">
                <div style="display:flex; align-items:center;">
                    <span class="arrow-cursor">►</span> ${icon}
                    <div style="margin-left:5px; display:flex; flex-direction:column; align-items:flex-start;">
                        <span>${m.name}</span>
                        <div style="display:flex; gap:5px;">${linkTag} <span style="font-size:0.7em">${typeIcon}</span></div>
                    </div>
                </div>
                <span>+${m.xp}XP</span>
            </div>`;
        });
    }
    elListMissions.innerHTML = htmlMissions;

    // 2. FALHAS
    let htmlDefeats = '';
    if (config.defeats.length === 0) {
         htmlDefeats = '<div style="text-align:center; padding:10px;">Sem falhas registradas.</div>';
    } else {
        config.defeats.forEach((d, i) => {
            let icon = getIconHtml(d.icon);
            htmlDefeats += `<div class="fail-btn" onclick="window.clickDefeat(${i})"><div class="fail-left">${icon} <span style="margin-left:5px;">${d.name}</span></div><span class="fail-xp">${d.xp} XP</span></div>`;
        });
    }
    elListDefeats.innerHTML = htmlDefeats;

    // 3. INSÍGNIAS
    let htmlBadges = '';
    config.badges.forEach((b, i) => {
        let lockedUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
        let unlockedClass = b.unlocked ? 'unlocked' : '';
        let content = "";
        if(b.unlocked) {
            if(b.img.match(/^http/i)) {
                 content = `<img src="${b.img}" class="badge-img">`;
            } else {
                 content = `<span class="badge-emoji">${b.img}</span>`;
            }
        } else {
            content = `<img src="${lockedUrl}" class="badge-locked">`;
        }

        let todayIdx = new Date().getDay();
        let progress = i === todayIdx ? `<br>(${player.dailyMissions[new Date().toLocaleDateString('pt-BR')]||0}/${b.goal})` : "";
        htmlBadges += `<div class="badge-slot ${unlockedClass}">${content}<div class="badge-tooltip"><b>${b.name}</b><br>${b.desc}${progress}</div></div>`;
    });
    elListBadges.innerHTML = htmlBadges;

    // 4. LOJA
    let htmlShop = '';
    if (config.shop.length === 0) {
         htmlShop = '<div style="text-align:center; padding:10px;">Loja vazia.</div>';
    } else {
        config.shop.forEach((s, i) => {
            let canBuy = player.gold >= s.cost;
            htmlShop += `
            <div class="shop-item">
                <span style="font-weight:bold; color:#333;">${s.name}</span>
                <span style="font-family:monospace; font-weight:bold; color:#d32f2f;">${s.cost} ₱</span>
                <button class="btn-buy" ${!canBuy?'disabled style="background:#ccc"':''} onclick="buyItem(${i})">COMPRAR</button>
            </div>`;
        });
    }
    elListShop.innerHTML = htmlShop;

    // 5. AGENDA
    let htmlAgenda = '';
    player.agenda.slice().reverse().forEach(a => {
        htmlAgenda += `<div style="border-bottom:1px solid #ccc; padding:5px; margin-bottom:5px;"><b style="color:#dc0a2d;">${a.date}</b> - ${a.text} <br><i style="color:#666;">${a.note||''}</i></div>`;
    });
    elListAgenda.innerHTML = htmlAgenda;

    renderAdmin();
}

window.clickMission = function(index) {
    tempMissionIndex = index;
    let m = config.missions[index];
    let itemText = m.linkedItem ? `<br><small style="color:#555;">(Vai para: ${m.linkedItem})</small>` : '';
    let html = `<p style="margin-bottom:10px;">Concluir: <b>${m.name}</b>${itemText}</p><p style="font-size:0.8em; color:#666;">Recompensa: +${m.xp}XP | +${m.coins}₱</p><input type="text" id="modal-note" class="modal-input" placeholder="Comentário opcional..."><button class="btn-modal btn-green" onclick="window.confirmMission(${index})">CONFIRMAR</button>`;
    showModal("VITÓRIA!", null, html, []);
}

window.confirmMission = function(index) {
    if(tempMissionIndex === null && index === undefined) return;
    if(index === undefined) index = tempMissionIndex;
    
    let m = config.missions[index];
    let targetPoke = null;
    if(m.linkedItem && m.linkedItem !== "") { targetPoke = player.team.find(p => p.item === m.linkedItem); }
    if (!targetPoke) targetPoke = player.team[player.activeSlot];
    
    let note = document.getElementById('modal-note').value;
    let dateKey = new Date().toLocaleDateString('pt-BR');

    targetPoke.xp += parseInt(m.xp);
    player.gold += parseInt(m.coins);

    if(!player.dailyStats[dateKey]) player.dailyStats[dateKey] = { gained: 0, lost: 0 };
    player.dailyStats[dateKey].gained += parseInt(m.xp);
    
    player.agenda.push({ date: dateKey, text: `Concluído: ${m.name} (${targetPoke.name})`, note: note });
    
    if(m.type === 'daily') config.missions.splice(index, 1);

    if(!player.dailyMissions[dateKey]) player.dailyMissions[dateKey] = 0;
    player.dailyMissions[dateKey]++;
    let dayIndex = new Date().getDay();
    let badge = config.badges[dayIndex];
    if(badge.goal && player.dailyMissions[dateKey] >= badge.goal && !badge.unlocked) {
        badge.unlocked = true;
        setTimeout(() => { showModal("CONQUISTA!", `Insígnia de ${badge.name} desbloqueada!`, "", [{text:"UHU!", class:"btn-green", action:"closeModal"}]); }, 600);
    }

    const container = document.getElementById('pokedex-box');
    container.classList.remove('success-effect');
    void container.offsetWidth; 
    container.classList.add('success-effect');
    setTimeout(() => container.classList.remove('success-effect'), 500);

    let leveledUp = checkLevel(targetPoke);
    saveData(true); 
    updateStats(); 
    if(!leveledUp) closeModal();
    tempMissionIndex = null;
}

window.clickDefeat = function(index) {
    let d = config.defeats[index];
    let dateKey = new Date().toLocaleDateString('pt-BR');
    const container = document.getElementById('pokedex-box');
    container.classList.remove('shake-effect');
    void container.offsetWidth;
    container.classList.add('shake-effect');
    setTimeout(() => container.classList.remove('shake-effect'), 500);

    if(!player.dailyStats[dateKey]) player.dailyStats[dateKey] = { gained: 0, lost: 0 };
    player.dailyStats[dateKey].lost += Math.abs(parseInt(d.xp));

    player.team.forEach(p => {
        p.xp += parseInt(d.xp);
        if(p.xp < 0) p.xp = 0;
    });
    player.agenda.push({ date: dateKey, text: `Falha: ${d.name}`, note: `XP Perdido: ${d.xp} (Todos)` });
    saveData(true);
    updateStats();
}

window.buyItem = function(index) {
    let s = config.shop[index];
    if(player.gold >= s.cost) {
        player.gold -= parseInt(s.cost);
        let dateKey = new Date().toLocaleDateString('pt-BR');
        player.agenda.push({ date: dateKey, text: `Compra: ${s.name}`, note: `-${s.cost} ₱` });
        showModal("LOJA", `Você comprou ${s.name}!`, "", [{text:"OK", class:"btn-green", action:"closeModal"}]);
        saveData(true);
    }
}

function checkLevel(poke) {
    let oldLvl = poke.lvl;
    let leveled = false;
    while (poke.xp >= poke.max) {
        poke.lvl++;
        poke.xp -= poke.max;
        poke.max = Math.floor(poke.max * 1.5);
        leveled = true;
    }
    if (leveled) {
        let dateKey = new Date().toLocaleDateString('pt-BR');
        player.agenda.push({ date: dateKey, text: `LEVEL UP! ${poke.name}`, note: `Alcançou nível ${poke.lvl}` });
        
        let evoData = evolutionLines[poke.id];
        if (evoData) {
            if (oldLvl < evoData[1].lvl && poke.lvl >= evoData[1].lvl) {
                 showModal("EVOLUÇÃO!", `${poke.name} está evoluindo!`, "", [{text:"UAU!", class:"btn-green", action:"closeModal"}]);
            } else {
                 showModal("LEVEL UP!", `${poke.name} subiu para o Nível ${poke.lvl}!`, "", [{text:"OK", class:"btn-green", action:"closeModal"}]);
            }
        }
    }
    return leveled;
}

function getIconHtml(txt) { if(!txt) return ''; if(txt.match(/^http/i)) return `<img src="${txt}" class="list-icon-img">`; return `<span class="list-icon-emoji">${txt}</span>`; }
function updateStats() {
    let activePoke = player.team[player.activeSlot];
    let evoData = evolutionLines[activePoke.id] || [{lvl:1, name: activePoke.name, img:`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${activePoke.id}.gif`}]; 
    let currentForm = evoData[0];
    if(evoData[1] && activePoke.lvl >= evoData[1].lvl) currentForm = evoData[1];
    if(evoData[2] && activePoke.lvl >= evoData[2].lvl) currentForm = evoData[2];

    document.getElementById('ui-img').src = currentForm.img;
    document.getElementById('ui-name').innerText = currentForm.name; 
    
    let itemDisplay = activePoke.item ? activePoke.item : "...";
    document.getElementById('ui-item').innerText = itemDisplay;
    
    document.getElementById('ui-lvl').innerText = activePoke.lvl;
    document.getElementById('ui-xp').innerText = activePoke.xp;
    document.getElementById('ui-next').innerText = activePoke.max;
    let pct = Math.min((activePoke.xp / activePoke.max) * 100, 100);
    document.getElementById('ui-xp-fill').style.width = pct + '%';
}

function renderPartyBar() {
    const bar = document.getElementById('party-bar'); bar.innerHTML = '';
    player.team.forEach((p, i) => {
        let evoData = evolutionLines[p.id] || [{lvl:1, name: p.name, img:`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${p.id}.gif`}];
        let currentForm = evoData[0];
        if(evoData[1] && p.lvl >= evoData[1].lvl) currentForm = evoData[1];
        if(evoData[2] && p.lvl >= evoData[2].lvl) currentForm = evoData[2];

        let activeClass = i === player.activeSlot ? 'active' : '';
        bar.innerHTML += `<div class="party-ball ${activeClass}" onclick="window.switchPoke(${i})" title="${p.name} - ${p.item}"><img src="${currentForm.img}"></div>`;
    });
}

function renderAdmin() {
    const tm = document.getElementById('admin-team'); tm.innerHTML = '';
    
    player.team.forEach((p, i) => {
        tm.innerHTML += `
        <div class="grid-team">
            <input type="number" class="admin-input" id="poke-id-${i}" value="${p.id}">
            <button id="btn-search-${i}" class="btn-search" onclick="fetchPokemon(${i})">🔍</button>
            <input value="${p.name}" oninput="player.team[${i}].name=this.value" class="admin-input">
            <input value="${p.item}" oninput="player.team[${i}].item=this.value" class="admin-input">
        </div>`;
    });

    const ms = document.getElementById('admin-missions'); ms.innerHTML = '';
    config.missions.forEach((m, i) => {
        let options = `<option value="">-- Item --</option>`;
        player.team.forEach(t => {
            let sel = t.item === m.linkedItem ? 'selected' : '';
            options += `<option value="${t.item}" ${sel}>${t.item}</option>`;
        });
        
        let typeSel = `
            <select onchange="config.missions[${i}].type=this.value" class="admin-input">
                <option value="daily" ${m.type==='daily'?'selected':''}>Diária</option>
                <option value="story" ${m.type==='story'?'selected':''}>História</option>
            </select>
        `;

        ms.innerHTML += `
        <div class="grid-missions">
            <input value="${m.name}" oninput="config.missions[${i}].name=this.value" class="admin-input">
            <input value="${m.icon}" oninput="config.missions[${i}].icon=this.value" class="admin-input">
            <input type="number" value="${m.xp}" oninput="config.missions[${i}].xp=this.value" class="admin-input">
            <input type="number" value="${m.coins}" oninput="config.missions[${i}].coins=this.value" class="admin-input">
            <select onchange="config.missions[${i}].linkedItem=this.value" class="admin-input">${options}</select>
            ${typeSel}
            <button class="btn-mini" onclick="removeItem('missions', ${i})">X</button>
        </div>`;
    });

    const ld = document.getElementById('admin-defeats'); ld.innerHTML = '';
    config.defeats.forEach((d, i) => { 
        ld.innerHTML += `
        <div class="grid-falhas">
            <input value="${d.name}" oninput="config.defeats[${i}].name=this.value" class="admin-input">
            <input type="number" value="${d.xp}" oninput="config.defeats[${i}].xp=this.value" class="admin-input">
            <input value="${d.icon}" oninput="config.defeats[${i}].icon=this.value" class="admin-input">
            <button class="btn-mini" onclick="removeItem('defeats', ${i})">X</button>
        </div>`; 
    });

    // CORREÇÃO DOS NOMES DOS DIAS
    const lb = document.getElementById('admin-badges'); lb.innerHTML = '';
    const dayNames = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"];
    
    config.badges.forEach((b, i) => { 
        lb.innerHTML += `
        <div class="grid-badges">
            <span class="slot-label">${dayNames[i]}</span>
            <input value="${b.name}" oninput="config.badges[${i}].name=this.value" class="admin-input">
            <input type="number" value="${b.goal}" oninput="config.badges[${i}].goal=this.value" class="admin-input">
            <input value="${b.img}" oninput="config.badges[${i}].img=this.value" class="admin-input">
        </div>`; 
    });

    const sh = document.getElementById('admin-shop'); sh.innerHTML = '';
    config.shop.forEach((s, i) => { 
        sh.innerHTML += `
        <div class="grid-shop">
            <input value="${s.name}" oninput="config.shop[${i}].name=this.value" class="admin-input">
            <input type="number" value="${s.cost}" oninput="config.shop[${i}].cost=this.value" class="admin-input">
            <button class="btn-mini" onclick="removeItem('shop', ${i})">X</button>
        </div>`; 
    });
}

window.switchPoke = function(index) { player.activeSlot = index; renderAll(); }
window.addNew = function(type) {
    if(type==='missions') config.missions.push({name:'Nova', xp:10, coins:5, icon:'📝', linkedItem:'', type:'daily', createdAt: new Date().toISOString()});
    if(type==='defeats') config.defeats.push({name:'Falha', xp:-20, icon:'💀'});
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
    const labels = [];
    const dataGained = [];
    const dataLost = [];
    
    for(let i=6; i>=0; i--) {
        let d = new Date();
        d.setDate(d.getDate() - i);
        let key = d.toLocaleDateString('pt-BR');
        labels.push(key.slice(0,5)); 
        let dayData = player.dailyStats[key] || { gained: 0, lost: 0 };
        dataGained.push(dayData.gained);
        dataLost.push(dayData.lost);
    }

    myChart = new Chart(ctx, { 
        type: 'line', 
        data: { 
            labels: labels, 
            datasets: [
                { label: 'Ganhos', data: dataGained, borderColor: '#2196f3', backgroundColor: 'rgba(33, 150, 243, 0.2)', fill: true },
                { label: 'Perdas', data: dataLost, borderColor: '#f44336', backgroundColor: 'rgba(244, 67, 54, 0.2)', fill: true }
            ] 
        }, 
        options: { responsive: true, maintainAspectRatio: false } 
    });
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
        if(b.action === "confirmMission") { /* Handled in onclick gen above */ }
        footer.appendChild(btn);
    });
    document.getElementById('modal-container').classList.add('active');
    document.getElementById('modal-container').style.display = 'flex';
}
window.closeModal = function() { document.getElementById('modal-container').classList.remove('active'); document.getElementById('modal-container').style.display = 'none'; }