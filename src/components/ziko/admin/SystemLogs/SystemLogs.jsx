import React from "react";
import { SystemLogsContainer, LogsArea } from "../../../../styles/ziko/admin/SystemLogs.styles"; // Adjusted import path
import { Title } from "../../../../styles/ziko/admin/SharedStyles"; // Adjusted import path

const dummyLogs = [
  "[INFO] 2023-11-20 08:30:01 - User 'admin' logged in from 192.168.1.100",
  "[WARNING] 2023-11-20 08:31:15 - Failed login attempt for user 'editor' from 10.0.0.5",
  "[ERROR] 2023-11-20 08:32:03 - Database connection error: Connection refused",
  "[INFO] 2023-11-20 08:35:40 - New user 'John Doe' registered.",
  "[DEBUG] 2023-11-20 08:40:00 - API endpoint '/users' accessed by 'admin'.",
  "[WARNING] 2023-11-20 08:42:05 - High memory usage detected on server 'app-01'.",
  "[INFO] 2023-11-20 08:45:10 - Content 'New Article' published by 'editor'.",
  "[ERROR] 2023-11-20 08:50:00 - Critical service 'AuthService' failed to start.",
  "[INFO] 2023-11-20 08:55:22 - User 'Jane Smith' updated profile details.",
  "[WARNING] 2023-11-20 08:58:30 - Backup process completed with minor errors.",
  "[INFO] 2023-11-20 09:00:00 - Scheduled task 'cleanup' executed successfully.",
  "[INFO] 2023-11-20 09:05:00 - User 'admin' logged out.",
  "[ERROR] 2023-11-20 09:10:00 - Unhandled exception in 'UserService' module.",
  "[INFO] 2023-11-20 09:15:00 - System heartbeat detected, all services operational.",
];

const SystemLogs = () => {
  const logsContent = dummyLogs.join("\n");

  return (
    <SystemLogsContainer>
      <Title>System Logs</Title>
      <LogsArea readOnly value={logsContent} />
    </SystemLogsContainer>
  );
};

export default SystemLogs;