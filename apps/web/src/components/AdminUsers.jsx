import React, { useEffect, useState } from "react";
import { Paper, Typography, Stack, Button, MenuItem, Select } from "@mui/material";
import { api } from "../api.js";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const refresh = async () => {
    const data = await api.get("/admin/users").then(r=>r.data).catch(()=>[]);
    setUsers(data);
  };

  useEffect(()=>{ refresh(); }, []);

  return (
    <Paper sx={{ p: 2.5, borderRadius: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={800}>Admin: Users</Typography>
        <Button variant="outlined" onClick={refresh}>Refresh</Button>
      </Stack>

      <div style={{ marginTop: 12 }}>
        {users.length === 0 ? (
          <Typography sx={{ opacity: 0.8 }}>
            Dacă primești Forbidden, userul tău nu are rol ADMIN în DB. Rulează bootstrap script din README.
          </Typography>
        ) : null}

        {users.map(u=>(
          <Paper key={u.id} sx={{ p: 2, borderRadius: 3, mt: 1 }}>
            <div style={{ fontWeight: 800 }}>{u.email}</div>
            <div style={{ opacity: 0.8, marginBottom: 8 }}>Role: {u.role}</div>

            <Select size="small" defaultValue={u.role} onChange={async(e)=>{
              await api.post("/admin/set-role", { userId: u.id, role: e.target.value }).catch(()=>{});
              await refresh();
            }}>
              <MenuItem value="ADMIN">ADMIN</MenuItem>
              <MenuItem value="DISPATCHER">DISPATCHER</MenuItem>
              <MenuItem value="VOLUNTEER">VOLUNTEER</MenuItem>
            </Select>
          </Paper>
        ))}
      </div>
    </Paper>
  );
}
