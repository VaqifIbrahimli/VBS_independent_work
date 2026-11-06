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

`sayt/index.html` faylını brauzerdə açın (internet lazımdır). Sayt məlumatı birbaşa Supabase bazasından oxuyur:
`sayt/config.js` bağlantı ünvanını və yalnız oxumaq üçün açıq (publishable) açarı saxlayır, `sayt/app.js` içindəki `getData()` isə sorğuları göndərir.
Bazada anonim istifadəçi yalnız oxuya bilər, yazma və silmə icazəsi yoxdur.
Hesabatlar üçün bazada 3 oxuma funksiyası var: `sayt_aylar()`, `sayt_kateqoriya()`, `sayt_bosaldilmali()`.

## Verilənlər bazası

Baza Supabase (PostgreSQL) üzərində qurulub və onlayn əlçatandır. Cədvəllərə yalnız oxumaq üçün baxmaq olar:
https://tezode-holding.vercel.app/baza
