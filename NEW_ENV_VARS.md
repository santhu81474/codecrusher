# New Environment Variables

This file documents all environment variables required for the CodeCrusher platform.

## Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `PORT` | ❌ | Server port (default: 5001) |

## Frontend (`.env` or `.env.local`)

| Variable | Required | Description |
|---|---|---|
| `VITE_BACKEND_URL` | ❌ | Backend URL override (default: `http://localhost:5001`). Used for Socket.io connections. |

## Notes

- All existing environment variables remain unchanged.
- No new environment variables were introduced in this update.
- The `VITE_BACKEND_URL` variable was already referenced in `api.js` and is now also used in CodeCast and ChallengeRooms for Socket.io connections.
- Note: Remember to restart the development server after making changes to any environment variables.
