import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Users, Briefcase, UserCheck, Building2, Download } from "lucide-react";

export default function BottomTabNavigator() {
  const location = useLocation();

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
      title: "Seekers",
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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 card-elevation">
      <div className="grid grid-cols-5 h-16">
        {navigationItems.map((item) => {
          const active = isActive(item.url);
          return (
            <Link
              key={item.title}
              to={item.url}
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                active
                  ? "text-[#046645]"
                  : "text-gray-500"
              }`}
            >
              <div className={`relative ${active ? "scale-110" : ""} transition-transform duration-200`}>
                <item.icon className="w-5 h-5" />
                {active && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#046645] rounded-full" />
                )}
              </div>
              <span className={`text-xs font-medium ${active ? "font-semibold" : ""}`}>
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
