-- HelpNear Database Schema (Day 1 - Day 3)
-- Database: helpnear_db

CREATE DATABASE IF NOT EXISTS helpnear_db;
USE helpnear_db;

-- 1. Users Table (Day 1 & Day 2)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Provider Profiles Table (Day 3)
CREATE TABLE IF NOT EXISTS provider_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    business_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    description TEXT,
    address VARCHAR(255),
    city VARCHAR(100),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_verified BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Service Categories Table (Day 3)
CREATE TABLE IF NOT EXISTS service_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Provider Services Relationship Table (Day 3)
CREATE TABLE IF NOT EXISTS provider_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT NOT NULL,
    service_category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES provider_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (service_category_id) REFERENCES service_categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_provider_service (provider_id, service_category_id)
);

