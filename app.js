// Passenger / cPanel startup entry point.
// Phusion Passenger boots this file and captures the http.Server created by
// server.ts (reverse port binding). Locally the same file runs via `npm start`.
import './dist/server.cjs';