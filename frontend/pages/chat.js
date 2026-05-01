import { useState } from "react";
import axios from "axios";

export default function Chat() {
  const [msg, setMsg] = useState("");
  const [reply, setReply] = useState("");

  const ask = async () => {
    if (!msg.trim()) return;
    try {
      const res = await axios.post("http://localhost:8000/chat", {message: msg});
      setReply(res.data.reply);
    } catch (err) {
      console.error(err);
      setReply("Error: Could not connect to AI Coach");
    }
  };

  return (
    <div style={{textAlign:"center", marginTop:50}}>
      <h2>AI Coach</h2>
      <input 
        type="text" 
        onChange={(e)=>setMsg(e.target.value)}
        style={{padding: 10, borderRadius: 5, border: "1px solid #ccc", width: "300px"}}
        placeholder="Ask something about skincare..."
      />
      <button 
        onClick={ask}
        style={{padding: 10, marginLeft: 10, borderRadius: 5, background: "#0070f3", color: "white", border: "none", cursor: "pointer"}}
      >
        Ask
      </button>

      <div style={{marginTop: 30, padding: 20, textAlign: "left", display: "inline-block", maxWidth: "500px"}}>
        <p style={{whiteSpace: "pre-wrap"}}>{reply}</p>
      </div>
    </div>
  );
}
