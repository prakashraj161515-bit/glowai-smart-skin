import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Scan() {
  const [file, setFile] = useState(null);
  const router = useRouter();

  const upload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post("http://localhost:8000/scan", formData);

    localStorage.setItem("result", JSON.stringify(res.data));
    router.push("/result");
  };

  return (
    <div style={{textAlign:"center", marginTop:50}}>
      <h2>Upload Face</h2>
      <input type="file" onChange={(e)=>setFile(e.target.files[0])}/>
      <br/><br/>
      <button onClick={upload}>Scan</button>
    </div>
  );
}
