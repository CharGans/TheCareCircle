# Permissions System Setup

## Overview
The new granular permissions system allows circle owners to control which sections each member can access.

## Database Migration

Run the migration to add the permissions table:

```bash
node server/db/migrate-permissions.js
```

## Features

### Permissions Available
- **Calendar**: View and manage events
- **Messages**: Access chat functionality
- **Care Plan**: View medications and care notes
- **Checklist**: View and manage tasks
- **Providers**: View healthcare providers
- **Members**: View members list (owner only for management)

### Default Behavior
- All permissions default to `true` (full access)
- Owner always has all permissions
- Permissions are editable by the owner only

## Usage

### For Owners
1. Navigate to Members page
2. Click "Permissions" button on any member card
3. Toggle checkboxes to grant/revoke access
4. Click "Save" to apply changes

### For Members
- Navigation only shows sections you have access to
- Attempting to access restricted pages shows "Access Denied"

## API Endpoints

- `GET /api/permissions/:circleId/members/:userId` - Get member permissions
- `PUT /api/permissions/:circleId/members/:userId` - Update member permissions
- `GET /api/permissions/:circleId/my-permissions` - Get current user permissions
