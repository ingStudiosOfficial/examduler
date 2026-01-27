<script setup lang="ts">
import '@material/web/button/filled-button.js';
import '@material/web/fab/fab.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
</script>

# Organization Docs

An organization groups users, domains, and exams under a single administrative unit.

## View an Organization

![Examduler dashboard](/screenshots/homepage.png)

Click on the organization you want to view.

![Organization dialog](/screenshots/org_dialog.png)

## Create an Organization

![Organization create dialog](/screenshots/org_create_dialog.png)

Click <md-filled-button class="inline-button">Create an organization</md-filled-button> and fill in the details in the dialog. Click <md-filled-button class="inline-button">Add a domain</md-filled-button> to add a domain.

::: warning
You need at least 1 domain to create an organization.
:::

Next, add members by uploading a CSV file formatted as such:

```csv
Mr John Doe, johndoe@yourdomain.com, admin
Teacher Jane Doe, janedoe@yourdomain.com, teacher
Student Jeffery Doe, jeffdoe@student.yourdomain.com, student
```

| Name | Email | Role |
| :--: | :---: | :--: |
| Mr John Doe | johndoe@yourdomain.com | admin |
| Teacher Jane Doe | janedoe@yourdomain.com | teacher |
| Student Jeffery Doe | jeffdoe@student.yourdomain.com | student |

::: warning
Members will not be able to join the organization unless you verify the domain in the organization settings.
:::

::: info
You can have members with different domains/subdomains (e.g. johndoe@yourdomain.com and jeffdoe@student.yourdomain.com).
:::

## Edit an Organization

![Organization dialog](/screenshots/org_dialog.png)

Click on the organization you want to edit to open it up in a dialog. Modify the details and click <md-fab class="inline-button"><md-icon slot="icon">check</md-icon></md-fab> to save your changes.

## Roles

Each user can be assigned a different role level. The following role levels are:

| Role | Examination permissions | Organization permissions |
| :--: | :---------------------- | :----------------------- |
| Admin | <ul><li>View</li><li>Create</li><li>Edit</li><li>Delete</li></ul> | <ul><li>View</li><li>Create</li><li>Edit</li><li>Delete</li></ul> |
| Teacher | <ul><li>View</li><li>Create</li><li>Edit</li><li>Delete</li></ul> | None |
| Student | <ul><li>View</li></ul> | None |

## Domains

### Modifying a Domain

::: info
You can't change the domain URL. However, you can create a new domain and delete the old one.
:::

### Verifying a Domain

Click the <md-icon-button class="inline-button"><md-icon>content_copy</md-icon></md-icon-button> to copy the verification token. There are 2 methods to verify your domain:

::: details 1. Verify using TXT record
1. Open your DNS service provider (e.g. [Cloudflare](https://cloudflare.com)).
2. Locate your domain, and create a new TXT record at the root.
3. Paste the verification token (starts with ```examduler_```) and save the changes.
4. Wait for the DNS changes to propagate (up to 24 hours, usually faster), and then click the <md-icon-button class="inline-button"><md-icon>domain_verification</md-icon></md-icon-button> button to verify.
:::

::: details 2. Verify using HTTP
1. Create a file named ```examduler``` (no extension) in the directory ```.well-known```. The file path should look something like ```yourdomain.com/.well-known/examduler```.
2. Paste the verification token (starts with ```examduler_```) and deploy your site.
3. Once your site is deployed, click the <md-icon-button class="inline-button"><md-icon>domain_verification</md-icon></md-icon-button> button to verify.
:::

::: info Verification troubleshooting
If verification fails, make sure:

**For TXT records:**

- The TXT record sits at the root of the domain (e.g. ```yourdomain.com```), and not ```subdomain.yourdomain.com```.
- There are no extra spaces in the token.
- Your DNS changes have finished propagating.

**For HTTP records:**

- The file is located at ```yourdomain.com/.well-known/examduler```.
- There are no extra spaces in the token.
- You have saved and deployed your changes.

If all else fails, feel free to contact our support at [support@ingstudios.dev](mailto:support@ingstudios.dev?subject=Domain%20Verification%20Support).
:::

### Deleting a Domain

Click the <md-icon-button class="inline-button"><md-icon>delete</md-icon></md-icon-button> button to delete the domain.

::: danger
This action is irreversible! The domain verification status will be lost. You will have to re-create the domain and re-verify the domain with a new verification token. However, members will keep their existing verification status.
:::