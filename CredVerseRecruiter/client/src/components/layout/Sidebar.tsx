
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import {
  Menu,
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileCheck,
  Building2,
  Settings,
  LogOut,
  Bell,
  Search,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "Candidates", href: "/candidates" },
  { icon: ShieldCheck, label: "Verifications", href: "/verifications" },
  { icon: FileCheck, label: "Bulk Verify", href: "/bulk-verify" },
  { icon: Search, label: "Instant Verify", href: "/instant-verify" },
  { icon: BookOpen, label: "Directory", href: "/directory" },
  { icon: Building2, label: "Organization", href: "/organization" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const SidebarContent = () => {
  const [location] = useLocation();
  const { logout } = useAuth();

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-sidebar to-sidebar/95 text-sidebar-foreground border-r border-sidebar-border shadow-xl">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            CredVerse
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 p-4 overflow-y-auto">
        <div className="space-y-1">
          <div className="px-2 pb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Menu</p>
          </div>
          {menuItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 translate-x-1"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1"
                  )}
                >
                  <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                  {item.label}
                  {item.label === "Verifications" && (
                    <span className="ml-auto bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full">
                      12
                    </span>
                  )}
                </button>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto space-y-1">
          <div className="px-2 pb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account</p>
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 group hover:translate-x-1">
            <Bell className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            Notifications
            <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </button>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all duration-200 group hover:translate-x-1"
          >
            <LogOut className="h-4 w-4 group-hover:rotate-12 transition-transform" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-background flex items-center px-4 justify-between z-50">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span>CredVerse</span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r-sidebar-border bg-sidebar text-sidebar-foreground">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
