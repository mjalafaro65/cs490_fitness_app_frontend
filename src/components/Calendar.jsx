import { useState } from "react";

function WorkoutCalendar({ plans = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Month name
  const monthName = currentDate.toLocaleString("default", {
    month: "long",
  });

  // First day of month (0 = Sunday)
  const firstDay = new Date(year, month, 1).getDay();

  // Total days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // generate calendar grid
  const generateCalendar = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const rows = [];
    let cells = [];

    // empty cells at start
    for (let i = 0; i < firstDay; i++) {
      cells.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(year, month, d));
      if (cells.length === 7) {
        rows.push(cells);
        cells = [];
      }
    }

    if (cells.length > 0) {
      while (cells.length < 7) cells.push(null);
      rows.push(cells);
    }

    return rows;
  };

  const calendar = generateCalendar(year, month);

  return (
    <div className="card bg-base-300 rounded-box p-4">
      <h2 className="text-lg font-bold mb-2">Workout Calendar</h2>

      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <button
          className="btn btn-sm"
          onClick={() =>
            setCurrentDate(
              new Date(current.getFullYear(), current.getMonth() - 1, 1)
            )
          }
        >
          ←
        </button>

        <span className="font-semibold text-lg">
          {monthName}
          {year}
        </span>

        <button
          className="btn btn-sm"
          onClick={() =>
            setCurrent(
              new Date(current.getFullYear(), current.getMonth() + 1, 1)
            )
          }
        >
          →
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-2 text-center text-sm font-bold mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Days */}
      {calendar.map((week, i) => (
        <div key={i} className="grid grid-cols-7 gap-2 text-center">
          {week.map((day, idx) => {
            const isToday =
              day &&
              new Date().toDateString() === day.toDateString();

            const isSelected =
              day &&
              selectedDate &&
              day.toDateString() === selectedDate.toDateString();

            const hasWorkout =
              day &&
              plans.some((plan) =>
                plan.days?.some((planDay) => {
                  if (!planDay.session_time) return false;
                  return (
                    new Date(planDay.session_time).toDateString() ===
                    day.toDateString()
                  );
                })
              );

            return (
              <div
                key={idx}
                onClick={() => day && setSelectedDate(day)}
                className={`p-2 rounded cursor-pointer transition
                  ${
                    isSelected
                      ? "bg-accent text-white"
                      : isToday
                      ? "bg-primary text-white"
                      : hasWorkout
                      ? "bg-secondary text-white"
                      : "bg-base-200"
                  }
                `}
              >
                {day ? day.getDate() : ""}
              </div>
            );
          })}
        </div>
      ))}
      {selectedDate && (
  <div className="mt-4">
    <h3 className="font-bold mb-2">
      Workouts on {selectedDate.toDateString()}
    </h3>

    {plans.flatMap((plan) =>
      plan.days?.filter((d) => {
        if (!d.session_time) return false;
        return (
          new Date(d.session_time).toDateString() ===
          selectedDate.toDateString()
        );
      }) || []
    ).length === 0 ? (
      <p className="text-sm opacity-70">No workouts</p>
    ) : (
      <div className="flex flex-col gap-2">
        {plans.flatMap((plan) =>
          plan.days?.filter((d) => {
            if (!d.session_time) return false;
            return (
              new Date(d.session_time).toDateString() ===
              selectedDate.toDateString()
            );
          }) || []
        ).map((w, i) => (
          <div key={i} className="p-2 bg-base-200 rounded">
            {w.day_label || "Workout Day"}
          </div>
        ))}
      </div>
    )}
  </div>
)}
    </div>
  );
}

export default WorkoutCalendar;