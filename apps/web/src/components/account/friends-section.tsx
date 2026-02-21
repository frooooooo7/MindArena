"use client";

import React, { useState, useCallback, useEffect } from "react";
import { UserPlus, UserMinus, Search, Users, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { useFriends } from "@/hooks/use-friends";
import { useAuthStore } from "@/store/auth.store";

export function FriendsSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { user } = useAuthStore();
  const { 
    friends, 
    pendingRequests, 
    searchResults, 
    loading, 
    searchUsers, 
    sendRequest, 
    acceptRequest, 
    deleteRequestOrFriend 
  } = useFriends();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery.length >= 3) {
      searchUsers(debouncedQuery, searchPage);
    }
  }, [debouncedQuery, searchPage, searchUsers]);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="friends" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList className="bg-secondary/20 p-1 border border-border/40">
            <TabsTrigger value="friends" className="gap-2">
              <Users className="h-4 w-4" />
              Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2 relative">
              <UserPlus className="h-4 w-4" />
              Requests
              {pendingRequests.received.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {pendingRequests.received.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-2">
              <Search className="h-4 w-4" />
              Find
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="friends" className="space-y-4">
          {friends.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border/60 bg-secondary/5">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-semibold mb-2">No friends yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Search for players to add them to your friends list and compare your ranks.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {friends.map((f) => (
                <div key={f.id} className="flex flex-col p-4 bg-card/60 border border-border/40 rounded-xl hover:border-violet-500/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-lg">{f.friend?.name}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                        <Trophy className="h-3.5 w-3.5 text-amber-500" />
                        <span>{f.friend?.rankName} • {f.friend?.rankPoints} RP</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                      onClick={() => deleteRequestOrFriend(f.id)}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b border-border/40 pb-2">Pending Received ({pendingRequests.received.length})</h3>
            {pendingRequests.received.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending requests.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pendingRequests.received.map(req => (
                  <div key={req.id} className="flex items-center justify-between p-4 bg-card/60 border border-border/40 rounded-xl">
                    <div>
                      <p className="font-semibold">{req.friend?.name}</p>
                      <p className="text-xs text-muted-foreground">{req.friend?.rankName} • {req.friend?.rankPoints} RP</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => deleteRequestOrFriend(req.id)}>Decline</Button>
                      <Button size="sm" onClick={() => acceptRequest(req.id)} className="bg-emerald-600 hover:bg-emerald-700">Accept</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b border-border/40 pb-2">Sent Requests ({pendingRequests.sent.length})</h3>
            {pendingRequests.sent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sent requests.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pendingRequests.sent.map(req => (
                  <div key={req.id} className="flex items-center justify-between p-4 bg-card/60 border border-border/40 rounded-xl">
                    <div>
                      <p className="font-semibold">{req.friend?.name}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteRequestOrFriend(req.id)}>Cancel</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search players by name..." 
              className="pl-9 bg-secondary/20 border-border/40"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchPage(1);
              }}
            />
          </div>

          {loading && <div className="text-sm text-muted-foreground animate-pulse">Searching...</div>}

          {!loading && searchResults && searchResults.users.length > 0 && (
            <div className="space-y-6">
              <div className="grid gap-4">
                {searchResults.users.map(u => {
                  // Check status context
                  const isFriend = friends.some(f => f.friend?.id === u.id);
                  const isPendingRecv = pendingRequests.received.some(r => r.friend?.id === u.id);
                  const isPendingSent = pendingRequests.sent.some(r => r.friend?.id === u.id);

                  return (
                    <div key={u.id} className="flex items-center justify-between p-4 bg-card/60 border border-border/40 rounded-xl">
                      <div>
                        <p className="font-semibold">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.rankName} • {u.rankPoints} RP</p>
                      </div>
                      <div>
                        {isFriend ? (
                          <span className="text-xs text-emerald-500 font-medium px-2 py-1 bg-emerald-500/10 rounded-full">Friend</span>
                        ) : isPendingRecv ? (
                          <span className="text-xs text-rose-500 font-medium px-2 py-1 bg-rose-500/10 rounded-full">Waiting response</span>
                        ) : isPendingSent ? (
                          <span className="text-xs text-amber-500 font-medium px-2 py-1 bg-amber-500/10 rounded-full">Requested</span>
                        ) : (
                          <Button size="sm" variant="secondary" onClick={() => sendRequest(u.id)} className="gap-1.5 hover:bg-violet-600 hover:text-white transition-colors">
                            <UserPlus className="h-4 w-4" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {searchResults.totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e: React.MouseEvent) => {e.preventDefault(); setSearchPage(p => Math.max(1, p - 1))}} 
                        className={searchPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: searchResults.totalPages }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          href="#" 
                          isActive={searchPage === i + 1}
                          onClick={(e: React.MouseEvent) => {e.preventDefault(); setSearchPage(i + 1)}}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e: React.MouseEvent) => {e.preventDefault(); setSearchPage(p => Math.min(searchResults.totalPages, p + 1))}} 
                        className={searchPage === searchResults.totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
          
          {!loading && searchQuery.length >= 3 && searchResults?.users.length === 0 && (
            <p className="text-sm text-muted-foreground">No players found matching "{searchQuery}".</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
