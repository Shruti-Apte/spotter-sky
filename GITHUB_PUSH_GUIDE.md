# Push Spotter Sky to a New GitHub Repository

Follow these steps in order. Your project is already set up with a `.gitignore` (node_modules, .env, dist, etc.).

---

## Step 1: Initialize Git (already done if you ran the setup)

From your project root (`spotter-sky`):

```bash
cd /Users/saeloun/spotter-sky
git init
```

---

## Step 2: Stage All Files

```bash
git add .
```

Check what will be committed (no secrets or build artifacts):

```bash
git status
```

You should see your source files, `package.json`, `index.html`, etc. You should **not** see `node_modules/`, `dist/`, or `.env`.

---

## Step 3: First Commit

```bash
git commit -m "Initial commit: Spotter Sky flight search app"
```

---

## Step 4: Create the New Repository on GitHub

1. Go to [https://github.com/new](https://github.com/new).
2. **Repository name:** `spotter-sky` (or any name you prefer).
3. **Description:** optional, e.g. "Flight search and compare — Spotter Sky".
4. Choose **Public**.
5. **Do not** check "Add a README", "Add .gitignore", or "Choose a license" — you already have these locally.
6. Click **Create repository**.

---

## Step 5: Connect Your Local Repo to GitHub

GitHub will show you commands. Use these (replace `YOUR_USERNAME` with your GitHub username):

```bash
git remote add origin https://github.com/YOUR_USERNAME/spotter-sky.git
```

Or with SSH:

```bash
git remote add origin git@github.com:YOUR_USERNAME/spotter-sky.git
```

Verify:

```bash
git remote -v
```

---

## Step 6: Rename Branch to `main` (if needed)

Git may have created a branch named `master`. GitHub uses `main` by default:

```bash
git branch -M main
```

---

## Step 7: Push to GitHub

```bash
git push -u origin main
```

If GitHub shows **Authentication failed** or **Permission denied**:

- **HTTPS:** Use a [Personal Access Token](https://github.com/settings/tokens) instead of your password when prompted.
- **SSH:** Ensure your SSH key is added to GitHub: [SSH keys](https://github.com/settings/keys).

---

## Step 8: Confirm

Open `https://github.com/YOUR_USERNAME/spotter-sky` — you should see your code, README, and commit history.

---

## Quick Checklist

- [ ] `git init` run
- [ ] `git add .` and `git status` checked (no .env, node_modules, dist)
- [ ] `git commit -m "Initial commit: ..."` done
- [ ] New repo created on GitHub (no README/.gitignore/license)
- [ ] `git remote add origin <url>` done
- [ ] `git branch -M main` (if needed)
- [ ] `git push -u origin main` — no errors

After the first push, use:

- `git add .` → `git commit -m "Your message"` → `git push`
for future updates.
