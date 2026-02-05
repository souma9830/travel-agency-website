# 👑 Ruler Tours - Startup Skeleton

Ruler Tours is a travel startup specializing in curated experiences across **North Bengal** (Darjeeling, Kurseong, Dooars) and premium **Vehicle Rentals**.

This project is a **Skeleton Structure** built with vanilla HTML, CSS, and JS. It is designed specifically for an Open Source Event to showcase how contributors can collaborate on a startup idea.

---

## 📂 Project Structure

The project is organized into four main directories to keep code modular:

- `/html`: Contains all page views (Destinations, Rentals, About, Contact).
- `/css`: Contains stylesheets (Global and Page-specific).
- `/javascript`: Contains the "Database" (tour-data.js) and logic (main.js).
- `/assets`: Contains logos and images.

---

## 🛠️ How to Contribute (The Hooks)

We have left several "Hooks" and empty spaces for you to dive in. Choose a task that fits your skill level!

### 1. The Design Challenge (CSS)
* **Refactor Inline Styles:** Many elements (like the North Bengal tour cards) use inline `style="..."` attributes. Move these into a dedicated `css/destinations.css` file.
* **Theming:** Use the CSS variables in `css/global.css` to define a premium "Royal" brand color palette.
* **Responsive Grid:** Make the Tour and Rental grids look perfect on mobile devices.

### 2. The Architecture Challenge (JavaScript & HTML)
* **The Navbar Hook:** Currently, the header is copied on every page. Can you refactor the project so the Navbar is injected from a single JavaScript file to make maintenance easier?
* **Dark Mode Toggle:** We have provided `dark_logo.png` and `light_logo.png`. Implement a theme switcher that swaps these logos and changes the site's background colors.

### 3. The Content Challenge (Data)
* **North Bengal Expansion:** Open `javascript/tour-data.js` and add more hidden gems like **Sittong**, **Lepchajagat**, or **Kalimpong** etc from North Bengal region.
* **Vehicle Fleet:** Create a `javascript/rental-data.js` file and populate it with cars (SUVs, Sedans) and bikes available for rent in North Bengal.

### 4. The Feature Challenge (Advanced JS)
* **Search & Filter:** Add a search bar to `destinations.html` that filters the cards in real-time as the user types.
* **Dynamic Package Page:** Make `package.html` read the `id` from the URL (e.g., `?id=darjeeling-01`) and display the correct data from `tour-data.js`.

---

## 🗺️ Targeted Locations
Our current focus is exclusively on the **Northern part of West Bengal, India (North Bengal)**:
- Darjeeling 🏔️
- Kurseong 🚂
- Mirik 🏖️
- Kalimpong 🌸
- Dooars & Jaldapara 🐘
- And many more locations as you want to add in this region

---

🤝 How to Contribute (The Workflow)
To ensure your contributions are merged smoothly, please follow this step-by-step workflow:

1. Fork the Project
Click the Fork button at the top right of this page to create a copy of this repository in your own GitHub account.

2. Clone your forked repository
Open your terminal and run the following command:

Bash
git clone https://github.com/<your_github_username>/travel-agency-website.git
3. Create a New Branch
Always work on a new branch for each feature or fix to keep the main branch clean:

Bash
git checkout -b fix-issue-<ISSUE-NUMBER>
4. Check Changed Files
After you have added your changes, check which files were modified:

Bash
git status -s
5. Add Files to Staging
Add all the changed files to the staging area to prepare them for a commit:

Bash
git add .
6. Commit Your Changes
Save your progress with a clear, descriptive message about what you changed:

Bash
git commit -m "Added: <EXPLAIN-YOUR-CHANGES>"
7. Push Your Changes
Upload your local branch changes to your forked repository on GitHub:

Bash
git push origin fix-issue-<ISSUE-NUMBER>
8. Open a Pull Request
Go to the original sanglaphalder/travel-agency-website repository on GitHub. You will see a green "Compare & pull request" button. Click it and describe your work!

Created for the Ruler Tours Open Source Showcase - JWoC 2026