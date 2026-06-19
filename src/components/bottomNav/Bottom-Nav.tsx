import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { FolderOpen, Clock, Upload, AlertCircle } from "lucide-react";

export const BottomNav = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="fixed bottom-0 z-50 left-0 right-0 pointer-events-none">
      <div className="pb-8 pt-2 flex justify-center relative">
        <nav className="bg-white/[0.04] border border-white/[0.1] px-4 py-3 rounded-full flex items-center gap-4 backdrop-blur-3xl shadow-[0_0.5rem_2rem_rgba(0,0,0,0.7),inset_0_0.0625rem_0_rgba(255,255,255,0.07)] pointer-events-auto">
          <Link to="/">
            <Button
              variant="ghost"
              className={`flex flex-col h-[3.25rem] w-20 gap-1 rounded-[0.875rem] transition-all group ${
                path === "/"
                  ? "text-white bg-purple-500/10 hover:bg-purple-500/20"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Upload
                className={`w-4 h-4 ${
                  path === "/" ? "text-purple-400" : "group-hover:scale-110 transition-transform duration-300"
                }`}
              />
              <span className="text-[0.5rem] uppercase tracking-[0.15em] font-black">
                Upload
              </span>
              {path === "/" && <div className="w-4 h-0.5 bg-purple-500 rounded-full mt-1" />}
            </Button>
          </Link>
          
          <Link to="/cases">
            <Button
              variant="ghost"
              className={`flex flex-col h-[3.25rem] w-20 gap-1 rounded-[0.875rem] transition-all group ${
                path === "/cases"
                  ? "text-white bg-purple-500/10 hover:bg-purple-500/20"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <FolderOpen
                className={`w-4 h-4 ${
                  path === "/cases" ? "text-purple-400" : "group-hover:scale-110 transition-transform duration-300"
                }`}
              />
              <span className="text-[0.5rem] uppercase tracking-[0.15em] font-black">
                Cases
              </span>
              {path === "/cases" && <div className="w-4 h-0.5 bg-purple-500 rounded-full mt-1" />}
            </Button>
          </Link>

          <Link to="/alerts">
            <Button
              variant="ghost"
              className={`flex flex-col h-[3.25rem] w-20 gap-1 rounded-[0.875rem] transition-all group ${
                path === "/alerts"
                  ? "text-white bg-purple-500/10 hover:bg-purple-500/20"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <AlertCircle
                className={`w-4 h-4 ${
                  path === "/alerts" ? "text-purple-400" : "group-hover:scale-110 transition-transform duration-300"
                }`}
              />
              <span className="text-[0.5rem] uppercase tracking-[0.15em] font-black">
                Alert
              </span>
              {path === "/alerts" && <div className="w-4 h-0.5 bg-purple-500 rounded-full mt-1" />}
            </Button>
          </Link>

          {/* <Link to="/archive">
            <Button
              variant="ghost"
              className={`flex flex-col h-[3.25rem] w-20 gap-1 rounded-[0.875rem] transition-all group ${
                path === "/archive"
                  ? "text-white bg-purple-500/10 hover:bg-purple-500/20"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <BookOpen
                className={`w-4 h-4 ${
                  path === "/archive" ? "text-purple-400" : "group-hover:scale-110 transition-transform duration-300"
                }`}
              />
              <span className="text-[0.5rem] uppercase tracking-[0.15em] font-black">
                Archive
              </span>
              {path === "/archive" && <div className="w-4 h-0.5 bg-purple-500 rounded-full mt-1" />}
            </Button>
          </Link> */}

          <Link to="/history">
            <Button
              variant="ghost"
              className={`flex flex-col h-[3.25rem] w-20 gap-1 rounded-[0.875rem] transition-all group ${
                path === "/history"
                  ? "text-white bg-purple-500/10 hover:bg-purple-500/20"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Clock
                className={`w-4 h-4 ${
                  path === "/history" ? "text-purple-400" : "group-hover:scale-110 transition-transform duration-300"
                }`}
              />
              <span className="text-[0.5rem] uppercase tracking-[0.15em] font-black">
                History
              </span>
              {path === "/history" && <div className="w-4 h-0.5 bg-purple-500 rounded-full mt-1" />}
            </Button>
          </Link>
        </nav>
      </div>
    </div>
  );
};
