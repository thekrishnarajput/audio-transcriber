export enum LoggerType {
  info = "info",
  error = "error",
  warn = "warn",
  debug = "debug",
}

export const printLogger = (
  type: LoggerType,
  message: string,
  functionName: string,
  subdomain?: string
): void => {
  const logMessage = `[${type.toUpperCase()}] [${functionName}]${subdomain ? ` [${subdomain}]` : ""} ${message}`;
  console.log(logMessage);
};
