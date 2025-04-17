
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA2ydyz4TKXiELpLmNUtLOrI6sppJgxxCg",
  authDomain: "gestor-financeiro-586ff.firebaseapp.com",
  projectId: "gestor-financeiro-586ff",
  storageBucket: "gestor-financeiro-586ff.firebasestorage.app",
  messagingSenderId: "890515805364",
  appId: "1:890515805364:web:ebd4e7bf8fbac3ee4b33e1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function App() {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");

  useEffect(() => {
    const q = query(collection(db, "transactions"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const trans = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(trans);
    });
    return () => unsubscribe();
  }, []);

  const handleAddTransaction = async () => {
    if (!description || !amount) return;
    await addDoc(collection(db, "transactions"), {
      description,
      amount: parseFloat(amount),
      type,
      timestamp: new Date(),
    });
    setDescription("");
    setAmount("");
  };

  const balance = transactions.reduce((acc, t) =>
    t.type === "income" ? acc + t.amount : acc - t.amount, 0
  );

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
      <h1>Gestor Financeiro</h1>
      <input
        placeholder="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        placeholder="Valor"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="income">Receita</option>
        <option value="expense">Despesa</option>
      </select>
      <button onClick={handleAddTransaction}>Adicionar</button>

      <h2>Saldo Atual: R$ {balance.toFixed(2)}</h2>

      <ul>
        {transactions.map((t) => (
          <li key={t.id}>
            {t.description} - {t.type === "income" ? "+" : "-"} R${t.amount.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
