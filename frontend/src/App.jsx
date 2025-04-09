import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [msg, setMsg] = useState("Loading...");

  useEffect(() => {
    axios.get("http://localhost:8000/api/ping")
      .then(res => {
        setMsg(res.data);
      })
      .catch(err => {
        console.error(err);
        setMsg("error"); 
      });
  }, []); 

  return <h1>Hello, FastAPI says: {msg}</h1>;
}

export default App;
