"use client";
import { useState, useRef } from "react";
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
import { PartnerForm } from "./partner-form";
import { CarFront, Phone } from "lucide-react";
import Image from "next/image";
import FleetPartnerReview from "./fleet-review";
import { deletePartner } from "@/actions/helper/delete-partner";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, Plus, Funnel, Star } from "lucide-react";
import { FleetPartnerType, CarOwnerType } from "@/lib/schemas/car-owner";
import { UserType } from "@/lib/schemas/user";

function FleetPartnersDataGrid({
  fleetPartners,
  onSelectPartner,
  carOwnerApplicants,
}: {
  fleetPartners: FleetPartnerType[];
  onSelectPartner: (partner: FleetPartnerType | null) => void;
  carOwnerApplicants: UserType[];
}) {
  const gridRef = useRef<GridComponent | null>(null);
  const applicantsRef = useRef(carOwnerApplicants);
  applicantsRef.current = carOwnerApplicants;

  //TEMPLATE: Syncfusion passes 'props' (the row data + isAdd flag) here
  function dialogTemplate(props: any) {
    return (
      <PartnerForm
        data={props}
        availableUsers={applicantsRef.current}
        closeDialog={() => {
          if (gridRef.current) {
            gridRef.current.closeEdit();
          }
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
      args.dialog.header =
        args.requestType === "add"
          ? "Add New Fleet Partner"
          : "Edit Partner Details";
      if (Browser.isDevice) {
        args.dialog.height = window.innerHeight - 90 + "px";
        (args.dialog as any).dataBind();
      }
    }
  }

  // THE KEY HANDLER
  const actionBegin = async (args: any) => {
    if (args.requestType === "save") {
      args.cancel = true; // Stop internal save
      const formData = new FormData();
      Object.keys(args.data).forEach((key) => {
        const value = args.data[key];
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      try {
        const result = await managePartner(
          { message: "", success: false },
          formData,
        );
        if (result.success) {
          gridRef.current?.closeEdit();
          // Refresh data if needed (usually handled by parent props updating)
        } else {
          alert("Error: " + result.message);
        }
      } catch (err) {
        console.error(err);
      }
    }
    // Delete logic goes here...
  };

  const editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    showDeleteConfirmDialog: true,
    showConfirmDialog: true,
    mode: "Dialog",
    template: dialogTemplate,
  };

  function profileTemplate(props: FleetPartnerType) {
    const profilePicture = props.profile_picture_url
      ? props.profile_picture_url
      : `https://ui-avatars.com/api/?name=${props.first_name}+${props.last_name}&background=random&color=fff`;
    return (
      <div>
        <div className="flex justify-start items-center gap-4">
          <div className="relative w-14 h-14">
            <Image
              key={profilePicture}
              src={profilePicture}
              alt="Profile"
              fill /* Fills the relative parent above */
              className="rounded-full object-cover border"
              sizes="40px"
            />
          </div>
          <div className="flex flex-col justify-center items-start">
            <h3 className="text-[0.9rem] font-semibold p-0 truncate max-w-37.5">
              {props.business_name ? props.business_name : props.full_name}
            </h3>
            <div className="flex items-center gap-2">
              <Star className="text-amber-400 fill-amber-400 w-4 h-4" />
              <h4 className="text-[0.8rem] font-medium text-foreground/50">
                4.8
              </h4>
              <div className="w-2 h-2 rounded-full bg-foreground/70"></div>
              <h4 className="text-[0.8rem] font-medium text-foreground/60">
                8 cars
              </h4>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Triggered when a row is clicked (To open side panel)
  const handleRecordClick = (args: RecordClickEventArgs) => {
    // Prevent opening if clicking a command column/button
    if ((args.target as HTMLElement).closest(".e-unboundcell")) return;
    onSelectPartner(args.rowData as FleetPartnerType);
  };

  const handleCloseDetail = () => {
    onSelectPartner(null);
    gridRef.current?.clearSelection();
  };

  // The Add Function (Programmatic)
  const handleAdd = () => {
    gridRef.current?.addRecord();
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    gridRef.current?.search(e.target.value);
  };

  return (
    <>
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
      <div className="flex flex-row-reverse px-4 pt-4">
        <Button
          onClick={handleAdd}
          className="bg-primary hover:bg-primary/60 shadow-md cursor-pointer h-7! text-[0.7rem] rounded-sm! p-1! px-2! mb-2 gap-1!"
        >
          <Plus className="text-secondary stroke-3" />
          Fleet Partner
        </Button>
      </div>
      <div className="flex items-center justify-between gap-2 mb-2 px-4">
        <div className="relative w-[90%] flex items-center gap-2">
          <Search className="absolute left-2 top-2.4 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search user..."
            className="pl-8 border-gray-300 rounded-sm text-xs! h-8"
            onChange={handleSearch}
          />
        </div>
        <Button variant="outline" className="bg-transparent! " size={"icon-sm"}>
          <Funnel className="text-foreground" />
        </Button>
      </div>
      <div className="h-[90%]">
        <GridComponent
          ref={gridRef}
          id="fleetPartnersGrid"
          dataSource={fleetPartners}
          editSettings={editSettings}
          allowSorting={true}
          allowSelection={true}
          selectionSettings={{ type: "Single", mode: "Row" }}
          recordClick={handleRecordClick} // <--- Triggers split view
          actionComplete={actionComplete}
          actionBegin={actionBegin}
          height="100%"
        >
          <ColumnsDirective>
            <ColumnDirective
              isPrimaryKey={true}
              field="car_owner_id"
              visible={false}
            />
            <ColumnDirective
              field="full_name"
              width="200"
              template={profileTemplate}
            />
            <ColumnDirective
              field="business_name"
              headerText="Business"
              width="150"
              visible={false}
            />
          </ColumnsDirective>
          <Inject services={[Sort, Filter, Edit, Selection, Page, Toolbar]} />
        </GridComponent>
      </div>
    </>
  );
}
export default FleetPartnersDataGrid;
