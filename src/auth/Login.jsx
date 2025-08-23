import React, { useState } from "react";
import Login from "./pages/Login";

export default function App() {
  const [authUser, setAuthUser] = useState(null);

  const handleLogin = ({ user, role }) => {
    console.log("Logged in user:", user.email, "Role:", role);
    setAuthUser({ ...user, role });
  };

  if (!authUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div>
      <h1>Welcome {authUser.email}</h1>
      <h2>Role: {authUser.role}</h2>
    </div>
  );
}
