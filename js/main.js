import { initializeApp }from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, setDoc, getDoc } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBrBUGG41UyOhzfzYYxI7UvZtlv5vf9eV4",
    authDomain: "liostrid-project.firebaseapp.com",
    projectId: "liostrid-project",
    storageBucket: "liostrid-project.firebasestorage.app",
    messagingSenderId: "673824565533",
    appId: "1:673824565533:web:45fc850c86fa68361fd9f4"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

const burger= document.querySelector('.burger');
const navLinks= document.querySelector('.linknav');

if (burger && navLinks) {
    burger.addEventListener('click',() => {
        navLinks.classList.toggle('active');
    });
}

document.querySelectorAll('a[href^="#"]').forEach( function(link){
    link.addEventListener('click', function(e){
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target){
             target.scrollIntoView({ 
                behavior: 'smooth'
            });
            }
        if (navLinks){
            navLinks.classList.remove('active');
        }
    });
});


const svcDefaults = {
    athlete: {
        title: 'Athlete Management',
        short: 'Complete career management and support for professional athletes.',
       
    },
    scouting: {
        title: 'Scouting',
        short: 'Identifying and developing the next generation of sporting talent. Our Scouting service identifies and develops'+
        ' the next generation of sporting talent. '+
        'We have a network of scouts across the world '+
        'who identify promising young athletes',
       
    },
    race: {
        title: 'Race Placement',
        short: 'Strategic placement of athletes in top competitions worldwide.'+
        'Our Race Placement service strategically '+'places athletes in top competitions worldwide.', 
    }
};

async function renderServices() {
    const keys  = ['athlete', 'scouting', 'race'];
    const cards = document.querySelectorAll('.service-card');
    for (let i = 0; i < keys.length; i++) {
        try {
            const snap = await getDoc(doc(db, 'services', keys[i]));
            const p = cards[i] && cards[i].querySelector('p');
            if (p && snap.exists()) p.textContent = snap.data().short;
        } catch {}
    }
}

async function renderAthletes() {
    const grille = document.querySelector('.athlete-grille');
    if (!grille) return;
    try {
        const snap = await getDocs(collection(db, 'athletes'));
        snap.forEach(d => {
            const a = d.data();
            const carte = document.createElement('div');
            carte.className = 'athlete-carte';
            carte.innerHTML = `
                <div class="athlete-img">
                    <img src="${a.img || ''}" alt="${a.name}">
                </div>
                <h3>${a.name}</h3>
                <p>athlete ${a.sport}</p>
                <div class="athlete-stats">
                    ${a.age    ? `<p><strong>Age:</strong> ${a.age} years</p>`    : ''}
                    ${a.weight ? `<p><strong>Weight:</strong> ${a.weight} kg</p>` : ''}
                    ${a.height ? `<p><strong>Height:</strong> ${a.height} cm</p>` : ''}
                </div>`;
            grille.appendChild(carte);
        });
    } catch(err) { console.error('athletes:', err); }
}

async function renderNews() {
    const grid = document.getElementById('news-grid');
    if (!grid) return;
    try {
        const snap = await getDocs(collection(db, 'news'));
        if (snap.empty) {
            grid.innerHTML = '<p class="news-empty"> hello  , now  new news </p>';
            return;
        }
        grid.innerHTML = '';
        snap.forEach(d => {
            const n = d.data();
            const card = document.createElement('div');
            card.className = 'news-card';
            card.innerHTML = `
                <span class="news-date">${n.date}</span>
                <h3>${n.title}</h3>
                <p>${n.text}</p>`;
            grid.appendChild(card);
        });
    } catch(err) { console.error('news:', err); }
}

window.sendMessage = async function() {
    const name    = document.querySelector('#contact input[type="text"]').value.trim();
    const email   = document.querySelector('#contact input[type="email"]').value.trim();
    const message = document.querySelector('#contact textarea').value.trim();

    if (!name || !email || !message) {
        alert('fill in all filds.');
        return;
    }
    try {
        await addDoc(collection(db, 'messages'), {
            name, email, message,
            date: new Date().toLocaleDateString('en-US'),
        });
        alert('message already sent!');
        document.querySelector('#contact input[type="text"]').value  = '';
        document.querySelector('#contact input[type="email"]').value = '';
        document.querySelector('#contact textarea').value            = '';
    } catch(err) { alert('Error: ' + err.message); }
};

function adminToast(msg) {
    const t = document.getElementById('admin-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
}

window.adminTab = function(name) {
    const names = ['athletes', 'news', 'services', 'messages'];
    document.querySelectorAll('.admin-tab').forEach((t, i) => {
        t.classList.toggle('active', names[i] === name);
    });
    document.querySelectorAll('.admin-panel').forEach(p => {
        p.classList.toggle('active', p.id === 'admin-panel-' + name);
    });
    if (name === 'messages') adminRenderMessages();
    if (name === 'athletes') adminRenderAthletes();
    if (name === 'news')     adminRenderNews();
};

window.adminAddAthlete = async function() {
    const name   = document.getElementById('ath-name').value.trim();
    const sport  = document.getElementById('ath-sport').value.trim();
    const age    = document.getElementById('ath-age').value.trim();
    const weight = document.getElementById('ath-weight').value.trim();
    const height = document.getElementById('ath-height').value.trim();
    const img    = document.getElementById('ath-img').value.trim();
    if (!name || !sport) { alert('name for athlet is  a obligation.'); return; }
    try {
        await addDoc(collection(db, 'athletes'), { name, sport, age, weight, height, img, ts: Date.now() });
        ['ath-name','ath-sport','ath-age','ath-weight','ath-height','ath-img']
            .forEach(id => document.getElementById(id).value = '');
        adminToast('cool !! athelete is dane add !');
        adminRenderAthletes();
    } catch(err) { alert('Error: ' + err.message); }
};

window.adminDeleteAthlete = async function(id) {
    try {
        await deleteDoc(doc(db, 'athletes', id));
        adminToast('delete .');
        adminRenderAthletes();
    } catch(e) { alert('Error , haku vutiwa: ' + e.message); }
};

async function adminRenderAthletes() {
    const el = document.getElementById('admin-athletes-list');
    if (!el) return;
    el.innerHTML = '<p class="admin-empty">Chargement...</p>';
    try {
        const snap = await getDocs(collection(db, 'athletes'));
        if (snap.empty) { el.innerHTML = '<p class="admin-empty">no one athlete.</p>'; return; }
        el.innerHTML = '';
        snap.forEach(d => {
            const a = d.data();
            const div = document.createElement('div');
            div.className = 'admin-list-item';
            div.innerHTML = `
                <div>
                    <strong>${a.name}</strong>
                    <span>${a.sport} · ${a.age||''}ans · ${a.weight||''}kg · ${a.height||''}cm</span>
                </div>
                <button class="admin-btn-delete" onclick="adminDeleteAthlete('${d.id}')">delete</button>`;
            el.appendChild(div);
        });
    } catch(e) { el.innerHTML = '<p class="admin-empty">chargement error.</p>'; }
}

window.adminAddNews = async function() {
    const title = document.getElementById('news-title').value.trim();
    const text  = document.getElementById('news-text').value.trim();
    if (!title || !text) { alert('Title and text is a obligation '); 
        return; 
    }
    try {
        await addDoc(collection(db, 'news'), {
            title, text,
            date: new Date().toLocaleDateString('en-US'),
          
        });
        document.getElementById('news-title').value = '';
        document.getElementById('news-text').value  = '';
        adminToast('publish');
        adminRenderNews();
    }
     catch(e) { 
        alert('Error: ' + e.message);
     }
};

window.adminDeleteNews = async function(id) 
{
    try {
        await deleteDoc(doc(db, 'news', id));
        adminToast('delete.');
        adminRenderNews();
    } catch(e) { alert('Error: ' + e.message); }
};

async function adminRenderNews() {
    const el = document.getElementById('admin-news-list');
    if (!el) return;
    el.innerHTML = '<p class="admin-empty">wating...</p>';
    try {
        const snap = await getDocs(collection(db, 'news'));
        if (snap.empty)
             {
                 el.innerHTML = '<p class="admin-empty">not atuality for today.</p>'; return; 
                }
        el.innerHTML = ' ';
        snap.forEach(d => {
            const n = d.data();
            const div = document.createElement('div');
            div.className = 'admin-list-item';
            div.innerHTML = `
                <div>
                    <strong>${n.title}</strong>
                    <span>${n.date}</span>
                </div>
                <button class="admin-btn-delete" onclick="adminDeleteNews('${d.id}')">delete</button>`;
            el.appendChild(div);
        });
    } catch(e) { el.innerHTML = '<p class="admin-empty">Error ,sorry.</p>'; }
}

async function adminLoadServices() {
    for (const key of ['athlete', 'scouting', 'race']) {
        try {
            const snap = await getDoc(doc(db, 'services', key));
            const s = snap.exists() ? snap.data() : svcDefaults[key];
            const shortEl = document.getElementById('svc-'+key+'-short');
            if (shortEl) shortEl.value=s.short || svcDefaults[key].short;

        } catch { }
    }
}
window.adminSaveServices=async function() {
    try {
        for (const key of ['athlete', 'scouting', 'race']) {
            const short = document.getElementById('svc-' + key + '-short').value.trim();
            await setDoc(doc(db, 'services', key),
             { short });
        }
        adminToast('Service is add , good job!');
    } catch(e) { alert('Error: ' + e.message); }
};


async function adminRenderMessages() {
    const el = document.getElementById('admin-messages-list');
    if (!el) return;
    el.innerHTML = '<p class="admin-empty">....</p>';
    try {
        const snap = await getDocs(collection(db, 'messages'));
        if (snap.empty) { el.innerHTML = '<p class="admin-empty">  anny message </p>'; return; }
        el.innerHTML = '';
        snap.forEach(d => {
            const m = d.data();
            const div = document.createElement('div');
            div.className = 'admin-list-item admin-message-item';
            div.innerHTML = `
                <div>
                    <strong>${m.name} — ${m.email}</strong>
                    <span>${m.date}</span>
                    <p class="admin-msg-text">${m.message}</p>
                </div>
                <button class="admin-btn-delete" onclick="adminDeleteMessage('${d.id}')">delete</button>`;
            el.appendChild(div);
        });
    } catch(e) { el.innerHTML = '<p class="admin-empty">error  chargement</p>'; }
}
window.adminDeleteMessage = async function(id) {
    try {
        await deleteDoc(doc(db, 'messages', id));
        adminToast('Message  delete .');
        adminRenderMessages();
    } catch(e) { alert('Error: ' + e.message); }
};


if (document.getElementById('admin-panel-athletes')) {
    adminRenderAthletes();
    adminRenderNews();
    adminLoadServices();
    adminRenderMessages();
} else {
    renderServices();
    renderAthletes();
    renderNews();
}