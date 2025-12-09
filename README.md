# Project Walkthrough & Run Guide

This guide details how to set up and run the Binary MLM application, which consists of a Node.js/Express backend and a React/Vite frontend.

## Prerequisites

Before starting, ensure you have the following installed:
- **Node.js** (v16+ recommended)
- **MongoDB** (Must be running locally on default port `27017` or configured via `MONGO_URI`)

---

## 1. Backend Setup

The backend handles the API, authentication, and database connections.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    The backend uses `dotenv`. You can create a `.env` file in the `backend` directory if you wish to override defaults, but it runs out-of-the-box with:
    - **Port**: `5000`
    - **MongoDB URI**: `mongodb://localhost:27017/mlm`
    - **JWT Secret**: `secret`

    *Example `.env` content (optional):*
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/mlm
    JWT_SECRET=your_super_secret_key
    ```

4.  **Start the Server:**
    For development (with hot-reload via nodemon):
    ```bash
    npm run dev
    ```
    *Or for standard start:*
    ```bash
    npm start
    ```

    You should see:
    ```
    MongoDB Connected
    Server running on port 5000
    ```

---

## 2. Frontend Setup

The frontend is a React application powered by Vite.

1.  **Navigate to the frontend directory:**
    Open a new terminal window (keep the backend running) and run:
    ```bash
    cd frontend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **API Configuration:**
    The frontend is configured to communicate with the backend at `http://localhost:5000/api/v1/` by default (defined in `src/store/api.ts`). Ensure your backend is running on this port.

4.  **Start the Development Server:**
    ```bash
    npm run dev
    ```

    You will see output similar to:
    ```
    VITE v5.0.8  ready in 250 ms

    ➜  Local:   http://localhost:5173/
    ```

5.  **Access the App:**
    Open your browser and navigate to `http://localhost:5173/`.

---

## Troubleshooting

-   **MongoDB Connection Error**: Ensure your local MongoDB service is running (`mongod`).
-   **API Connection Failed**: Check if the backend is running on port `5000`. If you changed the backend port, update `frontend/src/store/api.ts` to match.
-   **Login Issues**: Ensure you have registered a user or seeded the database. The initial "root" user might need to be created via the registration page or directly in the DB if not handled by a seed script.

## Screenshots

<img width="1915" height="913" alt="image" src="https://github.com/user-attachments/assets/8a0a580f-de98-49e0-ae99-e968eb70f4fb" />
<img width="1919" height="909" alt="image" src="https://github.com/user-attachments/assets/8dc052d3-44b4-4727-ae71-e0ec5211aeb5" />
<img width="1919" height="911" alt="image" src="https://github.com/user-attachments/assets/a09b87d1-75ab-4355-ba40-312ab490bfb5" />
<img width="1919" height="919" alt="image" src="https://github.com/user-attachments/assets/c84b8aa1-8516-4b54-99f1-e6d518d0ba2f" />
<img width="1905" height="908" alt="image" src="https://github.com/user-attachments/assets/2f3799fe-8e6e-4f81-b547-9d801abb1b42" />
<img width="1919" height="910" alt="image" src="https://github.com/user-attachments/assets/9252b3f6-7680-4452-9d56-1df032c7cae3" />




