import React, { useEffect, useMemo, useState } from "react";
import { ThemeProvider, createTheme, CssBaseline, Container, Box, AppBar, Toolbar, Typography, Button, Stack, Paper, Tabs, Tab } from "@mui/material";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase.js";
import Dashboard from "./components/Dashboard.jsx";
import Alerts from "./components/Alerts.jsx";
import Zones from "./components/Zones.jsx";
import AdminUsers from "./components/AdminUsers.jsx";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700}>Help-Sibiu — Login</Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
          Autentificare Firebase (Email/Password).
        </Typography>

        <Stack spacing={2}>
          <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} style={{ padding: 12, borderRadius: 10, border: "1px solid #ccc" }} />
          <input placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} style={{ padding: 12, borderRadius: 10, border: "1px solid #ccc" }} />
          {err ? <Typography color="error">{err}</Typography> : null}
          <Button variant="contained" onClick={async ()=>{
            setErr("");
            try {
              await signInWithEmailAndPassword(auth, email, password);
            } catch (e) { setErr(e.message); }
          }}>Login</Button>
        </Stack>
      </Paper>
    </Container>
  );
}

export default function App() {
  const [dark, setDark] = useState(true);
  const theme = useMemo(()=>createTheme({ palette: { mode: dark ? "dark" : "light" }, shape: { borderRadius: 16 } }), [dark]);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState(0);

  useEffect(()=>onAuthStateChanged(auth, (u)=>setUser(u)), []);

  if (!user) return <ThemeProvider theme={theme}><CssBaseline /><Login /></ThemeProvider>;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="sticky" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h6" fontWeight={800} sx={{ flex: 1 }}>Help-Sibiu Dashboard</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={()=>setDark(d=>!d)}>{dark ? "Light" : "Dark"}</Button>
            <Button variant="contained" onClick={()=>signOut(auth)}>Logout</Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper sx={{ p: 1.5, borderRadius: 4 }}>
          <Tabs value={tab} onChange={(e,v)=>setTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab label="Overview" />
            <Tab label="Alerte" />
            <Tab label="Zone (Draw)" />
            <Tab label="Admin Users" />
          </Tabs>
        </Paper>

        <Box sx={{ mt: 2 }}>
          {tab === 0 ? <Dashboard /> : null}
          {tab === 1 ? <Alerts /> : null}
          {tab === 2 ? <Zones /> : null}
          {tab === 3 ? <AdminUsers /> : null}
        </Box>
      </Container>
    </ThemeProvider>
  );
}
