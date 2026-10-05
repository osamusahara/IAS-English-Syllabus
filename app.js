const C = window.COURSES || [];
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

function norm(s) {
    return String(s || '').toLowerCase().normalize('NFKC');
}

function matches(c) {
    const q = norm($('#q').value);
    if (q) {
        const hay = norm([c['英文科目名'], c['科目名'], c['英文教員名'], c['教員名'], c['キーワード'], c['ナンバリング'], c['科目分野名']].join(' '));
        if (!hay.includes(q)) return false;
    }
    if ($('#semester').value && c['開講学期'] !== $('#semester').value) return false;
    if ($('#format').value && c['授業形態 (Class format)'] !== $('#format').value) return false;
    if ($('#type').value && c['選必区分 (Required/elective)'] !== $('#type').value) return false;
    return true;
}

function card(c, i) {
    const title = c['英文科目名'] || c['科目名'];
    const jp = c['科目名'];
    const teacher = c['英文教員名'] || c['教員名'];
    return `<article class="card" tabindex="0" data-i="${i}">
        <div class="badges">
            <span class="badge">${esc(c['開講年度'])}</span>
            <span class="badge">${esc(c['開講学期'])}</span>
            ${c['選必区分 (Required/elective)'] ? `<span class="badge">${esc(c['選必区分 (Required/elective)'])}</span>` : ''}
        </div>
        <h2>${esc(title)}</h2>
        <div class="jp">${esc(jp)}</div>
        <div class="teacher">Instructor<br><strong>${esc(teacher || '—')}</strong></div>
        <div class="info">
            <span>${esc(c['開講曜日時限'] || 'Schedule TBA')}</span>
            ${c['単位'] ? `<span>· ${esc(c['単位'])} credits</span>` : ''}
        </div>
    </article>`;
}

// 曜日ソート用の重み付け定義
const dayOrder = {
    "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5,
    "Intensive": 6, "Practicum": 7, "Individually": 8
};

function render() {
    let arr = C.map((c, i) => ({ c, i })).filter(x => matches(x.c));

    // ソート処理の追加
    const sortVal = $('#sort-day') ? $('#sort-day').value : 'default';
    if (sortVal === 'day-asc') {
        arr.sort((a, b) => {
            const getVal = (str) => {
                if (!str) return 99; // 空欄などは最後尾へ
                const match = str.match(/^(Mon|Tue|Wed|Thu|Fri|Intensive|Practicum|Individually)/);
                return match ? dayOrder[match[1]] : 99;
            };
            return getVal(a.c['開講曜日時限']) - getVal(b.c['開講曜日時限']);
        });
    }

    $('#resultCount').textContent = `Showing ${arr.length} of ${C.length} courses`;
    $(`#courseCount`).textContent = C.length;
    $('#results').innerHTML = arr.map(x => card(x.c, x.i)).join('');
    $('#empty').hidden = arr.length !== 0;

    document.querySelectorAll('.card').forEach(el => {
        el.onclick = () => openDetail(C[+el.dataset.i]);
        el.onkeydown = e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openDetail(C[+el.dataset.i]);
            }
        };
    });
}

function val(v) {
    return v ? esc(v).replace(/\n/g, '<br>') : '';
}

function openDetail(c) {
    const title = c['英文科目名'] || c['科目名'];
    $('#detailContent').innerHTML = `<div class="detail">
        <div class="badges">
            <span class="badge">${esc(c['開講年度'])}</span>
            <span class="badge">${esc(c['開講学期'])}</span>
            <span class="badge">${esc(c['授業形態 (Class format)'] || '')}</span>
        </div>
        <h1>${esc(title)}</h1>
        <div class="subtitle">${esc(c['科目名'])}</div>
        <div class="detail-grid">
            ${[['Instructor', c['英文教員名'] || c['教員名']], ['Schedule', c['開講曜日時限']], ['Credits', c['単位']], ['Numbering', c['ナンバリング']], ['Type', c['選必区分 (Required/elective)']], ['Target', c['対象クラス']]].map(([a, b]) => `<div class="kv"><small>${a}</small>${esc(b || '—')}</div>`).join('')}
        </div>
        ${[['Course objectives & learning outcomes', '授業の目的・到達目標'], ['Course outline', '授業の概要 (Course outline)'], ['Course plan', '授業の計画 (Course plan)'], ['Assessment', '評価にかかわる情報'], ['Message to students', '受講者へのメッセージ (Message to students)'], ['Advice for self-study', '自主学習のアドバイス (Advice for self-study)'], ['Textbook / reference notes', '教科書・参考書に関する補足 (Notes on textbooks/references)'], ['Office hours / other information', 'オフィスアワー・その他']].filter(x => c[x[1]]).map(x => `<section class="section"><h3>${x[0]}</h3><p>${val(c[x[1]])}</p></section>`).join('')}
        <section class="section">
            <h3>Links</h3>
            <div class="links">
                ${c['参照シラバス 英語版URL'] ? `<a href="${esc(c['参照シラバス 英語版URL'])}" target="_blank" rel="noopener">Official English syllabus ↗</a>` : ''}
                ${c['参照シラバス 日本語版URL'] ? `<a href="${esc(c['参照シラバス 日本語版URL'])}" target="_blank" rel="noopener">Japanese syllabus ↗</a>` : ''}
            </div>
        </section>
    </div>`;
    $('#detail').showModal();
}

['q', 'semester', 'format', 'type', 'sort-day'].forEach(id => {
    const el = $('#' + id);
    if (el) el.addEventListener(id === 'q' ? 'input' : 'change', render);
});

$('#clear').onclick = () => {
    ['q', 'semester', 'format', 'type'].forEach(id => {
        if ($('#' + id)) $('#' + id).value = '';
    });
    if ($('#sort-day')) $('#sort-day').value = 'default';
    render();
};

$('.close').onclick = () =>$('#detail').close();
$('#detail').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.close();
});

render();
