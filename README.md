import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// ============================
// CONFIGURAÇÃO DO SUPABASE
// ============================
// ⚠️ IMPORTANTE: Troque os valores abaixo pelos dados do seu projeto Supabase.
// Você pega eles em: https://app.supabase.com -> Projeto -> Settings -> API
const SUPABASE_URL = "https://exfhqytqpnkavohloymo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZmhxeXRxcG5rYXZvaGxveW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTExMTE3MCwiZXhwIjoyMDc0Njg3MTcwfQ.kuVc_UjkBHdqGDGxmtHCjcBbtXIwIDEJj8qZcFT85Wo";


const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================
// APP PRINCIPAL
// ============================
export default function AlbionProfitManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("items");

  const [form, setForm] = useState({ name: "", tier: "T4", enchant: "0" });

  // Carregar itens do banco
  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase.from("items").select("*").order("name");
    if (!error) setItems(data || []);
    setLoading(false);
  }

  async function addItem() {
    if (!form.name.trim()) return;
    const { error } = await supabase.from("items").insert({
      name: form.name.trim(),
      tier: form.tier,
      enchant: parseInt(form.enchant),
      buy: 0,
      sell: 0,
      fee_percent: 6,
      quantity: 0,
    });
    if (!error) {
      setForm({ name: "", tier: "T4", enchant: "0" });
      fetchItems();
    }
  }

  async function removeItem(id) {
    await supabase.from("items").delete().eq("id", id);
    fetchItems();
  }

  async function updateItem(id, field, value) {
    await supabase.from("items").update({ [field]: value }).eq("id", id);
    fetchItems();
  }

  function calcForItem(it) {
    const buy = Number(it.buy) || 0;
    const sell = Number(it.sell) || 0;
    const fee = Number(it.fee_percent) || 0;
    const net = sell * (1 - fee / 100);
    const profit = net - buy;
    const marginPercent = buy !== 0 ? (profit / buy) * 100 : (profit > 0 ? 999999 : 0);
    const qty = Number(it.quantity || 0);
    const totalProfit = profit * qty;
    return { buy, sell, fee, net, profit, marginPercent, qty, totalProfit };
  }

  function colorByMargin(m) {
    if (m >= 33) return "bg-green-100 border-green-400 text-green-800";
    if (m >= 25) return "bg-yellow-100 border-yellow-400 text-yellow-800";
    return "bg-red-100 border-red-400 text-red-800";
  }

  function formatMoney(v) {
    return Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 text-gray-800">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Albion Profit Manager</h1>

        <nav className="flex gap-2 mb-4">
          <TabButton active={tab === "items"} onClick={() => setTab("items")}>Itens</TabButton>
          <TabButton active={tab === "prices"} onClick={() => setTab("prices")}>Preços</TabButton>
          <TabButton active={tab === "inventory"} onClick={() => setTab("inventory")}>Quantidade</TabButton>
          <TabButton active={tab === "profits"} onClick={() => setTab("profits")}>Lucros</TabButton>
        </nav>

        {loading && <p>Carregando...</p>}

        {!loading && tab === "items" && (
          <section>
            <h2 className="text-lg font-semibold mb-2">Cadastrar itens</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
              <input className="border p-2 rounded" placeholder="Nome do item" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <select className="border p-2 rounded" value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}>
                {["T2","T3","T4","T5","T6","T7","T8"].map(t=> <option key={t}>{t}</option>)}
              </select>
              <select className="border p-2 rounded" value={form.enchant} onChange={e => setForm(f => ({ ...f, enchant: e.target.value }))}>
                {[0,1,2,3].map(e=> <option key={e}>{e}</option>)}
              </select>
              <button onClick={addItem} className="px-4 py-2 bg-green-600 text-white rounded">Adicionar</button>
            </div>

            <table className="w-full">
              <thead><tr><th>Nome</th><th>Tier</th><th>Encant.</th><th>Ações</th></tr></thead>
              <tbody>
                {items.map(it => (
                  <tr key={it.id} className="border-t">
                    <td>{it.name}</td>
                    <td>{it.tier}</td>
                    <td>{it.enchant}</td>
                    <td><button onClick={() => removeItem(it.id)} className="px-2 py-1 bg-red-500 text-white rounded">Remover</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {!loading && tab === "prices" && (
          <section>
            <h2 className="text-lg font-semibold mb-2">Preços</h2>
            <table className="w-full">
              <thead><tr><th>Item</th><th>Compra</th><th>Venda</th><th>Taxa %</th></tr></thead>
              <tbody>
                {items.map(it => (
                  <tr key={it.id} className="border-t">
                    <td>{it.name} ({it.tier}+{it.enchant})</td>
                    <td><input type="number" value={it.buy} onChange={e => updateItem(it.id, "buy", Number(e.target.value))} className="border p-1 w-24"/></td>
                    <td><input type="number" value={it.sell} onChange={e => updateItem(it.id, "sell", Number(e.target.value))} className="border p-1 w-24"/></td>
                    <td><input type="number" value={it.fee_percent} onChange={e => updateItem(it.id, "fee_percent", Number(e.target.value))} className="border p-1 w-16"/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {!loading && tab === "inventory" && (
          <section>
            <h2 className="text-lg font-semibold mb-2">Quantidade</h2>
            <table className="w-full">
              <thead><tr><th>Item</th><th>Qtd</th></tr></thead>
              <tbody>
                {items.map(it => (
                  <tr key={it.id} className="border-t">
                    <td>{it.name} ({it.tier}+{it.enchant})</td>
                    <td><input type="number" value={it.quantity} onChange={e => updateItem(it.id, "quantity", Number(e.target.value))} className="border p-1 w-24"/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {!loading && tab === "profits" && (
          <section>
            <h2 className="text-lg font-semibold mb-2">Lucros</h2>
            <table className="w-full">
              <thead><tr><th>Item</th><th>Compra</th><th>Venda</th><th>Taxa %</th><th>Líquido</th><th>Lucro/unid</th><th>Margem %</th><th>Qtd</th><th>Lucro total</th></tr></thead>
              <tbody>
                {items.map(it => {
                  const c = calcForItem(it);
                  return (
                    <tr key={it.id} className="border-t">
                      <td>{it.name} ({it.tier}+{it.enchant})</td>
                      <td>{formatMoney(c.buy)}</td>
                      <td>{formatMoney(c.sell)}</td>
                      <td>{c.fee}</td>
                      <td>{formatMoney(c.net)}</td>
                      <td>{formatMoney(c.profit)}</td>
                      <td><span className={`px-2 py-1 border rounded ${colorByMargin(c.marginPercent)}`}>{c.marginPercent.toFixed(2)}%</span></td>
                      <td>{c.qty}</td>
                      <td className="font-semibold">{formatMoney(c.totalProfit)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-4 p-3 border bg-gray-50">
              <h3 className="font-semibold">Resumo</h3>
              <p>Total de itens: {items.length}</p>
              <p>Lucro total: {formatMoney(items.reduce((acc, it) => acc + calcForItem(it).totalProfit, 0))}</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function TabButton({ children, active, onClick }) {
  return (
    <button onClick={onClick} className={`px-3 py-1 rounded ${active ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>{children}</button>
  );
}
