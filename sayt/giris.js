// Rola görə gizlədilən səhifələr (səhifə adı .html-siz). Yeni rol və ya səhifə üçün buraya əlavə edin.
const QADAGAN = {
  "Super admin": ["hesabatlar", "bot"],
};

function sehifeAdi(yol) {
  return (String(yol).split("?")[0].split("#")[0].split("/").pop() || "index").replace(/\.html$/, "") || "index";
}

// Giriş yoxlaması: giriş edilməyibsə login səhifəsinə yönləndirir.
// Giriş edilibsə: (1) rolun görməməli olduğu səhifədirsə Ana səhifəyə qaytarır,
// (2) istifadəçinin bazadakı "istifadeci" cədvəlində hələ də olduğunu yoxlayır (silinibsə çıxış edilir).
// Bu həqiqi təhlükəsizlik deyil (məlumat yalnız oxumaq üçün açıqdır), saytın giriş görünüşünü tamamlayır.
(function () {
  const ad = sessionStorage.getItem("giris");
  if (!ad) {
    location.replace("login.html");
    return;
  }
  const rol = sessionStorage.getItem("rol");
  if ((QADAGAN[rol] || []).includes(sehifeAdi(location.pathname))) {
    location.replace("index.html");
    return;
  }
  fetch(SUPABASE_URL + "/rest/v1/istifadeci?select=login&login=eq." + encodeURIComponent(ad), {
    headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY },
  })
    .then((c) => c.json())
    .then((sira) => {
      if (Array.isArray(sira) && sira.length === 0) {
        sessionStorage.clear();
        location.replace("login.html");
      }
    })
    .catch(() => {});
})();
