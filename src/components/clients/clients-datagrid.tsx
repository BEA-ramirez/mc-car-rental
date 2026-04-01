"use client";

import { useState } from "react";
import { ClientRow } from "../../../hooks/use-clients";
import { ClientForm } from "./form";
import { useClients } from "../../../hooks/use-clients";
import {
  getInitials,
  toTitleCase,
  toTitleCaseLine,
} from "@/actions/helper/format-text";
import { exportClientsToExcel } from "@/utils/export-excel";
import { exportClientsToPDF } from "@/utils/export-pdf";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
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
import { cn } from "@/lib/utils";

import {
  Phone,
  Mail,
  Plus,
  Trash2,
  History,
  User,
  Edit2,
  Download,
  FileText,
  FileSpreadsheet,
  Send,
  SquarePlus,
  Search,
  X,
  ShieldCheck,
  FileBadge,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CarFront,
} from "lucide-react";
import { useDebounce } from "../../../hooks/use-debounce";
import { DeleteDialog } from "../delete-dialog";
import { ClientsDataGridSkeleton } from "../skeletons";
import MessageModal from "./message-modal";

function getRoleBadgeStyle(role: string) {
  switch (role) {
    case "admin":
      return "bg-slate-900 text-white border-slate-900";
    case "staff":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "car_owner":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "driver":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "customer":
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function getStatusBadge(status: string) {
  if (status === "verified" || status === "active")
    return (
      <Badge
        variant="outline"
        className="text-[9px] uppercase tracking-widest bg-emerald-50 text-emerald-700 border-emerald-200 px-1.5 rounded-sm"
      >
        Verified
      </Badge>
    );
  if (status === "suspended")
    return (
      <Badge
        variant="outline"
        className="text-[9px] uppercase tracking-widest bg-slate-50 text-slate-700 border-red-200 px-1.5 rounded-sm"
      >
        Suspended
      </Badge>
    );
  if (status === "rejected")
    return (
      <Badge
        variant="outline"
        className="text-[9px] uppercase tracking-widest bg-red-50 text-red-700 border-red-200 px-1.5 rounded-sm"
      >
        Rejected
      </Badge>
    );
  return (
    <Badge
      variant="outline"
      className="text-[9px] uppercase tracking-widest bg-amber-50 text-amber-700 border-amber-200 px-1.5 rounded-sm"
    >
      Pending
    </Badge>
  );
}

export default function ClientsDataGrid() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500); // Waits half a second
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    data: paginatedUsers = [],
    totalCount,
    totalPages,
    isLoading,
    deleteClient,
    bulkDelete,
    isDeleting,
  } = useClients({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch,
    statusFilter,
    roleFilter,
  });

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [userToMessage, setUserToMessage] = useState<any | null>(null);

  const toggleSelectAll = () => {
    if (
      selectedRowIds.size === paginatedUsers.length &&
      paginatedUsers.length > 0
    )
      setSelectedRowIds(new Set());
    else setSelectedRowIds(new Set(paginatedUsers.map((u) => u.user_id)));
  };

  const toggleSelectRow = (id: string) => {
    const newSet = new Set(selectedRowIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedRowIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (selectedRowIds.size === 0) return;
    if (confirm(`Delete ${selectedRowIds.size} client(s)?`)) {
      await bulkDelete(Array.from(selectedRowIds));
      setSelectedRowIds(new Set());
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };
  const handleEdit = (e: React.MouseEvent, user: ClientRow) => {
    e.stopPropagation();
    setEditingUser(user);
    setIsFormOpen(true);
  };
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setUserToDelete(id);
  };
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await deleteClient(userToDelete);
      if (selectedUser?.user_id === userToDelete) setSelectedUser(null);
    } finally {
      setUserToDelete(null);
    }
  };

  const handleStatusCheckedChange = (filter: string) => {
    if (currentPage !== 1) setCurrentPage(1);
    if (statusFilter.includes(filter)) {
      const cleanData = statusFilter.filter((f) => f !== filter);
      setStatusFilter(cleanData);
    } else {
      setStatusFilter([...statusFilter, filter]);
    }
  };

  const handleRoleCheckedChange = (filter: string) => {
    if (currentPage !== 1) setCurrentPage(1);
    if (roleFilter.includes(filter)) {
      const cleanData = roleFilter.filter((f) => f !== filter);
      setRoleFilter(cleanData);
    } else {
      setRoleFilter([...roleFilter, filter]);
    }
  };

  // Export bypass pagination
  const handleExportExcel = async () => {
    const urlParams = new URLSearchParams({ search: searchQuery });
    if (statusFilter.length > 0)
      urlParams.append("status", statusFilter.join(","));
    if (roleFilter.length > 0) urlParams.append("role", roleFilter.join(","));
    urlParams.append("export", "true");

    const res = await fetch(`/api/clients?${urlParams.toString()}`);
    const data = await res.json();
    exportClientsToExcel(data.users);
  };

  const handleExportPDF = async () => {
    const urlParams = new URLSearchParams({ search: searchQuery });
    if (statusFilter.length > 0)
      urlParams.append("status", statusFilter.join(","));
    if (roleFilter.length > 0) urlParams.append("role", roleFilter.join(","));
    urlParams.append("export", "true");

    const res = await fetch(`/api/clients?${urlParams.toString()}`);
    const data = await res.json();
    exportClientsToPDF(data.users);
  };

  return (
    <div className="flex h-full bg-slate-50 min-h-0 overflow-hidden relative w-full">
      {/* --- MAIN GRID AREA --- */}
      <div
        className={cn(
          "flex flex-col h-full transition-all duration-300 ease-in-out min-h-0 shrink-0",
          selectedUser ? "w-[60%] xl:w-2/3" : "w-full",
        )}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between p-3 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search name, email, or ID..."
                className="pl-8 h-8 w-64 xl:w-72 text-xs font-medium bg-slate-50 border-slate-200 focus-visible:ring-1 focus-visible:bg-white rounded-sm shadow-none"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to page 1 on search
                }}
              />
            </div>

            {/* FILTER BUTTON */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 px-2.5 rounded-sm shadow-none border-dashed",
                    statusFilter.length > 0 || roleFilter.length > 0
                      ? "border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100"
                      : "text-slate-600 border-slate-200 bg-slate-50 hover:bg-slate-100",
                  )}
                >
                  <Filter className="w-3.5 h-3.5 mr-1.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Filter
                  </span>
                  {(statusFilter.length > 0 || roleFilter.length > 0) && (
                    <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-sm bg-blue-600 text-[8px] font-bold text-white">
                      {statusFilter.length + roleFilter.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-48 rounded-sm border-slate-200 shadow-lg p-1"
              >
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 py-1.5">
                  By Status
                </DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  className="text-xs font-medium rounded-sm cursor-pointer"
                  checked={statusFilter.includes("pending")}
                  onCheckedChange={() => handleStatusCheckedChange("pending")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Pending
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  className="text-xs font-medium rounded-sm cursor-pointer"
                  checked={statusFilter.includes("verified")}
                  onCheckedChange={() => handleStatusCheckedChange("verified")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Verified
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  className="text-xs font-medium rounded-sm cursor-pointer"
                  checked={statusFilter.includes("rejected")}
                  onCheckedChange={() => handleStatusCheckedChange("rejected")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Rejected
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  className="text-xs font-medium rounded-sm cursor-pointer"
                  checked={statusFilter.includes("suspended")}
                  onCheckedChange={() => handleStatusCheckedChange("suspended")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Suspended
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 py-1.5">
                  By Role
                </DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  className="text-xs font-medium rounded-sm cursor-pointer"
                  checked={roleFilter.includes("customer")}
                  onCheckedChange={() => handleRoleCheckedChange("customer")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Customer
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  className="text-xs font-medium rounded-sm cursor-pointer"
                  checked={roleFilter.includes("staff")}
                  onCheckedChange={() => handleRoleCheckedChange("staff")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Staff
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  className="text-xs font-medium rounded-sm cursor-pointer"
                  checked={roleFilter.includes("car_owner")}
                  onCheckedChange={() => handleRoleCheckedChange("car_owner")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Car Owner
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  className="text-xs font-medium rounded-sm cursor-pointer"
                  checked={roleFilter.includes("driver")}
                  onCheckedChange={() => handleRoleCheckedChange("driver")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Driver
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  className="text-xs font-medium rounded-sm cursor-pointer"
                  checked={roleFilter.includes("admin")}
                  onCheckedChange={() => handleRoleCheckedChange("admin")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Admin
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator className="bg-slate-100" />

                {(statusFilter.length > 0 || roleFilter.length > 0) && (
                  <>
                    <DropdownMenuSeparator className="bg-slate-100 mt-1" />
                    <DropdownMenuItem
                      className="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:text-red-700 hover:bg-red-50 justify-center cursor-pointer py-2 mt-1 rounded-sm transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        setStatusFilter([]);
                        setRoleFilter([]);
                        setCurrentPage(1);
                      }}
                    >
                      <X className="w-3.5 h-3.5 mr-1.5" /> Clear Filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {selectedRowIds.size > 0 && (
              <>
                <div className="h-4 w-px bg-slate-200 mx-1" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                  {selectedRowIds.size} Selected
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-sm text-red-600 hover:bg-red-50 border-red-200 shadow-none ml-1"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-none bg-white text-slate-600"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5 text-slate-400" />{" "}
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-32 rounded-sm border-slate-200 shadow-lg"
              >
                <DropdownMenuItem
                  className="text-xs font-medium cursor-pointer"
                  onClick={handleExportPDF}
                >
                  <FileText className="w-3.5 h-3.5 mr-2 text-slate-400" />
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-xs font-medium cursor-pointer"
                  onClick={handleExportExcel}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-2 text-slate-400" />{" "}
                  Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              onClick={handleAdd}
              className="h-8 text-[10px] font-bold uppercase tracking-widest rounded-sm bg-slate-900 hover:bg-slate-800 text-white shadow-none"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Client
            </Button>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto bg-white h-full relative thin-scrollbar">
          {isLoading ? (
            <ClientsDataGridSkeleton />
          ) : (
            <Table>
              <TableHeader className="sticky top-0 bg-slate-50/90 backdrop-blur-sm shadow-[0_1px_0_0_#e2e8f0] z-10">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="w-10 text-center px-0">
                    <Checkbox
                      checked={
                        selectedRowIds.size > 0 &&
                        selectedRowIds.size === paginatedUsers.length
                      }
                      onCheckedChange={toggleSelectAll}
                      className="rounded-[3px]"
                    />
                  </TableHead>
                  <TableHead className="h-9 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Client
                  </TableHead>
                  <TableHead className="h-9 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Contact Info
                  </TableHead>
                  <TableHead className="h-9 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Role
                  </TableHead>
                  <TableHead className="h-9 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Status
                  </TableHead>
                  <TableHead
                    className={cn(
                      "h-9 text-[10px] font-bold uppercase tracking-widest text-slate-500",
                      selectedUser && "hidden xl:table-cell",
                    )}
                  >
                    Last Active
                  </TableHead>
                  <TableHead className="h-9 text-right pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-32 text-center text-slate-400"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        No clients found.
                      </span>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => {
                    const isSelected = selectedRowIds.has(user.user_id);
                    const isActiveRow = selectedUser?.user_id === user.user_id;

                    return (
                      <TableRow
                        key={user.user_id}
                        onClick={() => setSelectedUser(user)}
                        className={cn(
                          "cursor-pointer transition-colors border-b border-slate-100 group",
                          isActiveRow
                            ? "bg-blue-50/40 hover:bg-blue-50/60"
                            : "hover:bg-slate-50",
                          isSelected && "bg-slate-50",
                        )}
                      >
                        <TableCell
                          className="w-10 text-center px-0 align-middle"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                              toggleSelectRow(user.user_id)
                            }
                            className="rounded-[3px]"
                          />
                        </TableCell>

                        {/* CLIENT AVATAR & NAME */}
                        <TableCell className="py-3 align-middle">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 rounded-sm border border-slate-200">
                              <AvatarImage
                                src={user.profile_picture_url || undefined}
                                className="object-cover"
                              />
                              <AvatarFallback className="text-[10px] font-bold bg-slate-100 text-slate-600 rounded-sm">
                                {getInitials(user.full_name || "")}
                              </AvatarFallback>
                            </Avatar>
                            <span
                              className={cn(
                                "text-xs font-bold text-slate-900 leading-none",
                                selectedUser ? "hidden 2xl:block" : "block",
                              )}
                            >
                              {toTitleCase(user.full_name)}
                            </span>
                          </div>
                        </TableCell>

                        {/* CONTACT INFO */}
                        <TableCell className="py-3 align-middle">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600 leading-none">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span
                                className={cn(
                                  "truncate",
                                  selectedUser
                                    ? "max-w-25"
                                    : "max-w-35 xl:max-w-50",
                                )}
                              >
                                {user.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 leading-none">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{user.phone_number || "N/A"}</span>
                            </div>
                          </div>
                        </TableCell>

                        {/* ROLE */}
                        <TableCell className="py-3 align-middle">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] uppercase tracking-widest px-1.5 h-4 rounded-sm",
                              getRoleBadgeStyle(user.role || ""),
                            )}
                          >
                            {toTitleCaseLine(user.role)}
                          </Badge>
                        </TableCell>

                        {/* STATUS */}
                        <TableCell className="py-3 align-middle">
                          {getStatusBadge(user.account_status || "pending")}
                        </TableCell>

                        <TableCell
                          className={cn(
                            "py-3 align-middle",
                            selectedUser && "hidden xl:table-cell",
                          )}
                        >
                          <span className="text-[10px] font-mono text-slate-500">
                            2026-03-14
                          </span>
                        </TableCell>

                        {/* ACTIONS */}
                        <TableCell className="py-3 align-middle text-right pr-4">
                          <div
                            className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-sm text-slate-400 hover:text-slate-900 hover:bg-slate-200"
                              onClick={(e) => handleEdit(e, user)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-sm text-red-400 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => handleDelete(e, user.user_id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-white shrink-0 z-10">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Showing{" "}
            {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}{" "}
            entries
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 rounded-sm shadow-none text-[10px] font-bold uppercase tracking-widest text-slate-600 border-slate-200"
              disabled={currentPage === 1 || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
            </Button>

            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-7 w-7 p-0 rounded-sm shadow-none text-xs font-mono",
                    currentPage === i + 1
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100",
                  )}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 rounded-sm shadow-none text-[10px] font-bold uppercase tracking-widest text-slate-600 border-slate-200"
              disabled={
                currentPage === totalPages || isLoading || totalPages === 0
              }
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: DOSSIER */}
      <div
        className={cn(
          "bg-white transition-all duration-300 ease-in-out shrink-0 overflow-hidden flex flex-col shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)]",
          selectedUser
            ? "w-[40%] xl:w-1/3 translate-x-0 border-l border-slate-200"
            : "w-0 translate-x-full border-none opacity-0",
        )}
      >
        {selectedUser && (
          <>
            <div className="shrink-0 flex flex-col bg-slate-900 p-6 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 h-6 w-6 text-slate-400 hover:text-white hover:bg-slate-800 rounded-sm"
                onClick={() => setSelectedUser(null)}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 rounded-sm border border-slate-700 bg-slate-800 shrink-0">
                  <AvatarImage
                    src={selectedUser.profile_picture_url || undefined}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-lg font-bold bg-slate-800 text-slate-300 rounded-sm">
                    {getInitials(selectedUser.full_name || "")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col pt-1">
                  <h2 className="text-lg font-bold text-white leading-none mb-1.5 pr-6">
                    {toTitleCase(selectedUser.full_name)}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] uppercase tracking-widest h-4 px-1.5 rounded-sm border-none bg-white/10 text-white",
                      )}
                    >
                      {toTitleCaseLine(selectedUser.role)}
                    </Badge>
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {selectedUser.user_id.split("-")[0].toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <Button
                  size="sm"
                  className="h-7 text-[10px] font-bold uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white flex-1 rounded-sm shadow-none"
                >
                  <SquarePlus className="w-3 h-3 mr-1.5" /> Book
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] font-bold uppercase tracking-widest bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white flex-1 rounded-sm shadow-none"
                  onClick={() => setUserToMessage(selectedUser)}
                >
                  <Send className="w-3 h-3 mr-1.5" /> Msg
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/50 thin-scrollbar">
              <Tabs defaultValue="overview" className="w-full">
                <div className="p-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10 shadow-sm">
                  <TabsList className="h-9 bg-slate-200/60 p-1 flex w-full rounded-sm">
                    <TabsTrigger
                      value="overview"
                      className="flex-1 h-7 text-[10px] font-bold uppercase tracking-widest rounded-[2px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="history"
                      className="flex-1 h-7 text-[10px] font-bold uppercase tracking-widest rounded-[2px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all"
                    >
                      Bookings
                    </TabsTrigger>
                    <TabsTrigger
                      value="docs"
                      className="flex-1 h-7 text-[10px] font-bold uppercase tracking-widest rounded-[2px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all"
                    >
                      Docs
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent
                  value="overview"
                  className="p-5 m-0 space-y-5 outline-none"
                >
                  <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Account Health
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">
                          Status
                        </p>
                        {getStatusBadge(
                          selectedUser.account_status || "pending",
                        )}
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">
                          Trust Score
                        </p>
                        <p className="text-xs font-black font-mono text-emerald-600">
                          {selectedUser.trust_score || "5.0"}{" "}
                          <span className="text-[10px] text-slate-400 font-medium">
                            / 5.0
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Contact Profile
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-[9px] font-bold uppercase tracking-widest text-blue-600 hover:bg-blue-50"
                        onClick={(e) => handleEdit(e, selectedUser)}
                      >
                        Edit
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-[80px_1fr] items-start">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                          Email
                        </span>
                        <span className="text-[11px] font-mono text-slate-900 font-medium break-all">
                          {selectedUser.email}
                        </span>
                      </div>
                      <div className="grid grid-cols-[80px_1fr] items-start">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                          Phone
                        </span>
                        <span className="text-[11px] font-mono text-slate-900 font-medium">
                          {selectedUser.phone_number || "N/A"}
                        </span>
                      </div>
                      <div className="grid grid-cols-[80px_1fr] items-start">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                          Address
                        </span>
                        <span className="text-xs text-slate-700 leading-snug">
                          {selectedUser.address || "No address on file."}
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="p-5 m-0 outline-none">
                  <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5 text-slate-400" />{" "}
                        Recent Bookings
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400">
                        Total: 2
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <div className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold text-slate-900">
                            BK-7A921
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[9px] uppercase tracking-widest bg-emerald-50 text-emerald-700 border-emerald-200 px-1.5 h-4 rounded-sm"
                          >
                            Completed
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                          <CarFront className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium">
                            2023 Toyota Fortuner
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>Mar 12 - Mar 15</span>
                          <span className="font-bold text-slate-700">
                            ₱12,500
                          </span>
                        </div>
                      </div>

                      <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold text-slate-900">
                            BK-3B445
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[9px] uppercase tracking-widest bg-blue-50 text-blue-700 border-blue-200 px-1.5 h-4 rounded-sm"
                          >
                            Upcoming
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                          <CarFront className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium">2024 Honda Civic</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>Apr 01 - Apr 03</span>
                          <span className="font-bold text-slate-700">
                            ₱8,200
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="docs"
                  className="p-5 m-0 space-y-4 outline-none"
                >
                  <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                        <FileBadge className="w-3.5 h-3.5 text-slate-400" />{" "}
                        Driver's License
                      </h4>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] uppercase tracking-widest h-4 px-1.5 rounded-sm",
                          selectedUser.license_id_url
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-500 border-slate-200",
                        )}
                      >
                        {selectedUser.license_id_url ? "Uploaded" : "Missing"}
                      </Badge>
                    </div>

                    {selectedUser.license_id_url ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-[80px_1fr] items-start">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                            Number
                          </span>
                          <span className="text-[11px] font-mono font-medium text-slate-900 uppercase">
                            {selectedUser.license_number || "N/A"}
                          </span>
                        </div>
                        <div className="grid grid-cols-[80px_1fr] items-start">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                            Expiry
                          </span>
                          <span className="text-[11px] font-mono text-slate-900 font-medium">
                            {selectedUser.license_expiry_date
                              ? new Date(
                                  selectedUser.license_expiry_date,
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                        <a
                          href={selectedUser.license_id_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full mt-2 h-8 bg-slate-50 border border-slate-200 rounded-sm text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          View Document <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ) : (
                      <div className="border border-dashed border-slate-200 rounded-sm p-4 flex flex-col items-center justify-center text-center mt-2 bg-slate-50/50">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                          No file on record
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-[9px] font-bold uppercase tracking-widest rounded-sm"
                          onClick={(e) => handleEdit(e, selectedUser)}
                        >
                          Upload Now
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />{" "}
                        Secondary ID
                      </h4>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] uppercase tracking-widest h-4 px-1.5 rounded-sm",
                          selectedUser.valid_id_url
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-500 border-slate-200",
                        )}
                      >
                        {selectedUser.valid_id_url ? "Uploaded" : "Missing"}
                      </Badge>
                    </div>

                    {selectedUser.valid_id_url ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-[80px_1fr] items-start">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                            Expiry
                          </span>
                          <span className="text-[11px] font-mono text-slate-900 font-medium">
                            {selectedUser.valid_id_expiry_date
                              ? new Date(
                                  selectedUser.valid_id_expiry_date,
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                        <a
                          href={selectedUser.valid_id_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full mt-2 h-8 bg-slate-50 border border-slate-200 rounded-sm text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          View Document <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ) : (
                      <div className="border border-dashed border-slate-200 rounded-sm p-4 flex flex-col items-center justify-center text-center mt-2 bg-slate-50/50">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                          No file on record
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-[9px] font-bold uppercase tracking-widest rounded-sm"
                          onClick={(e) => handleEdit(e, selectedUser)}
                        >
                          Upload Now
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-150 flex flex-col p-0 border-slate-200 shadow-xl rounded-sm overflow-hidden gap-0 bg-white"
        >
          <DialogHeader className="p-0 ">
            <DialogTitle className="sr-only text-xs font-bold text-slate-900 uppercase tracking-widest">
              {editingUser ? "Edit Client Profile" : "Add New Client"}
            </DialogTitle>
          </DialogHeader>
          <ClientForm
            data={editingUser}
            closeDialog={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <MessageModal
        isOpen={!!userToMessage}
        onClose={() => setUserToMessage(null)}
        userId={userToMessage?.user_id}
        recipientName={userToMessage?.full_name}
        recipientEmail={userToMessage?.email}
      />

      <DeleteDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title="Delete Client Profile?"
        description="Are you sure you want to remove this client? This will permanently delete their account, documents, and system access."
      />
    </div>
  );
}
