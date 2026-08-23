import { Routes, Route, BrowserRouter } from "react-router-dom";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import CreateJob from "./pages/client/CreateJob";
import MyJobs from "./pages/client/MyJobs";
// import WorkerJobs from "./pages/worker/WorkerJobs";

import SearchJobs from "./pages/worker/SearchJobs";
import Conversation from "./pages/conversation/Conversation";

import WorkerProfile from "./components/worker/WorkerProfile";

import ClientProfile from "./pages/client/ClientProfile";

import Messages from "./pages/conversation/Messages";

// import MessagesPage from "./pages/messages/MessagesPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/client/jobs" element={<MyJobs />} />

        <Route path="/client/jobs/create" element={<CreateJob />}/>

        {/* <Route path="/worker/jobs" element={<WorkerJobs />} /> */}

        <Route path="/worker/search-jobs" element={<SearchJobs />} />

        <Route path="/worker/conversations:jobPostId" element={<Conversation />}/>
,
       <Route path="/worker/profile" element ={<WorkerProfile />} />

       <Route path="/client/profile" element={<ClientProfile/>}/>

       <Route path="/messages/:conversationId" element={<Messages />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;