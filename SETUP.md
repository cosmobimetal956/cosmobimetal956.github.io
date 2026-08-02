# Horizon Q — full setup walkthrough

For `stuartokin` → `horizonqltd.com`

**You have live email on this domain.** Nothing in this guide touches mail
delivery, but Part B backs everything up first regardless.

**Golden rule: get the site working on GitHub's own URL before you touch DNS.**
If you change both at once and something breaks, you won't know which half.

| Part | Device | What | Time |
| ---- | ------ | ---- | ---- |
| A | 💻 Laptop | Get the site live on GitHub | 20 min |
| B | 💻 or 📱 | Back up DNS | 3 min |
| C | 💻 or 📱 | Turn off domain forwarding | 2 min |
| D | 💻 Laptop | Edit DNS records | 10 min |
| E | 💻 or 📱 | Point GitHub at the domain | 5 min + wait |
| F | 💻 or 📱 | Enable HTTPS | 2 min + wait |
| G | 💻 and 📱 | Verify, including email | 10 min |

---

# Part A — GitHub 💻 **Laptop only**

Do not attempt this on the phone. GitHub's uploader needs drag-and-drop, and
mobile browsers cannot select the hidden `.github` folder at all.

### A1. Unzip

Unzip `horizonq-phase0.zip`. You'll get a folder called `horizonq`.

### A2. Make hidden files visible ⚠️

**This is the step that silently ruins everything if skipped.**

The folder contains `.github` and `.gitignore`. Names starting with a dot are
hidden by default, and if `.github` doesn't get uploaded, the site never builds
and GitHub shows you no error explaining why.

- **Windows:** File Explorer → View tab → tick **Hidden items**
- **Mac:** open the folder in Finder → press `Cmd + Shift + .`

Confirm you can now see `.github` and `.gitignore` inside `horizonq`.

### A3. Check the repo name isn't taken

Go to `https://github.com/stuartokin?tab=repositories`.

Is there already a repo called `stuartokin.github.io`? You only get one per
account.

- **No** → carry on to A4
- **Yes** → stop and tell me. We'll use a different name; it needs one config
  line changed.

### A4. Create the repository

`https://github.com/new`

| Field | Value |
| ----- | ----- |
| Owner | `stuartokin` |
| Repository name | `stuartokin.github.io` |
| Visibility | **Public** |
| Add a README | **leave unticked** |
| .gitignore | **None** |
| Licence | **None** |

The username appearing twice in `stuartokin/stuartokin.github.io` looks wrong
but is correct. That exact pattern makes GitHub serve the site at the root of
the domain rather than in a subfolder.

Click **Create repository**.

### A5. Upload

On the empty repo page, click the link **uploading an existing file**.

Open the `horizonq` folder, select **everything inside it** — `Ctrl+A` or
`Cmd+A` — and drag it onto the browser window.

You are uploading the *contents*, not the folder. If GitHub shows a single
`horizonq` entry, you've dragged the wrong thing: undo and go one level in.

**Before committing, check the file list includes `.github`.** If it's missing,
go back to A2.

### A6. Commit

Scroll down → **Commit changes**.

### A7. Turn on Pages

Repo → **Settings** → **Pages** (left sidebar) → under **Source**, change
*Deploy from a branch* to **GitHub Actions**.

There's no save button; it applies immediately.

### A8. Watch the build

Click the **Actions** tab. You'll see workflows running.

- 🟡 Yellow dot — building, wait
- ✅ Green tick — done, usually 2–3 minutes
- ❌ Red cross — click into it, copy the error, send it to me

### A9. Test

Visit `https://stuartokin.github.io`

You should see: near-black background, **Horizon Q** in large expanded type, a
horizontal spectral bar with five coloured lines, and four items listed
underneath. A pill-shaped bar at the bottom with **Read / Orbital / Landscape**.

Tap **Orbital** — you should get a dark 3D space with coloured shapes slowly
rotating.

**🛑 Do not go further until this works.** DNS cannot fix a broken build, and
changing both at once makes it far harder to diagnose.

---

# Part B — Back up DNS 💻 or 📱

### B1.
GoDaddy → **My Products** → find `horizonqltd.com` → **DNS**

### B2.
Find the three-dot or **More** menu near the top of the records list →
**Export zone file**. Save it somewhere you'll find it.

This is your complete rollback. If anything goes wrong at any point, importing
this file restores every record exactly as it was, email included.

### B3.
Take a screenshot of the full record list as well. Belt and braces.

---

# Part C — Turn off forwarding 💻 or 📱

### C1.
In GoDaddy, go to the domain's **Domain Settings** — this is a different page
from DNS — and look for **Forwarding**.

### C2.
If a forward exists, **delete it**.

Forwarding silently re-injects GoDaddy's parking records and overwrites
whatever you set in Part D. If your changes mysteriously revert an hour later,
this was why.

---

# Part D — Edit DNS records 💻 **Laptop recommended**

Doable on the phone, but you're adding five records in a fiddly interface and a
typo here takes the site down. Bigger screen is better.

GoDaddy → `horizonqltd.com` → **DNS** → **Manage DNS**.

### D1. Delete the existing apex A record

Find the row with **Type: A** and **Name: @**. Note its current value, then
delete it. There's normally exactly one, pointing at a GoDaddy parking IP.

### D2. Add four A records

One at a time. All four — they're GitHub's redundant edge servers, and with
fewer you get intermittent outages that are miserable to diagnose.

| Type | Name | Value | TTL |
| ---- | ---- | ----- | --- |
| A | `@` | `185.199.108.153` | 1 hour |
| A | `@` | `185.199.109.153` | 1 hour |
| A | `@` | `185.199.110.153` | 1 hour |
| A | `@` | `185.199.111.153` | 1 hour |

Note the last octet changes: **108, 109, 110, 111**.

### D3. Replace the www record

Find **Type: CNAME**, **Name: www**. Delete it. Add:

| Type | Name | Value | TTL |
| ---- | ---- | ----- | --- |
| CNAME | `www` | `stuartokin.github.io` | 1 hour |

If GoDaddy adds a trailing dot, that's fine and correct.

### D4. Save

### ⚠️ D5. Leave these strictly alone

Everything below is your email. Touching any of it breaks mail, sometimes
silently and days later.

| Record | What it does |
| ------ | ------------ |
| `MX` on `@` | Mail delivery — **the critical one** |
| `TXT` on `@` starting `v=spf1` | SPF, anti-spoofing |
| `TXT` on `_dmarc` | DMARC policy |
| `TXT` or `CNAME` containing `._domainkey` | DKIM signing |
| `CNAME` on `autodiscover` | Outlook auto-configuration |
| `CNAME` on `email`, `pop`, `imap`, `smtp` | Mail client connections |
| `SRV` on `_sip`, `_sipfederationtls` | Microsoft 365 / Teams |
| `CNAME` on `_domainconnect` | GoDaddy's own setup tooling |
| Any `TXT` you don't recognise | Almost always domain verification for
something you set up and forgot. Deleting it breaks that thing quietly. |

A `TXT` record and an `A` record can both sit on `@` with no conflict. You are
only replacing the `A` record on `@` and the `CNAME` on `www`. Nothing else.

---

# Part E — Point GitHub at the domain 💻 or 📱

### E1.
Wait 15 minutes after saving in Part D.

### E2.
GitHub → `stuartokin.github.io` repo → **Settings** → **Pages** →
**Custom domain** → type:

```
horizonqltd.com
```

→ **Save**

### E3.
GitHub runs a DNS check underneath the field.

- ✅ Green — proceed to Part F
- ❌ "Domain does not resolve" — DNS hasn't propagated yet. Normally minutes,
  occasionally a few hours. Wait and click **Save** again.

### E4.
GitHub automatically commits a `CNAME` file to the repo at this point. That's
expected and correct — it's what makes the domain survive future deploys. You
don't need to create it yourself.

---

# Part F — HTTPS 💻 or 📱

### F1.
Same page. The **Enforce HTTPS** checkbox stays greyed out until GitHub has
issued a certificate — usually 10–20 minutes after the DNS check goes green,
occasionally longer.

### F2.
Once it's clickable, **tick it**. Don't skip this.

---

# Part G — Verify 💻 **and** 📱

Both devices matter — the phone is where the responsive and 3D behaviour
actually gets tested.

### G1. 💻 Site
`https://horizonqltd.com` — loads, padlock showing.

### G2. 💻 www redirect
`https://www.horizonqltd.com` — redirects to the apex.

### G3. 📱 Phone, folded
Open the site on the Fold, closed. Text readable, spectral bar fits, bottom
toggle reachable with a thumb.

### G4. 📱 Phone, unfolded
Open the device. Layout should reflow to the wider measure, not just stretch.

### G5. 📱 Orbital world on mobile
Tap **Orbital**. Drag to rotate, pinch to zoom. Should stay smooth. If it
stutters badly, tell me — the quality tier detection needs adjusting.

### G6. ⚠️ Email in
From an outside account — Gmail, your phone, anything not on this domain —
send an email **to** your `horizonqltd.com` address. Confirm it arrives.

### G7. ⚠️ Email out
Send an email **from** your `horizonqltd.com` address to an outside account.
Confirm it arrives **and lands in the inbox, not spam**. This is what tests
that SPF and DKIM survived.

**Not finished until G6 and G7 both pass.**

---

# If something goes wrong

| Symptom | Cause | Fix |
| ------- | ----- | --- |
| Actions tab empty | `.github` didn't upload | Redo A2, re-upload |
| Build fails | Send me the error from Actions | — |
| Site 404s at github.io | Pages source not set | Redo A7 |
| DNS check won't go green | Not propagated | Wait, click Save again |
| Records revert after an hour | Forwarding still on | Redo Part C |
| Site works, email stops | A protected record was changed | Import the zone file from B2 |
| Everything is wrong | — | Import the zone file from B2 |

The zone file from B2 restores DNS completely. The repo can be deleted and
re-uploaded at any time. Nothing here is irreversible.

---

# What to send me when you're stuck

- The error text from the **Actions** tab, if a build fails
- A screenshot of your DNS records, if anything looks off — DNS is public
  information, so there's nothing sensitive in sharing it
- Which mail provider you use, if email misbehaves — GoDaddy's Microsoft 365
  resale has a couple of extra records that Google Workspace doesn't
