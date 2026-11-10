// Giriş yoxlaması iki mərhələdədir:
// 1) İstifadəçi bazadakı "istifadeci" cədvəlində olmalı və rolu icazəli olmalıdır (login və rol bazadan oxunur).
// 2) Şifrə saytda yoxlanılır:
//    - demo hesab (111) üçün şifrə açıq yazılıb (hamı bilir);
//    - gizli hesab üçün şifrə kodda YAZILMIR, yalnız yavaş hash (PBKDF2) saxlanılır.
// Bu, saytın giriş görünüşüdür: məlumat yalnız oxumaq üçün açıqdır, giriş əsl server təhlükəsizliyi deyil.
const ICAZELI_ROLLAR = ["Super admin", "Baş admin"];

const DEMO_SIFRELER = { "111": "111" };

// Şifrə yox, yalnız duz (salt) və hash. PBKDF2-SHA256, 300 000 dövr: oflayn təxmin praktiki olaraq mümkün deyil.
const GIZLI_HESABLAR = {
  "5BFY3NSA": {
    iter: 300000,
    salt: "33e95bbf292d9950394f7178031bdfa4",
    hash: "41d078fd8d2c22ffd8aa6f38b55f319ef26688d9d68b816b77ef81b54fd4689a",
  },
};

const hexBayt = (hex) => Uint8Array.from(hex.match(/../g).map((b) => parseInt(b, 16)));
const baytHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

async function pbkdf2Hex(sifre, saltHex, iter) {
  const acar = await crypto.subtle.importKey("raw", new TextEncoder().encode(sifre), "PBKDF2", false, ["deriveBits"]);
  const bitler = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: hexBayt(saltHex), iterations: iter, hash: "SHA-256" }, acar, 256);
  return baytHex(bitler);
}

async function sifreDuzgundur(ad, sifre) {
  if (Object.prototype.hasOwnProperty.call(DEMO_SIFRELER, ad)) return sifre === DEMO_SIFRELER[ad];
  if (Object.prototype.hasOwnProperty.call(GIZLI_HESABLAR, ad)) {
    const g = GIZLI_HESABLAR[ad];
    return (await pbkdf2Hex(sifre, g.salt, g.iter)) === g.hash;
  }
  return false;
}

async function girisYoxla(ad, sifre) {
  const basliqlar = { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY };
  let cavab;
  try {
    cavab = await fetch(SUPABASE_URL + "/rest/v1/istifadeci?select=login,rol(ad)&login=eq." + encodeURIComponent(ad), { headers: basliqlar });
  } catch (e) {
    return { ok: false, xeta: "Bazaya qoşulmaq olmadı. İnternet bağlantısını yoxlayın." };
  }
  if (!cavab.ok) return { ok: false, xeta: "Baza cavab vermədi (" + cavab.status + ")." };
  const sira = await cavab.json();
  const rol = sira.length === 1 && sira[0].rol ? sira[0].rol.ad : null;
  if (rol && ICAZELI_ROLLAR.includes(rol) && (await sifreDuzgundur(ad, sifre))) {
    return { ok: true, login: sira[0].login, rol };
  }
  return { ok: false, xeta: "İstifadəçi adı və ya şifrə yanlışdır." };
}

if (typeof document !== "undefined" && document.getElementById("forma")) {
  document.getElementById("forma").addEventListener("submit", async (e) => {
    e.preventDefault();
    const dugme = document.getElementById("dugme");
    const xeta = document.getElementById("xeta");
    dugme.disabled = true;
    dugme.textContent = "Yoxlanılır…";
    xeta.hidden = true;
    const n = await girisYoxla(document.getElementById("ad").value.trim(), document.getElementById("sifre").value);
    if (n.ok) {
      sessionStorage.setItem("giris", n.login);
      sessionStorage.setItem("rol", n.rol);
      location.href = "index.html";
    } else {
      xeta.textContent = n.xeta;
      xeta.hidden = false;
      dugme.disabled = false;
      dugme.textContent = "Daxil ol";
    }
  });
}

if (typeof module !== "undefined") module.exports = { girisYoxla };
