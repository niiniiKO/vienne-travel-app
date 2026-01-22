# Graduation Trip App (Vienna/Germany) - Function Test Specification

- **Project Name**: Vienna/Germany Trip Manager
- **Target Platform**: Web App (PWA)
- **Tester**: Developer & Members (Aoyama, Asada, Ichikawa, Onizawa)

---

## 1. User Identity & Initial Setup

**Requirement**: Simple persistent identification without strict authentication.

| ID | Test Item | Procedure / Condition | Expected Behavior | Status |
| :--- | :--- | :--- | :--- | :---: |
| 1-1 | Initial User Selection | Launch the app for the first time (localStorage is empty). | Four user icons/names are displayed and selectable. | [ ] |
| 1-2 | User Persistence | Close the browser after selecting a user, then reopen the app. | The app bypasses the selection screen and opens the Home Screen as the previously selected user. | [ ] |
| 1-3 | Switch User | Select "Change User" from the settings menu. | The app returns to the User Selection screen, allowing login as a different user. | [ ] |

---

## 2. Schedule Management

**Precondition**: All dates and times are treated as Local Time (destination time).

| ID | Test Item | Procedure / Condition | Expected Behavior | Status |
| :--- | :--- | :--- | :--- | :---: |
| 2-1 | Timeline View | Open Home screen with existing schedule data. | Events are displayed in a chronological list (vertical scroll). | [ ] |
| 2-2 | Current Time Focus | View the timeline during the trip dates (or mock data). | The event corresponding to the current local time is highlighted or the view automatically scrolls to it. | [ ] |
| 2-3 | Map Integration | Tap the "Location/Address" or Map icon on an event. | The OS native map app (Google Maps/Apple Maps) launches with the location pinned/searched. | [ ] |
| 2-4 | Create Event | Tap FAB -> Add Schedule. | Can save Date, Time, Location, Tag, Memo, and URL. | [ ] |
| 2-5 | Edit/Delete Event | Tap an existing event in the list. | Can edit details and save, or delete the event. | [ ] |

---

## 3. Accounting & Split Bill

**Logic**: Maintain decimals internally; display only the final "Balance (+/-)" per person.

| ID | Test Item | Procedure / Condition | Expected Behavior | Status |
| :--- | :--- | :--- | :--- | :---: |
| 3-1 | Create Transaction | Tap FAB -> Add Expense. | The input form opens immediately. | [ ] |
| 3-2 | Default Payer | Open the expense input form. | "Who Paid" defaults to the currently logged-in user. | [ ] |
| 3-3 | Change Payer | Change "Who Paid" field. | Can select a different member (e.g., paying on behalf of someone else). | [ ] |
| 3-4 | Specify Payees | Change "For Whom" field. | Default is "All". Can select specific members (multiple selection supported). | [ ] |
| 3-5 | Currency Selection | Select EUR or JPY and save. | The transaction is saved and calculated separately for each currency. | [ ] |
| 3-6 | Dashboard View | Open the Accounting tab. | Displays the net balance for each of the 4 members (e.g., "+50" or "-20") for both EUR and JPY separately. | [ ] |
| 3-7 | Calculation Logic | Register an expense that doesn't split evenly (e.g., 10 EUR / 3). | No crash occurs. The internal logic handles the split, and the total balance displayed is logically consistent (minor rounding diffs acceptable). | [ ] |

---

## 4. Wish List

| ID | Test Item | Procedure / Condition | Expected Behavior | Status |
| :--- | :--- | :--- | :--- | :---: |
| 4-1 | Add Item | Add a place of interest. | Can save Place Name, Tags, and URL. | [ ] |
| 4-2 | Promote to Schedule | Select an item and choose "Add to Schedule". | The item's data is copied to the Schedule Creation screen (or directly added). | [ ] |

---

## 5. Information & Knowledge Base

| ID | Test Item | Procedure / Condition | Expected Behavior | Status |
| :--- | :--- | :--- | :--- | :---: |
| 5-1 | Save HTML | Copy HTML code (from Gemini/PC) and paste it into the text area on mobile. | Saves to the database without errors. | [ ] |
| 5-2 | Render HTML | Open a saved Info item. | The raw HTML tags are not shown; instead, the content is rendered as a proper web page (tables, styles applied). | [ ] |

---

## 6. Non-Functional & UI/UX

| ID | Test Item | Procedure / Condition | Expected Behavior | Status |
| :--- | :--- | :--- | :--- | :---: |
| 6-1 | Offline Viewing | Set phone to Airplane Mode -> Open App. | Cached Schedule and Accounting data are visible. (Screen does not go blank). | [ ] |
| 6-2 | Offline Input Handling | Airplane Mode -> Try to Save data. | User receives an error message or UI indication that saving failed (No infinite loading). | [ ] |
| 6-3 | Design & Theme | Navigate through the app. | The "Vienna Secession" theme (Bordeaux/Gold colors, Serif fonts) is consistently applied. | [ ] |