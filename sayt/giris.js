// Giriş yoxlaması: giriş edilməyibsə login səhifəsinə yönləndirir.
// Giriş edilibsə, istifadəçinin bazadakı "istifadeci" cədvəlində hələ də olduğunu yoxlayır (silinibsə çıxış edilir).
// Bu həqiqi təhlükəsizlik deyil (məlumat yalnız oxumaq üçün açıqdır), saytın giriş görünüşünü tamamlayır.
(function () {
  const ad = sessionStorage.getItem("giris");
  if (!ad) {
    location.replace("login.html");
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
