import { Routes, Route, BrowserRouter } from "react-router-dom";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import CreateJob from "./pages/client/CreateJob";
import MyJobs from "./pages/client/MyJobs";
import WorkerProfilePreview from "./pages/worker/WorkerProfilePreview";
import SearchJobs from "./pages/worker/SearchJobs";

import WorkerProfile from "./components/worker/WorkerProfile";

import ClientProfile from "./pages/client/ClientProfile";

import Messages from "./pages/conversation/Messages";

import ProtectedRoute from "./components/auth/ProtectedRoute";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/client/jobs" element={<ProtectedRoute allowedRole={1}> <MyJobs /> </ProtectedRoute>} />

        <Route path="/client/jobs/create" element={<ProtectedRoute allowedRole={1}> <CreateJob /> </ProtectedRoute>}/>

        <Route path="/worker/search-jobs" element={ <ProtectedRoute allowedRole={2}>  <SearchJobs />  </ProtectedRoute> }  />

        <Route path="/worker/profile" element={ <ProtectedRoute allowedRole={2}> <WorkerProfile /> </ProtectedRoute> } />

        <Route path="/client/profile" element={  <ProtectedRoute allowedRole={1}><ClientProfile /></ProtectedRoute> } />

       <Route path="/messages/:conversationId" element={<Messages />}/>

       <Route path="/messages" element={<Messages />} />
       
       <Route path="/worker/clients/:clientId" element={ <ProtectedRoute allowedRole={2}> <ClientProfile /></ProtectedRoute>}/>

       <Route path="/client/workers/:workerId"  element={ <ProtectedRoute allowedRole={1}> <WorkerProfilePreview />   </ProtectedRoute> }/>

        </Routes >
  
    </BrowserRouter>
    
  );
  
}

export default App;













