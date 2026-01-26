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
  File,
  Plus,
  Pencil,
  Trash2,
  Eye,
  FileSearchCorner,
  EllipsisVertical,
  History,
  UserStar,
  SquarePen,
  X,
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
import { useState } from "react";

interface GridProps {
  users: UserType[];
}

export default function ClientsDataGrid({ users }: GridProps) {
  const gridRef = useRef<GridComponent | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

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
      admin: "bg-red-300 text-red-700",
      staff: "bg-blue-300 text-blue-700",
      car_owner: "bg-purple-300 text-purple-700",
      customer: "bg-orange-200 text-orange-700",
    };
    // Default to 'customer' color if role is unknown
    const colorClass = colors[props.role] || colors.customer;

    return (
      <span
        className={`px-2 py-1 rounded-full text-[12px] font-medium ${colorClass}`}
      >
        {props.role}
      </span>
    );
  }

  function addressTemplate(props: UserType) {
    return props.address ? (
      <div className="flex items-center gap-2 ">
        <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
        <span className="truncate text-[12px]">{props.address}</span>
      </div>
    ) : (
      <span className="text-gray-400 bold text-center ">- -</span>
    );
  }

  function profileTemplate(props: UserType) {
    const profilePicture = props.profile_picture_url
      ? props.profile_picture_url
      : `https://ui-avatars.com/api/?name=${props.first_name}+${props.last_name}&background=random&color=fff`;
    return (
      <div className="flex justify-start items-center gap-2">
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
          <h3 className="text-[0.8rem] bold mb-[-0.3rem] p-0">
            {props.full_name}
          </h3>
          <h4 className="text-[0.6rem]">{props.email}</h4>
        </div>
      </div>
    );
  }

  function phoneTemplate(props: UserType) {
    return props.phone_number ? (
      <div className="flex items-center gap-2">
        <Phone className="w-3 h-3 shrink-0" />
        <span className="truncate text-[12px]">{props.phone_number}</span>
      </div>
    ) : (
      <span className="text-gray-400 bold text-center ">- -</span>
    );
  }

  function actionTemplate(props: UserType) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="!bg-transparent !border-none !shadow-none "
            size={"icon-sm"}
          >
            <EllipsisVertical className="text-black" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[10rem]">
          <DropdownMenuGroup>
            <DropdownMenuItem className="!text-xs">
              <div className="flex items-center gap-2">
                <FileSearchCorner className="size-4" />
                <p>View Details</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="!text-xs">
              <div className="flex items-center gap-2 ">
                <History className="size-4" />
                <p>Item History</p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem className="!text-xs">
              <div className="flex items-center gap-2 ">
                <UserStar className="size-4" />
                <p>Make as Admin</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="!text-xs">
              <div className="flex items-center gap-2 ">
                <SquarePen className="size-4" />
                <p>Edit User</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="!text-xs">
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
            bg-white rounded-md shadow-sm flex flex-col
            /* THE SMOOTH MAGIC: */
            transition-[width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
            overflow-hidden min-w-0 px-3 py-3
            ${selectedUser ? "w-[70%]" : "w-full"} 
          `}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-[600]">Clients ({users.length})</h3>
            </div>
            <div className="relative w-60 flex items-center gap-2">
              <Search className="absolute left-2 top-2.4 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search user..."
                className="pl-8 border-gray-300 rounded-sm !text-xs h-8"
                onChange={handleSearch}
              />
              <Button
                onClick={handleAdd}
                className="h-8 bg-[#20CE8B] hover:bg-primary/90 text-xs rounded-sm p-0" // Uses your theme color
                size={"icon-sm"}
              >
                <Plus />
              </Button>
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
                  width={140}
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
                  visible={false}
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
                  textAlign="Center"
                  template={phoneTemplate}
                  visible={false}
                />
                <ColumnDirective
                  field="address"
                  headerText="Address"
                  width={200}
                  textAlign="Center"
                  template={addressTemplate}
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
            bg-white rounded-md shadow-md flex flex-col overflow-hidden 
            transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${selectedUser ? "w-[30%] opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-10 border-0"}
          `}
        >
          {selectedUser && (
            <>
              {/* Detail Header */}
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-lg text-gray-800">
                  Client Details
                </h3>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleCloseDetail}
                >
                  <X className="h-4 w-4" />{" "}
                  {/* Make sure to import X from icons */}
                </Button>
              </div>

              {/* Detail Content (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Profile Header */}
                <div className="flex items-center gap-4">
                  {/* Large Avatar */}
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                    {selectedUser.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedUser.full_name}
                    </h2>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full uppercase font-bold">
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                    Contact Info
                  </h4>
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium">{selectedUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-medium">
                        {selectedUser.phone_number || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Add your Tabs here (Overview, Documents, History) if you want! */}
              </div>

              {/* Detail Footer Actions */}
              <div className="p-4 border-t bg-gray-50 flex gap-2 justify-end">
                <Button variant="outline" onClick={handleCloseDetail}>
                  Cancel
                </Button>
                <Button className="bg-[#20CE8B]">Edit Record</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
