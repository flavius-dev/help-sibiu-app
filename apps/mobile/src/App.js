import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList } from "react-native";
import { StatusBar } from "expo-status-bar";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { apiFetch } from "./api";
import { socket } from "./socket";

function Btn({ title, onPress }) {
  return (
    <Pressable onPress={onPress} style={{ padding: 12, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.12)" }}>
      <Text style={{ color: "white", fontWeight: "700" }}>{title}</Text>
    </Pressable>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [err, setErr] = useState("");

  const refresh = async () => {
    const data = await apiFetch("/alerts").catch(()=>[]);
    setAlerts(data);
  };

  useEffect(()=>onAuthStateChanged(auth, (u)=>setUser(u)), []);
  useEffect(()=>{
    if (!user) return;
    refresh();
    const onAny = ()=>refresh();
    socket.on("alert:new", onAny);
    socket.on("alert:accepted", onAny);
    socket.on("alert:status", onAny);
    return ()=>{
      socket.off("alert:new", onAny);
      socket.off("alert:accepted", onAny);
      socket.off("alert:status", onAny);
    };
  }, [user]);

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0b1220", padding: 18, justifyContent: "center" }}>
        <StatusBar style="light" />
        <Text style={{ color: "white", fontSize: 26, fontWeight: "900" }}>Help-Sibiu</Text>
        <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 6 }}>Voluntar — login Firebase</Text>

        <View style={{ height: 16 }} />
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="rgba(255,255,255,0.5)"
          style={{ padding: 12, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", color: "white" }} />
        <View style={{ height: 10 }} />
        <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="rgba(255,255,255,0.5)" secureTextEntry
          style={{ padding: 12, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", color: "white" }} />
        <View style={{ height: 10 }} />
        {err ? <Text style={{ color: "#ff8a8a" }}>{err}</Text> : null}
        <View style={{ height: 10 }} />
        <Btn title="Login" onPress={async()=>{
          setErr("");
          try { await signInWithEmailAndPassword(auth, email, password); }
          catch (e) { setErr(e.message); }
        }} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0b1220", padding: 18 }}>
      <StatusBar style="light" />
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: "white", fontSize: 22, fontWeight: "900" }}>Alerte</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Btn title="Refresh" onPress={refresh} />
          <Btn title="Logout" onPress={()=>signOut(auth)} />
        </View>
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(i)=>i.id}
        contentContainerStyle={{ paddingVertical: 12 }}
        renderItem={({ item }) => (
          <View style={{ padding: 14, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", marginBottom: 10 }}>
            <Text style={{ color: "white", fontWeight: "900", fontSize: 16 }}>{item.title}</Text>
            <Text style={{ color: "rgba(255,255,255,0.75)" }}>Status: {item.status}</Text>
            <Text style={{ color: "rgba(255,255,255,0.6)" }}>({item.lat}, {item.lng})</Text>

            <View style={{ height: 10 }} />
            <Btn title="Accept intervenția" onPress={async()=>{
              try { await apiFetch(`/alerts/${item.id}/accept`, { method: "POST" }); refresh(); }
              catch (e) { setErr(e.message); }
            }} />
          </View>
        )}
      />
      {err ? <Text style={{ color: "#ff8a8a" }}>{err}</Text> : null}
    </View>
  );
}
