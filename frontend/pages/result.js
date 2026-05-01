import { useEffect, useState } from "react";

export default function Result() {
  const [data, setData] = useState(null);

  useEffect(()=>{
    const res = JSON.parse(localStorage.getItem("result"));
    setData(res);
  },[]);

  if(!data) return <div style={{textAlign:"center", marginTop:50}}>Loading...</div>;

  return (
    <div style={{textAlign:"center", marginTop:50}}>
      <h2>Analysis Result</h2>
      <div style={{display:"inline-block", textAlign:"left", background:"#f0f0f0", padding:20, borderRadius:10, color: "black"}}>
        <p><b>Acne:</b> {data.acne}</p>
        <p><b>Oil:</b> {data.oil}</p>
        <p><b>Pigmentation:</b> {data.pigmentation}</p>
      </div>
    </div>
  );
}
