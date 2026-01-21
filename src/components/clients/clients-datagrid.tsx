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
import { MapPin, Phone, File } from "lucide-react";
import Image from "next/image";

interface GridProps {
  users: UserType[];
}

export default function ClientsDataGrid({ users }: GridProps) {
  const gridRef = useRef<GridComponent | null>(null);

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

  const toolbarOptions: ToolbarItems[] = [
    "Add",
    "Search",
    "ExcelExport",
    "PdfExport",
    "CsvExport",
  ];

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
      admin: "bg-red-100 text-red-700",
      staff: "bg-blue-100 text-blue-700",
      car_owner: "bg-purple-100 text-purple-700",
      customer: "bg-gray-100 text-gray-700",
    };
    // Default to 'customer' color if role is unknown
    const colorClass = colors[props.role] || colors.customer;

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-bold uppercase ${colorClass}`}
      >
        {props.role}
      </span>
    );
  }

  function addressTemplate(props: UserType) {
    return props.address ? (
      <div className="flex items-center gap-2 text-gray-700">
        <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
        <span className="truncate">{props.address}</span>
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
      <div className="flex items-center gap-2 text-gray-700">
        <Phone className="w-4 h-4 text-gray-500 shrink-0" />
        <span className="truncate">{props.phone_number}</span>
      </div>
    ) : (
      <span className="text-gray-400 bold text-center ">- -</span>
    );
  }

  function validIdTemplate(props: UserType) {
    return props.valid_id_url ? (
      <div className="text-gray-700">
        <a
          href={props.valid_id_url}
          target="_blank"
          className="underline flex items-center gap-2"
        >
          <File className="w-4 h-4 text-gray-500 shrink-0" />
          View ID
        </a>
      </div>
    ) : (
      <div className="text-gray-400 bold text-center ">- -</div>
    );
  }
  function licenseIdTemplate(props: UserType) {
    return props.license_id_url ? (
      <div className="text-gray-700 w-full">
        <a
          href={props.license_id_url}
          target="_blank"
          className="underline flex items-center gap-2"
        >
          <File className="w-4 h-4 text-gray-500 shrink-0" />
          View ID
        </a>
      </div>
    ) : (
      <div className="text-gray-400 bold text-center ">- -</div>
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
      <GridComponent
        width="100%"
        id="clientsGrid"
        ref={gridRef}
        dataSource={users}
        editSettings={editSettings}
        toolbar={toolbarOptions}
        filterSettings={filterOptions}
        allowPaging={true}
        allowSorting={true}
        allowFiltering={true}
        clipMode="EllipsisWithTooltip"
        actionComplete={actionComplete}
        actionBegin={actionBegin}
        height={400} // Optional height
        allowExcelExport={true}
        allowPdfExport={true}
        toolbarClick={toolbarClick}
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
            width={200}
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
            width={150}
            template={roleTemplate}
            textAlign="Center"
          />
          <ColumnDirective
            field="phone_number"
            headerText="Phone"
            width={150}
            textAlign="Center"
            template={phoneTemplate}
          />
          <ColumnDirective
            field="address"
            headerText="Address"
            width={200}
            textAlign="Center"
            template={addressTemplate}
          />
          <ColumnDirective
            field="valid_id_url"
            headerText="Valid ID"
            width={120}
            textAlign="Center"
            template={validIdTemplate}
          />
          <ColumnDirective
            field="license_id_url"
            headerText="License ID"
            width={120}
            textAlign="Center"
            template={licenseIdTemplate}
          />
          <ColumnDirective
            headerText="Manage"
            width={100}
            allowFiltering={false}
            allowSorting={false}
            commands={[
              {
                type: "Edit",
                buttonOption: {
                  iconCss: "e-icons e-edit",
                  cssClass: "e-flat",
                },
              },
              {
                type: "Delete",
                buttonOption: {
                  iconCss: "e-icons e-delete",
                  cssClass: "e-flat",
                },
              },
            ]}
            //freeze="Right"
            textAlign="Center"
          />
        </ColumnsDirective>
        <Inject
          services={[
            Page,
            Sort,
            Filter,
            Toolbar,
            Edit,
            CommandColumn,
            Freeze,
            ExcelExport,
            PdfExport,
          ]}
        />
      </GridComponent>
    </>
  );
}
