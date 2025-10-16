import React, { useState } from 'react';
import * as XLSX from 'xlsx';

function ExcelComparePage() {
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle file input
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setResult([]);
  };

  // Parse and compare logic
  const handleCompare = async () => {
    setLoading(true);
    const allRecords = [];
    for (const file of files) {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      // Find columns for name and reg no (case-insensitive)
      const header = json[0].map(h => h.toString().toLowerCase());
      const nameIdx = header.findIndex(h => h.includes('name'));
      const regIdx = header.findIndex(h => h.includes('reg'));
      if (nameIdx === -1 || regIdx === -1) continue;
      for (let i = 1; i < json.length; i++) {
        const row = json[i];
        if (!row[nameIdx] || !row[regIdx]) continue;
        allRecords.push({
          name: row[nameIdx].toString().trim(),
          reg: row[regIdx].toString().trim(),
        });
      }
    }
    // Count occurrences
    const map = new Map();
    allRecords.forEach(({ name, reg }) => {
      const key = name + '|' + reg;
      map.set(key, (map.get(key) || 0) + 1);
    });
    // Only keep those that appear more than once
    const filtered = Array.from(map.entries())
      .filter(([_, count]) => count > 1)
      .map(([key, count]) => {
        const [name, reg] = key.split('|');
        return { name, reg, count };
      });
    setResult(filtered);
    setLoading(false);
  };

  // Export result to Excel
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(result.map(r => ({
      Name: r.name,
      'Reg No': r.reg,
      Count: r.count,
      '✔': '✔'.repeat(r.count),
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Matches');
    XLSX.writeFile(wb, 'matched_records.xlsx');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-2">
      <h1 className="text-2xl font-bold mb-4 text-indigo-700">Excel Name/Reg No Comparison</h1>
      <input
        type="file"
        accept=".xlsx,.xls"
        multiple
        onChange={handleFileChange}
        className="mb-4 hover:cursor-pointer"
      />
      <button
        onClick={handleCompare}
        disabled={files.length < 2 || loading}
        className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Comparing...' : 'Compare & Find Matches'}
      </button>
      {result.length > 0 && (
        <div className="w-full max-w-2xl mt-8">
          <h2 className="text-lg font-semibold mb-2">Matched Records</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-slate-300 bg-white rounded-lg">
              <thead>
                <tr className="bg-slate-100">
                  <th className="px-3 py-2 border">Name</th>
                  <th className="px-3 py-2 border">Reg No</th>
                  <th className="px-3 py-2 border">Count</th>
                  <th className="px-3 py-2 border">✔</th>
                </tr>
              </thead>
              <tbody>
                {result.map((r, i) => (
                  <tr key={i}>
                    <td className="px-3 py-1 border">{r.name}</td>
                    <td className="px-3 py-1 border">{r.reg}</td>
                    <td className="px-3 py-1 border text-center">{r.count}</td>
                    <td className="px-3 py-1 border text-center">{'✔'.repeat(r.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={handleExport}
            className="mt-4 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export to Excel
          </button>
        </div>
      )}
    </div>
  );
}

export default ExcelComparePage;
