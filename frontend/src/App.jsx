import { useEffect, useState } from 'react';

function App() {
  const setMsg = async () => {
    axios.get("http://localhost:8000/api/ping")
    .then(res => {
      console.log(res.data)
    }).catch(err => {
      console.log(err);
    })
  }

  return <h1>Hello, FastAPI says: {setMsg}</h1>;
}

export default App;