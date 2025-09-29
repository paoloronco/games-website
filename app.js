// ---- CONFIG facoltativa per XLSX ----
const XLSX_CONFIG = {
  sheetName: 'Foglio1',   // cambia se il tuo foglio ha un altro nome
  headerRowIndex: 1,      // riga intestazioni (0-based) -> Excel riga 2
  startColIndex: 0        // colonna di partenza (0 = A)
};

// ---------- Utils ----------
const $ = s => document.querySelector(s);
const isURL = v => /^https?:\/\//i.test(v || '');

// CSV parser robusto
function parseCSV(text){
  const rows=[], row=[], len=text.length;
  let i=0, cur='', inQuotes=false;
  const pushCell=()=>{ row.push(cur); cur=''; };
  const pushRow=()=>{ if(row.length || cur!==''){ pushCell(); rows.push(row.slice()); row.length=0; } };
  while(i<len){
    const c=text[i];
    if(inQuotes){
      if(c==='"'){ if(text[i+1]==='"'){ cur+='"'; i++; } else { inQuotes=false; } }
      else { cur+=c; }
    } else {
      if(c==='"'){ inQuotes=true; }
      else if(c===','){ pushCell(); }
      else if(c==='\n'){ pushRow(); }
      else if(c==='\r'){}
      else { cur+=c; }
    }
    i++;
  }
  pushRow();
  return rows.filter(r => r.length && !(r.length===1 && r[0]===''));
}

// ---------- Stato (senza paginazione) ----------
let headers = [];
let data = [];   // tutte le righe
let view = [];   // filtro corrente
let sortCol = 0, sortDir = 1;

// ---------- Loader ----------
async function loadCSVUrl(url){
  const res = await fetch(url, {cache:'no-store'});
  if(!res.ok) throw new Error('CSV non trovato ('+res.status+')');
  const txt = (await res.text()).trim();
  const arr = parseCSV(txt);
  headers = arr.shift() || [];
  data = arr;
  applySearch($('#search').value || '');
}

async function loadXLSXUrl(url){
  if(typeof XLSX === 'undefined') throw new Error('Libreria XLSX non caricata');
  const res = await fetch(url, {cache:'no-store'});
  if(!res.ok) throw new Error('XLSX non trovato ('+res.status+')');
  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf, {type:'array'});
  const sheetName = wb.SheetNames.includes(XLSX_CONFIG.sheetName) ? XLSX_CONFIG.sheetName : wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const arr = XLSX.utils.sheet_to_json(ws, {header:1, raw:false});

  const H = Math.max(0, XLSX_CONFIG.headerRowIndex|0);
  const S = Math.max(0, XLSX_CONFIG.startColIndex|0);
  headers = (arr[H] || []).slice(S).map(v => (v ?? '').toString().trim());
  const dataRows = arr.slice(H+1).filter(r => (r||[]).some(c => (c ?? '').toString().trim() !== ''));
  data = dataRows.map(r => headers.map((_,i)=> (r[S+i] ?? '').toString()));
  applySearch($('#search').value || '');
}

async function autoLoad(){
  // prova prima XLSX, poi CSV
  try{ await loadXLSXUrl('data.xlsx'); return; }catch(e1){ console.info('XLSX:', e1.message); }
  try{ await loadCSVUrl('data.csv'); return; }catch(e2){ console.info('CSV:', e2.message); }
  const tbody = document.querySelector('#table tbody');
  tbody.innerHTML = '<tr><td>Impossibile caricare <code>data.xlsx</code> o <code>data.csv</code>.</td></tr>';
  render(); // struttura vuota
}

// ---------- Render (mostra tutte le righe, senza paginazione) ----------
function render(){
  // ordina tutto il view
  if(headers.length){
    view.sort((a,b)=>{
      const A=(a[sortCol]||'').toString().toLowerCase();
      const B=(b[sortCol]||'').toString().toLowerCase();
      const nA = parseFloat(A.replace(/[^\d.-]/g,'')), nB = parseFloat(B.replace(/[^\d.-]/g,''));
      if(!Number.isNaN(nA) && !Number.isNaN(nB) && (/[0-9]/.test(A) || /[0-9]/.test(B))){
        return (nA-nB)*sortDir;
      }
      return (A>B?1:A<B?-1:0)*sortDir;
    });
  }

  // head
  const thead = $('#table thead'); thead.innerHTML='';
  const trh = document.createElement('tr');
  headers.forEach((h,idx)=>{
    const th = document.createElement('th');
    th.textContent = h || `Col ${idx+1}`;
    th.title = 'Ordina per ' + (h||`Col ${idx+1}`);
    th.addEventListener('click', ()=>{
      if(sortCol===idx){ sortDir*=-1; } else { sortCol=idx; sortDir=1; }
      render();
    });
    if(idx===sortCol){ th.insertAdjacentText('beforeend', sortDir>0?'  ↑':'  ↓'); }
    trh.appendChild(th);
  });
  thead.appendChild(trh);

  // body: tutte le righe
  const tbody = $('#table tbody'); tbody.innerHTML='';
  view.forEach(r=>{
    const tr = document.createElement('tr');
    r.forEach((cell)=>{
      const td = document.createElement('td');
      if(isURL(cell)){
        const a = document.createElement('a'); a.href = cell; a.textContent = 'Apri link'; a.target='_blank'; a.rel='noopener'; a.className='link';
        td.appendChild(a);
      } else {
        td.textContent = cell;
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function applySearch(q){
  const ql = (q||'').toLowerCase();
  view = data.filter(r => !ql || r.some(c => (c||'').toString().toLowerCase().includes(ql)));
  render();
}

// ---------- Eventi ----------
window.addEventListener('DOMContentLoaded', async () => {
  await autoLoad();
  $('#search').addEventListener('input', e => applySearch(e.target.value));
});
