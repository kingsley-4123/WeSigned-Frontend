import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import {useAlert} from '../components/AlertContext';

function ExcelComparePage() {
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState(false);

  const { showAlert } = useAlert();

  useEffect(() => {
    showAlert("Import multiple Attendance you've collected and click the compare button to filter it for you showing how many times a name and reg no appeared in the docs. ", "info", {closable: true});
  }, []);

  // Handle file input
  const handleFileChange = (e) => {
    const input = e.target;
    const selectedFiles = Array.from(input.files || []);

    if (selectedFiles.length === 0) {
      // Nothing selected — reset
      setSelecting(false);
      document.body.style.cursor = '';
    } else {
      // Files selected
      setFiles(selectedFiles);
      setResult([]);
      setSelecting(false);
      document.body.style.cursor = '';
    }
  };

  // Parse and compare logic
  const handleCompare = async () => {
    try {
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
      // Show all names/regNos, with count and check marks
      let allResults = Array.from(map.entries())
        .map(([key, count]) => {
          const [name, reg] = key.split('|');
          return { name, reg, count };
        });
      // Sort alphabetically by name only
      allResults = allResults.sort((a, b) => {
        if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
        if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
        return 0;
      });
      setResult(allResults);
    } catch (err) {
      showAlert('An error occurred while comparing files.', 'error');
      console.error('Compare error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Export result to Excel
  const handleExport = () => {
    try {
      // Calculate max length for Name and Reg No columns
      const maxNameLen = Math.max(...result.map(r => r.name.length), 4); // 4 for 'Name'
      const maxRegLen = Math.max(...result.map(r => r.reg.length), 6); // 6 for 'Reg No'
      const ws = XLSX.utils.json_to_sheet(result.map(r => ({
        Name: r.name,
        'Reg No': r.reg,
        Count: '✔'.repeat(r.count),
      })));
      // Set column widths
      ws['!cols'] = [
        { wch: maxNameLen + 2 }, // Name
        { wch: maxRegLen + 2 },  // Reg No
        { wch: 8 },              // Count
        { wch: 8 }               // Check
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Matches');
      XLSX.writeFile(wb, 'matched_records.xlsx');
      showAlert('Matched records exported to Excel successfully.', 'success');
    } catch (err) {
      showAlert('An error occurred while exporting to Excel.', 'error');
      console.error('Export error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-2">
      <h1 className="text-2xl font-bold mb-4 text-indigo-700">Excel Name/Reg No Comparison</h1>
        <div className="mb-4 w-full flex flex-col items-center">
          <input
            id="excel-upload"
            type="file"
            accept=".xlsx,.xls"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="excel-upload"
            className={`px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 cursor-pointer ${selecting ? 'cursor-wait' : ''}`}
            onClick={() => {
              setSelecting(true);
              document.body.style.cursor = 'wait';

              const handleFocus = () => {
                const input = document.getElementById("excel-upload");
                if (input && (!input.files || input.files.length === 0)) {
                  setSelecting(false);
                  document.body.style.cursor = '';
                }
                window.removeEventListener('focus', handleFocus);
              };
              window.addEventListener('focus', handleFocus);
            }}
          >
            {selecting ? 'Loading...' : 'Select Excel Files'}
          </label>
          <div className="mt-2 text-gray-600 text-sm">
            {files.length === 0 ? 'No files selected.' : files.map(f => f.name).join(', ')}
          </div>
        </div>
      <button
        onClick={handleCompare}
        disabled={files.length < 2 || loading}
        className="px-6 py-2 bg-indigo-500 text-white rounded-lg shadow hover:bg-indigo-700 hover:cursor-pointer  disabled:opacity-50"
      >
        {loading ? 'Comparing...' : 'Compare & Find Matches'}
      </button>
      {result.length > 0 && (
  <div className="w-full max-w-2xl mt-8">
          <h2 className="text-lg font-semibold mb-2">Matched Records</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-slate-300 bg-white rounded-lg text-xs sm:text-sm md:text-base">
              <thead>
                <tr className="bg-slate-100">
                  <th className="px-2 sm:px-3 py-2 border">Name</th>
                  <th className="px-2 sm:px-3 py-2 border">Reg No</th>
                  <th className="px-2 sm:px-3 py-2 border">Count</th>
                  <th className="px-2 sm:px-3 py-2 border">✔</th>
                </tr>
              </thead>
              <tbody>
                {result.map((r, i) => (
                  <tr key={i}>
                    <td className="px-2 sm:px-3 py-1 border break-words max-w-[120px] sm:max-w-[180px]">{r.name}</td>
                    <td className="px-2 sm:px-3 py-1 border break-words max-w-[120px] sm:max-w-[180px]">{r.reg}</td>
                    <td className="px-2 sm:px-3 py-1 border text-center">{r.count}</td>
                    <td className="px-2 sm:px-3 py-1 border text-center">{'✔'.repeat(r.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={handleExport}
            className="mt-4 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 hover:cursor-pointer"
          >
            Export to Excel
          </button>
        </div>
      )}
    </div>
  );
}

export default ExcelComparePage;
