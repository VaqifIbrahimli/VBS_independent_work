# VBS sərbəst iş: Tezöde Holding

Fənn: *Verilənlər bazasını idarəetmə alətləri və dilləri*

Tezöde Holding ödəniş terminalları şəbəkəsinin verilənlər bazası (38 cədvəl) və sadə sayt.
Şirkət və bütün məlumatlar nümunə üçündür (saxtadır). FİN və əlaqə nömrələrinin son simvolları `*` ilə gizlədilib.

## Qovluqlar

| Qovluq | Nə var |
|---|---|
| `sayt/` | Çox sadə sayt (HTML, CSS, JS): Ana səhifə, Terminallar, Əməliyyatlar, İşçilər, Avtomobillər, Hesabatlar |
| `sql/` | Hər cədvəlin `CREATE TABLE` kodu (`<cədvəl>.txt`), `Primary_Key.txt` (38) və `Foreign_Key.txt` (48) |
| `teqdimat/` | Sərbəst iş təqdimatı (PowerPoint) |

## Sayta baxmaq

Canlı sayt (GitHub Pages): https://vaqifibrahimli.github.io/VBS_independent_work/
`main` budağına hər push-dan sonra `.github/workflows/pages.yml` saytı (`sayt/` qovluğunu) avtomatik yeniləyir.
Əvvəl Netlify-da (`vbsserbestis.netlify.app`) yayımlanırdı, kredit limiti bitdiyi üçün Pages-ə keçildi.

Yerli olaraq `sayt/index.html` faylını brauzerdə açmaq da olar (internet lazımdır). Sayt məlumatı birbaşa Supabase bazasından oxuyur:
`sayt/config.js` bağlantı ünvanını və yalnız oxumaq üçün açıq (publishable) açarı saxlayır, `sayt/app.js` içindəki `getData()` isə sorğuları göndərir.
Bazada anonim istifadəçi yalnız oxuya bilər, yazma və silmə icazəsi yoxdur.
Giriş səhifəsi bazadakı `istifadeci` cədvəlinə baxır: istifadəçi orada olmalı və rolu icazəli olmalıdır (`Super admin` və ya `Baş admin`).
İki hesab var:
- **Demo hesab** (`Super admin`): istifadəçi adı `111`, şifrə `111`. "Hesabatlar" və "Bot jurnalı" səhifələri bu hesabdan gizlədilib (`sayt/giris.js`-də `QADAGAN`).
- **Gizli hesab** (`Baş admin`): bütün səhifələri görür. Şifrəsi kodda yazılmır, yalnız yavaş hash (PBKDF2-SHA256, 300 000 dövr) saxlanılır.

Bu həqiqi server təhlükəsizliyi deyil, saytın giriş görünüşüdür: məlumat yalnız oxumaq üçün açıqdır.
Hesabatlar üçün bazada 3 oxuma funksiyası var: `sayt_aylar()`, `sayt_kateqoriya()`, `sayt_bosaldilmali()`.

## Verilənlər bazası

Baza Supabase (PostgreSQL) üzərində qurulub və onlayn əlçatandır. Cədvəllərə yalnız oxumaq üçün baxmaq olar:
https://tezode-holding.vercel.app/baza
