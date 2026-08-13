"use client";
import { Button, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server'; // <-- Ye naya import hai

const ExportButton = (props) => {
    const { url, columns, fileName = 'exported_data.csv' } = props;
    const [loading, setLoading] = useState(false);

    let token = '';
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('access_token');
    }

    const exportToExcel = async () => {
        if (!columns || columns.length === 0) return;

        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/${url}?export=true`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`
                }
            });

            const result = await response.json();
            const data = result.data || result;

            if (!data || data.length === 0) {
                alert("No data found to export!");
                setLoading(false);
                return;
            }

            // 'actions' column hatayein
            const exportColumns = columns.filter(col => col.field !== 'actions');
            const csvRows = [];

            // 1. Headers lagayein
            const headers = exportColumns.map(col => `"${col.headerName}"`);
            csvRows.push(headers.join(','));

            // 2. Data rows lagayein
            data.forEach(row => {
                const values = exportColumns.map(col => {
                    let val = '';

                    // AGAR RENDER CELL HAI: Toh uska HTML render karke text nikal lo
                    if (col.renderCell) {
                        try {
                            // renderCell function call karke React element nikaalo
                            const reactElement = col.renderCell({ row });
                            
                            if (reactElement !== null && reactElement !== undefined) {
                                // React Element ko HTML String me badlo
                                const htmlString = renderToStaticMarkup(reactElement);
                                
                                // Regex se HTML tags (jaise <span>) hata do aur sirf text rakho
                                val = htmlString.replace(/<[^>]+>/g, '').trim();
                            }
                        } catch (error) {
                            console.error(`Error parsing column ${col.field}`, error);
                            val = row[col.field] || '';
                        }
                    } 
                    // AGAR RENDER CELL NAHI HAI: Toh direct database value utha lo
                    else {
                        val = row[col.field] !== null && row[col.field] !== undefined ? row[col.field] : '';
                    }

                    // CSV me coma(,) ki wajah se text break na ho isliye format karein
                    return `"${String(val).replace(/"/g, '""')}"`;
                });
                csvRows.push(values.join(','));
            });

            // 3. File Download Logic
            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const blobUrl = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            window.URL.revokeObjectURL(blobUrl);

        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert("Error exporting data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '10px' }}>
            <Button
                variant="contained"
                onClick={exportToExcel}
                disabled={loading}
            >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Export'}
            </Button>
        </div>
    );
};

export default ExportButton;