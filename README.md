# NEOM Admin Dashboard

A modern, feature-rich admin dashboard for managing the NEOM E-commerce platform. Built with React, Material-UI, and Vite.

## Features

- 📊 Comprehensive dashboard with real-time statistics
- 📦 Product management
- 🏷️ Category management
- 👥 User management
- 📝 Order tracking and management
- 📈 Analytics and reporting
- 🔔 Real-time notifications
- 🎨 Modern and responsive UI

## Tech Stack

- React 18
- Material-UI v5
- Recharts for data visualization
- React Router v6
- Axios for API communication
- Vite for build tooling

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── pages/          # Route components
  ├── App.jsx         # Main application component
  └── main.jsx        # Application entry point
```

## API Integration

The dashboard connects to the NEOM backend API running on `http://localhost:3000`. Make sure the backend server is running before starting the dashboard.

## Development Guidelines

- Follow Material-UI best practices for component styling
- Implement proper error handling for API calls
- Maintain responsive design across all views
- Use TypeScript for new feature development

## Security

- JWT authentication for API requests
- Role-based access control
- Secure session management
- Protected admin routes

## Contributing

1. Create a feature branch
2. Implement changes
3. Submit a pull request

## License

MIT
