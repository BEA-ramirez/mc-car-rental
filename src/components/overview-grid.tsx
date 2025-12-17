"use client";

import React, { useRef } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Filter,
  VirtualScroll,
  Sort,
  Selection,
  FilterSettingsModel,
} from "@syncfusion/ej2-react-grids";
import {
  DropDownListComponent,
  ChangeEventArgs,
} from "@syncfusion/ej2-react-dropdowns";
import { RatingComponent } from "@syncfusion/ej2-react-inputs";
import { DataManager, Query, UrlAdaptor } from "@syncfusion/ej2-data";
import { User, MapPin } from "lucide-react"; // Using Lucide icons instead of missing PNGs
import "@/css/overview-grid.css"; // Import the CSS we created in Step 3

// --- TEMPLATES ---

const StatusTemplate = (props: any) => {
  return (
    <div
      className={`statustemp ${
        props.Status === "Active" ? "e-activecolor" : "e-inactivecolor"
      }`}
    >
      <span className="statustxt">{props.Status}</span>
    </div>
  );
};

const RatingTemplate = (props: any) => {
  return (
    <RatingComponent
      value={props.Rating}
      cssClass={"custom-rating"}
      readOnly={true}
    />
  );
};

const ProgressTemplate = (props: any) => {
  let percentage: number = props[props.column.field];
  if (percentage <= 20) {
    percentage = percentage + 30;
  }
  return (
    <div className="pbar">
      <div
        className={`bar ${
          props.Status === "Inactive" ? "progressdisable" : ""
        }`}
        style={{ width: `${percentage}%` }}
      >
        {percentage}%
      </div>
    </div>
  );
};

const TrustTemplate = (props: any) => {
  // Replaced Image logic with text/color logic for simplicity
  const color =
    props.Trustworthiness === "Sufficient"
      ? "text-red-500"
      : props.Trustworthiness === "Perfect"
      ? "text-green-500"
      : "text-yellow-500";
  return (
    <div>
      <span className={`font-bold ${color}`}>{props.Trustworthiness}</span>
    </div>
  );
};

const EmpTemplate = (props: any) => {
  return (
    <div className="flex items-center gap-2">
      <div className="empimg flex items-center justify-center">
        <User size={16} />
      </div>
      <span>{props.Employees}</span>
    </div>
  );
};

const LocationTemplate = (props: any) => {
  return (
    <div className="flex items-center gap-2">
      <MapPin size={16} className="text-blue-500" />
      <span>{props.Location}</span>
    </div>
  );
};

// --- MAIN COMPONENT ---

const OverviewGrid = () => {
  let gridInstance = useRef<GridComponent>(null);
  let ddObj = useRef<DropDownListComponent>(null);

  // Data Source (Remote Data)
  // Note: This connects to Syncfusion's demo server.
  // For your project, you will replace this with your Supabase logic later.
  const hostUrl: string = "https://ej2services.syncfusion.com/react/hotfix/";
  const data: DataManager = new DataManager({
    url: hostUrl + "api/UrlDataSource",
    adaptor: new UrlAdaptor(),
  });

  const query = new Query().addParams("dataCount", "1000");

  const ddlData = [
    { text: "1,000 Rows", value: "1000" },
    { text: "10,000 Rows", value: "10000" },
    { text: "100,000 Rows", value: "100000" },
  ];

  const onChange = (args: ChangeEventArgs) => {
    // This logic handles changing the number of rows (Virtual Scroll Demo logic)
    if (gridInstance.current && args.value) {
      gridInstance.current.query.params[0].value = args.value.toString();
      gridInstance.current.setProperties({ dataSource: data });
    }
  };

  const filterSettings: FilterSettingsModel = { type: "Menu" };
  const selectionSettings = {
    persistSelection: true,
    type: "Multiple",
    checkboxOnly: true,
  };

  return (
    <div className="control-pane p-4 bg-white rounded-lg shadow">
      <div className="control-section">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Overview Data Grid</h2>
          <DropDownListComponent
            id="games"
            width="220"
            dataSource={ddlData}
            index={0}
            ref={ddObj}
            change={onChange}
            placeholder="Select Data Range"
            popupHeight="240px"
          />
        </div>

        <GridComponent
          id="overviewgrid"
          dataSource={data}
          loadingIndicator={{ indicatorType: "Shimmer" }}
          query={query}
          enableHover={false}
          enableVirtualization={true}
          rowHeight={38}
          height="400"
          ref={gridInstance}
          filterSettings={filterSettings}
          allowFiltering={true}
          allowSorting={true}
          allowSelection={true}
          selectionSettings={selectionSettings as any}
        >
          <ColumnsDirective>
            <ColumnDirective
              type="checkbox"
              allowSorting={false}
              allowFiltering={false}
              width="60"
            ></ColumnDirective>
            <ColumnDirective
              field="EmployeeID"
              visible={false}
              isPrimaryKey={true}
              width="130"
            ></ColumnDirective>
            <ColumnDirective
              field="Employees"
              headerText="Employee Name"
              width="230"
              clipMode="EllipsisWithTooltip"
              template={EmpTemplate}
            />
            <ColumnDirective
              field="Designation"
              headerText="Designation"
              width="170"
              clipMode="EllipsisWithTooltip"
            />
            <ColumnDirective
              field="Mail"
              headerText="Mail"
              width="230"
            ></ColumnDirective>
            <ColumnDirective
              field="Location"
              headerText="Location"
              width="140"
              template={LocationTemplate}
            ></ColumnDirective>
            <ColumnDirective
              field="Status"
              headerText="Status"
              template={StatusTemplate}
              width="130"
            ></ColumnDirective>
            <ColumnDirective
              field="Trustworthiness"
              headerText="Trustworthiness"
              template={TrustTemplate}
              width="160"
            ></ColumnDirective>
            <ColumnDirective
              field="Rating"
              headerText="Rating"
              template={RatingTemplate}
              width="220"
            />
            <ColumnDirective
              field="Software"
              allowFiltering={false}
              allowSorting={false}
              headerText="Software Proficiency"
              width="180"
              template={ProgressTemplate}
            />
            <ColumnDirective
              field="CurrentSalary"
              headerText="Current Salary"
              width="160"
              format="C2"
            ></ColumnDirective>
            <ColumnDirective
              field="Address"
              headerText="Address"
              width="240"
              clipMode="EllipsisWithTooltip"
            ></ColumnDirective>
          </ColumnsDirective>
          <Inject services={[Filter, VirtualScroll, Sort, Selection]} />
        </GridComponent>
      </div>
    </div>
  );
};

export default OverviewGrid;
