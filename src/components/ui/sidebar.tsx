"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore, type UserRole } from "@/store/use-app-store";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  sections: {
    title: string;
    items: {
      key: string;
      label: string;
      icon: string; // Using Phosphor icons as per your snippet
      badge?: string;
      subItems?: { key: string; label: string; icon?: string }[];
    }[];
  }[];
  activeKey: string;
  onNavigate: (key: string) => void;
  schoolName?: string;
}

export function Sidebar({ sections, activeKey, onNavigate, schoolName }: SidebarProps) {
  const { currentUser, sidebarOpen, setSidebarOpen, logout } = useAppStore();
  
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [hoveredNavId, setHoveredNavId] = useState<string | null>(null);
  const [hoveredItemTop, setHoveredItemTop] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-open menu if child is active
    sections.forEach(section => {
      section.items.forEach(item => {
        if (item.subItems?.some(sub => sub.key === activeKey)) {
          setOpenMenus(prev => ({ ...prev, [item.key]: true }));
        }
      });
    });
  }, [activeKey, sections]);

  const toggleMenu = (key: string) => {
    setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        profileBtnRef.current &&
        !profileBtnRef.current.contains(e.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const role = currentUser.role as UserRole;
  const initials = currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const c = collapsed;

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px] z-[999] lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "flex flex-col py-6 px-4 fixed lg:relative inset-y-0 left-0 shrink-0 z-[1000] transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          "bg-white dark:bg-[#0d0e10] lg:rounded-[2.5rem] border border-gray-200 dark:border-white/5 shadow-xl lg:shadow-none",
          c ? "w-[92px]" : "w-[290px]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Toggle Button */}
        <div
          className="hidden lg:flex bg-[#1a1c1e] text-white w-7 h-7 rounded-full items-center justify-center cursor-pointer absolute -right-3.5 top-9 z-[100] transition-all duration-300 hover:scale-110 shadow-lg border border-white/10"
          onClick={() => setCollapsed(!collapsed)}
        >
          <i className={cn("ph-bold ph-caret-left transition-transform duration-500 text-xs", c && "rotate-180")} />
        </div>

        {/* Branding Header */}
        <div className={cn(
          "flex items-center mb-9 transition-all duration-300",
          c ? "justify-center px-0" : "px-3 justify-between"
        )}>
          <div className="flex items-center gap-3 overflow-hidden shrink-0">
            <div className="relative group">
              <i className="ph-fill ph-graduation-cap text-teal-500 text-[34px] group-hover:scale-110 transition-transform duration-300" />
            </div>
            {!c && (
              <span className="text-gray-900 dark:text-white text-[22px] font-bold tracking-tight whitespace-nowrap animate-slide-in">
                {role === 'super_admin' ? 'EduAdmin' : (schoolName || "EduAdmin")}
              </span>
            )}
          </div>
          <div className="lg:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer transition-colors" onClick={() => setSidebarOpen(false)}>
            <i className="ph-bold ph-x text-2xl" />
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-8 px-1 shrink-0">
          <div className={cn(
             "border rounded-2xl flex items-center gap-3 transition-all duration-300 py-3 px-3.5 group",
             "bg-gray-50 dark:bg-[#1a1c1e] border-gray-100 dark:border-white/5",
             c ? "justify-center bg-transparent border-transparent" : "focus-within:border-teal-500/30 hover:border-gray-200 dark:hover:border-white/10"
          )}>
            <i className="ph ph-magnifying-glass text-lg text-gray-400" />
            {!c && (
              <>
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none text-gray-900 dark:text-white outline-none w-full text-sm placeholder:text-gray-400"
                />
                <div className="bg-white dark:bg-[#25282c] py-1 px-1.5 rounded-md text-[11px] flex items-center gap-1 text-gray-400 font-bold border border-gray-100 dark:border-white/5">
                  <i className="ph ph-command text-[10px]" /> S
                </div>
              </>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <div className={cn(
          "flex-1 mb-4 overflow-y-auto sidebar-scrollbar flex flex-col",
          c ? "items-center overflow-x-visible [scrollbar-width:none]" : "pr-2"
        )}>
          {sections.map((section) => (
            <div key={section.title} className="mb-7 last:mb-0">
              <div className={cn(
                "text-[10px] uppercase tracking-widest text-gray-400 dark:text-[#666] font-bold mb-4 flex items-center",
                c ? "justify-center px-0" : "px-4 justify-between"
              )}>
                <span className={cn("transition-all duration-300", c ? "text-[8px] whitespace-nowrap" : "")}>
                  {section.title}
                </span>
              </div>
              
              <ul className="list-none space-y-1">
                {section.items.map((item) => {
                  const isOpen = openMenus[item.key];
                  const active = activeKey === item.key || item.subItems?.some(s => s.key === activeKey);
                  const isHovered = hoveredNavId === item.key;
                  const hasSub = item.subItems && item.subItems.length > 0;

                  return (
                    <li
                      key={item.key}
                      className="relative group/nav w-full"
                      onMouseEnter={(e) => {
                        if (c) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredItemTop(rect.top);
                          setHoveredNavId(item.key);
                        }
                      }}
                      onMouseLeave={() => c && setHoveredNavId(null)}
                    >
                      <div
                        className={cn(
                          "flex items-center rounded-2xl transition-all duration-300 cursor-pointer active:scale-[0.98]",
                          c ? "w-14 h-14 justify-center mx-auto" : "gap-3.5 py-3.5 px-5",
                          active 
                            ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-gray-200 dark:border-white/10" 
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                        )}
                        onClick={() => {
                          if (hasSub && !c) toggleMenu(item.key);
                          else onNavigate(item.key);
                        }}
                      >
                        <div className={cn(
                          "transition-all duration-300 shrink-0",
                          active ? "scale-110 text-teal-500" : "group-hover/nav:scale-110",
                          "text-[20px]"
                        )}>
                          <i className={cn("ph", item.icon)} />
                        </div>
                        {!c && <span className="flex-1 font-bold text-sm tracking-tight truncate">{item.label}</span>}
                        {!c && hasSub && (
                          <i className={cn("ph-bold ph-caret-down text-[10px] transition-transform duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)] opacity-60", isOpen && "rotate-180")} />
                        )}
                      </div>

                      {/* Submenu Expansion with Tree Lines */}
                      {!c && hasSub && isOpen && (
                        <ul className={cn(
                          "mt-1.5 ml-[28px] pl-6 list-none relative space-y-1 animate-slide-up",
                          "before:content-[''] before:absolute before:left-0 before:-top-4 before:bottom-3 before:border-l before:border-gray-200 dark:before:border-white/10"
                        )}>
                          {item.subItems.map((sub) => {
                            const subActive = activeKey === sub.key;
                            return (
                              <li key={sub.key} className="relative">
                                <div
                                  className={cn(
                                    "flex items-center gap-2.5 relative py-2.5 px-4 no-underline text-[13.5px] rounded-xl transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5",
                                    "before:content-[''] before:absolute before:-left-[24px] before:top-0 before:h-5 before:w-4 before:border-l before:border-b before:border-gray-200 dark:before:border-white/10 before:rounded-bl-lg before:opacity-80",
                                    subActive ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 font-bold border border-gray-200 dark:border-white/10" : "text-gray-500 dark:text-gray-400"
                                  )}
                                  onClick={() => onNavigate(sub.key)}
                                >
                                  {sub.icon && <i className={cn("ph", sub.icon, "text-base opacity-70")} />}
                                  <span className="relative z-[1]">{sub.label}</span>
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      )}

                      {/* Collapsed Hover Tooltip / Submenu */}
                      {c && isHovered && (
                        <div
                          className={cn(
                             "fixed border rounded-2xl p-2 shadow-2xl z-[5000] animate-slide-right min-w-[200px] backdrop-blur-xl",
                             "bg-white dark:bg-[#1a1c1e] border-gray-200 dark:border-white/10"
                          )}
                          style={{ top: `${hoveredItemTop - 14}px`, left: "84px" }}
                        >
                          <div className="text-gray-900 dark:text-white text-sm font-bold px-3 py-2 border-b border-gray-100 dark:border-white/5 mb-1">{item.label}</div>
                          {hasSub ? (
                             <ul className="space-y-0.5">
                              {item.subItems.map((sub) => (
                                <li key={sub.key}>
                                  <div 
                                    className={cn(
                                      "py-2.5 px-4 rounded-xl cursor-pointer text-[13.5px] font-medium transition-colors",
                                      activeKey === sub.key ? "text-teal-500 bg-gray-50 dark:bg-white/5" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                                    )}
                                    onClick={() => onNavigate(sub.key)}
                                  >
                                    {sub.label}
                                  </div>
                                </li>
                              ))}
                             </ul>
                          ) : (
                             <div className="px-3 py-1.5 text-xs text-gray-500">Quick access info</div>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* User Profile Footer */}
        <div className="mt-auto pt-4 relative border-t border-gray-100 dark:border-white/5">
          <div
            ref={dropdownRef}
            className={cn(
              "absolute left-0 border rounded-[2rem] p-3 shadow-2xl flex-col gap-1 z-[5100] animate-slide-up backdrop-blur-xl",
              showProfileDropdown ? "flex" : "hidden",
              "bg-white dark:bg-[#1a1c1e] border-gray-200 dark:border-white/10",
              c ? "fixed w-[240px] left-[106px] bottom-8" : "w-full bottom-[calc(100%+8px)]"
            )}
          >
            <div className="px-4 py-3 mb-2 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
               <Avatar className="w-10 h-10 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                <AvatarFallback className="bg-teal-500/10 text-teal-500 text-sm font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <div className="text-gray-900 dark:text-white text-[14px] font-bold truncate leading-none mb-1">{currentUser.name}</div>
                <div className="text-gray-500 text-[11px] font-bold uppercase tracking-wider">{role.replace("_", " ")}</div>
              </div>
            </div>
            
            <div 
              className="flex items-center gap-3 py-2.5 px-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-all font-medium text-[13px]"
              onClick={() => {
                onNavigate("settings");
                setShowProfileDropdown(false);
              }}
            >
              <i className="ph ph-user text-lg" />
              <span>My Profile</span>
            </div>
            
            <div className="h-px bg-gray-100 dark:bg-white/5 my-1 mx-2" />
            <div 
              className="flex items-center gap-3 py-2.5 px-4 text-red-500 hover:bg-red-500/10 rounded-xl cursor-pointer transition-all font-bold text-[13px]"
              onClick={logout}
            >
              <i className="ph ph-sign-out text-lg" />
              <span>Sign Out</span>
            </div>
          </div>

          <div
            className={cn(
              "rounded-2xl flex items-center gap-3 cursor-pointer transition-all duration-300",
              "bg-gray-50 dark:bg-[#0d0e10] border border-gray-100 dark:border-white/5",
              c ? "justify-center h-16 w-16 mx-auto hover:bg-gray-100" : "p-2.5 hover:bg-gray-100 dark:hover:bg-white/5",
              showProfileDropdown && "bg-gray-100 dark:bg-white/5"
            )}
            ref={profileBtnRef}
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <div className="relative shrink-0">
              <Avatar className={cn(
                "rounded-[14px] border border-gray-200 dark:border-white/10 shadow-sm transition-all duration-300 bg-white",
                c ? "w-11 h-11" : "w-11 h-11"
              )}>
                <AvatarFallback className="bg-teal-500/10 text-teal-500 text-sm font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0d0e10]" />
            </div>
            {!c && (
              <>
                <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                  <span className="text-gray-900 dark:text-white text-sm font-bold truncate tracking-tight">{currentUser.name}</span>
                  <span className="text-gray-400 dark:text-gray-500 text-[10px] uppercase font-bold tracking-widest truncate">{role.replace("_", " ")}</span>
                </div>
                <i className="ph-bold ph-dots-three-vertical text-gray-400 ml-auto" />
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
