import Layout from "./Layout.jsx";
import Users from "./Users";
import Jobs from "./Jobs";
import JobSeekers from "./JobSeekers";
import Employers from "./Employers";
import DataExport from "./DataExport";
import Login from "./Login"; // Import the Login component
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';

const PAGES = {
    Users: Users,
    Jobs: Jobs,
    JobSeekers: JobSeekers,
    Employers: Employers,
    DataExport: DataExport,
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    if (!isAuthenticated && location.pathname !== '/login') {
        return <Navigate to="/login" replace />;
    }
     if (isAuthenticated && location.pathname === '/login') {
        return <Navigate to="/Users" replace />;
    }
    
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
                isAuthenticated ? (
                    <Layout currentPageName={currentPage}>
                        <Routes>
                            <Route path="/" element={<Users />} />
                            <Route path="/Users" element={<Users />} />
                            <Route path="/Jobs" element={<Jobs />} />
                            <Route path="/JobSeekers" element={<JobSeekers />} />
                            <Route path="/Employers" element={<Employers />} />
                            <Route path="/DataExport" element={<DataExport />} />
                        </Routes>
                    </Layout>
                ) : (
                    <Navigate to="/login" replace />
                )
            } />
        </Routes>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}
