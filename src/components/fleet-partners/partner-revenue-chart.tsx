import React from "react";
import RevenueLineChart from "../charts/LineChart";
import {
  DatePickerComponent,
  CalendarView,
} from "@syncfusion/ej2-react-calendars";

function PartnerRevenueChart() {
  const start: CalendarView = "Year";
  const depth: CalendarView = "Year";
  const format: string = "MMMM y";
  const dateValue: Date = new Date();
  return (
    <div className="w-[60%] h-72 bg-card rounded-md shadow-md p-3">
      <div className="flex items-start justify-between">
        <h3 className="text-foreground/90 text-md font-semibold">
          Revenue Trend
        </h3>
        <div className="w-[30%]">
          <DatePickerComponent
            value={dateValue}
            start={start}
            depth={depth}
            format={format}
          ></DatePickerComponent>
        </div>
      </div>
      <RevenueLineChart />
    </div>
  );
}

export default PartnerRevenueChart;
