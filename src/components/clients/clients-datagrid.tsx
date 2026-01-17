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
} from "@syncfusion/ej2-react-grids";
import { Browser } from "@syncfusion/ej2-base"; // Import for mobile check
import { UserType } from "@/lib/schemas/user";
import { ClientForm } from "./client-form";
import { useRef, useEffect } from "react";

interface GridProps {
  users: UserType[];
}

export default function ClientsDataGrid({ users }: GridProps) {
  const gridRef = useRef<GridComponent | null>(null);

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

  const editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true, // Note: You'll need a separate delete action logic for this later
    mode: "Dialog",
    template: dialogTemplate,
  };

  const toolbarOptions: ToolbarItems[] = ["Add", "Search"];

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

  return (
    <>
      <style>{`.e-dialog .e-footer-content { display: none !important; }`}</style>
      <GridComponent
        ref={gridRef}
        dataSource={users}
        editSettings={editSettings}
        toolbar={toolbarOptions}
        allowPaging={true}
        allowSorting={true}
        allowFiltering={true}
        actionComplete={actionComplete}
        height={400} // Optional height
      >
        <ColumnsDirective>
          <ColumnDirective
            field="user_id"
            isPrimaryKey={true}
            visible={false}
          />
          <ColumnDirective
            field="full_name"
            headerText="Full Name"
            width={150}
          />
          <ColumnDirective field="email" headerText="Email" width={180} />
          <ColumnDirective
            field="role"
            headerText="Role"
            width={120}
            template={roleTemplate}
            textAlign="Center"
          />
          <ColumnDirective
            field="phone_number"
            headerText="Phone"
            width={120}
            textAlign="Center"
          />
          <ColumnDirective
            headerText="Manage"
            width={100}
            commands={[
              {
                type: "Edit",
                buttonOption: { iconCss: "e-icons e-edit", cssClass: "e-flat" },
              },
            ]}
            textAlign="Center"
          />
        </ColumnsDirective>
        <Inject services={[Page, Sort, Filter, Toolbar, Edit, CommandColumn]} />
      </GridComponent>
    </>
  );
}
