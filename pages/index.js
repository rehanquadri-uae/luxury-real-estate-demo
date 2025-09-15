export default function Home() {
  const stats = [
    { label: "Available", value: 120, color: "#2e8b57" },
    { label: "On Hold", value: 15, color: "#f4a261" },
    { label: "Booked", value: 25, color: "#1e6091" },
    { label: "Sold", value: 40, color: "#9d0208" }
  ];

  return (
    <main style={{
      fontFamily: "Optima, sans-serif",
      padding: "40px",
      backgroundColor: "#f8f5f2",
      minHeight: "100vh"
    }}>
      <h1 style={{ color: "#4a3c2a", textAlign: "center", marginBottom: "40px" }}>
        🏢 Luxury Real Estate Demo
      </h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px"
      }}>
        {stats.map((item) => (
          <div key={item.label} style={{
            background: "white",
            padding: "20px",
            borderRadius: "16px",
            textAlign: "center",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{ color: item.color, fontSize: "2rem", margin: 0 }}>
              {item.value}
            </h2>
            <p style={{ margin: 0, color: "#333" }}>{item.label}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
