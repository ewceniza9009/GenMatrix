# Database Seeding Guide

This guide explains how to populate the database with initial test data (Admin, Root Distributor, Leaders, and Users).

**WARNING: Running the seed script will DELETE all existing data in the database.**

## Prerequisites

-   Ensure **MongoDB** is running.
-   Ensure you are in the `backend` directory.

## How to Seed

1.  Open a terminal in the `backend` folder:
    ```bash
    cd backend
    ```

2.  Run the seed script using `ts-node`:
    ```bash
    npx ts-node scripts/seed-data.ts
    ```

3.  **Expected Output:**
    ```
    Connected to DB
    Cleared DB
    Created Admin (admin@demo.com / password)
    ...
    Seeding Complete
    ```

## Verification

To verify that the data has been seeded correctly:

1.  Run the verification script:
    ```bash
    npx ts-node scripts/verify-db.ts
    ```

2.  It should list the created users.

---

**Troubleshooting:**
-   If you see `EADDRINUSE`, it means the server is running. You can still run the seed script locally in a separate terminal window, or stop the server first.
-   Ensure `MONGO_URI` in `.env` is correct if not using localhost.
