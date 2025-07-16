import { useState, useEffect } from "react";

type Campos = {
  [key: string]: string;
};

export default function App() {
  const [input, setInput] = useState<Campos>({
    tarifa: "",
    kmUsuario: "",
    kmViaje: "",
    precioLitro: localStorage.getItem("precioLitro") || "",
    rendimiento: localStorage.getItem("rendimiento") || "",
    gananciaMinima: localStorage.getItem("gananciaMinima") || "7",
  });

  const [resultado, setResultado] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("precioLitro", input.precioLitro);
    localStorage.setItem("rendimiento", input.rendimiento);
    localStorage.setItem("gananciaMinima", input.gananciaMinima);
  }, [input.precioLitro, input.rendimiento, input.gananciaMinima]);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setInput((prev) => ({ ...prev, [name]: value }));
    }
  };

  const calcular = () => {
    const d = Object.fromEntries(
      Object.entries(input).map(([k, v]) => [k, parseFloat(v || "0")])
    ) as Record<string, number>;

    const distanciaTotal = d.kmUsuario + d.kmViaje;
    if (distanciaTotal === 0 || d.rendimiento === 0 || d.precioLitro === 0) {
      setResultado("❌ Datos insuficientes");
      return;
    }

    const litros = distanciaTotal / d.rendimiento;
    const costoGas = litros * d.precioLitro;
    const gananciaBruta = d.tarifa * 0.75;
    const gananciaNeta = gananciaBruta - costoGas;
    const gananciaPorKm = gananciaNeta / distanciaTotal;

    setResultado(
      gananciaPorKm >= d.gananciaMinima ? "✅ Conviene" : "❌ No conviene"
    );
  };

  const resetear = () => {
    setInput({
      tarifa: "",
      kmUsuario: "",
      kmViaje: "",
      precioLitro: "",
      rendimiento: "",
      gananciaMinima: "7",
    });
    setResultado(null);
    localStorage.removeItem("precioLitro");
    localStorage.removeItem("rendimiento");
    localStorage.removeItem("gananciaMinima");
  };

  const campos = [
    { label: "Tarifa total del viaje ($)", name: "tarifa" },
    { label: "Kilómetros hasta el usuario", name: "kmUsuario" },
    { label: "Kilómetros del viaje", name: "kmViaje" },
    { label: "Precio por litro de gasolina ($)", name: "precioLitro" },
    { label: "Rendimiento del coche (km por litro)", name: "rendimiento" },
    { label: "Ganancia mínima esperada ($ por km)", name: "gananciaMinima" },
  ];

  return (
    <main className="min-h-screen p-4 max-w-md mx-auto space-y-3">
      <h1 className="text-xl font-bold text-center mb-4">Viaje Fácil - Uber</h1>

      {campos.map((campo) => (
        <div key={campo.name}>
          <label className="text-sm block mb-1">{campo.label}</label>
          <input
            type="text"
            inputMode="decimal"
            name={campo.name}
            value={
              typeof input[campo.name] === "string"
                ? input[campo.name]
                : String(input[campo.name] ?? "")
            }
            onChange={handle}
            placeholder="0"
            className="w-full border px-2 py-1 rounded"
          />
        </div>
      ))}

      <div className="flex gap-2">
        <button
          className="flex-1 bg-blue-600 text-white p-2 rounded"
          onClick={calcular}
        >
          Calcular
        </button>
        <button
          className="flex-1 bg-gray-500 text-white p-2 rounded"
          onClick={resetear}
        >
          Limpiar
        </button>
      </div>

      {resultado && (
        <div className="text-center text-2xl font-bold mt-4">{resultado}</div>
      )}
    </main>
  );
}
