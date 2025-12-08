/**
 * StatusScode - HTTP status codes with comments for project-wide usage.
 */
export const StatusScode = {
  // 2xx Success
  OK: 200, // 200 - OK (Request succeeded)
  CREATED: 201, // 201 - Created (Resource created)
  ACCEPTED: 202, // 202 - Accepted (Request accepted, processing pending)
  NO_CONTENT: 204, // 204 - No Content (No response body)

  // 4xx Client Errors
  BAD_REQUEST: 400, // 400 - Bad Request (Malformed request)
  UNAUTHORIZED: 401, // 401 - Unauthorized (Authentication required)
  FORBIDDEN: 403, // 403 - Forbidden (No permission)
  NOT_FOUND: 404, // 404 - Not Found (Resource not found)
  CONFLICT: 409, // 409 - Conflict (Resource conflict)

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: 500, // 500 - Internal Server Error
  NOT_IMPLEMENTED: 501, // 501 - Not Implemented
  BAD_GATEWAY: 502, // 502 - Bad Gateway
  SERVICE_UNAVAILABLE: 503, // 503 - Service Unavailable
} as const;
