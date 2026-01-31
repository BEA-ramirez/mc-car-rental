"use client";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Page,
  Sort,
  Filter,
  Toolbar,
  Edit,
  EditSettingsModel,
  ToolbarItems,
  DialogEditEventArgs,
  CommandColumn,
  SaveEventArgs,
  FilterSettingsModel,
  Freeze,
  ExcelExport,
  PdfExport,
} from "@syncfusion/ej2-react-grids";
import { ClickEventArgs } from "@syncfusion/ej2-navigations";
import { Browser } from "@syncfusion/ej2-base"; // Import for mobile check
import { UserType } from "@/lib/schemas/user";
import { ClientForm } from "./client-form";
import { useRef, useEffect } from "react";
import { deleteUser } from "@/actions/helper/delete-user";
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
  SquarePen,
  Download,
  FileText,
  FileSpreadsheet,
  Sheet,
  ArrowRightFromLine,
  Send,
  SquarePlus,
} from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toTitleCase, toTitleCaseLine } from "@/actions/helper/format-text";

interface GridProps {
  users: UserType[];
}

export default function ClientsDataGrid({ users }: GridProps) {
  const gridRef = useRef<GridComponent | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Toggle single row
  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Helper: Select All / Deselect All
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all IDs currently in the data
      setSelectedIds(new Set(users.map((u) => u.user_id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // Triggered when a row is clicked
  const handleRowSelected = (args: any) => {
    setSelectedUser(args.data);
  };

  // Triggered when closing the side panel
  const handleCloseDetail = () => {
    setSelectedUser(null);
    // Optional: clear selection in grid visually
    gridRef.current?.clearSelection();
  };

  // ensures the grid updates when the server action finishes and sends new props
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.refresh();
    }
  }, [users]);

  function dialogTemplate(props: any) {
    return (
      <ClientForm
        data={props}
        closeDialog={() => {
          if (gridRef.current) {
            gridRef.current.closeEdit();
          }
        }}
      />
    );
  }

  function actionComplete(args: DialogEditEventArgs): void {
    if (
      (args.requestType === "beginEdit" || args.requestType === "add") &&
      args.dialog
    ) {
      // A. Set Custom Titles
      if (args.requestType === "add") {
        args.dialog.header = "Add New Client";
      } else {
        // You can even access data here: "Edit User - John Doe"
        const name = (args.rowData as UserType)?.full_name || "User";
        args.dialog.header = `Edit Client: ${name}`;
      }

      // B. Mobile Responsiveness
      if (Browser.isDevice) {
        args.dialog.height = window.innerHeight - 90 + "px";
        (args.dialog as any).dataBind();
      }
    }
  }

  const actionBegin = async (args: any) => {
    // check if the event is a delete request
    if (args.requestType === "delete") {
      // stop syncfusion's default delete action
      args.cancel = true;

      const deletedRecord = args.data[0] as UserType;

      if (deletedRecord && deletedRecord.user_id) {
        try {
          const result = await deleteUser(deletedRecord.user_id);
          if (!result.success) {
            alert("Error deleting user: " + result.message);
          }
        } catch (error) {
          console.error(error);
          alert("An unexpected error occurred while deleting the user.");
        }
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    gridRef.current?.search(e.target.value);
  };

  const handleExcelExport = () => {
    gridRef.current?.excelExport();
  };

  const handlePdfExport = () => {
    gridRef.current?.pdfExport();
  };

  const handleAdd = () => {
    gridRef.current?.addRecord();
  };

  const handleView = (props: UserType) => {
    window.location.href = `/admin/clients/${props.user_id}`;
  };

  const handleEdit = (e: React.MouseEvent, props: UserType) => {
    e.stopPropagation(); // Stop the row from being toggled selected/deselected

    if (gridRef.current) {
      // 1. Find the row index using the Primary Key
      const index = gridRef.current.getRowIndexByPrimaryKey(props.user_id);

      // 2. Only proceed if the row is found
      if (index !== -1) {
        gridRef.current.selectRow(index); // Force selection
        gridRef.current.startEdit(); // Trigger the Edit Dialog
      } else {
        console.error("Could not find row index for ID:", props.user_id);
      }
    }
  };

  const handleDelete = (props: UserType) => {
    if (gridRef.current) {
      gridRef.current.deleteRecord("user_id", props);
    }
  };

  const filterOptions: FilterSettingsModel = { type: "Menu" };

  const editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true, // Note: You'll need a separate delete action logic for this later
    showDeleteConfirmDialog: true,
    showConfirmDialog: true,
    mode: "Dialog",
    template: dialogTemplate,
  };

  const toolbarClick = (args: ClickEventArgs): void => {
    if (gridRef.current) {
      switch (args.item.id) {
        case "clientsGrid_excelexport":
          gridRef.current.excelExport();
          break;
        case "clientsGrid_pdfexport":
          gridRef.current.pdfExport();
          break;
        case "clientsGrid_csvexport":
          gridRef.current.csvExport();
          break;
      }
    }
  };

  // Helper for Role Badges
  function roleTemplate(props: UserType) {
    const colors: Record<string, string> = {
      admin: "bg-rose-100 text-rose-600 ",
      staff: "bg-blue-100 text-blue-600 ",
      car_owner: "bg-purple-100 text-purple-600 ",
      customer: "bg-emerald-100 text-emerald-600 ",
      driver: "bg-orange-100 text-orange-600 ",
    };
    // Default to 'customer' color if role is unknown
    const colorClass = colors[props.role] || colors.customer;

    return (
      <span
        className={`px-2 py-[0.2rem] rounded-sm text-[11px] font-semibold ${colorClass} shadow-md`}
      >
        {toTitleCaseLine(props.role)}
      </span>
    );
  }

  function profileTemplate(props: UserType) {
    const profilePicture = props.profile_picture_url
      ? props.profile_picture_url
      : `https://ui-avatars.com/api/?name=${props.first_name}+${props.last_name}&background=random&color=fff`;
    const isSelected = selectedIds.has(props.user_id);
    return (
      <div className="flex justify-start items-center gap-2">
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center pr-2"
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleSelection(props.user_id)}
            className="border-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>
        <div className="relative w-8 h-8">
          <Image
            key={profilePicture}
            src={profilePicture}
            alt="Profile"
            fill /* Fills the relative parent above */
            className="rounded-full object-cover border"
            sizes="40px"
          />
        </div>
        <div className="flex flex-col justify-start items-start">
          <h3 className="text-[0.8rem] font-semibold mb-[-0.3rem] p-0">
            {toTitleCase(props.full_name)}
          </h3>
          <h4 className="text-[0.6rem] font-medium">{props.email}</h4>
        </div>
      </div>
    );
  }

  function actionTemplate(props: UserType) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="bg-transparent! border-none! shadow-none! "
            size={"icon-sm"}
          >
            <EllipsisVertical className="text-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuGroup>
            <DropdownMenuItem className="text-xs!">
              <div className="flex items-center gap-2">
                <FileSearchCorner className="size-4" />
                <p>View Details</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs!">
              <div className="flex items-center gap-2 ">
                <History className="size-4" />
                <p>Item History</p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem className="text-xs!">
              <div className="flex items-center gap-2 ">
                <UserStar className="size-4" />
                <p>Make as Admin</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs!">
              <div className="flex items-center gap-2 ">
                <SquarePen className="size-4" />
                <p>Edit User</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs!">
              <div className="flex items-center gap-2 ">
                <Trash2 className="size-4" />
                <p>Delete User</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const headerTemplate = () => {
    const isAllSelected = users.length > 0 && selectedIds.size === users.length;

    return (
      <div className="flex items-center gap-3">
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={(c) => toggleSelectAll(!!c)}
          className="border-gray-400 data-[state=checked]:bg-[#00ddd2]"
        />
        <span className="text-foreground/50 font-semibold">Client</span>
      </div>
    );
  };

  return (
    <>
      <style>
        {`
    /* Hide footer ONLY for the custom Add/Edit form */
    #clientsGrid_dialogEdit_wrapper.e-dialog .e-footer-content { 
      display: none !important; 
    }
    
    /* Force the footer to show up for the Delete Confirmation (Alert) */
    .e-alert-dialog .e-footer-content {
      display: flex !important;
    }
  `}
      </style>
      <div className="h-full space-y-2 mb-6 flex gap-4 w-full relative ">
        <div
          className={`
            bg-card rounded-md shadow-sm flex flex-col
            /* THE SMOOTH MAGIC: */
            transition-[width] duration-500 ease-in-out
            overflow-hidden min-w-0 px-3 py-3
            ${selectedUser ? "w-[70%]" : "w-full"} 
          `}
        >
          <div className="flex flex-row-reverse px-2">
            <Button
              onClick={handleAdd}
              className="bg-primary hover:bg-primary/60 shadow-md cursor-pointer h-7! text-[0.7rem] rounded-sm! p-1! px-2! mb-2 gap-1!"
            >
              <Plus className="text-secondary stroke-3" />
              New User
            </Button>
          </div>
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">
                Clients ({users.length})
              </h3>
              <h4 className="text-[0.7rem] text-foreground/50 font-medium border-l-2 border-gray-300 pl-2">
                {selectedIds.size} users selected
              </h4>
              <Button
                variant="outline"
                className="bg-transparent! "
                size={"icon-sm"}
              >
                <Trash2 className="text-foreground" />
              </Button>
              <Button
                variant="outline"
                className="bg-transparent! "
                size={"icon-sm"}
              >
                <EllipsisVertical className="text-foreground" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-transparent! "
                    size={"icon-sm"}
                  >
                    <Download className="text-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-20 min-w-24">
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="text-xs! ">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4" />
                        <p>PDF</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs! ">
                      <div className="flex items-center gap-2 ">
                        <FileSpreadsheet className="size-4" />
                        <p>CSV</p>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="text-xs!">
                      <div className="flex items-center gap-2 ">
                        <Sheet className="size-4" />
                        <p>Excel</p>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="relative w-60 flex items-center gap-2">
                <Search className="absolute left-2 top-2.4 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search user..."
                  className="pl-8 border-gray-300 rounded-sm text-xs! h-8"
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden p-2">
            <GridComponent
              width="100%"
              id="clientsGrid"
              ref={gridRef}
              dataSource={users}
              editSettings={editSettings}
              filterSettings={filterOptions}
              allowPaging={true}
              allowSorting={true}
              allowFiltering={true}
              clipMode="EllipsisWithTooltip"
              actionComplete={actionComplete}
              actionBegin={actionBegin}
              height={500} // Optional height
              allowExcelExport={true}
              allowPdfExport={true}
              toolbarClick={toolbarClick}
              rowSelected={handleRowSelected}
            >
              <ColumnsDirective>
                <ColumnDirective
                  field="user_id"
                  isPrimaryKey={true}
                  visible={false}
                />
                <ColumnDirective
                  field="full_name"
                  headerText="Client"
                  headerTemplate={headerTemplate}
                  width={220}
                  template={profileTemplate}
                />
                <ColumnDirective
                  field="email"
                  headerText="Email"
                  width={180}
                  visible={false}
                />
                <ColumnDirective
                  field="role"
                  headerText="Role"
                  width={100}
                  template={roleTemplate}
                  textAlign="Center"
                />
                <ColumnDirective
                  headerText="Status"
                  width={100}
                  textAlign="Center"
                />
                <ColumnDirective
                  headerText="Condition"
                  width={100}
                  textAlign="Center"
                />
                <ColumnDirective
                  field="phone_number"
                  headerText="Phone"
                  width={120}
                  visible={false}
                />
                <ColumnDirective
                  field="address"
                  headerText="Address"
                  width={200}
                  visible={false}
                />
                <ColumnDirective
                  headerText=""
                  width={60}
                  allowFiltering={false}
                  allowSorting={false}
                  template={actionTemplate}
                  //freeze="Right"
                  textAlign="Center"
                  clipMode="Ellipsis"
                />
              </ColumnsDirective>
              <Inject
                services={[
                  Page,
                  Sort,
                  Filter,
                  Edit,
                  CommandColumn,
                  Freeze,
                  ExcelExport,
                  PdfExport,
                ]}
              />
            </GridComponent>
          </div>
        </div>
        <div
          className={`
            bg-card rounded-md shadow-md flex flex-col overflow-hidden 
            transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${selectedUser ? "w-[30%] opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-10 border-0"}
          `}
        >
          {selectedUser && (
            <div className="h-full p-1">
              <div className="w-full p-4 bg-gradient-to-br from-primary to-foreground/60 relative rounded-md h-26">
                <div className="flex justify-start items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleCloseDetail}
                  >
                    <ArrowRightFromLine className="h-4 w-4" />
                  </Button>
                  <h3 className="font-bold text-[0.9rem]">Client Detail</h3>
                </div>
                <div className="w-20 h-20 absolute top-14 left-4 border-4 border-card rounded-full overflow-hidden">
                  <Image
                    key={selectedUser.profile_picture_url}
                    src={
                      selectedUser.profile_picture_url ||
                      `https://ui-avatars.com/api/?name=${selectedUser.first_name}+${selectedUser.last_name}&background=random&color=fff`
                    }
                    alt="Profile"
                    fill /* Fills the relative parent above */
                    className="rounded-full object-cover"
                    sizes="80px"
                  />
                </div>
              </div>
              <div className="w-full mt-9 px-5">
                <h2 className="text-lg text-foreground font-semibold">
                  {toTitleCase(selectedUser.full_name)}
                </h2>
                <div className="w-full flex items-end justify-between mt-[-0.4rem]">
                  <p className="text-[0.8rem] font-medium px-[0.7rem] border bg-foreground/30 rounded-full">
                    {selectedUser.role}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={handleCloseDetail}
                      className="!bg-transparent !py-2"
                    >
                      <SquarePen className="h-4 w-4 stroke-2" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={handleCloseDetail}
                      className="!bg-transparent !py-2"
                    >
                      <EllipsisVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="w-full flex items-center justify-evenly gap-1 mt-4 border-b-2 pb-4 border-foreground/20">
                <Button
                  onClick={handleAdd}
                  className="w-[45%] !h-9 bg-card border border-primary text-primary text-[0.8rem] !rounded-sm !p-1 !px-2 !gap-2"
                >
                  <SquarePlus className="text-primary  stroke-2" />
                  Add Booking
                </Button>
                <Button
                  onClick={handleAdd}
                  className="w-[45%] !h-9 bg-primary/20 text-primary text-[0.8rem] !rounded-sm !p-1 !px-2 !gap-2"
                >
                  <Send className=" text-primary stroke-2" />
                  Message
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-3 border-b-2 border-foreground/20">
                <h3 className="mb-3 text-[0.9rem] font-semibold">
                  Contact Information
                </h3>
                <div className="flex items-center gap-2 text-foreground/40 text-[0.8rem] font-medium mb-1">
                  <Mail className="w-4 h-4 text-foreground/40" />
                  <h4>E-mail</h4>
                </div>
                <p className="mb-3 text-[0.8rem] font-medium">
                  {selectedUser.email}
                </p>
                <div className="flex items-center gap-2 text-foreground/40 text-[0.8rem] font-medium mb-1">
                  <Phone className="w-4 h-4 text-foreground/40" />
                  <h4>Phone</h4>
                </div>
                <p className="mb-3 text-[0.8rem] font-medium">
                  {selectedUser.phone_number}
                </p>
                <div className="flex items-center gap-2 text-foreground/40 text-[0.8rem] font-medium mb-1">
                  <MapPin className="w-4 h-4 text-foreground/40" />
                  <h4>Address</h4>
                </div>
                <p className="mb-3 text-[0.8rem] font-medium">
                  {selectedUser.address || "- -"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
