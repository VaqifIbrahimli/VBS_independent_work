// Görünüş üçün sadə giriş: giriş edilməyibsə login səhifəsinə yönləndirir.
// Bu həqiqi təhlükəsizlik deyil (məlumat yalnız oxumaq üçün açıqdır), yalnız saytın görünüşünü tamamlayır.
if (!sessionStorage.getItem("giris")) location.replace("login.html");
