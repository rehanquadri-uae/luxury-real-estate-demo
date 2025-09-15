import { useEffect, useMemo, useState } from "react";

// Simple currency formatter for AED
const formatAED = (n) =>
  typeof n === "number"
    ? new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", currencyDisplay: "symbol" }).format(n)
    : "—";

const STATUS_COLORS = {
  available: "#2e8b57", // green
  on_hold: "#f4a261",   // amber
  booked: "#1e6091",    // deep blue
  sold: "#9d0208"       // red
};

export default function Home() {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null); // selected unit for modal

  useEffect(() => {
  fetch("/data/viento_inventory.json")
    .then((r) => r.json())
  .then((json) => {
  console.log("Loaded JSON:", json);
  setData(json);
})

    .catch((e) => console.error("Failed to load inventory JSON", e));
}, []);


  // Counters (Available / On Hold / Booked / Sold) from full records
  const counters = useMemo(() => {
    const base = { available: 0, on_hold: 0, booked: 0, sold: 0 };
    if (!data?.records) return base;
    for (const r of data.records) {
      const s = (r.status || "available").toLowerCase();
      if (s.includes("sold")) base.sold++;
      else if (s.includes("hold")) base.on_hold++;
      else if (s.includes("book")) base.booked++;
      else base.available++;
    }
    return base;
  }, [data]);

  // Floors sorted numerically (string keys in the JSON)
  const floorKeys = useMemo(() => {
    if (!data?.floors) return [];
    return Object.keys(data.floors)
      .filter((k) => k !== "-1")
      .map((k) => Number(k))
      .sort((a, b) => a - b)
      .map(String);
  }, [data]);

  // Styling helpers (keeping it minimal now; we’ll brand it next)
  const pageStyle = {
    fontFamily: "Optima, sans-serif",
    backgroundColor: "#f8f5f2",
    minHeight: "100vh",
    padding: "24px"
  };

  const titleStyle = {
    color: "#4a3c2a",
    textAlign: "center",
    fontSize: "34px",
    margin: "16px 0 24px"
  };

  const gridWrap = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    margin: "0 auto 28px",
    maxWidth: 1200
  };

  const card = {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 8px 20px rgba(0,0,0,.08)",
    padding: "18px",
    textAlign: "center"
  };

  const unitRow = {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center"
  };

  const unitBox = (status) => ({
    padding: "10px 14px",
    borderRadius: 12,
    background: "#fff",
    border: `2px solid ${STATUS_COLORS[status] || "#999"}`,
    color: STATUS_COLORS[status] || "#222",
    fontWeight: 700,
    cursor: status === "sold" ? "not-allowed" : "pointer",
    opacity: status === "sold" ? 0.65 : 1,
    userSelect: "none",
    transition: "transform .08s ease",
  });

  const legendDot = (c) => ({
    width: 10, height: 10, borderRadius: 99, background: c, display: "inline-block", marginRight: 8
  });

  const modalBackdrop = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50
  };

  const modalCard = {
    background: "#fff", borderRadius: 16, padding: 24, width: "min(560px, 92vw)",
    boxShadow: "0 12px 28px rgba(0,0,0,.18)"
  };

  return (
    <main style={pageStyle}>
      <h1 style={titleStyle}>🏢 Luxury Real Estate — {data?.project_name || "Project"}</h1>

      {/* Counters */}
      <div style={gridWrap}>
        <div style={card}>
          <div style={{ fontSize: 34, color: STATUS_COLORS.available, fontWeight: 800 }}>{counters.available}</div>
          <div>Available</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 34, color: STATUS_COLORS.on_hold, fontWeight: 800 }}>{counters.on_hold}</div>
          <div>On Hold</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 34, color: STATUS_COLORS.booked, fontWeight: 800 }}>{counters.booked}</div>
          <div>Booked</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 34, color: STATUS_COLORS.sold, fontWeight: 800 }}>{counters.sold}</div>
          <div>Sold</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ maxWidth: 1200, margin: "0 auto 12px", color: "#4a3c2a" }}>
        <span style={{ marginRight: 14 }}><span style={legendDot(STATUS_COLORS.available)} />Available</span>
        <span style={{ marginRight: 14 }}><span style={legendDot(STATUS_COLORS.on_hold)} />On Hold</span>
        <span style={{ marginRight: 14 }}><span style={legendDot(STATUS_COLORS.booked)} />Booked</span>
        <span style={{ marginRight: 14 }}><span style={legendDot(STATUS_COLORS.sold)} />Sold</span>
      </div>

      {/* Floor-wise unit rectangles */}
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gap: 16 }}>
        {floorKeys.map((fk) => {
          const units = (data.floors?.[fk] || []).slice().sort((a, b) => (a.unit_no > b.unit_no ? 1 : -1));
          return (
            <div key={fk} style={card}>
              <div style={{ textAlign: "left", color: "#4a3c2a", marginBottom: 10, fontWeight: 700 }}>
                Floor {fk}
              </div>
              <div style={unitRow}>
                {units.map((u) => {
                  const status = (u.status || "available").toLowerCase();
                  const isSold = status === "sold";
                  return (
                    <div
                      key={`${fk}-${u.unit_no}`}
                      style={unitBox(status)}
                      onClick={() => !isSold && setSelected(u)}
                      onMouseDown={(e) => !isSold && (e.currentTarget.style.transform = "scale(0.98)")}
                      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    >
                      {u.unit_no}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selected && (
        <div style={modalBackdrop} onClick={() => setSelected(null)}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, color: "#4a3c2a" }}>
                Unit {selected.unit_no} — Floor {selected.floor_no ?? "—"}
              </h2>
              <button
                onClick={() => setSelected(null)}
                style={{ border: "none", background: "transparent", fontSize: 18, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <div style={{ marginTop: 12, color: "#333" }}>
              <div><strong>Status:</strong> <span style={{ color: STATUS_COLORS[selected.status] || "#333" }}>{selected.status?.replace("_", " ")}</span></div>
              <div><strong>Type:</strong> {selected.unit_type || "—"}</div>
              <div><strong>View:</strong> {selected.view || "—"}</div>
              <div><strong>Total Area:</strong> {selected.total_area ? `${selected.total_area.toLocaleString()} sq.ft.` : "—"}</div>
              <div><strong>Rooms:</strong> {selected.rooms ?? "—"}</div>
              <div><strong>Parking:</strong> {selected.parking ?? "—"}</div>
              <div><strong>Price:</strong> {formatAED(selected.sales_value)}</div>
              <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                Label: {selected.unit_label}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
