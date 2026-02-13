import React, { useEffect, useRef, useState } from "react";
import { Paper, Typography, Grid, Stack, Button, TextField } from "@mui/material";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { api } from "../api.js";
import { socket } from "../socket.js";

export default function Zones() {
  const [name, setName] = useState("Zona 1");
  const [zones, setZones] = useState([]);
  const fgRef = useRef(null);

  const refresh = async () => {
    const data = await api.get("/zones").then(r=>r.data).catch(()=>[]);
    setZones(data);
  };

  useEffect(()=>{ refresh(); }, []);
  useEffect(()=>{
    const onNew = ()=>refresh();
    socket.on("zone:new", onNew);
    return ()=>socket.off("zone:new", onNew);
  }, []);

  const onCreated = async (e) => {
    const geojson = e.layer.toGeoJSON();
    const risk = Math.random(); // demo
    await api.post("/zones", { name, geojson, risk });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2.5, borderRadius: 4 }}>
          <Typography variant="h6" fontWeight={800}>Hartă (Leaflet) + Draw</Typography>
          <Typography variant="body2" sx={{ opacity: 0.75, mb: 1 }}>
            Desenează forme; GeoJSON se trimite în backend și apare în listă (realtime).
          </Typography>

          <div style={{ height: 520, borderRadius: 16, overflow: "hidden" }}>
            <MapContainer center={[45.7983, 24.1256]} zoom={12} style={{ height: "100%", width: "100%" }}>
              <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <FeatureGroup ref={fgRef}>
                <EditControl
                  position="topright"
                  onCreated={onCreated}
                  draw={{ polygon: true, rectangle: true, circle: true, polyline: false, marker: false, circlemarker: false }}
                />
              </FeatureGroup>
            </MapContainer>
          </div>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2.5, borderRadius: 4 }}>
          <Typography variant="h6" fontWeight={800}>Salvare zonă</Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField label="Nume zonă" value={name} onChange={(e)=>setName(e.target.value)} />
            <Button variant="outlined" onClick={refresh}>Refresh listă</Button>
          </Stack>

          <Typography variant="subtitle2" sx={{ mt: 3, opacity: 0.75 }}>Zone salvate</Typography>
          <div style={{ marginTop: 8, maxHeight: 280, overflow: "auto" }}>
            {zones.map(z=>(
              <Paper key={z.id} sx={{ p: 1.5, borderRadius: 3, mb: 1 }}>
                <div style={{ fontWeight: 700 }}>{z.name}</div>
                <div style={{ opacity: 0.8 }}>Risk: {(Number(z.risk||0)*100).toFixed(1)}%</div>
              </Paper>
            ))}
          </div>
        </Paper>
      </Grid>
    </Grid>
  );
}
