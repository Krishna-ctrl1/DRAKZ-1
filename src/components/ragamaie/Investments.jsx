import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "../../styles/ragamaie/Investments.css";

export default function Investments() {
  const data = [
    { name: "Jul 23", value: 4200 },
    { name: "Aug 23", value: 4500 },
    { name: "Sep 23", value: 4300 },
    { name: "Oct 23", value: 4487 },
    { name: "Nov 23", value: 4566 },
  ];

  return (
    <div className="investment-container">
      <h2>Total Investment</h2>
      <p className="investment-value">$4,566.48 (+1.65%)</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="name" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
