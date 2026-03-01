import { Routes, Route } from "react-router-dom";
import Bot from "./bot/Bot";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Bot />} /> 
    </Routes>
  );
}
