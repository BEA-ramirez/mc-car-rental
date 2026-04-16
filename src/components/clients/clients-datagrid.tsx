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
      return "bg-foreground/10 text-foreground border-foreground/20";
    case "staff":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case "car_owner":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    case "driver":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "customer":
    default:
      return "bg-secondary text-muted-foreground border-border";
  }
}

function getStatusBadge(status: string) {
  if (status === "VERIFIED" || status === "active")
    return (
      <Badge
        variant="outline"
        className="text-[8px] uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-1.5 rounded"
      >
        Verified
      </Badge>
    );
  if (status === "SUSPENDED")
    return (
      <Badge
        variant="outline"
        className="text-[8px] uppercase tracking-widest bg-secondary text-muted-foreground border-border px-1.5 rounded"
      >
        Suspended
      </Badge>
    );
  if (status === "REJECTED")
    return (
      <Badge
        variant="outline"
        className="text-[8px] uppercase tracking-widest bg-destructive/10 text-destructive border-destructive/20 px-1.5 rounded"
      >
        Rejected
      </Badge>
    );
  return (
    <Badge
      variant="outline"
      className="text-[8px] uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 px-1.5 rounded"
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
    <div className="flex h-full bg-background min-h-0 overflow-hidden relative w-full transition-colors duration-300">
      {/* --- MAIN GRID AREA --- */}
      <div
        className={cn(
          "flex flex-col h-full transition-all duration-300 ease-in-out min-h-0 shrink-0",
          selectedUser ? "w-[60%] xl:w-2/3" : "w-full",
        )}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between p-2.5 bg-card border-b border-border shrink-0 transition-colors">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                className="pl-8 h-8 w-56 xl:w-64 text-[11px] font-medium bg-secondary border-border focus-visible:ring-1 focus-visible:ring-primary rounded-lg shadow-none transition-colors"
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
                    "h-8 px-3 rounded-lg shadow-none border-border transition-colors",
                    statusFilter.length > 0 || roleFilter.length > 0
                      ? "border-primary bg-primary/10 text-primary hover:bg-primary/20"
                      : "text-muted-foreground bg-secondary hover:bg-background hover:text-foreground",
                  )}
                >
                  <Filter className="w-3.5 h-3.5 mr-1.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Filter
                  </span>
                  {(statusFilter.length > 0 || roleFilter.length > 0) && (
                    <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded bg-primary text-[8px] font-bold text-primary-foreground">
                      {statusFilter.length + roleFilter.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-48 rounded-xl border-border shadow-xl p-1 bg-popover"
              >
                <DropdownMenuLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1.5">
                  By Status
                </DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  className="text-[11px] font-semibold rounded-lg cursor-pointer transition-colors focus:bg-secondary"
                  checked={statusFilter.includes("PENDING")}
                  onCheckedChange={() => handleStatusCheckedChange("PENDING")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Pending
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  className="text-[11px] font-semibold rounded-lg cursor-pointer transition-colors focus:bg-secondary"
                  checked={statusFilter.includes("VERIFIED")}
                  onCheckedChange={() => handleStatusCheckedChange("VERIFIED")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Verified
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  className="text-[11px] font-semibold rounded-lg cursor-pointer transition-colors focus:bg-secondary"
                  checked={statusFilter.includes("REJECTED")}
                  onCheckedChange={() => handleStatusCheckedChange("REJECTED")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Rejected
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  className="text-[11px] font-semibold rounded-lg cursor-pointer transition-colors focus:bg-secondary"
                  checked={statusFilter.includes("SUSPENDED")}
                  onCheckedChange={() => handleStatusCheckedChange("SUSPENDED")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Suspended
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1.5">
                  By Role
                </DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  className="text-[11px] font-semibold rounded-lg cursor-pointer transition-colors focus:bg-secondary"
                  checked={roleFilter.includes("customer")}
                  onCheckedChange={() => handleRoleCheckedChange("customer")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Customer
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  className="text-[11px] font-semibold rounded-lg cursor-pointer transition-colors focus:bg-secondary"
                  checked={roleFilter.includes("staff")}
                  onCheckedChange={() => handleRoleCheckedChange("staff")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Staff
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  className="text-[11px] font-semibold rounded-lg cursor-pointer transition-colors focus:bg-secondary"
                  checked={roleFilter.includes("car_owner")}
                  onCheckedChange={() => handleRoleCheckedChange("car_owner")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Car Owner
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  className="text-[11px] font-semibold rounded-lg cursor-pointer transition-colors focus:bg-secondary"
                  checked={roleFilter.includes("driver")}
                  onCheckedChange={() => handleRoleCheckedChange("driver")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Driver
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  className="text-[11px] font-semibold rounded-lg cursor-pointer transition-colors focus:bg-secondary"
                  checked={roleFilter.includes("admin")}
                  onCheckedChange={() => handleRoleCheckedChange("admin")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Admin
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator className="bg-border" />

                {(statusFilter.length > 0 || roleFilter.length > 0) && (
                  <>
                    <DropdownMenuSeparator className="bg-border mt-1" />
                    <DropdownMenuItem
                      className="text-[9px] font-bold uppercase tracking-widest text-destructive hover:text-destructive hover:bg-destructive/10 justify-center cursor-pointer py-2 mt-1 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        setStatusFilter([]);
                        setRoleFilter([]);
                        setCurrentPage(1);
                      }}
                    >
                      <X className="w-3 h-3 mr-1.5" /> Clear Filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {selectedRowIds.size > 0 && (
              <>
                <div className="h-4 w-px bg-border mx-1" />
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                  {selectedRowIds.size} Selected
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-md text-destructive hover:bg-destructive/10 border-border shadow-none ml-1 transition-colors"
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
                  className="h-8 text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-none bg-card text-foreground border-border hover:bg-secondary transition-colors"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />{" "}
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-32 rounded-xl border-border bg-popover shadow-xl p-1"
              >
                <DropdownMenuItem
                  className="text-[11px] font-semibold cursor-pointer rounded-lg focus:bg-secondary transition-colors"
                  onClick={handleExportPDF}
                >
                  <FileText className="w-3.5 h-3.5 mr-2 text-muted-foreground" />{" "}
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-[11px] font-semibold cursor-pointer rounded-lg focus:bg-secondary transition-colors"
                  onClick={handleExportExcel}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-2 text-muted-foreground" />{" "}
                  Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              onClick={handleAdd}
              className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-primary hover:opacity-90 text-primary-foreground shadow-sm transition-opacity"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Client
            </Button>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto bg-background h-full relative custom-scrollbar transition-colors">
          {isLoading ? (
            <ClientsDataGridSkeleton />
          ) : (
            <Table>
              <TableHeader className="sticky top-0 bg-secondary/80 backdrop-blur-md shadow-[0_1px_0_0_hsl(var(--border))] z-10 transition-colors">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="w-10 text-center px-0">
                    <Checkbox
                      checked={
                        selectedRowIds.size > 0 &&
                        selectedRowIds.size === paginatedUsers.length
                      }
                      onCheckedChange={toggleSelectAll}
                      className="rounded shadow-none border-muted-foreground/50"
                    />
                  </TableHead>
                  <TableHead className="h-8 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    Client
                  </TableHead>
                  <TableHead className="h-8 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    Contact Info
                  </TableHead>
                  <TableHead className="h-8 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    Role
                  </TableHead>
                  <TableHead className="h-8 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead
                    className={cn(
                      "h-8 text-[9px] font-bold uppercase tracking-widest text-muted-foreground",
                      selectedUser && "hidden xl:table-cell",
                    )}
                  >
                    Last Active
                  </TableHead>
                  <TableHead className="h-8 text-right pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-32 text-center text-muted-foreground"
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
                          "cursor-pointer transition-colors border-b border-border group",
                          isActiveRow
                            ? "bg-primary/10 hover:bg-primary/10"
                            : "hover:bg-secondary/50",
                          isSelected && "bg-secondary/50",
                        )}
                      >
                        <TableCell
                          className="w-10 text-center px-0 align-middle py-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                              toggleSelectRow(user.user_id)
                            }
                            className="rounded shadow-none border-muted-foreground/50"
                          />
                        </TableCell>

                        {/* CLIENT AVATAR & NAME */}
                        <TableCell className="py-2 align-middle">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-7 w-7 rounded-lg border border-border">
                              <AvatarImage
                                src={user.profile_picture_url || undefined}
                                className="object-cover"
                              />
                              <AvatarFallback className="text-[9px] font-bold bg-secondary text-foreground rounded-lg">
                                {getInitials(user.full_name || "")}
                              </AvatarFallback>
                            </Avatar>
                            <span
                              className={cn(
                                "text-[11px] font-bold text-foreground leading-none",
                                selectedUser ? "hidden 2xl:block" : "block",
                              )}
                            >
                              {toTitleCase(user.full_name)}
                            </span>
                          </div>
                        </TableCell>

                        {/* CONTACT INFO */}
                        <TableCell className="py-2 align-middle">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground leading-none">
                              <Mail className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                              <span
                                className={cn(
                                  "truncate",
                                  selectedUser
                                    ? "max-w-[120px]"
                                    : "max-w-[160px] xl:max-w-[200px]",
                                )}
                              >
                                {user.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/80 leading-none">
                              <Phone className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                              <span>{user.phone_number || "N/A"}</span>
                            </div>
                          </div>
                        </TableCell>

                        {/* ROLE */}
                        <TableCell className="py-2 align-middle">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[8px] uppercase tracking-widest px-1.5 h-4 rounded",
                              getRoleBadgeStyle(user.role || ""),
                            )}
                          >
                            {toTitleCaseLine(user.role)}
                          </Badge>
                        </TableCell>

                        {/* STATUS */}
                        <TableCell className="py-2 align-middle">
                          {getStatusBadge(user.account_status || "PENDING")}
                        </TableCell>

                        {/* LAST ACTIVE */}
                        <TableCell
                          className={cn(
                            "py-2 align-middle",
                            selectedUser && "hidden xl:table-cell",
                          )}
                        >
                          <span className="text-[10px] font-mono text-muted-foreground">
                            2026-03-14
                          </span>
                        </TableCell>

                        {/* ACTIONS */}
                        <TableCell className="py-2 align-middle text-right pr-4">
                          <div
                            className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                              onClick={(e) => handleEdit(e, user)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-md text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
                              onClick={(e) => handleDelete(e, user.user_id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card shrink-0 z-10 transition-colors">
          <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            Showing{" "}
            {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}{" "}
            entries
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 rounded-lg shadow-none text-[9px] font-bold uppercase tracking-widest text-foreground border-border hover:bg-secondary transition-colors"
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
                    "h-7 w-7 p-0 rounded-md shadow-none text-[11px] font-mono transition-colors",
                    currentPage === i + 1
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
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
              className="h-7 px-2.5 rounded-lg shadow-none text-[9px] font-bold uppercase tracking-widest text-foreground border-border hover:bg-secondary transition-colors"
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
          "bg-background transition-all duration-300 ease-in-out shrink-0 overflow-hidden flex flex-col shadow-[-10px_0_15px_-3px_hsl(var(--shadow)/0.05)]",
          selectedUser
            ? "w-[40%] xl:w-1/3 translate-x-0 border-l border-border"
            : "w-0 translate-x-full border-none opacity-0",
        )}
      >
        {selectedUser && (
          <>
            {/* DOSSIER HEADER */}
            <div className="shrink-0 flex flex-col bg-card p-5 relative border-b border-border transition-colors">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                onClick={() => setSelectedUser(null)}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 rounded-xl border border-border bg-secondary shrink-0">
                  <AvatarImage
                    src={selectedUser.profile_picture_url || undefined}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-sm font-bold bg-secondary text-foreground rounded-xl">
                    {getInitials(selectedUser.full_name || "")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col pt-1">
                  <h2 className="text-sm font-bold text-foreground leading-none mb-1.5 pr-6 truncate">
                    {toTitleCase(selectedUser.full_name)}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[8px] uppercase tracking-widest h-4 px-1.5 rounded",
                        getRoleBadgeStyle(selectedUser.role || ""),
                      )}
                    >
                      {toTitleCaseLine(selectedUser.role)}
                    </Badge>
                    <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                      ID: {selectedUser.user_id.split("-")[0]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  className="h-8 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground flex-1 rounded-lg shadow-sm transition-opacity"
                >
                  <SquarePlus className="w-3.5 h-3.5 mr-1.5" /> Book
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-[10px] font-bold uppercase tracking-widest bg-background border-border text-foreground hover:bg-secondary flex-1 rounded-lg shadow-none transition-colors"
                  onClick={() => setUserToMessage(selectedUser)}
                >
                  <Send className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />{" "}
                  Msg
                </Button>
              </div>
            </div>

            {/* DOSSIER BODY */}
            <div className="flex-1 overflow-y-auto bg-background custom-scrollbar transition-colors">
              <Tabs defaultValue="overview" className="w-full">
                <div className="px-3 pt-2 border-b border-border bg-secondary/30 sticky top-0 z-10 transition-colors">
                  <TabsList className="h-9 bg-transparent p-0 flex w-full border-b-0">
                    <TabsTrigger
                      value="overview"
                      className="flex-1 h-9 text-[10px] font-bold uppercase tracking-widest rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground text-muted-foreground transition-all"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="history"
                      className="flex-1 h-9 text-[10px] font-bold uppercase tracking-widest rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground text-muted-foreground transition-all"
                    >
                      Bookings
                    </TabsTrigger>
                    <TabsTrigger
                      value="docs"
                      className="flex-1 h-9 text-[10px] font-bold uppercase tracking-widest rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground text-muted-foreground transition-all"
                    >
                      Docs
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent
                  value="overview"
                  className="p-4 m-0 space-y-4 outline-none"
                >
                  <div className="bg-card border border-border rounded-xl p-4 shadow-sm transition-colors">
                    <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-border pb-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Account Health
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                          Status
                        </span>
                        <div>
                          {getStatusBadge(
                            selectedUser.account_status || "PENDING",
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                          Trust Score
                        </span>
                        <p className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 leading-none">
                          {selectedUser.trust_score || "5.0"}{" "}
                          <span className="text-[10px] text-muted-foreground font-sans font-medium">
                            / 5.0
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-4 shadow-sm transition-colors">
                    <div className="flex items-center justify-between mb-3 border-b border-border pb-1.5">
                      <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Contact Profile
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-[9px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10 rounded"
                        onClick={(e) => handleEdit(e, selectedUser)}
                      >
                        Edit
                      </Button>
                    </div>

                    <div className="space-y-2.5">
                      <div className="grid grid-cols-[60px_1fr] items-start">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                          Email
                        </span>
                        <span className="text-[11px] font-mono text-foreground font-medium break-all">
                          {selectedUser.email}
                        </span>
                      </div>
                      <div className="grid grid-cols-[60px_1fr] items-start">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                          Phone
                        </span>
                        <span className="text-[11px] font-mono text-foreground font-medium">
                          {selectedUser.phone_number || "N/A"}
                        </span>
                      </div>
                      <div className="grid grid-cols-[60px_1fr] items-start">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                          Addr
                        </span>
                        <span className="text-[11px] text-foreground leading-snug font-medium">
                          {selectedUser.address || "No address on file."}
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="p-4 m-0 outline-none">
                  <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-colors">
                    <div className="p-3 border-b border-border flex items-center justify-between bg-secondary/50">
                      <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5" /> Recent Bookings
                      </h4>
                      <span className="text-[9px] font-bold text-muted-foreground">
                        Total: 2
                      </span>
                    </div>

                    <div className="flex flex-col divide-y divide-border">
                      {/* Booking 1 */}
                      <div className="p-3 hover:bg-secondary/30 transition-colors cursor-pointer group">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-mono font-bold text-foreground">
                            BK-7A921
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[8px] uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-1.5 h-4 rounded"
                          >
                            Completed
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-foreground mb-1.5">
                          <CarFront className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-semibold">
                            2023 Toyota Fortuner
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                          <span>Mar 12 - Mar 15</span>
                          <span className="font-bold text-foreground text-[11px]">
                            ₱ 12,500
                          </span>
                        </div>
                      </div>

                      {/* Booking 2 */}
                      <div className="p-3 hover:bg-secondary/30 transition-colors cursor-pointer group">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-mono font-bold text-foreground">
                            BK-3B445
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[8px] uppercase tracking-widest bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 px-1.5 h-4 rounded"
                          >
                            Upcoming
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-foreground mb-1.5">
                          <CarFront className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-semibold">
                            2024 Honda Civic
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                          <span>Apr 01 - Apr 03</span>
                          <span className="font-bold text-foreground text-[11px]">
                            ₱ 8,200
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="docs"
                  className="p-4 m-0 space-y-4 outline-none"
                >
                  <div className="bg-card border border-border rounded-xl p-4 shadow-sm transition-colors">
                    <div className="flex items-center justify-between mb-3 border-b border-border pb-1.5">
                      <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <FileBadge className="w-3.5 h-3.5" /> Driver's License
                      </h4>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[8px] uppercase tracking-widest h-4 px-1.5 rounded",
                          selectedUser.license_id_url
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-secondary text-muted-foreground border-border",
                        )}
                      >
                        {selectedUser.license_id_url ? "Uploaded" : "Missing"}
                      </Badge>
                    </div>

                    {selectedUser.license_id_url ? (
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-[60px_1fr] items-start">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                            Number
                          </span>
                          <span className="text-[11px] font-mono font-medium text-foreground uppercase">
                            {selectedUser.license_number || "N/A"}
                          </span>
                        </div>
                        <div className="grid grid-cols-[60px_1fr] items-start">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                            Expiry
                          </span>
                          <span className="text-[11px] font-mono text-foreground font-medium">
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
                          className="flex items-center justify-center gap-2 w-full mt-3 h-8 bg-secondary border border-border rounded-lg text-[10px] font-bold text-primary hover:bg-background transition-colors uppercase tracking-widest shadow-sm"
                        >
                          View Document <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <div className="border border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center text-center mt-2 bg-secondary/30 transition-colors">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                          No file on record
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-3 text-[9px] font-bold uppercase tracking-widest rounded-md shadow-none"
                          onClick={(e) => handleEdit(e, selectedUser)}
                        >
                          Upload Now
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="bg-card border border-border rounded-xl p-4 shadow-sm transition-colors">
                    <div className="flex items-center justify-between mb-3 border-b border-border pb-1.5">
                      <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" /> Secondary ID
                      </h4>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[8px] uppercase tracking-widest h-4 px-1.5 rounded",
                          selectedUser.valid_id_url
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-secondary text-muted-foreground border-border",
                        )}
                      >
                        {selectedUser.valid_id_url ? "Uploaded" : "Missing"}
                      </Badge>
                    </div>

                    {selectedUser.valid_id_url ? (
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-[60px_1fr] items-start">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                            Expiry
                          </span>
                          <span className="text-[11px] font-mono text-foreground font-medium">
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
                          className="flex items-center justify-center gap-2 w-full mt-3 h-8 bg-secondary border border-border rounded-lg text-[10px] font-bold text-primary hover:bg-background transition-colors uppercase tracking-widest shadow-sm"
                        >
                          View Document <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <div className="border border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center text-center mt-2 bg-secondary/30 transition-colors">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                          No file on record
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-3 text-[9px] font-bold uppercase tracking-widest rounded-md shadow-none"
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
          className="sm:max-w-[600px] flex flex-col p-0 border-border shadow-2xl rounded-2xl overflow-hidden gap-0 bg-background transition-colors duration-300"
        >
          <DialogHeader className="p-0">
            <DialogTitle className="sr-only text-xs font-bold text-foreground uppercase tracking-widest">
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
