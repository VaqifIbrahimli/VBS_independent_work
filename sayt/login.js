// Giriş yoxlaması: istifadəçi bazadakı "istifadeci" cədvəlində olmalı və rolu "Super admin" olmalıdır.
// Şifrə bazadakı hash ilə yoxlanılmır (anonim istifadəçi hash-i oxuya bilmir), demo şifrə burada yoxlanılır.
// Bu, həqiqi təhlükəsizlik deyil, saytın giriş görünüşünü və baza ilə bağlılığını göstərir.
const DEMO_SIFRE = "111";
const ICAZELI_ROL = "Super admin";

async function girisYoxla(ad, sifre) {
  const baslıqlar = { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY };
  const yol =
    SUPABASE_URL + "/rest/v1/istifadeci?select=login,rol!inner(ad)&login=eq." + encodeURIComponent(ad) +
    "&rol.ad=eq." + encodeURIComponent(ICAZELI_ROL);
  let cavab;
  try {
    cavab = await fetch(yol, { headers: baslıqlar });
  } catch (e) {
    return { ok: false, xeta: "Bazaya qoşulmaq olmadı. İnternet bağlantısını yoxlayın." };
  }
  if (!cavab.ok) return { ok: false, xeta: "Baza cavab vermədi (" + cavab.status + ")." };
  const sira = await cavab.json();
  if (sira.length === 1 && sifre === DEMO_SIFRE) {
    return { ok: true, login: sira[0].login, rol: sira[0].rol.ad };
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
