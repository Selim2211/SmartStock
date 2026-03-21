export default function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-50">
        SmartStock Panel
      </h1>
      <p className="text-sm text-zinc-400">
        Soldaki menüden modüller arasında geçiş yapabilirsiniz. Varsayılan
        olarak <span className="font-semibold text-amber-300">Menü Yönetimi</span>{" "}
        sekmesi seçili gelir.
      </p>
    </div>
  );
}

