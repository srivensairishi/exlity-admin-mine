
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Users, Briefcase, UserCheck, Building2, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import BottomTabNavigator from "../components/common/BottomTabNavigator";

import PropTypes from "prop-types";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
    localStorage.setItem("isAuthenticated", "false");
    navigate("/");
  };

  const navigationItems = [
    {
      title: "Users",
      url: createPageUrl("Users"),
      icon: Users,
    },
    {
      title: "Jobs",
      url: createPageUrl("Jobs"),
      icon: Briefcase,
    },
    {
      title: "Job Seekers",
      url: createPageUrl("JobSeekers"),
      icon: UserCheck,
    },
    {
      title: "Employers",
      url: createPageUrl("Employers"),
      icon: Building2,
    }
  ];

  const isActive = (url) => location.pathname === url;

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        :root {
          --primary: #046645;
          --primary-hover: #035538;
          --primary-light: #e6f4f0;
        }
        .ripple-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ripple-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(4, 102, 69, 0.25);
        }
        .ripple-button:active {
          transform: translateY(0);
        }
        .card-elevation {
          box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
          transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-elevation:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08);
        }
      `}</style>

      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 card-elevation">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#046645] to-[#035538] flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Exlity</h1>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#046645] flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.full_name?.[0]?.toUpperCase() || "A"}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.full_name || "Admin"}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-600 hover:text-red-500">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Desktop Only */}
        <aside className={`fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)] bg-white border-r border-gray-200 transition-transform duration-300 z-40 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64 card-elevation`}>
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.title}
                to={item.url}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.url)
                    ? "bg-[#046645] text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.title}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 w-full pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Bottom Tab Navigator - Mobile Only */}
      <BottomTabNavigator />
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
