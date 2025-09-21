import React from "react";
import "./Sectograph.css";

interface Task {
  id: string;
  text: string;
  startTime: number; // Hour in 24-hour format (0-23)
  duration: number; // Duration in hours
  completed: boolean;
}

interface SectographProps {
  tasks: Task[];
  selectedDate: Date;
}

export const Sectograph: React.FC<SectographProps> = ({
  tasks,
  selectedDate,
}) => {
  const radius = 80;
  const centerX = 100;
  const centerY = 100;
  const innerRadius = 60;

  // Create hour markers
  const createHourMarker = (hour: number) => {
    const angle = (hour * 15 - 90) * (Math.PI / 180); // 15 degrees per hour, start at 12 o'clock
    const x1 = centerX + innerRadius * Math.cos(angle);
    const y1 = centerY + innerRadius * Math.sin(angle);
    const x2 = centerX + radius * Math.cos(angle);
    const y2 = centerY + radius * Math.sin(angle);

    return (
      <g key={hour}>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="var(--black)"
          strokeWidth={hour % 6 === 0 ? "2" : "1"}
        />
        {hour % 6 === 0 && (
          <text
            x={centerX + (radius + 10) * Math.cos(angle)}
            y={centerY + (radius + 10) * Math.sin(angle)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8"
            fontFamily="Press Start 2P"
            fill="var(--black)"
          >
            {hour === 0 ? "12" : hour > 12 ? hour - 12 : hour}
            {hour < 12 ? "AM" : "PM"}
          </text>
        )}
      </g>
    );
  };

  // Create task arcs
  const createTaskArc = (task: Task, index: number) => {
    const startAngle = (task.startTime * 15 - 90) * (Math.PI / 180);
    const endAngle =
      ((task.startTime + task.duration) * 15 - 90) * (Math.PI / 180);

    const x1 = centerX + innerRadius * Math.cos(startAngle);
    const y1 = centerY + innerRadius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(startAngle);
    const y2 = centerY + radius * Math.sin(startAngle);

    const x3 = centerX + radius * Math.cos(endAngle);
    const y3 = centerY + radius * Math.sin(endAngle);
    const x4 = centerX + innerRadius * Math.cos(endAngle);
    const y4 = centerY + innerRadius * Math.sin(endAngle);

    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `L ${x2} ${y2}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x3} ${y3}`,
      `L ${x4} ${y4}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`,
      "Z",
    ].join(" ");

    const colors = [
      "var(--dark-orange)",
      "var(--light-yellow)",
      "var(--darker-orange)",
      "var(--cream)",
    ];

    const color = task.completed
      ? "rgba(199, 93, 44, 0.3)"
      : colors[index % colors.length];

    return (
      <path
        key={task.id}
        d={pathData}
        fill={color}
        stroke="var(--black)"
        strokeWidth="1"
        opacity={task.completed ? 0.5 : 1}
      />
    );
  };

  return (
    <div className="sectograph-container">
      <div className="sectograph-header">
        <h3>Daily Schedule</h3>
        <p>{selectedDate.toLocaleDateString()}</p>
      </div>

      <div className="sectograph-chart">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="var(--cream)"
            stroke="var(--black)"
            strokeWidth="2"
          />

          {/* Inner circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={innerRadius}
            fill="var(--light-yellow)"
            stroke="var(--black)"
            strokeWidth="2"
          />

          {/* Hour markers */}
          {Array.from({ length: 24 }, (_, i) => createHourMarker(i))}

          {/* Task arcs */}
          {tasks.map((task, index) => createTaskArc(task, index))}

          {/* Center dot */}
          <circle cx={centerX} cy={centerY} r="3" fill="var(--black)" />
        </svg>
      </div>

      <div className="sectograph-legend">
        {tasks.length === 0 ? (
          <p className="no-tasks">No scheduled tasks</p>
        ) : (
          <div className="task-list">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className={`task-item ${task.completed ? "completed" : ""}`}
              >
                <div
                  className="task-color"
                  style={{
                    backgroundColor: task.completed
                      ? "rgba(199, 93, 44, 0.3)"
                      : [
                          "var(--dark-orange)",
                          "var(--light-yellow)",
                          "var(--darker-orange)",
                          "var(--cream)",
                        ][index % 4],
                  }}
                />
                <span className="task-time">
                  {task.startTime}:00 - {task.startTime + task.duration}:00
                </span>
                <span className="task-text">{task.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
