"use client";

import { useRef, forwardRef } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Filter,
  EditSettingsModel,
  Toolbar,
  Sort,
  Page,
  Edit,
  Selection,
  RecordClickEventArgs,
  DialogEditEventArgs,
} from "@syncfusion/ej2-react-grids";
import { Browser } from "@syncfusion/ej2-base";
import { PartnerForm } from "./partner-form";
import Image from "next/image";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, Plus, Funnel, Star } from "lucide-react";
import { FleetPartnerType } from "@/lib/schemas/car-owner";
import { useFleetPartners } from "../../../hooks/use-fleetPartners"; // Verify this path matches your folder structure

// Wrap with forwardRef to allow the parent to trigger Edit
const FleetPartnersDataGrid = forwardRef<
  GridComponent,
  { onSelectPartner: (partner: FleetPartnerType | null) => void }
>(({ onSelectPartner }, ref) => {
  // Use React Query Hook
  // Note: We don't need deletePartner here anymore since the delete button is in the Header
  const { data: partners, isLoading } = useFleetPartners();

  // TEMPLATE: Syncfusion passes 'props' (the row data + isAdd flag) here
  function dialogTemplate(props: any) {
    // If car_owner_id is missing, it's a new record
    const isAdd = !props.car_owner_id;
    return (
      <PartnerForm
        data={{ ...props, isAdd }}
        closeDialog={() => {
          // @ts-ignore - ref.current might be null, safety check handled by logic
          if (ref && "current" in ref && ref.current) {
            ref.current.closeEdit();
          }
        }}
      />
    );
  }

  // ACTION COMPLETE: Handle Dialog Sizing/Header
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

  // We are using custom saving in the Form, so we just need to prevent default saving behavior
  const actionBegin = async (args: any) => {
    // No internal logic needed here anymore, handled by PartnerForm
  };

  const editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: "Dialog",
    template: dialogTemplate,
  };

  function profileTemplate(props: FleetPartnerType) {
    const user = props.users;
    const profilePicture = user?.profile_picture_url
      ? user.profile_picture_url
      : `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=random&color=fff`;
    return (
      <div>
        <div className="flex justify-start items-center gap-4">
          <div className="relative w-14 h-14">
            <Image
              src={profilePicture}
              alt="Profile"
              fill
              className="rounded-full object-cover border"
              sizes="40px"
            />
          </div>
          <div className="flex flex-col justify-center items-start">
            <h3 className="text-[0.9rem] font-semibold p-0 truncate max-w-37.5">
              {props.business_name || user?.full_name}
            </h3>
            <div className="flex items-center gap-2">
              <Star className="text-amber-400 fill-amber-400 w-4 h-4" />
              <h4 className="text-[0.8rem] font-medium text-foreground/50">
                {user?.trust_score || 5.0}
              </h4>
              <div className="w-2 h-2 rounded-full bg-foreground/70"></div>
              <h4 className="text-[0.8rem] font-medium text-foreground/60">
                {props.total_units} cars
              </h4>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleRecordClick = (args: RecordClickEventArgs) => {
    onSelectPartner(args.rowData as FleetPartnerType);
  };

  // The Add Function (Programmatic)
  const handleAdd = () => {
    // @ts-ignore
    if (ref && ref.current) {
      // @ts-ignore
      ref.current.addRecord();
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    // @ts-ignore
    if (ref && ref.current) {
      // @ts-ignore
      ref.current.search(e.target.value);
    }
  };

  return (
    <>
      <style>
        {`
          /* Hide footer ONLY for the custom Add/Edit form */
          #fleetPartnersGrid_dialogEdit_wrapper.e-dialog .e-footer-content { 
            display: none !important; 
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
          ref={ref} // 👈 Attach the forwarded ref here
          id="fleetPartnersGrid"
          dataSource={partners || []}
          editSettings={editSettings}
          allowSorting={true}
          allowSelection={true}
          selectionSettings={{ type: "Single", mode: "Row" }}
          recordClick={handleRecordClick}
          actionComplete={actionComplete}
          actionBegin={actionBegin}
          loadingIndicator={{ indicatorType: "Shimmer" }}
          height="100%"
        >
          <ColumnsDirective>
            <ColumnDirective
              isPrimaryKey={true}
              field="car_owner_id"
              visible={false}
            />
            <ColumnDirective
              field="users.full_name"
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
});

FleetPartnersDataGrid.displayName = "FleetPartnersDataGrid";
export default FleetPartnersDataGrid;
