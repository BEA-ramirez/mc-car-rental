"use client";
import { useState } from "react";
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
} from "@syncfusion/ej2-react-grids";
import { Browser } from "@syncfusion/ej2-base"; // for responsiveness check
import { managePartner } from "@/actions/manage-partner";
import { FleetPartnerProfileType } from "@/lib/schemas/car-owner";
import { UserType } from "@/lib/schemas/user";
import { PartnerForm } from "./partner-form";

interface GridProps {
  fleetPartners: FleetPartnerProfileType[];
  availableUsers: UserType[];
}

function FleetPartnersDataGrid({ fleetPartners, availableUsers }: GridProps) {
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
          formData
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
  };

  // data grid settings
  const filterOptions: FilterSettingsModel = { type: "Menu" };
  const toolbarOptions: ToolbarItems[] = [
    "Search",
    "Add",
    "Delete",
    "ColumnChooser",
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
    checkboxOnly: true,
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

  //when clicking a row
  const handleRecordClick = (args: RecordClickEventArgs) => {
    // Prevent opening if the user clicked on a command button
    if ((args.target as HTMLElement).closest(".e-unboundcell")) return;
    setSelectedPartner(args.rowData as FleetPartnerProfileType);
    setIsOpen(true);
  };

  const closeSidebar = () => setIsOpen(false);

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
            <div className="p-4 flex flex-col gap-4">
              <div className="border border-black h-40">User Information</div>
              <div className="border border-black h-40">
                Car Owner Information
              </div>
              <div className="border border-black h-40">Car Units Owned</div>
            </div>
          ) : (
            <div>Select a row to view details</div>
          )}
        </SheetContent>
      </Sheet>
      {/* 
          Hide Syncfusion's footer because I want to add my own "Save" button in the form 
      */}
      <style>{`
        .e-dialog .e-footer-content { display: none !important; }
      `}</style>

      <GridComponent
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
        height="390"
      >
        <ColumnsDirective>
          <ColumnDirective type="checkbox" width="50"></ColumnDirective>
          <ColumnDirective
            isPrimaryKey={true}
            field="car_owner_id"
            headerText="Car Owner ID"
            width="120"
            visible={false}
          />
          <ColumnDirective
            headerText="Partner Name"
            field="partner_name"
            width="120"
          />
          <ColumnDirective
            field="business_name"
            headerText="Business Name"
            width="120"
          />
          <ColumnDirective
            field="phone_number"
            headerText="Contact"
            width="120"
          />
          <ColumnDirective
            field="verification_status"
            headerText="Verification Status"
            width="120"
            template={verificationStatusTemplate}
            textAlign="Center"
          />
          <ColumnDirective
            field="revenue_share_percentage"
            headerText="Rev. Share"
            width="120"
            template={revenueTemplate}
            textAlign="Center"
          />
          <ColumnDirective
            field="total_units"
            headerText="Unit Count"
            width="120"
            textAlign="Center"
          />
          <ColumnDirective
            headerText="Actions"
            width="120"
            commands={commands}
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
          ]}
        />
      </GridComponent>
    </>
  );
}
export default FleetPartnersDataGrid;
