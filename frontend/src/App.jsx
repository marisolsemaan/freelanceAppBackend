import { Routes, Route, BrowserRouter } from "react-router-dom";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

import MyJobs from "./pages/client/MyJobs";
// import WorkerJobs from "./pages/worker/WorkerJobs";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/client/jobs" element={<MyJobs />} />

        {/* <Route path="/worker/jobs" element={<WorkerJobs />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;