import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  return (
    <div style={{textAlign:"center", marginTop:50}}>
      <h1>Glow AI Skin Coach</h1>

      <button onClick={()=>router.push("/scan")}>
        Scan Face
      </button>

      <br/><br/>

      <button onClick={()=>router.push("/chat")}>
        AI Chat
      </button>
    </div>
  );
}
