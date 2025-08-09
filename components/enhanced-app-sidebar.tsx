"use client";

import { useState } from "react";
import {
  Plus,
  MessageSquare,
  History,
  Settings,
  User,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { agricultureAgents } from "@/data/agents";
import { ChatSession } from "@/types/agriculture";

interface AppSidebarProps {
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
}: AppSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["agents"]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  const groupedAgents = agricultureAgents.reduce(
    (acc, agent) => {
      if (!acc[agent.category]) {
        acc[agent.category] = [];
      }
      acc[agent.category].push(agent);
      return acc;
    },
    {} as Record<string, typeof agricultureAgents>,
  );

  const recentSessions = chatSessions.slice(0, 5);
  const olderSessions = chatSessions.slice(5);

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4 border-b border-green-200">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
            <span className="text-xl">🌾</span>
          </div>
          <div>
            <h2 className="font-bold text-lg text-green-700">AgriAI</h2>
            <p className="text-xs text-green-600">Smart Farming Assistant</p>
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
                  className="w-full justify-start gap-2 h-10 bg-green-600 hover:bg-green-700 text-white border-0"
                >
                  <Plus className="h-4 w-4" />
                  New Chat
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Specialized Agents - Direct Categories */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-green-700 font-semibold">
            <Sparkles className="h-4 w-4" />
            AI Specialists
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="h-[400px]">
              <SidebarMenu className="space-y-1">
                {/* Prediction & Forecasting */}
                <div className="px-2 py-1">
                  <span className="text-xs font-medium text-green-600">
                    Prediction & Forecasting
                  </span>
                </div>
                {groupedAgents.prediction?.map((agent) => (
                  <SidebarMenuItem key={agent.id}>
                    <SidebarMenuButton
                      onClick={() => onSelectAgentAction(agent.id)}
                      className="gap-3 hover:bg-green-50 group pl-4"
                    >
                      <div className="text-green-600 group-hover:scale-110 transition-transform">
                        {agent.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate text-gray-900">
                          {agent.name}
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                {/* Advisory Services */}
                <div className="px-2 py-1 mt-3">
                  <span className="text-xs font-medium text-green-600">
                    Advisory Services
                  </span>
                </div>
                {groupedAgents.advisory?.map((agent) => (
                  <SidebarMenuItem key={agent.id}>
                    <SidebarMenuButton
                      onClick={() => onSelectAgentAction(agent.id)}
                      className="gap-3 hover:bg-green-50 group pl-4"
                    >
                      <div className="text-green-600 group-hover:scale-110 transition-transform">
                        {agent.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate text-gray-900">
                          {agent.name}
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                {/* Analysis & Diagnostics */}
                <div className="px-2 py-1 mt-3">
                  <span className="text-xs font-medium text-green-600">
                    Analysis & Diagnostics
                  </span>
                </div>
                {groupedAgents.analysis?.map((agent) => (
                  <SidebarMenuItem key={agent.id}>
                    <SidebarMenuButton
                      onClick={() => onSelectAgentAction(agent.id)}
                      className="gap-3 hover:bg-green-50 group pl-4"
                    >
                      <div className="text-green-600 group-hover:scale-110 transition-transform">
                        {agent.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate text-gray-900">
                          {agent.name}
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                {/* Market Intelligence */}
                <div className="px-2 py-1 mt-3">
                  <span className="text-xs font-medium text-green-600">
                    Market Intelligence
                  </span>
                </div>
                {groupedAgents.market?.map((agent) => (
                  <SidebarMenuItem key={agent.id}>
                    <SidebarMenuButton
                      onClick={() => onSelectAgentAction(agent.id)}
                      className="gap-3 hover:bg-green-50 group pl-4"
                    >
                      <div className="text-green-600 group-hover:scale-110 transition-transform">
                        {agent.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate text-gray-900">
                          {agent.name}
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                {/* News & Updates */}
                <div className="px-2 py-1 mt-3">
                  <span className="text-xs font-medium text-green-600">
                    News & Updates
                  </span>
                </div>
                {groupedAgents.news?.map((agent) => (
                  <SidebarMenuItem key={agent.id}>
                    <SidebarMenuButton
                      onClick={() => onSelectAgentAction(agent.id)}
                      className="gap-3 hover:bg-green-50 group pl-4"
                    >
                      <div className="text-green-600 group-hover:scale-110 transition-transform">
                        {agent.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate text-gray-900">
                          {agent.name}
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Chat History */}
        <Collapsible
          open={expandedGroups.includes("history")}
          onOpenChange={() => toggleGroup("history")}
        >
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="group/collapsible hover:bg-green-50 rounded-md text-green-700 font-semibold">
                <History className="h-4 w-4" />
                <span>Chat History</span>
                <Badge
                  variant="secondary"
                  className="ml-auto text-xs bg-green-100 text-green-700"
                >
                  {chatSessions.length}
                </Badge>
                <ChevronRight className="ml-1 transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <ScrollArea className="h-[200px]">
                  <SidebarMenu>
                    {recentSessions.length > 0 && (
                      <>
                        <div className="px-2 py-1">
                          <span className="text-xs font-medium text-green-600">
                            Recent
                          </span>
                        </div>
                        {recentSessions.map((session) => (
                          <SidebarMenuItem key={session.id}>
                            <SidebarMenuButton
                              onClick={() => onSelectSessionAction(session.id)}
                              isActive={currentSessionId === session.id}
                              className="gap-3 hover:bg-green-50 data-[active=true]:bg-green-100"
                            >
                              <MessageSquare className="h-3 w-3 shrink-0 text-green-600" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate text-gray-900">
                                  {session.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {session.createdAt.toLocaleDateString()}
                                </div>
                              </div>
                              {session.agent && (
                                <div className="text-green-600 shrink-0">
                                  {session.agent.icon}
                                </div>
                              )}
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </>
                    )}

                    {olderSessions.length > 0 && (
                      <>
                        <div className="px-2 py-1 mt-2">
                          <span className="text-xs font-medium text-green-600">
                            Older
                          </span>
                        </div>
                        {olderSessions.map((session) => (
                          <SidebarMenuItem key={session.id}>
                            <SidebarMenuButton
                              onClick={() => onSelectSessionAction(session.id)}
                              isActive={currentSessionId === session.id}
                              className="gap-3 hover:bg-green-50 opacity-75 data-[active=true]:bg-green-100"
                            >
                              <MessageSquare className="h-3 w-3 shrink-0 text-green-600" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate text-gray-900">
                                  {session.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {session.createdAt.toLocaleDateString()}
                                </div>
                              </div>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </>
                    )}
                  </SidebarMenu>
                </ScrollArea>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-green-200">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="gap-3 hover:bg-green-50 text-gray-700">
              <User className="h-4 w-4 text-green-600" />
              <span>Profile & Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="gap-3 hover:bg-green-50 text-gray-700">
              <Settings className="h-4 w-4 text-green-600" />
              <span>Preferences</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
