"use client";

import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { UserType } from "@/lib/schemas/user";
import { ClientForm } from "./client-form";
import { useClients } from "../../../hooks/use-clients";
import { getInitials } from "@/actions/helper/format-text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  MapPin,
  Phone,
  Mail,
  Plus,
  Trash2,
  FileSearchCorner,
  EllipsisVertical,
  History,
  UserStar,
  Edit2,
  Download,
  FileText,
  FileSpreadsheet,
  Sheet,
  ArrowRightFromLine,
  Send,
  SquarePlus,
  Search,
  Users,
  Loader2,
  X,
  ShieldCheck,
  CalendarDays,
  Clock,
} from "lucide-react";

import { toTitleCase, toTitleCaseLine } from "@/actions/helper/format-text";
import { cn } from "@/lib/utils";

// --- HELPERS ---
function getRoleBadgeStyle(role: string) {
  switch (role) {
    case "admin":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "staff":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "car_owner":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "driver":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "customer":
    default:
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
}

export default function ClientsDataGrid() {
  const {
    data: rawUsers = [],
    isLoading,
    deleteClient,
    bulkDelete,
  } = useClients();

  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  // --- FILTERING ---
  const filteredUsers = useMemo(() => {
    return rawUsers.filter(
      (u) =>
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [rawUsers, searchQuery]);

  // --- SELECTION LOGIC ---
  const toggleSelectAll = () => {
    if (
      selectedRowIds.size === filteredUsers.length &&
      filteredUsers.length > 0
    ) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(filteredUsers.map((u) => u.user_id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const newSet = new Set(selectedRowIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedRowIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (selectedRowIds.size === 0) return;
    if (
      confirm(
        `Are you sure you want to delete ${selectedRowIds.size} client(s)?`,
      )
    ) {
      await bulkDelete(Array.from(selectedRowIds));
      setSelectedRowIds(new Set());
    }
  };

  // --- ACTIONS ---
  const handleAdd = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (e: React.MouseEvent, user: UserType) => {
    e.stopPropagation();
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this user?")) {
      deleteClient(id);
      if (selectedUser?.user_id === id) setSelectedUser(null);
    }
  };

  const handleRowClick = (user: UserType) => {
    setSelectedUser(user);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-slate-50/50 min-h-0 overflow-hidden relative">
      {/* --- MAIN GRID AREA --- */}
      <div
        className={cn(
          "flex flex-col h-full transition-all duration-300 ease-in-out min-h-0 shrink-0",
          selectedUser
            ? "w-[60%] xl:w-2/3 border-r border-slate-200"
            : "w-full",
        )}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800">
              Clients Hub
            </h1>
            <p className="text-xs text-muted-foreground">
              Manage {filteredUsers.length} total users
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleAdd}
            className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Client
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-3 bg-slate-50/50 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search name or email..."
                className="pl-8 h-8 w-64 text-xs bg-white border-slate-200 focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {selectedRowIds.size > 0 && (
              <>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-2 border-l border-slate-300">
                  {selectedRowIds.size} Selected
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 ml-1"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
          </div>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs bg-white text-slate-700"
              >
                <Download className="w-3.5 h-3.5 mr-1.5 text-slate-400" />{" "}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-32 rounded-lg border-slate-200"
            >
              <DropdownMenuItem className="text-xs cursor-pointer">
                <FileText className="w-3.5 h-3.5 mr-2" /> PDF
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs cursor-pointer">
                <FileSpreadsheet className="w-3.5 h-3.5 mr-2" /> CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto bg-white min-h-0 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-white/80 z-50">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mb-2" />
              <span className="text-xs font-medium">Loading clients...</span>
            </div>
          ) : (
            <Table>
              <TableHeader className="sticky top-0 bg-slate-50 shadow-sm z-10">
                <TableRow className="border-b border-slate-200 hover:bg-transparent">
                  <TableHead className="w-12 text-center px-0">
                    <Checkbox
                      checked={
                        selectedRowIds.size > 0 &&
                        selectedRowIds.size === filteredUsers.length
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    Client
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    Role
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    Status
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-wider text-slate-500 text-right pr-6">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const isSelected = selectedRowIds.has(user.user_id);
                  const isActiveRow = selectedUser?.user_id === user.user_id;

                  return (
                    <TableRow
                      key={user.user_id}
                      onClick={() => handleRowClick(user)}
                      className={cn(
                        "cursor-pointer transition-colors border-b border-slate-100",
                        isActiveRow
                          ? "bg-blue-50/50 hover:bg-blue-50/80"
                          : "hover:bg-slate-50",
                        isSelected && "bg-slate-50",
                      )}
                    >
                      <TableCell
                        className="w-12 text-center px-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelectRow(user.user_id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-slate-200">
                            <AvatarImage
                              src={user.profile_picture_url || undefined}
                            />
                            <AvatarFallback className="text-[10px] font-bold bg-slate-100 text-slate-600">
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800">
                              {toTitleCase(user.full_name)}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] uppercase tracking-wider px-1.5 h-4",
                            getRoleBadgeStyle(user.role),
                          )}
                        >
                          {toTitleCaseLine(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {toTitleCaseLine(user.account_status || "Pending")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-slate-800"
                            onClick={(e) => handleEdit(e, user)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-400 hover:text-slate-800"
                              >
                                <EllipsisVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-36 rounded-md border-slate-200"
                            >
                              <DropdownMenuItem className="text-xs cursor-pointer">
                                <UserStar className="w-3.5 h-3.5 mr-2" /> Make
                                Admin
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-xs cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                                onClick={(e) => handleDelete(e, user.user_id)}
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredUsers.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-slate-500"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Users className="h-6 w-6 text-slate-300 mb-2" />
                        <span className="text-xs font-semibold">
                          No clients found.
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* --- RIGHT SIDEBAR: PROFILE DETAIL --- */}
      <div
        className={cn(
          "bg-white border-l border-slate-200 transition-all duration-300 ease-in-out shrink-0 overflow-hidden flex flex-col",
          selectedUser
            ? "w-[40%] xl:w-1/3 opacity-100 translate-x-0"
            : "w-0 opacity-0 translate-x-10",
        )}
      >
        {selectedUser && (
          <>
            {/* Fixed Top Profile Header */}
            <div className="shrink-0 flex flex-col">
              <div className="relative h-28 bg-slate-900">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 text-white/70 hover:bg-white/20 hover:text-white"
                  onClick={() => setSelectedUser(null)}
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Floating Avatar */}
                <div className="absolute -bottom-8 left-6">
                  <Avatar className="h-16 w-16 border-4 border-slate-50 shadow-md">
                    <AvatarImage
                      src={selectedUser.profile_picture_url || undefined}
                    />
                    <AvatarFallback className="text-sm font-bold bg-white text-slate-800">
                      {getInitials(selectedUser.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="pt-10 px-6 pb-4 border-b border-slate-200 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-800 leading-tight mb-0.5">
                      {toTitleCase(selectedUser.full_name)}
                    </h2>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] uppercase tracking-wider h-4 px-1.5",
                        getRoleBadgeStyle(selectedUser.role),
                      )}
                    >
                      {toTitleCaseLine(selectedUser.role)}
                    </Badge>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-8 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white flex-1 shadow-sm"
                  >
                    <SquarePlus className="w-3.5 h-3.5 mr-1.5" /> Book
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-medium bg-white text-slate-700 flex-1 border-slate-200"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Msg
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-white border-slate-200 shrink-0"
                    onClick={(e) => handleEdit(e, selectedUser)}
                  >
                    <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Scrollable Detail Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 min-h-0">
              {/* Info Blocks Row */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Contact Details */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Contact Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded border border-slate-200 bg-white flex items-center justify-center shrink-0">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <span className="text-xs font-medium text-slate-800 truncate">
                        {selectedUser.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded border border-slate-200 bg-white flex items-center justify-center shrink-0">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <span className="text-xs font-medium text-slate-800">
                        {selectedUser.phone_number || "No phone number"}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-7 w-7 rounded border border-slate-200 bg-white flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <span className="text-xs font-medium text-slate-800 line-clamp-2">
                        {selectedUser.address || "No address provided."}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Account Info
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded border border-slate-200 bg-white flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500">
                          Status
                        </span>
                        <span className="text-xs font-medium text-slate-800 truncate">
                          {toTitleCaseLine(
                            selectedUser.account_status || "Pending",
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded border border-slate-200 bg-white flex items-center justify-center shrink-0">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500">
                          Joined
                        </span>
                        <span className="text-xs font-medium text-slate-800 truncate">
                          {/* If you have a created_at property, format it here. Mocking for now: */}
                          Oct 24, 2025
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded border border-slate-200 bg-white flex items-center justify-center shrink-0">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500">
                          Last Active
                        </span>
                        <span className="text-xs font-medium text-slate-800 truncate">
                          Today, 10:45 AM
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs Section */}
              <Tabs defaultValue="history" className="mt-6">
                <TabsList className="h-8 bg-slate-100 p-0.5 rounded-md border border-slate-200 inline-flex w-full">
                  <TabsTrigger
                    value="history"
                    className="h-6 text-[11px] font-medium px-4 rounded-[4px] flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all gap-1.5"
                  >
                    <History className="w-3.5 h-3.5" /> History & Logs
                  </TabsTrigger>
                  <TabsTrigger
                    value="docs"
                    className="h-6 text-[11px] font-medium px-4 rounded-[4px] flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" /> Documents
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="history" className="mt-3">
                  <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center shadow-sm h-40">
                    <History className="w-6 h-6 text-slate-300 mb-2" />
                    <p className="text-xs font-semibold text-slate-700">
                      No recent activity
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      This user has not made any bookings yet.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="docs" className="mt-3">
                  <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center shadow-sm h-40">
                    <FileText className="w-6 h-6 text-slate-300 mb-2" />
                    <p className="text-xs font-semibold text-slate-700">
                      No documents found
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      ID verification files will appear here.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </div>

      {/* --- FORM MODAL --- */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] h-[85vh] flex flex-col p-0 border-slate-200 shadow-xl rounded-lg overflow-hidden gap-0 bg-slate-50">
          <DialogHeader className="p-4 border-b border-slate-200 bg-white shrink-0">
            <DialogTitle className="text-base font-bold text-slate-800">
              {editingUser ? "Edit Client" : "Add New Client"}
            </DialogTitle>
          </DialogHeader>
          <ClientForm
            data={editingUser}
            closeDialog={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
