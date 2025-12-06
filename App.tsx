import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { HostDashboard } from './pages/HostDashboard';
import { ParticipantView } from './pages/ParticipantView';
import { DisplayView } from './pages/DisplayView';
import { Toaster } from 'react-hot-toast';
import { ArrowRight, Monitor, Smartphone, Settings } from 'lucide-react';

const Landing: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-ui-50 p-6 text-center">
    <div className="max-w-md w-full space-y-8">
        <div className="space-y-2">
            <h1 className="text-4xl font-bold text-ui-900 tracking-tight">Stanford Sparks</h1>
            <p className="text-xl text-ui-500">Real-time Voting System</p>
        </div>

        <div className="grid gap-4">
            <Link to="/vote" className="group relative block w-full p-6 bg-white border border-ui-200 rounded-xl shadow-sm hover:shadow-md hover:border-stanford transition-all text-left">
                <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-lg text-green-700">
                        <Smartphone size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-ui-900">Join Voting</h3>
                        <p className="text-sm text-ui-500">For Audience Members</p>
                    </div>
                    <ArrowRight className="ml-auto text-ui-300 group-hover:text-stanford transition-colors" />
                </div>
            </Link>

            <Link to="/display" className="group relative block w-full p-6 bg-white border border-ui-200 rounded-xl shadow-sm hover:shadow-md hover:border-stanford transition-all text-left">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg text-blue-700">
                        <Monitor size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-ui-900">Big Screen</h3>
                        <p className="text-sm text-ui-500">For Projector / TV</p>
                    </div>
                    <ArrowRight className="ml-auto text-ui-300 group-hover:text-stanford transition-colors" />
                </div>
            </Link>

            <Link to="/host" className="group relative block w-full p-6 bg-white border border-ui-200 rounded-xl shadow-sm hover:shadow-md hover:border-stanford transition-all text-left">
                <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-3 rounded-lg text-gray-700">
                        <Settings size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-ui-900">Host Dashboard</h3>
                        <p className="text-sm text-ui-500">For Organizers</p>
                    </div>
                    <ArrowRight className="ml-auto text-ui-300 group-hover:text-stanford transition-colors" />
                </div>
            </Link>
        </div>
        
        <p className="text-xs text-ui-400 mt-8">
            Select the interface that matches your role.
        </p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<ParticipantView />} />
        <Route path="/host" element={<HostDashboard />} />
        <Route path="/display" element={<DisplayView />} />
        <Route path="/vote" element={<ParticipantView />} />
        <Route path="/landing" element={<Landing />} />
      </Routes>
    </HashRouter>
  );
};

export default App;