import React, { useEffect, useMemo, useState } from "react";
import { Paper, Typography, Stack, Button, Grid, TextField, Chip } from "@mui/material";
import { api } from "../api.js";
import { socket } from "../socket.js";
import { useReactTable, getCoreRowModel, getPaginationRowModel } from "@tanstack/react-table";

function downloadCSV(rows) {
  const header = ["id","title","status","lat","lng","createdAt"];
  const lines = [header.join(",")].concat(
    rows.map(a => header.map(k => JSON.stringify(a[k] ?? "")).join(","))
  );
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "alerts.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [title, setTitle] = useState("Intervenție");
  const [lat, setLat] = useState("45.7983");
  const [lng, setLng] = useState("24.1256");
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    const data = await api.get("/alerts").then(r=>r.data).catch(()=>[]);
    setAlerts(data);
  };

  useEffect(()=>{ refresh(); }, []);
  useEffect(()=>{
    const onNew = ()=>refresh();
    const onAcc = ()=>refresh();
    const onSt = ()=>refresh();
    socket.on("alert:new", onNew);
    socket.on("alert:accepted", onAcc);
    socket.on("alert:status", onSt);
    return ()=>{
      socket.off("alert:new", onNew);
      socket.off("alert:accepted", onAcc);
      socket.off("alert:status", onSt);
    };
  }, []);

  const columns = useMemo(()=>[
    { header: "Title", accessorKey: "title" },
    { header: "Status", cell: ({ row }) => <Chip size="small" label={row.original.status} /> },
    { header: "Created", accessorKey: "createdAt" },
    { header: "Actions", cell: ({ row }) => (
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="outlined" onClick={async()=>{
          await api.post(`/alerts/${row.original.id}/status`, { status: "RESOLVED" }).catch(()=>{});
        }}>Resolve</Button>
      </Stack>
    )},
  ], []);

  const table = useReactTable({
    data: alerts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2.5, borderRadius: 4 }}>
          <Typography variant="h6" fontWeight={800}>Creează alertă (DISPATCHER)</Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField label="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
            <TextField label="Lat" value={lat} onChange={(e)=>setLat(e.target.value)} />
            <TextField label="Lng" value={lng} onChange={(e)=>setLng(e.target.value)} />
            <Button variant="contained" disabled={loading} onClick={async()=>{
              setLoading(true);
              try {
                await api.post("/alerts", { title, lat: Number(lat), lng: Number(lng) });
                await refresh();
              } finally { setLoading(false); }
            }}>Trimite alertă</Button>

            <Button variant="outlined" onClick={()=>downloadCSV(alerts)}>Export CSV</Button>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2.5, borderRadius: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={800}>Alerte (realtime)</Typography>
            <Button variant="outlined" onClick={refresh}>Refresh</Button>
          </Stack>

          <div style={{ marginTop: 12, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                {table.getHeaderGroups().map(hg=>(
                  <tr key={hg.id}>
                    {hg.headers.map(h=>(
                      <th key={h.id} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                        {h.isPlaceholder ? null : h.column.columnDef.header}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(r=>(
                  <tr key={r.id}>
                    {r.getVisibleCells().map(c=>(
                      <td key={c.id} style={{ padding: 10, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        {c.column.columnDef.cell ? c.column.columnDef.cell(c.getContext()) : c.getValue()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={()=>table.previousPage()} disabled={!table.getCanPreviousPage()}>Prev</Button>
            <Button variant="outlined" onClick={()=>table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
            <Typography sx={{ opacity: 0.8, alignSelf: "center" }}>Page {table.getState().pagination.pageIndex + 1}</Typography>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}
