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
} from "@syncfusion/ej2-react-grids";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { FleetPartnerProfileType } from "@/lib/schemas/car-owner";

function FleetPartnersDataGrid({
  dummyFleetPartners,
}: {
  dummyFleetPartners: FleetPartnerProfileType[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] =
    useState<FleetPartnerProfileType | null>(null);

  // data grid settings
  const filterOptions: FilterSettingsModel = { type: "Excel" };
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
      <GridComponent
        dataSource={dummyFleetPartners}
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
