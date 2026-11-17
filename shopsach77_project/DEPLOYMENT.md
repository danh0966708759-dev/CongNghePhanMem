# Deploy with XAMPP

The React website and PHP API should be served by the same Apache origin so login sessions work and all customers use the same MySQL data. Admin login is at `/admin`.

## 1. Set up XAMPP

1. Start **Apache** and **MySQL** in the XAMPP Control Panel.
2. Create/import the database `shop_sach_77project` in phpMyAdmin.
   - For a **new empty database**, import `database.sql`. It drops and recreates the project tables, so do not import it over a database containing data you need.
   - For an **existing database**, keep the data. The PHP API adds the order fields it needs on its first request.
3. The local XAMPP defaults in `php/db.php` are MySQL host `127.0.0.1`, port `3306`, user `root`, and an empty password. Change those values or set matching Apache environment variables if your XAMPP MySQL has a password.
4. Copy the contents of the Vite `dist` folder, the `php` folder, and `.htaccess` into `C:\xampp\htdocs\shopsach77`. Keep the `php` folder next to `index.html`.
5. To build for that folder, run from the project directory:

   ```powershell
   New-Item -ItemType Directory -Force C:\xampp\htdocs\shopsach77
   $env:VITE_BASE_PATH = '/shopsach77/'
   $env:VITE_API_URL = '/shopsach77'
   npm run build
   Copy-Item dist\* C:\xampp\htdocs\shopsach77\ -Recurse -Force
   Copy-Item php C:\xampp\htdocs\shopsach77\ -Recurse -Force
   Copy-Item .htaccess C:\xampp\htdocs\shopsach77\.htaccess -Force
   ```

6. Open `http://localhost/shopsach77/`. The same site is available at `http://localhost/shopsach77/admin`.

Apache's `mod_rewrite` must be enabled for the `/admin` page route. PHP must have PDO MySQL enabled.

## 2. Create the admin account

Run the one-time setup script from PowerShell, replacing the email and password with your own. Choose a unique password of at least 12 characters:

```powershell
$env:ADMIN_EMAIL = 'admin@example.com'
$env:ADMIN_PASSWORD = 'replace-with-your-own-long-password'
$env:ADMIN_NAME = 'Quản trị viên'
& C:\xampp\php\php.exe C:\xampp\htdocs\shopsach77\php\setup_admin.php
Remove-Item Env:ADMIN_EMAIL, Env:ADMIN_PASSWORD, Env:ADMIN_NAME
```

Then sign in at `/admin`. The setup script stores only a password hash in MySQL. Do not use the example password on a public site.

## What is saved to MySQL

- New customer registrations and customer/admin sign-in sessions
- Products added, edited, hidden, or deleted in admin
- Stock changes from orders and borrow slips
- Customer orders and admin payment-status updates/deletions
- Admin-created borrow slips

The store refreshes products, customer orders, and admin data when the page is revisited and periodically while it remains open. Deleting a book with order/borrow history is blocked; hide it instead to keep records intact.

## Putting it on the public internet

XAMPP on your own computer is a local development server; a public website cannot reach `localhost` on your computer. Do not expose an XAMPP/MySQL port to the internet. To make the site public, deploy the built frontend and PHP API together to a PHP/MySQL hosting account, or configure a secure public PHP host/database and set `VITE_API_URL` to that API's same-site path before building. Static-only hosting such as Netlify does not run this PHP API.
