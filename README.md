# Full-Stack CRUD Application (Go + React)

This is a complete full-stack application demonstrating a modern, decoupled architecture with a Go backend and a React/TypeScript frontend. It includes a full authentication lifecycle, role-based access control (RBAC), and CRUD (Create, Read, Update, Delete) functionality for products and user management.

## Features

- **Complete Authentication Lifecycle:**
  - User Registration with email activation.
  - Secure Login with JWT.
  - Secure, token-based Password Reset flow.
- **Role-Based Access Control (RBAC):**
  - `user` and `admin` roles.
  - Backend middleware protects admin-only API endpoints.
  - Frontend UI conditionally renders admin-specific links and pages.
- **Product Management:** Full CRUD functionality for products.
- **User Management (Admin):** A full-featured dashboard for admins to list, search, create, edit, and delete users.
- **Modern Tech Stack:** Go for the backend API, and React with TypeScript and Vite for a fast, type-safe frontend.
- **Comprehensive Testing:**
  - **Backend:** Unit and integration tests for services and repositories.
  - **Frontend:** Full integration test suite using React Testing Library and Mock Service Worker (MSW) to cover all major user flows.

## Tech Stack

| Area    | Technology                                                              |
|---------|-------------------------------------------------------------------------|
| **Backend**  | Go                                                                      |
| **Frontend** | React, TypeScript, Vite, Tailwind CSS                                   |
| **Database** | MySQL                                                                   |
| **Testing**  | **Go:** Standard `testing`, `testify` <br> **React:** Jest, React Testing Library, MSW |

## Project Structure

```
.
├── backend-go/         # Go API source code
└── frontend-react-ts/  # React/TypeScript SPA source code
```

## Getting Started

Follow these instructions to get the project running on your local machine.

### Prerequisites

- Go (version 1.18 or higher)
- Node.js (version 18.x or higher)
- `npm` or `yarn`

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend-go
    ```

2.  **Install dependencies:**
    ```bash
    go mod tidy
    ```

3.  **Run the server:**
    ```bash
    go run main.go
    ```

    The backend API will be running on `http://localhost:8080`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend-react-ts
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

    The frontend application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Running Tests

### Backend Tests

To run the unit tests for the Go service layer:

```bash
cd backend-go
go test ./...
```

### Frontend Tests

To run the integration and component tests for the React application:

```bash
cd frontend-react-ts
npm test
```

This will execute the Jest test suite, which uses React Testing Library and MSW to simulate user interactions and API calls without needing the Go backend to be running.

## API Endpoints

The backend exposes the following RESTful endpoints:

### Authentication (`/api/v1/auth`)
| Method | Endpoint             | Description                               |
|--------|----------------------|-------------------------------------------|
| `POST` | `/register`          | Register a new user (inactive)            |
| `POST` | `/activate`          | Activate a user account with a token      |
| `POST` | `/login`             | Log in a user and receive a JWT           |
| `POST` | `/forgot-password`   | Request a password reset link             |
| `POST` | `/reset-password`    | Set a new password using a reset token    |

### Admin (`/api/v1/admin`) - *Admin Role Required*
| Method | Endpoint             | Description                               |
|--------|----------------------|-------------------------------------------|
| `GET`    | `/users`             | Get a paginated list of all users         |
| `POST`   | `/users`             | Create a new user                         |
| `PUT`    | `/users/:id`         | Update an existing user's details         |
| `DELETE` | `/users/:id`         | Delete a user                             |

## License

This project is licensed under the MIT License.