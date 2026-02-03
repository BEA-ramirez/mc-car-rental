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
  SelectionSettingsModel,
  RecordClickEventArgs,
} from "@syncfusion/ej2-react-grids";
import { ClickEventArgs } from "@syncfusion/ej2-navigations";
import { Browser } from "@syncfusion/ej2-base"; // Import for mobile check
import { UserType } from "@/lib/schemas/user";
import { ClientForm } from "./client-form";
import { useRef, useEffect, useMemo, useState, useCallback } from "react";
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
import { toTitleCase, toTitleCaseLine } from "@/actions/helper/format-text";
import { DialogUtility } from "@syncfusion/ej2-popups";

import { useClients } from "../../../hooks/use-clients";

const selectionSettings: SelectionSettingsModel = {
  type: "Multiple",
  checkboxOnly: true,
  persistSelection: true,
};

const editSettings: EditSettingsModel = {
  allowEditing: true,
  allowAdding: true,
  allowDeleting: true,
  mode: "Dialog",
  // We can't define the template here easily because it's a component,
  // but we will fix that inside.
};

const filterOptions: FilterSettingsModel = { type: "Menu" };

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
  const fname = props.first_name || "New";
  const lname = props.last_name || "User";
  const profilePicture =
    props.profile_picture_url ||
    `https://ui-avatars.com/api/?name=${fname}+${lname}&background=random&color=fff`;

  return (
    <div className="flex justify-start items-center gap-2">
      <div className="relative w-8 h-8">
        <Image
          key={profilePicture}
          src={profilePicture}
          alt="Profile"
          fill
          className="rounded-full object-cover border"
          unoptimized
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

export default function ClientsDataGrid() {
  const {
    data: rawUsers = [],
    isLoading,
    deleteClient,
    bulkDelete,
  } = useClients();
  console.log("Users", rawUsers);

  const gridRef = useRef<GridComponent | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);

  const users = useMemo(() => rawUsers, [rawUsers]);

  const handleRecordClick = (args: RecordClickEventArgs) => {
    // Optional: Prevent opening if they clicked a button/action inside the row
    if (
      (args.target as HTMLElement).closest("button, a, .e-checkbox-wrapper")
    ) {
      return;
    }
    setSelectedUser(args.rowData as UserType);
  };

  // Update count when selection changes
  const handleSelectionChange = () => {
    if (gridRef.current) {
      setSelectedCount(gridRef.current.getSelectedRecords().length);
    }
  };

  const handleBulkDelete = async () => {
    if (gridRef.current) {
      const selectedRecords =
        gridRef.current.getSelectedRecords() as UserType[];
      const idsToDelete = selectedRecords.map((record) => record.user_id);

      if (idsToDelete.length === 0) return;

      let dialogObj: any;

      dialogObj = DialogUtility.confirm({
        title: "Delete users",
        content: `Are you sure you want to delete ${idsToDelete.length} user(s)? This action cannot be undone.`,
        okButton: {
          text: "Delete",
          cssClass: "e-primary",
          click: async () => {
            await bulkDelete(idsToDelete);
            if (gridRef.current) {
              gridRef.current.clearSelection();
              setSelectedCount(0);
            }
            dialogObj.hide();
          },
        },
        cancelButton: {
          text: "Cancel",
          click: () => {
            dialogObj.hide();
          },
          cssClass: "e-flat",
        },
        showCloseIcon: false,
        closeOnEscape: true,
        animationSettings: { effect: "Zoom" },
        cssClass: "e-confirm-dialog",
      });
    }
  };

  // Triggered when a row is clicked
  const handleRowSelected = (args: any) => {
    setSelectedUser(args.data);
  };

  // Triggered when closing the side panel
  const handleCloseDetail = () => {
    setSelectedUser(null);
  };

  const dialogTemplate = useCallback((props: any) => {
    return (
      <ClientForm
        data={props}
        closeDialog={() => gridRef.current?.closeEdit()}
      />
    );
  }, []);

  const editSettings = useMemo<EditSettingsModel>(
    () => ({
      allowEditing: true,
      allowAdding: true,
      allowDeleting: true,
      showDeleteConfirmDialog: true,
      showConfirmDialog: true,
      mode: "Dialog",
      template: dialogTemplate, // Uses the stable function above
    }),
    [dialogTemplate],
  );

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

      args.dialog.width = "auto";
      if (Browser.isDevice) {
        args.dialog.height = window.innerHeight - 90 + "px";
      }
      const dialogInstance = args.dialog as any;

      setTimeout(() => {
        // Check if method exists (safety) and call it
        if (dialogInstance.refreshPosition) {
          dialogInstance.refreshPosition();
        }
      }, 50);
    }
  }

  const actionBegin = async (args: any) => {
    // check if the event is a delete request
    if (args.requestType === "delete") {
      // stop syncfusion's default delete action
      args.cancel = true;

      const deletedRecord = args.data[0] as UserType;

      if (deletedRecord && deletedRecord.user_id) {
        deleteClient(deletedRecord.user_id);
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) =>
    gridRef.current?.search(e.target.value);

  const handleExcelExport = () => {
    gridRef.current?.excelExport();
  };

  const handlePdfExport = () => {
    gridRef.current?.pdfExport();
  };

  const handleCsvExport = () => {
    gridRef.current?.csvExport();
  };

  const handleAdd = () => gridRef.current?.addRecord();

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

  const actionTemplate = useCallback((props: UserType) => {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="bg-transparent! border-none! shadow-none! cursor-pointer"
            size={"icon-sm"}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <EllipsisVertical className="text-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-40"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
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
            <DropdownMenuItem
              className="text-xs!"
              onClick={(e) => {
                e.stopPropagation();
                if (gridRef.current) {
                  gridRef.current.clearSelection();
                  const index = gridRef.current.getRowIndexByPrimaryKey(
                    props.user_id,
                  );
                  gridRef.current.selectRow(index);
                  gridRef.current.startEdit();
                }
              }}
            >
              <div className="flex items-center gap-2 ">
                <SquarePen className="size-4" />
                <p>Edit User</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs!"
              onClick={(e) => {
                e.stopPropagation();
                if (gridRef.current) {
                  gridRef.current.clearSelection();
                  const index = gridRef.current.getRowIndexByPrimaryKey(
                    props.user_id,
                  );
                  gridRef.current.selectRow(index);
                  gridRef.current.deleteRecord("user_id", props);
                }
              }}
            >
              <div className="flex items-center gap-2 ">
                <Trash2 className="size-4" />
                <p>Delete User</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }, []);

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
      <div
        className={`h-full mb-6 rounded-lg flex w-full relative ${selectedUser ? "gap-4" : "gap-0"}`}
      >
        {isLoading && (
          <div className="absolute inset-0 z-50 bg-white/60 flex items-center justify-center backdrop-blur-[1px] rounded-md border">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="text-xs font-medium text-muted-foreground">
                Loading Clients...
              </span>
            </div>
          </div>
        )}

        <div
          className={`
            bg-card rounded-lg shadow-sm flex flex-col
            transition-[width] duration-500 ease-in-out
            overflow-hidden min-w-0 px-3 py-4 
            ${selectedUser ? "w-[70%]" : "w-full"} 
          `}
        >
          <div className="flex flex-row-reverse px-2 ">
            <Button
              onClick={handleAdd}
              className="bg-primary hover:bg-primary/60 shadow-md cursor-pointer h-7! text-[0.7rem] rounded-sm! p-1! px-2! mb-2 gap-1!"
            >
              <Plus className="text-secondary stroke-3 w-1 h-1" />
              New User
            </Button>
          </div>
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">
                Clients ({users.length})
              </h3>
              <h4 className="text-[0.7rem] text-foreground/50 font-medium border-l-2 border-gray-300 pl-2">
                {selectedCount} users selected
              </h4>
              <Button
                variant="outline"
                className="bg-transparent! cursor-pointer"
                size={"icon-sm"}
                onClick={handleBulkDelete}
                disabled={selectedCount === 0}
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
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-transparent! cursor-pointer"
                    size={"icon-sm"}
                  >
                    <Download className="text-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-20 min-w-24">
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      className="text-xs!"
                      onClick={handlePdfExport}
                    >
                      <div className="flex items-center gap-2 cursor-pointer">
                        <FileText className="size-4" />
                        <p>PDF</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-xs!"
                      onClick={handleCsvExport}
                    >
                      <div className="flex items-center gap-2 cursor-pointer">
                        <FileSpreadsheet className="size-4" />
                        <p>CSV</p>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="text-xs!"
                      onClick={handleExcelExport}
                    >
                      <div className="flex items-center gap-2 cursor-pointer">
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
              selectionSettings={selectionSettings}
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
              rowSelected={handleSelectionChange}
              rowDeselected={handleSelectionChange}
              recordClick={handleRecordClick}
            >
              <ColumnsDirective>
                <ColumnDirective
                  field="user_id"
                  isPrimaryKey={true}
                  visible={false}
                />
                <ColumnDirective type="Checkbox" width="40" />
                <ColumnDirective
                  field="full_name"
                  headerText="Client"
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
                  field="account_status"
                />
                <ColumnDirective
                  headerText="Condition"
                  width={100}
                  textAlign="Center"
                  field={"last_active_at"}
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
            transition-all duration-500 ease-in-out border
            ${selectedUser ? "w-[30%] opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-10 border-0"}
          `}
        >
          {selectedUser && (
            <div className="h-full p-1">
              <div className="w-full p-4 bg-linear-to-br from-primary to-foreground/60 relative rounded-md h-26">
                <div className="flex justify-start items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleCloseDetail}
                  >
                    <ArrowRightFromLine className="h-4 w-4 text-primary-foreground" />
                  </Button>
                  <h3 className="font-bold text-[14px] text-primary-foreground">
                    Client Detail
                  </h3>
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
                      className="bg-transparent! py-2!"
                    >
                      <SquarePen className="h-4 w-4 stroke-2" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={handleCloseDetail}
                      className="bg-transparent! py-2!"
                    >
                      <EllipsisVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="w-full flex items-center justify-evenly gap-1 mt-4 border-b-2 pb-4 border-foreground/20">
                <Button
                  onClick={handleAdd}
                  className="w-[45%] h-9! bg-card border border-primary text-primary text-[0.8rem] rounded-sm! p-1! px-2! gap-2!"
                >
                  <SquarePlus className="text-primary  stroke-2" />
                  Add Booking
                </Button>
                <Button
                  onClick={handleAdd}
                  className="w-[45%] h-9! bg-primary/20 text-primary text-[0.8rem] rounded-sm! p-1! px-2! gap-2!"
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
