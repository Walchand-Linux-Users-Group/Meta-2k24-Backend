# WLUG Event Registration Backend

## Overview

This repository contains the source code for the event registration backend.

## Usage

Hit the following endpoint to register a user [event must be scheduled first]:

```http
POST /register
```

```json
{
    "name": "SMI11T",
    "phone": "9545236151",
    "email": "SMI203.sb@GMAIL.COM",
    "college": "ASDAS",
    "yearOfstudy": "24"
}
```

Hit the following endpoint to schedule an event:

```http
POST /schedule
```

```json
{
  "event": "Meta",
  "year": 2024,
  "start": 1541825600,
  "end": 1841854400,
  "uri": "mongo sample uri",
  "email": "osd2023.wcewlug@gmail.com",
  "email_subject": "Your registration was successful",
  "email_body": "This is a sample email body.",
  "email_appkey": "16 digit appkey",
  "max_users": 100,
  "fields": {
    "name": 1,
    "phone": 1,
    "email": 1,
    "college": 0,
    "yearOfstudy": 0,
    "isDualBooted": -1,
    "referralCode": -1
  }
}
```

## Configuration

### Basic

Use year as `2024` , `2025` (4 digit year)
Use event name as one of the following
`Meta` `LinuxDiary` `OSD` `TechnoTweet`

### MongoDB URI

Make sure to replace `"mongo sample uri"` with your actual MongoDB connection string in the `uri` field.

### Email Configuration

- **Email:** [Sender email]
- **Email Subject:** [Email subject]
- **Email Body:** [Email body]
- **Email App Key:** [Your 16-digit app key]

### User Fields

The following fields are used for user registration:

```json
Name:
Phone:
Email:
College:
Year of Study:
Is Dual Booted:
Referral Code:

Use 1 is field is required.
Use 0 if field is optional.
Use -1 if field is to be omitted.
```

### Registration Period

The registration period is defined from [start] to [end] unix time.

### Maximum Number of Users

The maximum number of users allowed.

