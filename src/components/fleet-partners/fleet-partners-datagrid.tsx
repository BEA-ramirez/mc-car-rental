"use client";
import { useState, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Filter,
  EditSettingsModel,
  Toolbar,
  ToolbarItems,
  Sort,
  Page,
  FilterSettingsModel,
  Edit,
  ColumnChooser,
  CommandColumn,
  SelectionSettingsModel,
  Selection,
  RecordClickEventArgs,
  DialogEditEventArgs,
  ExcelExport,
  PdfExport,
} from "@syncfusion/ej2-react-grids";
import { ClickEventArgs } from "@syncfusion/ej2-navigations";
import { Browser } from "@syncfusion/ej2-base"; // for responsiveness check
import { managePartner } from "@/actions/manage-partner";
import { FleetPartnerProfileType } from "@/lib/schemas/car-owner";
import { UserType } from "@/lib/schemas/user";
import { PartnerForm } from "./partner-form";
import { CarFront, Phone } from "lucide-react";
import Image from "next/image";
import FleetPartnerReview from "./fleet-review";
import { deletePartner } from "@/actions/helper/delete-partner";

interface GridProps {
  fleetPartners: FleetPartnerProfileType[];
  availableUsers: UserType[];
}

function FleetPartnersDataGrid({ fleetPartners, availableUsers }: GridProps) {
  const gridRef = useRef<GridComponent | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedPartner, setSelectedPartner] =
    useState<FleetPartnerProfileType | null>(null);

  let grid: GridComponent | null = null;

  // TEMPLATE: Syncfusion passes 'props' (the row data + isAdd flag) here
  function dialogTemplate(props: any) {
    return (
      <PartnerForm
        data={props}
        availableUsers={availableUsers}
        closeDialog={() => {
          if (grid) grid.closeEdit();
        }}
      />
    );
  }

  // ACTION COMPLETE: Copied from Syncfusion's demo for better Dialog handling
  function actionComplete(args: DialogEditEventArgs): void {
    if (
      (args.requestType === "beginEdit" || args.requestType === "add") &&
      args.dialog
    ) {
      // Customize Dialog Title based on action
      if (args.requestType === "add") {
        args.dialog.header = "Add New Fleet Partner";
      } else {
        args.dialog.header = "Edit Partner Details";
      }

      // Responsive Height Logic from Demo
      if (Browser.isDevice) {
        args.dialog.height = window.innerHeight - 90 + "px";
        (args.dialog as any).dataBind();
      }
    }
  }

  // THE KEY HANDLER
  const actionBegin = async (args: any) => {
    // Intercept the SAVE action
    if (args.requestType === "save") {
      // Stop Syncfusion from doing its default internal save
      args.cancel = true;

      // Prepare FormData for your Server Action
      // 'args.data' contains the values we updated in PartnerForm via 'handleChange'
      const formData = new FormData();

      // Loop through the data object and append to FormData
      Object.keys(args.data).forEach((key) => {
        const value = args.data[key];
        if (value !== undefined && value !== null) {
          // Convert booleans/numbers to string for FormData
          formData.append(key, value.toString());
        }
      });

      try {
        // Call Server Action
        const result = await managePartner(
          { message: "", success: false },
          formData,
        );

        if (result.success) {
          // Close the dialog manually on success
          if (args.grid) {
            args.grid.closeEdit();
          }
          // Optionally show a toast here
          console.log("Success:", result.message);
        } else {
          // Handle Validation Errors
          alert("Error: " + result.message);
          // If you want to show field errors, you'd need to pass state back to the form
          // or simple alert them for now since we removed useActionState
          console.error(result.errors);
        }
      } catch (err) {
        console.error("Server Action Failed", err);
      }
    }
    if (args.requestType === "delete") {
      // stop syncfusion's default delete action
      args.cancel = true;
      // get the data of the rows being deleted
      const selectedRecords: FleetPartnerProfileType[] =
        args.data as FleetPartnerProfileType[];
      const record = selectedRecords[0];
      if (!record) return;
      try {
        const result = await deletePartner(record.car_owner_id, record.user_id);
        if (result.success) {
          alert(result.message);
        } else {
          alert("Error: " + result.message);
        }
      } catch (error) {
        console.error(error);
        alert("An unexpected error occurred.");
      }
    }
  };

  // data grid settings
  const filterOptions: FilterSettingsModel = { type: "Menu" };
  const toolbarOptions: ToolbarItems[] = [
    "Search",
    "Add",

    "ExcelExport",
    "PdfExport",
    "CsvExport",
  ];

  const editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    showDeleteConfirmDialog: true,
    showConfirmDialog: true,
    mode: "Dialog",
    template: dialogTemplate,
  };

  const selectionsettings: SelectionSettingsModel = {
    type: "Multiple",
    persistSelection: true,
  };

  const commands: any = [
    {
      type: "Edit",
      buttonOption: { iconCss: " e-icons e-edit", cssClass: "e-flat" },
    },
    {
      type: "Delete",
      buttonOption: { iconCss: "e-icons e-delete", cssClass: "e-flat" },
    },
    {
      type: "Save",
      buttonOption: { iconCss: "e-icons e-update", cssClass: "e-flat" },
    },
    {
      type: "Cancel",
      buttonOption: { iconCss: "e-icons e-cancel-icon", cssClass: "e-flat" },
    },
  ];

  function verificationStatusTemplate(props: FleetPartnerProfileType) {
    const colors = {
      verified: "text-green-600 bg-green-100",
      pending: "text-yellow-600 bg-yellow-100",
      rejected: "text-red-600 bg-red-100",
    };
    const colorClass = colors[props.verification_status] || "text-gray-500";
    return (
      <span className={`statustemp ${colorClass}`}>
        {props.verification_status}
      </span>
    );
  }

  function revenueTemplate(props: FleetPartnerProfileType) {
    return <span>{`${props.revenue_share_percentage}%`}</span>;
  }

  function unitCountTemplate(props: FleetPartnerProfileType) {
    return props.total_units >= 0 ? (
      <div className="flex justify-center items-center gap-2 text-gray-700">
        <CarFront className="w-4 h-4 text-gray-500 shrink-0" />
        <span className="truncate">{props.total_units}</span>
      </div>
    ) : (
      <span className="text-gray-400 bold text-center ">- -</span>
    );
  }

  function profileTemplate(props: FleetPartnerProfileType) {
    const profilePicture = props.profile_picture_url
      ? props.profile_picture_url
      : `https://ui-avatars.com/api/?name=${props.first_name}+${props.last_name}&background=random&color=fff`;
    return (
      <div className="flex justify-start items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${props.active_status ? "bg-green-400" : "bg-gray-400"}`}
        ></div>
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

  //when clicking a row
  const handleRecordClick = (args: RecordClickEventArgs) => {
    // Prevent opening if the user clicked on a command button
    if ((args.target as HTMLElement).closest(".e-unboundcell")) return;
    setSelectedPartner(args.rowData as FleetPartnerProfileType);
    setIsOpen(true);
  };

  const handleOpenDialog = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const toolbarClick = (args: ClickEventArgs): void => {
    if (gridRef.current) {
      switch (args.item.id) {
        case "fleetPartnersGrid_excelexport":
          gridRef.current.excelExport();
          break;
        case "fleetPartnersGrid_pdfexport":
          gridRef.current.pdfExport();
          break;
        case "fleetPartnersGrid_csvexport":
          gridRef.current.csvExport();
          break;
      }
    }
  };

  // sheet partner details not displaying

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Partner Details</SheetTitle>
            <SheetDescription>
              View and manage fleet partner information.
            </SheetDescription>
          </SheetHeader>
          {selectedPartner ? (
            <FleetPartnerReview
              selectedPartner={selectedPartner}
              setIsOpen={handleOpenDialog}
            />
          ) : (
            <div>Select a row to view details</div>
          )}
        </SheetContent>
      </Sheet>
      {/* 
          Hide Syncfusion's footer because I want to add my own "Save" button in the form 
      */}
      <style>
        {`
    /* Hide footer ONLY for the custom Add/Edit form */
    #fleetPartnersGrid_dialogEdit_wrapper.e-dialog .e-footer-content { 
      display: none !important; 
    }
    
    /* Force the footer to show up for the Delete Confirmation (Alert) */
    .e-alert-dialog .e-footer-content {
      display: flex !important;
    }
  `}
      </style>

      <GridComponent
        ref={gridRef}
        id="fleetPartnersGrid"
        dataSource={fleetPartners}
        recordClick={handleRecordClick}
        allowPaging={true}
        allowSorting={true}
        allowFiltering={true}
        allowSelection={true}
        showColumnChooser={true}
        filterSettings={filterOptions}
        toolbar={toolbarOptions}
        editSettings={editSettings}
        selectionSettings={selectionsettings}
        loadingIndicator={{ indicatorType: "Shimmer" }}
        actionComplete={actionComplete}
        actionBegin={actionBegin}
        clipMode="EllipsisWithTooltip"
        allowExcelExport={true}
        allowPdfExport={true}
        toolbarClick={toolbarClick}
        height="390"
      >
        <ColumnsDirective>
          <ColumnDirective
            isPrimaryKey={true}
            field="car_owner_id"
            visible={false}
          />
          <ColumnDirective
            headerText="Partner Name"
            field="full_name"
            width="200"
            template={profileTemplate}
          />
          <ColumnDirective
            field="business_name"
            headerText="Business"
            width="150"
          />
          <ColumnDirective
            field="phone_number"
            headerText="Contact"
            width="150"
            template={phoneTemplate}
          />
          <ColumnDirective
            field="verification_status"
            headerText="Status"
            width="120"
            template={verificationStatusTemplate}
            textAlign="Center"
          />
          <ColumnDirective
            field="revenue_share_percentage"
            headerText="Rev. Share"
            width="130"
            template={revenueTemplate}
            textAlign="Center"
          />
          <ColumnDirective
            field="total_units"
            headerText="Unit Count"
            width="130"
            textAlign="Center"
            template={unitCountTemplate}
          />
          <ColumnDirective
            headerText="Manage"
            width="90"
            commands={commands}
            allowFiltering={false}
            allowSorting={false}
            textAlign="Center"
          ></ColumnDirective>
        </ColumnsDirective>
        <Inject
          services={[
            Page,
            Sort,
            Filter,
            ColumnChooser,
            CommandColumn,
            Toolbar,
            Edit,
            Selection,
            PdfExport,
            ExcelExport,
          ]}
        />
      </GridComponent>
    </>
  );
}
export default FleetPartnersDataGrid;
