#!/bin/bash

# Database Setup Script for HopDrop Admin Panel
# This script creates the database and tables if they don't exist

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

DB_NAME=${DB_NAME:-nexusretail}
DB_USER=${DB_USER:-apple}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

echo "Setting up database: $DB_NAME"
echo "User: $DB_USER"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo ""

# Check if database exists
DB_EXISTS=$(psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null)

if [ "$DB_EXISTS" = "1" ]; then
    echo "Database '$DB_NAME' already exists."
else
    echo "Creating database '$DB_NAME'..."
    psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "Database '$DB_NAME' created successfully!"
    else
        echo "Error: Could not create database. Please check your PostgreSQL connection."
        exit 1
    fi
fi

# Create tables
echo ""
echo "Creating tables..."
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -f schema.sql 2>/dev/null

if [ $? -eq 0 ]; then
    echo "Tables created successfully!"
    echo ""
    echo "Setup complete! You can now use the API."
else
    echo "Error: Could not create tables. Please check the schema.sql file."
    exit 1
fi
