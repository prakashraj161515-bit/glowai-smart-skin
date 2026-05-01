import { useState } from "react";
import axios from "axios";

export default function Chat() {
  const [msg, setMsg] = useState("");
  const [reply, setReply] = useState("");

  const send = async () => {
    const res = await axios.post("http://localhost:8000/chat", {
      message: msg
    });

    setReply(res.data.reply);
  };

  return (
    <div style={{textAlign:"center", marginTop:50}}>
      <h2>AI Skin Chat</h2>

      <input 
        value={msg} 
        onChange={(e)=>setMsg(e.target.value)} 
        placeholder="Ask..."
        style={{padding: 8, borderRadius: 4, border: "1px solid #ccc"}}
      />

      <button onClick={send} style={{marginLeft: 10, padding: "8px 16px"}}>Send</button>

      <div style={{marginTop: 30, maxWidth: 600, margin: "30px auto", textAlign: "left"}}>
        <p style={{whiteSpace: "pre-wrap"}}>{reply}</p>
      </div>
    </div>
  );
}
