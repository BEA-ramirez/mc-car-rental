"use client";
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
} from "@syncfusion/ej2-react-grids";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { BookingType } from "@/lib/schemas/booking";

function statusBadge(props: BookingType) {
  const statusColors = {
    active: "e-activecolor",
    confirmed: "text-green-600 bg-green-100",
    pending: "text-yellow-600 bg-yellow-100",
    cancelled: "text-red-600 bg-red-100",
    completed: "text-gray-600 bg-gray-100",
  };

  const colorClass = statusColors[props.booking_status] || "text-gray-500";
  return (
    <span className={`statustemp ${colorClass}`}>{props.booking_status}</span>
  );
}

function BookingDataGrid({ bookings }: { bookings: BookingType[] }) {
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

  return (
    <GridComponent
      dataSource={bookings}
      allowPaging={true}
      allowSorting={true}
      allowFiltering={true}
      allowTextWrap={true}
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
          field="booking_id"
          headerText="Booking ID"
          width="150"
          isPrimaryKey={true}
          textAlign="Center"
        />
        <ColumnDirective field="user_id" headerText="User" width="150" />
        <ColumnDirective field="car_id" headerText="Car" width="150" />
        <ColumnDirective field="driver_id" headerText="Driver" width="150" />
        <ColumnDirective
          field="pickup_location"
          headerText="Pickup Loc"
          width="150"
        />
        <ColumnDirective
          field="dropoff_location"
          headerText="Dropoff Loc"
          width="150"
        />
        <ColumnDirective
          field="start_date"
          headerText="Start Date"
          width="150"
          format="yMd"
          editType="datepickeredit"
        />
        <ColumnDirective
          field="end_date"
          headerText="End Date"
          width="150"
          format="yMd"
          editType="datepickeredit"
        />
        <ColumnDirective
          field="booking_status"
          headerText="Status"
          width="150"
          template={statusBadge}
        />
        <ColumnDirective
          field="payment_method"
          headerText="Payment Method"
          width="150"
        />
        <ColumnDirective
          headerText="Manage Records"
          width="160"
          commands={commands}
        ></ColumnDirective>
      </ColumnsDirective>

      {/* Inject Page module instead of VirtualScroll for simpler pagination */}
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
  );
}

export default BookingDataGrid;
