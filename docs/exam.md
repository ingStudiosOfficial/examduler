<script setup>
import '@material/web/fab/fab.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/ripple/ripple.js';
import '@material/web/focus/md-focus-ring.js';
</script>

# Examination Docs

An examination provides details on the actual examination such as time, seating, and description.

## View an Examination

![Dashboard with examination created](/screenshots/homepage_with_exam.png)

Click on the examination on the dashboard to view examination details and seating.

![Examination dialog view](/screenshots/exam_view_dialog.png)

## Create an Examination

![Examduler dashboard](/screenshots/homepage.png)

Click <md-fab label="Create" class="inline-button"><md-icon slot="icon">add</md-icon></md-fab> and enter the examination details in the dialog.

![Examination dialog](/screenshots/exam_dialog.png)

Enter a name, date and description, then upload the seating as a CSV file. The seating should be formatted as shown below:

```csv
A1, youremail@yourdomain.com
A2, youremail@yourdomain.com
B1, youremail@yourdomain.com
C1, youremail@yourdomain.com
C2, youremail@yourdomain.com
```

| Seat | Email |
| :--: | :---: |
| A1 | youremail@yourdomain.com |
| A2 | youremail@yourdomain.com |
| B1 | youremail@yourdomain.com |
| C1 | youremail@yourdomain.com |
| C2 | youremail@yourdomain.com |

Lastly, click <md-fab class="inline-button"><md-icon slot="icon">check</md-icon></md-fab> and your examination should be created!

## Bulk Create Examinations

![Examination dialog](/screenshots/exam_dialog.png)

Firstly, click the <md-icon-button class="inline-button"><md-icon>file_copy</md-icon></md-icon-button> button on the top panel to switch to the bulk creation mode.

![Examination create multiple dialog view](/screenshots/exam_create_multiple_dialog.png)

There are 2 methods of bulk creating examinations.

::: details 1. Upload a JSON file
Press the <label class="file-upload-button inline-button" tabindex="0"><md-ripple></md-ripple><md-focus-ring style="--md-focus-ring-shape: 25px"></md-focus-ring><md-icon>upload</md-icon></label>
                button and upload a JSON file containing the examinations in the following format:

```json
[
    {
        "name": "Mid Term Examinations",
        "date": "2026-01-06T12:00:00Z",
        "description": "Please prepare for your mid-terms.",
        "seating": [
            [
                {
                    "seat": "A1",
                    "name": "Ethan Lee",
                    "email": "contact@ingstudios.dev"
                },
                {
                    "seat": "A2",
                    "name": "Person 1",
                    "email": "unique.email.01@example.com"
                },
                {
                    "seat": "A3",
                    "name": "Person 2",
                    "email": "unique.email.02@example.com"
                },
                {
                    "seat": "A4",
                    "name": "Person 3",
                    "email": "unique.email.03@example.com"
                },
                {
                    "seat": "A5",
                    "name": "Person 4",
                    "email": "unique.email.04@example.com"
                },
                {
                    "seat": "A6",
                    "name": "Person 5",
                    "email": "unique.email.05@example.com"
                },
                {
                    "seat": "A7",
                    "name": "Person 6",
                    "email": "unique.email.06@example.com"
                },
                {
                    "seat": "A8",
                    "name": "Person 7",
                    "email": "unique.email.07@example.com"
                }
            ],
            [
                {
                    "seat": "B1",
                    "name": "Person 8",
                    "email": "unique.email.08@example.com"
                }
            ],
            [
                {
                    "seat": "C1",
                    "name": "Person 9",
                    "email": "unique.email.09@example.com"
                },
                {
                    "seat": "C2",
                    "name": "Person 10",
                    "email": "unique.email.10@example.com"
                },
                {
                    "seat": "C3",
                    "name": "Person 11",
                    "email": "unique.email.11@example.com"
                },
                {
                    "seat": "C4",
                    "name": "",
                    "email": "",
                    "isBlank": true
                },
                {
                    "seat": "C5",
                    "name": "Person 12",
                    "email": "unique.email.12@example.com"
                }
            ]
        ]
    },
    {
        "_id": "69324bbfcd93fc363e047401",
        "name": "Year End Examinations",
        "date": "2026-01-06T12:00:00Z",
        "description": "Please prepare for your EOY.",
        "seating": [
            [
                {
                    "seat": "A1",
                    "name": "Ethan Lee",
                    "email": "contact@ingstudios.dev"
                }
            ]
        ]
    }
]
```
:::

::: details 2. Magic Paste
![Magic Paste](/screenshots/magic_paste.png)

Let AI format your examinations with Magic Paste. Paste text containing examination details and let AI extract the information and format it into the correct format.

::: info
All data is processed using Gemma 3 on our servers. No data is sent to third-party AI providers.
:::

![Edit examinations in the table](/screenshots/exam_create_multiple_table.png)

If you feel that the details need to be changed or reformatted, edit the examinations in the table. Once you are happy with your details, click <md-fab class="inline-button"><md-icon slot="icon">check</md-icon></md-fab> to create the examinations.

## Edit an Examination

![Examination dialog view](/screenshots/exam_view_dialog.png)

Click the <md-icon-button class="inline-button"><md-icon>edit</md-icon></md-icon-button> button in the examination dialog to get started.

![Examination edit dialog](/screenshots/exam_edit_dialog.png)

Edit any fields that need to be edited and click <md-fab class="inline-button"><md-icon slot="icon">check</md-icon></md-fab> to save your changes.

## Delete an Examination

![Examination dialog view](/screenshots/exam_view_dialog.png)

Open the examination dialog and click the <md-icon-button class="inline-button"><md-icon>delete</md-icon></md-icon-button> button.

::: danger
This action is irreversible! All seating information will be deleted, and students and teachers will not be able to view the examination anymore.
:::

<style scoped>
.file-upload-button {
    display: block;
    position: relative;
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    padding: 10px;
    border-radius: 25px;
    cursor: pointer;
    display: inline-block;
    box-sizing: border-box;
    text-align: center;
    height: 50px;
    outline: none;
    width: 20%;
}
</style>