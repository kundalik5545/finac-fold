# Assests

desing the assests tracking page with typescipt, shadcn, tailwindcss.

- User should able to add, edit, delete the assests
- use prisma model assests for creating a form and schema
- create schema inside lib folder - ts-type.ts
- Show table and card view with details
  - table with percent profit loss
  - inside table show Name, type, purchase date, purchase value, currrent value, Gain/Loss
  - At top show Total Current Value
  - use toggle between card and table
  - Card should have all details in nice arrangely format which are important
  - WHen click on on card or table it should open new page which show all details about that assets with previous transaction history also
- Below table or card show pie chart and line chart with current assest value with assest name and percentage of total use recharts from shadcn

# Todo List

- Create a todo list where user can add, edit delete and mark complete the todo.
- Show todo in table format and in calendar format in daily/weekly/monthly show upcoming todos using toggle view mode
- make it responsive and nice

# Investment Goals

Create a feature called goals which helps user to track there future goals and its progress.

- User should abel to add, edit, delete the goals using api
- Show goals in table format and card format with toggle button
- Show goals progress and percentage completion
- Show charts like bar or area or donut chart to show the data
- Make charts and page responsive
- user should able to add icon and color and as per color card baground should shown
- Use Prisma model goal and add extra fields which are needed as required
- use color picker for such that create premade color template with ligh colors and user should select one of them make 10 color template. Create this as utitlity functionality so that we can use it whenever required.
- also create utitlity functionality to pick icon and show picked icon in box. for icons i will use windown emoji win + . functionality 💰 like this.
- make nice and beautiful ui
- add back button which is created inside the custom-components folder when ever required
- use can add progress of goals like when ever he saves some money he will update or create a new transaction to update current goal value which will change goals percentage.
- create seperate table to track goal added new amount values over time so for eavh goal when user click on individual goal history of goal transaction can be shown.
- for each goal show area chart with date for every time user add new transaction to upadate current balance.
- add other required details as per indusrty standards
- check functionality for any error after creating it.

# Feature - Bank Account

Create a feature bank account so user can add details about there bank accounts and related balancea and transactions.

- User should be able to add, edit and delete bank accounts
- Upon adding bank account show them and cards and upon clicking that card user will navigate to details page
  - Bank details page should have
    - total balance (optional)
    - total expense and total income
    - all transaction related to that bank in table format
    - filter to filter transaction based on date range and credit, debit, and categories, sub categories
    - Show line chart for transaction for daily, weekly, monthly or date range basis
    - show donut chart for income and expense categories (use pre made color and icon components inside )
    - back button from back-button.tsx
- make card responsive and nice looking
- create prisma model and migrate
- show stats about bank account page
  - show total accounts and total balance
  - current month spendings analytics
  - show donut and bar charts to show comparision for weekyl and monthyl spendings
