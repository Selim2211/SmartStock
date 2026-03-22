export default function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-espresso dark:text-espresso-cream">
        SmartStock Panel
      </h1>
      <p className="text-sm text-espresso/75 dark:text-espresso-muted">
        Soldaki menüden modüller arasında geçiş yapabilirsiniz. Varsayılan
        olarak{" "}
        <span className="font-semibold text-espresso-latte dark:text-espresso-cream">
          Menü Yönetimi
        </span>{" "}
        sekmesi seçili gelir.
      </p>
    </div>
  );
}
