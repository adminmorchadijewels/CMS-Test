import React, { useState, useEffect, useCallback } from "react";

const API = "http://localhost:5000/api";

export default function App() {
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [status, setStatus] = useState("");
  const [newColName, setNewColName] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API}/data`);
      const json = await res.json();
      setColumns(json.columns);
      setData(json.data);
    } catch (err) {
      setStatus("Failed to load data");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCellChange = (rowIdx, colIdx, value) => {
    const updated = data.map((row, ri) =>
      ri === rowIdx
        ? row.map((cell, ci) => (ci === colIdx ? value : cell))
        : row
    );
    setData(updated);
  };

  const saveAll = async () => {
    setStatus("Saving...");
    try {
      const res = await fetch(`${API}/data`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columns, data }),
      });
      if (res.ok) setStatus("Saved!");
      else setStatus("Save failed");
    } catch {
      setStatus("Save failed");
    }
  };

  const addRow = () => {
    setData([...data, columns.map(() => "")]);
  };

  const deleteRow = (rowIdx) => {
    setData(data.filter((_, i) => i !== rowIdx));
  };

  const addColumn = async () => {
    const name = newColName.trim() || "New Column";
    try {
      const res = await fetch(`${API}/column`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      setColumns(json.columns);
      setData(json.data);
      setNewColName("");
    } catch {
      setStatus("Failed to add column");
    }
  };

  const deleteColumn = async (colIdx) => {
    if (!window.confirm(`Delete column "${columns[colIdx]}"?`)) return;
    try {
      const res = await fetch(`${API}/column/${colIdx}`, { method: "DELETE" });
      const json = await res.json();
      setColumns(json.columns);
      setData(json.data);
    } catch {
      setStatus("Failed to delete column");
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 16 }}>Inventory Editor</h1>

      <div style={{ marginBottom: 16, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={saveAll} style={btnStyle("#2563eb")}>
          Save to Excel
        </button>
        <button onClick={addRow} style={btnStyle("#16a34a")}>
          + Add Row
        </button>
        <input
          value={newColName}
          onChange={(e) => setNewColName(e.target.value)}
          placeholder="Column name"
          style={{ padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4 }}
        />
        <button onClick={addColumn} style={btnStyle("#9333ea")}>
          + Add Column
        </button>
        {status && <span style={{ marginLeft: 8, color: "#555" }}>{status}</span>}
      </div>

      {columns.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                {columns.map((col, ci) => (
                  <th key={ci} style={thStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span>{col}</span>
                      <button
                        onClick={() => deleteColumn(ci)}
                        title="Delete column"
                        style={{
                          background: "none", border: "none", color: "#dc2626",
                          cursor: "pointer", fontSize: 14, padding: "0 2px",
                        }}
                      >
                        x
                      </button>
                    </div>
                  </th>
                ))}
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, ri) => (
                <tr key={ri}>
                  {columns.map((_, ci) => (
                    <td key={ci} style={tdStyle}>
                      <input
                        value={row[ci] !== undefined ? row[ci] : ""}
                        onChange={(e) => handleCellChange(ri, ci, e.target.value)}
                        style={{ width: "100%", border: "none", outline: "none", padding: 4, boxSizing: "border-box" }}
                      />
                    </td>
                  ))}
                  <td style={tdStyle}>
                    <button
                      onClick={() => deleteRow(ri)}
                      style={{
                        background: "none", border: "none", color: "#dc2626",
                        cursor: "pointer", fontSize: 13,
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const btnStyle = (bg) => ({
  padding: "8px 16px",
  background: bg,
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 14,
});

const thStyle = {
  border: "1px solid #ddd",
  padding: "8px 12px",
  background: "#f3f4f6",
  textAlign: "left",
  fontSize: 14,
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: 0,
};
