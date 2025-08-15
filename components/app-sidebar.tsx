/* eslint-disable prettier/prettier */
"use client";

import { useState } from "react";
import { Plus, MessageSquare, LogOut, User, QrCode } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { agricultureAgents } from "@/data/agents";
import { ChatSession } from "@/types/agriculture";

interface StreamlinedSidebarProps {
  chatSessions: ChatSession[];
  currentSessionId?: string;
  onNewChatAction: () => void;
  onSelectSessionAction: (sessionId: string) => void;
  onSelectAgentAction: (agentId: string) => void;
}

export function AppSidebar({
  chatSessions,
  currentSessionId,
  onNewChatAction,
  onSelectSessionAction,
  onSelectAgentAction,
}: StreamlinedSidebarProps) {
  const [activeSection, setActiveSection] = useState<"agents" | "history">(
    "agents"
  );
  const router = useRouter();

  const groupedAgents = agricultureAgents.reduce(
    (acc, agent) => {
      if (!acc[agent.category]) {
        acc[agent.category] = [];
      }
      acc[agent.category].push(agent);
      return acc;
    },
    {} as Record<string, typeof agricultureAgents>
  );

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <span className="text-lg">🌾</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">PRAGATI</h2>
            <p className="text-xs text-gray-500">Smart Farming Assistant</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* New Chat Button */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Button
                  onClick={onNewChatAction}
                  className="w-full justify-start gap-2 h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                  New Chat
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>

        {/* QR Scanner Button */}
            <SidebarMenu>
              <SidebarMenuItem>
                <Button
                  onClick={() => router.push("/qr-scanner")}
                  className="w-full justify-start gap-2 h-9 mt-1 bg-slate-200 hover:bg-slate-300 text-green-950"
                >
                  <QrCode className="h-4 w-4" />
                  QR Scanner
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Section Toggle */}
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setActiveSection("agents")}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeSection === "agents"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                AI Specialists
              </button>
              <button
                onClick={() => setActiveSection("history")}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeSection === "history"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Chat History
              </button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Content based on active section */}
        {activeSection === "agents" ? (
          <SidebarGroup>
            <SidebarGroupContent>
              <ScrollArea className="h-[400px]">
                <SidebarMenu className="space-y-1">
                  {/* Prediction Tools */}
                  {groupedAgents.prediction?.map((agent) => (
                    <SidebarMenuItem key={agent.id}>
                      <SidebarMenuButton
                        onClick={() => onSelectAgentAction(agent.id)}
                        className="gap-3 hover:bg-gray-50 group h-12"
                      >
                        <div
                          className={`${agent.color} group-hover:scale-110 transition-transform`}
                        >
                          {agent.icon}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {agent.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {agent.description}
                          </div>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}

                  {/* Advisory Services */}
                  {groupedAgents.advisory?.map((agent) => (
                    <SidebarMenuItem key={agent.id}>
                      <SidebarMenuButton
                        onClick={() => onSelectAgentAction(agent.id)}
                        className="gap-3 hover:bg-gray-50 group h-12"
                      >
                        <div
                          className={`${agent.color} group-hover:scale-110 transition-transform`}
                        >
                          {agent.icon}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {agent.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {agent.description}
                          </div>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}

                  {/* Analysis Tools */}
                  {groupedAgents.analysis?.map((agent) => (
                    <SidebarMenuItem key={agent.id}>
                      <SidebarMenuButton
                        onClick={() => onSelectAgentAction(agent.id)}
                        className="gap-3 hover:bg-gray-50 group h-12"
                      >
                        <div
                          className={`${agent.color} group-hover:scale-110 transition-transform`}
                        >
                          {agent.icon}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {agent.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {agent.description}
                          </div>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}

                  {/* Market Intelligence */}
                  {groupedAgents.market?.map((agent) => (
                    <SidebarMenuItem key={agent.id}>
                      <SidebarMenuButton
                        onClick={() => onSelectAgentAction(agent.id)}
                        className="gap-3 hover:bg-gray-50 group h-12"
                      >
                        <div
                          className={`${agent.color} group-hover:scale-110 transition-transform`}
                        >
                          {agent.icon}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {agent.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {agent.description}
                          </div>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}

                  {/* News & Updates */}
                  {groupedAgents.news?.map((agent) => (
                    <SidebarMenuItem key={agent.id}>
                      <SidebarMenuButton
                        onClick={() => onSelectAgentAction(agent.id)}
                        className="gap-3 hover:bg-gray-50 group h-12"
                      >
                        <div
                          className={`${agent.color} group-hover:scale-110 transition-transform`}
                        >
                          {agent.icon}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {agent.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {agent.description}
                          </div>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <SidebarGroup>
            <SidebarGroupContent>
              <ScrollArea className="h-[400px]">
                <SidebarMenu className="space-y-1">
                  {chatSessions.map((session) => (
                    <SidebarMenuItem key={session.id}>
                      <SidebarMenuButton
                        onClick={() => onSelectSessionAction(session.id)}
                        isActive={currentSessionId === session.id}
                        className="gap-3 hover:bg-gray-50 data-[active=true]:bg-emerald-50 h-12"
                      >
                        <MessageSquare className="h-4 w-4 text-gray-400" />
                        <div className="flex-1 min-w-0 text-left">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {session.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {session.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                        {session.agent && (
                          <div className={`${session.agent.color} shrink-0`}>
                            {session.agent.icon}
                          </div>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-100">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="gap-3 hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700">
              <User className="h-4 w-4 text-emerald-500" />
              <span>Profile</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: "/api/auth/signin" })}
              className="gap-3 hover:bg-red-50 text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
