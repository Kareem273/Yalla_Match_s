# Elsewedy School System - Database Architecture

This repository contains the master T-SQL script for creating, configuring, and populating the `ElsewedySchoolSys` database. It is engineered to be a robust, single-source-of-truth for the entire database schema, ensuring consistency and reliability across all development and deployment environments.

The script performs a full teardown and rebuild, making it ideal for setting up a clean environment. It handles everything from dropping old objects to creating tables, defining complex relationships, and seeding the database with essential dummy data for immediate use.

## ✨ Key Features

-   **Idempotent & Robust Execution**: The script can be run multiple times without errors. It intelligently drops all existing objects, including foreign keys, in the correct order to prevent dependency conflicts.
-   **Comprehensive & Scalable Schema**: The database design covers a wide range of school management functionalities, with all primary keys set as `BIGINT` to support future growth.
-   **Soft Delete Implementation**: The schema uses a `StatusId` field in most tables instead of permanently deleting records, preserving data history and integrity.
-   **Role-Based Data Extensions**: Utilizes a one-to-one extension table pattern (e.g., `StudentExtension`) to keep the core `Account` table clean while accommodating role-specific attributes.
-   **Rich Dummy Data**: Comes pre-populated with a logical set of sample data, allowing developers to start working with a functional dataset right away.
-   **Full Arabic Language Support**: The database collation is set to `Arabic_100_CI_AI` for native support of Arabic characters, case-insensitivity, and accent-insensitivity.

## 📋 Prerequisites

-   Microsoft SQL Server (2017 or later recommended).
-   A SQL Server management tool, such as **SQL Server Management Studio (SSMS)** or Azure Data Studio.

## 🚀 Getting Started

Follow these steps to deploy the database:

1.  **Connect to your SQL Server instance** using SSMS or your preferred database client.
2.  **Open a New Query** window.
3.  **Copy the entire content** of the `ElsewedySchoolSys_Script.sql` file.
4.  **Paste the script** into the query window.
5.  **Execute the script** (press `F5` or click the `Execute` button).

After execution, the `ElsewedySchoolSys` database will be fully created, configured, and ready for application development. The script concludes by running `SELECT` queries on all tables to give you an immediate preview of the data.

---

## 🏛️ Database Architectural Concepts

### The Soft Delete Pattern

A core design principle in this database is the use of **Soft Deletion**. Instead of permanently removing records from the database using a `DELETE` statement, we mark them as inactive.

**How is it implemented?**

Almost every major table in this schema (e.g., `Account`, `Project`, `Task`, `Team`) contains a `StatusId` column. This column is a foreign key that references the `dbo.Status` table.

-   **To "delete" a record**, an application would update its `StatusId` to point to a status like 'Inactive' or 'Archived'.
-   **To retrieve active records**, queries must include a `WHERE` clause, for example: `WHERE StatusId = 1` (assuming '1' is the ID for the 'Active' status).

The `Account` table also includes an `IsActive` BIT flag as a quick and explicit way to disable a user's account, which works in tandem with the more descriptive `StatusId`.

**Why use Soft Deletion?**

1.  **Data Recovery**: Accidental deletions can be easily reversed by simply updating the `StatusId` back to 'Active'.
2.  **Audit Trail & History**: It preserves a complete history of all records ever created. This is critical for auditing, reporting, and understanding data lineage. For example, you can still see which projects a student was part of, even if the project is now "inactive".
3.  **Maintaining Relational Integrity**: Prevents the cascading delete issues or orphaned records that can occur when a parent record is permanently deleted. If a `Student` record was deleted, all their `StudentTask` and `TeamMember` records would remain intact, pointing to an inactive student.

---

## 🗄️ Schema Deep Dive

The database is organized into several logical domains:

### Core Entities & Security

These tables form the foundation of the system, managing users, roles, and statuses.

| Table | Purpose | Key Columns |
| :--- | :--- | :--- |
| **`Account`** | The central table for all users. Stores credentials and basic profile info. | `Id`, `NationalId`, `Email`, `PasswordHash`, `RoleId`, `StatusId` |
| **`Roles`** | A lookup table for user roles (e.g., 'SuperAdmin', 'Student', 'Teacher'). | `Id`, `RoleName` |
| **`Status`** | A lookup table for all statuses used in the system (e.g., 'Active', 'Pending'). | `Id`, `StatusName`, `BusinessEntity` |
| **`Login`** | Tracks user login events and credentials. | `Id`, `AccountId`, `Email` |

### Academic Structure

These tables define the school's organizational structure.

| Table | Purpose | Key Columns |
| :--- | :--- | :--- |
| **`Grade`** | Defines the academic grades or years (e.g., "Grade 10"). | `Id`, `GradeName`, `AdminAccountId` |
| **`Class`** | Represents a specific class within a grade (e.g., "Class 10-A"). | `Id`, `ClassName`, `GradeId` |
| **`Session`** | Defines academic sessions or terms (e.g., "Academic Year 2025-2026"). | `Id`, `SessionNo`, `FromDate`, `ToDate` |

### Projects, Teams, and Tasks

This group manages collaborative work and assignments.

| Table | Purpose | Key Columns |
| :--- | :--- | :--- |
| **`Project`** | Stores details about major academic projects. | `Id`, `NameEN`, `ProjectDescription`, `SupervisorAccountId` |
| **`Team`** | Defines student teams and links them to projects and classes. | `Id`, `TeamName`, `TeamLeaderAccountId`, `ProjectId`, `ClassId` |
| **`TeamMember`** | A linking table that assigns students (`Account`) to `Team`s. | `Id`, `TeamId`, `TeamMemberAccountId` |
| **`Task`** | Manages individual tasks or assignments. | `Id`, `TaskName`, `AssignedToID`, `GradeId`, `DueDate` |
| **`StudentTask`** | A linking table to track which students are assigned which tasks and their completion status. | `Id`, `StudentAccountId`, `TaskId`, `IsCompleted` |

### User Interaction & Support

Tables for managing communication, feedback, and administrative issues.

| Table | Purpose | Key Columns |
| :--- | :--- | :--- |
| **`Report`** | Allows users to submit reports, feedback, or bug reports. | `Id`, `Title`, `ReportMessage`, `SubmitterAccountId` |
| **`SubordinateTicket`** | A ticketing system for supervisors to report student issues (e.g., absence, lateness). | `Id`, `SupervisorAccountId`, `SubordinateAccountId`, `TicketTypeId` |
| **`TicketType`** | A lookup table for the types of tickets that can be created. | `Id`, `TicketTypeName` |
| **`Notifications`** | Stores system notifications for individual users. | `ID`, `Accountid`, `Title`, `Message` |

### User Profile & Extension Tables

These tables follow a one-to-one relationship with the `Account` table to store role-specific data without cluttering the main `Account` table.

| Table | Purpose | Key Columns |
| :--- | :--- | :--- |
| **`AdmissionProfile`** | Stores detailed data for student admission applications. | `AccountId`, `DateOfBirth`, `SoftwareInterviewScore` |
| **`StudentExtension`** | Stores data specific only to students (e.g., team leadership status). | `AccountId`, `IsLeader`, `ClassId` |
| **`ReviewerSupervisorExtension`** | Stores data for reviewers and supervisors. | `AccountId`, `AssignedClassId` |
| **`CapstoneSupervisorExtension`** | Stores data specific to capstone project supervisors. | `AccountId` |
| **`SuperAdminExtension`** | Stores data specific to super administrators. | `AccountId` |

### Configuration & Miscellaneous

| Table | Purpose | Key Columns |
| :--- | :--- | :--- |
| **`EmailSettings`** | Stores SMTP server configuration for sending emails from the system. | `Id`, `SmtpServer`, `SmtpPort`, `SmtpUsername` |
| **`Achievements`** | Stores information about awards and achievements. | `Id`, `Title`, `Description` |
| **`EmploymentRequests`** | Manages employment requests from external companies. | `Id`, `CompanyName`, `Specialization` |
| **`Scholarship`** | Manages scholarship information. | `Id`, `ScholarshipName`, `Amount`, `ProviderName` |
