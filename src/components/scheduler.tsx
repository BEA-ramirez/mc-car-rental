"use client";
import { timelineResourceData } from "@/constants/datasource";
import {
  Week,
  Month,
  Agenda,
  ScheduleComponent,
  ViewsDirective,
  ViewDirective,
  EventSettingsModel,
  ResourcesDirective,
  ResourceDirective,
  Inject,
  TimelineViews,
  Resize,
  DragAndDrop,
  TimelineMonth,
} from "@syncfusion/ej2-react-schedule";

function Scheduler() {
  const eventSettings: EventSettingsModel = {
    dataSource: timelineResourceData,
  };

  const carsData = [
    { text: "Toyota Vios", id: 1, color: "#ea7a57" },
    { text: "Honda Civic", id: 2, color: "#7fa900" },
    { text: "Mitsubishi Mirage", id: 3, color: "#5978ee" },
    { text: "Hyundai Accent", id: 4, color: "#df5286" },
  ];

  // Rental bookings
  const bookingsData = [
    {
      Id: 1,
      Subject: "John Doe",
      StartTime: new Date(2024, 10, 11, 9, 0), // Nov 11, 9 AM
      EndTime: new Date(2024, 10, 12, 9, 0), // Nov 12, 9 AM (1 day rental)
      IsAllDay: false,
      CarId: 1,
      Description: "Contact: 0912-345-6789",
    },
    {
      Id: 2,
      Subject: "Jane Smith",
      StartTime: new Date(2024, 10, 11, 14, 0), // Nov 11, 2 PM
      EndTime: new Date(2024, 10, 13, 14, 0), // Nov 13, 2 PM (2 day rental)
      IsAllDay: false,
      CarId: 2,
      Description: "Contact: 0923-456-7890",
    },
    {
      Id: 3,
      Subject: "Mike Johnson",
      StartTime: new Date(2024, 10, 11, 10, 0),
      EndTime: new Date(2024, 10, 11, 18, 0), // Same day return
      IsAllDay: false,
      CarId: 3,
      Description: "Half-day rental",
    },
  ];

  return (
    <>
      <h2>Schedule</h2>
      <ScheduleComponent
        width="100%"
        height="550px"
        selectedDate={new Date(2024, 10, 11)}
        eventSettings={{
          dataSource: bookingsData,
          enableTooltip: true,
        }}
        startHour="06:00" // Start display at 6 AM
        endHour="22:00" // End display at 10 PM
        timeScale={{
          enable: true,
          interval: 60, // 1 hour intervals
          slotCount: 2, // Split into 30-min slots
        }}
      >
        <ViewsDirective>
          <ViewDirective option="TimelineDay" />
          <ViewDirective option="TimelineWeek" />
          <ViewDirective option="TimelineMonth" />
        </ViewsDirective>

        <Inject services={[TimelineViews, TimelineMonth]} />
      </ScheduleComponent>
    </>
  );
}

export default Scheduler;
