# Database Setup Guide

## Issue
The error `database "apple" does not exist` occurs because:
1. The database configuration was looking for wrong environment variable names
2. The database might not exist yet

## Solution

### Step 1: Verify Environment Variables

Make sure your `.env` file in the `server` folder has the correct values:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=apple
DB_PASSWORD=reshal
DB_NAME=nexusretail
```

**Note**: The database name should be `nexusretail` (or whatever you want), NOT `apple`. `apple` is your PostgreSQL username.

### Step 2: Create the Database

You have two options:

#### Option A: Using the Setup Script (Recommended)

1. Make the script executable:
   ```bash
   chmod +x database/setup.sh
   ```

2. Run the setup script:
   ```bash
   cd server
   ./database/setup.sh
   ```

#### Option B: Manual Setup

1. Connect to PostgreSQL:
   ```bash
   psql -U apple -d postgres
   ```

2. Create the database:
   ```sql
   CREATE DATABASE nexusretail;
   ```

3. Exit PostgreSQL:
   ```sql
   \q
   ```

4. Run the schema:
   ```bash
   psql -U apple -d nexusretail -f database/schema.sql
   ```

### Step 3: Verify Database Connection

Test the connection:
```bash
psql -U apple -d nexusretail -c "SELECT COUNT(*) FROM sales;"
```

If this works without errors, your database is set up correctly!

### Step 4: Restart Your Server

After setting up the database, restart your Node.js server:
```bash
npm start
# or
npm run dev
```

## Troubleshooting

### Error: "role apple does not exist"
- Create the PostgreSQL user:
  ```bash
  createuser -s apple
  ```

### Error: "password authentication failed"
- Check your `.env` file has the correct password
- Or reset PostgreSQL password:
  ```sql
  ALTER USER apple WITH PASSWORD 'reshal';
  ```

### Error: "could not connect to server"
- Make sure PostgreSQL is running:
  ```bash
  # macOS
  brew services start postgresql
  
  # Linux
  sudo systemctl start postgresql
  
  # Or check status
  psql -U apple -d postgres -c "SELECT version();"
  ```

## Database Configuration Fixed

The `config/db.js` file has been updated to support both:
- `DB_*` environment variables (your current setup)
- `PG*` environment variables (PostgreSQL standard)

This ensures compatibility with your existing `.env` file.
