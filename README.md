# Full-Stack CRUD Application (Go + React)

This is a complete full-stack CRUD (Create, Read, Update, Delete) application for managing a list of products. The project is separated into a Go backend and a React/TypeScript frontend, demonstrating a modern, decoupled architecture.

## Features

- **Full CRUD Functionality:** Create, view, edit, and delete products.
- **Modern Frontend:** A responsive and interactive single-page application built with React, TypeScript, and Vite.
- **Robust Backend:** A clean and efficient API built with Go.
- **Client-Side State Management:** The UI updates in real-time after every operation.
- **Form Validation:** The product creation/update form includes client-side validation.
- **Comprehensive Testing:**
  - **Backend:** Unit tests for the service layer.
  - **Frontend:** Full integration test suite using React Testing Library and Mock Service Worker (MSW) to cover the entire user flow.

## Tech Stack

| Area    | Technology                                                              |
|---------|-------------------------------------------------------------------------|
| **Backend**  | Go                                                                      |
| **Frontend** | React, TypeScript, Vite, Tailwind CSS                                   |
| **Testing**  | **Go:** Standard `testing` package <br> **React:** Jest, React Testing Library, MSW |

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

| Method | Endpoint                | Description                 |
|--------|-------------------------|-----------------------------|
| `GET`    | `/api/products`         | Get all products            |
| `POST`   | `/api/products`         | Create a new product        |
| `PUT`    | `/api/products/:id`     | Update an existing product  |
| `DELETE` | `/api/products/:id`     | Delete a product            |

## License

This project is licensed under the MIT License.