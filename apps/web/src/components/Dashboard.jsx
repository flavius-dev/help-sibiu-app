import React, { useEffect, useState } from "react";
import { Paper, Typography, Grid, Stack } from "@mui/material";
import { api } from "../api.js";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(()=>{
    (async ()=>{
      const s = await api.get("/stats/summary").then(r=>r.data).catch(()=>null);
      setSummary(s);
    })();
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2.5, borderRadius: 4 }}>
          <Typography variant="h6" fontWeight={800}>Statistici</Typography>
          <Stack spacing={1} sx={{ mt: 1, opacity: 0.9 }}>
            <div>Total alerte: {summary?.alertsTotal ?? "—"}</div>
            <div>Active: {summary?.active ?? "—"}</div>
            <div>Rezolvate: {summary?.resolved ?? "—"}</div>
            <div>Total zone: {summary?.zonesTotal ?? "—"}</div>
            <div>Risc mediu: {summary ? (summary.avgRisk*100).toFixed(1)+"%" : "—"}</div>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2.5, borderRadius: 4, height: 340 }}>
          <Typography variant="h6" fontWeight={800}>Trend demo</Typography>
          <Typography variant="body2" sx={{ opacity: 0.75, mb: 1 }}>
            Grafic demonstrativ (înlocuiești cu date reale).
          </Typography>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={[
              { name: "L", v: 2 },
              { name: "Ma", v: 3 },
              { name: "Mi", v: 1 },
              { name: "J", v: 4 },
              { name: "V", v: 3 },
              { name: "S", v: 2 },
              { name: "D", v: 5 },
            ]}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="v" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}
