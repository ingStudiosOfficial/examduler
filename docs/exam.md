<script setup>
import '@material/web/fab/fab.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
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

## Delete an Examination

![Examination dialog view](/screenshots/exam_view_dialog.png)

Open the examination dialog and click the <md-icon-button class="inline-button"><md-icon>delete</md-icon></md-icon-button> button.

::: danger
This action is irreversible! All seating information will be deleted, and students and teachers will not be able to view the examination anymore.
:::