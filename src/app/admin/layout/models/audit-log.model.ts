export interface AuditLog {
  LogID?: number;
  User: string;
  Action: string;
  Module: string;
  DateTime: string;
  IP: string;
}