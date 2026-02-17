# iCal Subscription Feature - Database Migration

To enable the iCal subscription feature, run this SQL migration:

```bash
psql -d your_database_name -f server/db/add_ical_token.sql
```

Or manually run this SQL command in your database:

```sql
ALTER TABLE care_circles ADD COLUMN IF NOT EXISTS ical_token VARCHAR(64) UNIQUE;
```

This adds a unique token column to the care_circles table that will be used to generate private iCal subscription URLs.
