// Tezöde Holding: sadə sayt. Məlumat Supabase (PostgreSQL) bazasından oxunur (yalnız oxuma).
const API = SUPABASE_URL + "/rest/v1/";
const BASLIQLAR = { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY };

async function sorgu(yol, secenek = {}) {
  const cavab = await fetch(API + yol, { ...secenek, headers: { ...BASLIQLAR, ...(secenek.headers || {}) } });
  if (!cavab.ok) throw new Error(`Baza cavab vermədi (${cavab.status}): ${(await cavab.text()).slice(0, 120)}`);
  return cavab;
}
const oxu = async (yol) => (await sorgu(yol)).json();
const funksiya = async (ad) => (await sorgu("rpc/" + ad, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })).json();

// Cədvəldəki sətir sayı (filtrlə birlikdə də ola bilər)
async function saySorgu(cedvel, filtr = "") {
  const cavab = await sorgu(`${cedvel}?select=*&limit=1${filtr}`, { headers: { Prefer: "count=exact" } });
  return Number(cavab.headers.get("content-range").split("/")[1]);
}

function tarixYaz(iso) {
  return new Date(iso)
    .toLocaleString("en-GB", { timeZone: "Asia/Baku", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })
    .replace(",", "")
    .replace(/\//g, ".");
}

// Səhifələr yalnız bu funksiyadan istifadə edir
async function getData(ad) {
  switch (ad) {
    case "say": {
      const [terminal, aktiv, emeliyyat, isci, avtomobil] = await Promise.all([
        saySorgu("terminal"), saySorgu("terminal", "&status_id=eq.1"), saySorgu("emeliyyat"), saySorgu("isci"), saySorgu("avtomobil")]);
      return { terminal, aktiv, emeliyyat, isci, avtomobil };
    }
    case "bot":
      return oxu("bot_jurnal?select=gun,vaxt,xulase,detallar&order=id.desc&limit=30");
    case "aylar":
      return funksiya("sayt_aylar");
    case "kateqoriya":
      return funksiya("sayt_kateqoriya");
    case "bosaldilmali":
      return funksiya("sayt_bosaldilmali");
    case "terminallar": {
      const sira = await oxu("terminal?select=terminal_id,seriya_nomresi,terminal_status(ad),mekan(unvan,rayon(ad))&order=terminal_id");
      return sira.map((t) => ({ id: t.terminal_id, seriya: t.seriya_nomresi, mekan: t.mekan.unvan, rayon: t.mekan.rayon.ad, status: t.terminal_status.ad }));
    }
    case "emeliyyatlar": {
      const sira = await oxu("emeliyyat?select=emeliyyat_id,abonent_nomresi,mebleg,komissiya,tarix,status,terminal(seriya_nomresi),provayder(ad),odenis_usulu(ad)&order=tarix.desc&limit=100");
      return sira.map((e) => ({ id: e.emeliyyat_id, terminal: e.terminal.seriya_nomresi, provayder: e.provayder.ad, abonent: e.abonent_nomresi,
        mebleg: e.mebleg, komissiya: e.komissiya, usul: e.odenis_usulu.ad, tarix: tarixYaz(e.tarix), status: e.status }));
    }
    case "isciler": {
      const sira = await oxu("isci?select=isci_id,ad,soyad,fin,telefon,status,sobe(ad),vezife(ad)&order=isci_id");
      return sira.map((i) => ({ id: i.isci_id, ad: `${i.ad} ${i.soyad}`, fin: i.fin, telefon: i.telefon, sobe: i.sobe.ad, vezife: i.vezife.ad, status: i.status }));
    }
    case "avtomobiller": {
      const sira = await oxu("avtomobil?select=avtomobil_id,dqn,marka,model,buraxilis_ili,nov,avtomobil_status(ad)&order=avtomobil_id");
      return sira.map((a) => ({ id: a.avtomobil_id, dqn: a.dqn, model: `${a.marka} ${a.model}`, il: a.buraxilis_ili, nov: a.nov, status: a.avtomobil_status.ad }));
    }
    default:
      throw new Error("Naməlum məlumat: " + ad);
  }
}

// Menyuda istifadəçi adı və "Çıxış"
document.addEventListener("DOMContentLoaded", () => {
  const ad = sessionStorage.getItem("giris");
  const el = document.getElementById("istAd");
  if (el && ad) el.textContent = ad;
  document.getElementById("cixis")?.addEventListener("click", () => sessionStorage.removeItem("giris"));
});

// Yüklənərkən yazı, xəta olarsa göstərmək
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".cedvel, #kartlar").forEach((e) => (e.innerHTML = '<p class="yuk">Yüklənir…</p>'));
});
window.addEventListener("unhandledrejection", (h) => {
  document.querySelector("main")?.insertAdjacentHTML("afterbegin", `<div class="qeyd xeta-qeyd">Məlumat yüklənmədi: ${h.reason?.message || h.reason}</div>`);
  document.querySelectorAll(".yuk").forEach((e) => (e.textContent = ""));
});

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const pul = (n) => Number(n).toLocaleString("az", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₼";
const eded = (n) => Number(n).toLocaleString("az");

function etiket(metn) {
  const pis = ["Nasaz", "uğursuz", "Təmirdə", "Bağlı", "Söküldü", "Silinib"];
  const orta = ["geri qaytarılıb", "Məzuniyyət"];
  const sinif = pis.includes(metn) ? "etiket xeta" : orta.includes(metn) ? "etiket xəbər" : "etiket";
  return `<span class="${sinif}">${metn}</span>`;
}

// sütunlar: [{ bas: "Başlıq", deyer: (sətir) => "HTML", say: true }]
function cedvelYaz(yer, sutunlar, setirler) {
  const el = document.getElementById(yer);
  const bas = sutunlar.map((s) => `<th class="${s.say ? "say" : ""}">${s.bas}</th>`).join("");
  const govde = setirler.length
    ? setirler.map((r) => "<tr>" + sutunlar.map((s) => `<td class="${s.say ? "say" : ""}">${s.deyer(r)}</td>`).join("") + "</tr>").join("")
    : `<tr><td colspan="${sutunlar.length}">Nəticə tapılmadı.</td></tr>`;
  el.innerHTML = `<table><thead><tr>${bas}</tr></thead><tbody>${govde}</tbody></table>`;
}

// Axtarış sahəsi və (istəyə görə) status seçimi ilə cədvəl
function siyahi(sutunlar, setirler, axtarisSahələri, statusSahesi) {
  const axtaris = document.getElementById("axtaris");
  const secim = document.getElementById("secim");
  function yenile() {
    const s = (axtaris?.value || "").toLowerCase().trim();
    const st = secim?.value || "";
    const nəticə = setirler.filter(
      (r) => (!s || axtarisSahələri.some((f) => String(r[f]).toLowerCase().includes(s))) && (!st || r[statusSahesi] === st)
    );
    cedvelYaz("cedvel", sutunlar, nəticə);
    const say = document.getElementById("say");
    if (say) say.textContent = `${nəticə.length} qeyd göstərilir`;
  }
  axtaris?.addEventListener("input", yenile);
  secim?.addEventListener("change", yenile);
  if (secim && statusSahesi) {
    [...new Set(setirler.map((r) => r[statusSahesi]))].forEach((v) => secim.insertAdjacentHTML("beforeend", `<option>${v}</option>`));
  }
  yenile();
}
