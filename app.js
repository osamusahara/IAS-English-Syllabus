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
    
    if ($('#day').value) {
        const dayVal = $('#day').value;
        const schedule = c['開講曜日時限'] || '';
        if (!schedule.includes(dayVal)) return false;
    }
    
    return true;
}

// 日本語化用の簡易辞書
const dict = {
    'First semester': '前期',
    'Second semester': '後期',
    'Required': '必修',
    'Elective': '選択',
    'Required elective': '選択必修',
    'Lecture': '講義',
    'Seminar': '演習',
    'Media-based (online) class': '遠隔授業'
};

function loc(str) {
    if (window.currentLang !== 'ja') return str;
    return dict[str] || str;
}

function locSchedule(str) {
    if (!str) return window.currentLang === 'ja' ? '未定' : 'Schedule TBA';
    if (window.currentLang !== 'ja') return str;
    
    let s = str;
    s = s.replace(/Mon/g, '月曜').replace(/Tue/g, '火曜').replace(/Wed/g, '水曜').replace(/Thu/g, '木曜').replace(/Fri/g, '金曜');
    s = s.replace(/periods?/g, '時限');
    s = s.replace(/Intensive/g, '集中講義');
    s = s.replace(/Practicum/g, '実習');
    s = s.replace(/Individually scheduled/g, '応相談・その他');
    return s;
}

function card(c, i) {
    const isJa = window.currentLang === 'ja';
    const title = isJa ? (c['科目名'] || c['英文科目名']) : (c['英文科目名'] || c['科目名']);
    const sub = isJa ? c['英文科目名'] : c['科目名'];
    const teacher = isJa ? (c['教員名'] || c['英文教員名']) : (c['英文教員名'] || c['教員名']);
    const lblInstr = isJa ? '担当教員' : 'Instructor';
    const lblCred = isJa ? '単位' : 'credits';

    return `<article class="card" tabindex="0" data-i="${i}">
        <div class="badges">
            <span class="badge">${esc(c['開講年度'])}</span>
            <span class="badge">${esc(loc(c['開講学期']))}</span>
            ${c['選必区分 (Required/elective)'] ? `<span class="badge">${esc(loc(c['選必区分 (Required/elective)']))}</span>` : ''}
        </div>
        <h2>${esc(title)}</h2>
        <div class="jp">${esc(sub || '')}</div>
        <div class="teacher">${lblInstr}<br><strong>${esc(teacher || '—')}</strong></div>
        <div class="info">
            <span>${esc(locSchedule(c['開講曜日時限']))}</span>
            ${c['単位'] ? `<span>· ${esc(c['単位'])} ${lblCred}</span>` : ''}
        </div>
    </article>`;
}

function render() {
    let arr = C.map((c, i) => ({ c, i })).filter(x => matches(x.c));

    $('#resultCount').textContent = window.currentLang === 'ja' 
        ? `${C.length}件中 ${arr.length}件を表示`
        : `Showing ${arr.length} of ${C.length} courses`;
    
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
    const isJa = window.currentLang === 'ja';
    const title = isJa ? (c['科目名'] || c['英文科目名']) : (c['英文科目名'] || c['科目名']);
    const sub = isJa ? c['英文科目名'] : c['科目名'];
    const teacher = isJa ? (c['教員名'] || c['英文教員名']) : (c['英文教員名'] || c['教員名']);
    
    const lblInstr = isJa ? '担当教員' : 'Instructor';
    const lblSched = isJa ? '曜日・時限' : 'Schedule';
    const lblCred = isJa ? '単位' : 'Credits';
    const lblNum = isJa ? 'ナンバリング' : 'Numbering';
    const lblType = isJa ? '選必区分' : 'Type';
    const lblTarget = isJa ? '対象クラス' : 'Target';

    const sections = isJa ? [
        ['授業の目的・到達目標', '授業の目的・到達目標'],
        ['授業の概要', '授業の概要 (Course outline)'],
        ['授業の計画', '授業の計画 (Course plan)'],
        ['評価にかかわる情報', '評価にかかわる情報'],
        ['受講者へのメッセージ', '受講者へのメッセージ (Message to students)'],
        ['自主学習のアドバイス', '自主学習のアドバイス (Advice for self-study)'],
        ['教科書・参考書に関する補足', '教科書・参考書に関する補足 (Notes on textbooks/references)'],
        ['オフィスアワー・その他', 'オフィスアワー・その他']
    ] : [
        ['Course objectives & learning outcomes', '授業の目的・到達目標'],
        ['Course outline', '授業の概要 (Course outline)'],
        ['Course plan', '授業の計画 (Course plan)'],
        ['Assessment', '評価にかかわる情報'],
        ['Message to students', '受講者へのメッセージ (Message to students)'],
        ['Advice for self-study', '自主学習のアドバイス (Advice for self-study)'],
        ['Textbook / reference notes', '教科書・参考書に関する補足 (Notes on textbooks/references)'],
        ['Office hours / other information', 'オフィスアワー・その他']
    ];

    const lblLinks = isJa ? 'リンク' : 'Links';
    const lblEnSyllabus = isJa ? '公式シラバス (英語) ↗' : 'Official English syllabus ↗';
    const lblJaSyllabus = isJa ? '公式シラバス (日本語) ↗' : 'Japanese syllabus ↗';

    $('#detailContent').innerHTML = `<div class="detail">
        <div class="badges">
            <span class="badge">${esc(c['開講年度'])}</span>
            <span class="badge">${esc(loc(c['開講学期']))}</span>
            ${c['授業形態 (Class format)'] ? `<span class="badge">${esc(loc(c['授業形態 (Class format)']))}</span>` : ''}
        </div>
        <h1>${esc(title)}</h1>
        <div class="subtitle">${esc(sub || '')}</div>
        <div class="detail-grid">
            ${[[lblInstr, teacher], [lblSched, locSchedule(c['開講曜日時限'])], [lblCred, c['単位']], [lblNum, c['ナンバリング']], [lblType, loc(c['選必区分 (Required/elective)'])], [lblTarget, c['対象クラス']]].map(([a, b]) => `<div class="kv"><small>${a}</small>${esc(b || '—')}</div>`).join('')}
        </div>
        ${sections.filter(x => c[x[1]]).map(x => `<section class="section"><h3>${x[0]}</h3><p>${val(c[x[1]])}</p></section>`).join('')}
        <section class="section">
            <h3>${lblLinks}</h3>
            <div class="links">
                ${c['参照シラバス 英語版URL'] ? `<a href="${esc(c['参照シラバス 英語版URL'])}" target="_blank" rel="noopener">${lblEnSyllabus}</a>` : ''}
                ${c['参照シラバス 日本語版URL'] ? `<a href="${esc(c['参照シラバス 日本語版URL'])}" target="_blank" rel="noopener">${lblJaSyllabus}</a>` : ''}
            </div>
        </section>
    </div>`;
    $('#detail').showModal();
}

['q', 'semester', 'day', 'format', 'type'].forEach(id => {
    const el = $('#' + id);
    if (el) el.addEventListener(id === 'q' ? 'input' : 'change', render);
});

$('#clear').onclick = () => {
    ['q', 'semester', 'day', 'format', 'type'].forEach(id => {
        if ($('#' + id)) $('#' + id).value = '';
    });
    render();
};

$('.close').onclick = () =>$('#detail').close();
$('#detail').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.close();
});

render();
