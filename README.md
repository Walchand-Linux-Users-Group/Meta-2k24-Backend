# WLUG Event Registration Backend

## Overview

This repository contains the source code for the event registration backend.

## Usage

To schedule an event:

```http
POST /api/schedule
```

```json
{
    "event": "Meta",
    "year": 2024,
    "start": 1541825600,
    "end": 1541825600,
    "uri": "sample mongo uri",
    "tech1": "golang",
    "tech2": "docker",
    "email_subject": "Registration Successful",
    "max_users": 100,
    "api_key": "---",
    "cloudinary_name":"---",
    "cloudinary_key" :"---",
    "cloudinary_secret" :"---",
    "fields": {
        "name": 1,
        "phone": 1,
        "email": 1,
        "college": 1,
        "yearOfstudy": 1,
        "isDualBooted": 1,
        "techOpted": 1,
        "paymentScreenshot": 1,
        "referralCode": 0
    }
}

```

To upload email body:

```http
POST /upload
```
```
curl -X POST -F "file=@./($tech1).html" http://server/upload 
curl -X POST -F "file=@./($tech2).html" http://server/upload 
curl -X POST -F "file=@./both.html" http://server/upload 

```


Sample Register for above config 

```
#!/bin/bash

curl -X POST http://server/api/register \
  -H "Content-Type: multipart/form-data" \
  -F "name=John Doe" \
  -F "phone=1234567210" \
  -F "email=test@example.com" \
  -F "college=ABC University" \
  -F "yearOfStudy=2024" \
  -F "isDualBooted=true" \
  -F "techOpted=both" \
  -F "referralCode=ABCD1234" \
  -F "image=@/home/smit/Pictures/Screenshots/testpng.jpeg"

```
```json 

{
    "name": "John Doe",
    "phone": "1234567210",
    "email": "test@example.com",
    "college": "ABC University",
    "yearOfstudy": "2024",
    "isDualBooted": "true",
    "techOpted": "both",
    "referralCode": "ABCD1234"
}

```
## Configuration

### Basic

Use year as `2024` , `2025` (4 digit year)
Use event name as one of the following
`Meta` `LinuxDiary` `OSD` `TechnoTweet`

### MongoDB URI

Make sure to replace `"mongo sample uri"` with your actual MongoDB connection string in the `uri` field.

### User Fields

The following fields are used for user registration:

```
"name"
"phone"
"email"
"college"
"yearOfstudy"
"isDualBooted"
"techOpted"
"paymentScreenshot"
"referralCode"

Use 1 is field is required.
Use 0 if field is optional.
Use -1 if field is to be omitted.

Note: "paymentScreenshot" is used to upload the payment screenshot. See the example above (image=@/home/smit/Pictures/Screenshots/testpng.jpeg)
```

### Registration Period

The registration period is defined from [start] to [end] unix time.

### Maximum Number of Users

The maximum number of users allowed.

