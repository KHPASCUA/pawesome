# 🎓 PAWESOME SYSTEM - PROFESSOR TESTING GUIDE

## 🔑 TEST ACCOUNTS (All Passwords Listed)

| Role | Email | Password | What They Can CREATE |
|------|-------|----------|---------------------|
| **Admin** | admin@example.com | admin123 | Users, Services, Inventory, Customers, Pets, FAQs |
| **Manager** | manager@example.com | manager123 | Payroll, Attendance Records |
| **Receptionist** | receptionist@example.com | reception123 | Appointments, Customers, Pets, Boardings |
| **Cashier** | cashier@example.com | cashier123 | Sales Transactions, Process Payments |
| **Inventory** | inventory@example.com | inventory123 | Inventory Items, Stock Adjustments |
| **Vet** | vet@example.com | vet123 | View appointments (read-only in this version) |
| **Customer** | customer@example.com | customer123 | Book Appointments, Book Boardings, Add Pets |

---

## 📝 CREATE TESTS BY ROLE

### 1️⃣ ADMIN DASHBOARD (admin@example.com)
**Navigate to:**
- **Users** → Click "Add User" → Create new staff account
- **Services** → Click "Add Service" → Create new pet service
- **Inventory** → Click "Add Item" → Create new inventory product
- **Customers** → Click "Add Customer" → Create new customer profile
- **Chatbot FAQs** → Click "Add FAQ" → Create new chatbot response

**Example Data to Enter:**
```
New Service:
- Name: Pet Massage Therapy
- Price: ₱350
- Description: Relaxing massage for pets

New User:
- Name: Test Staff
- Email: teststaff@example.com
- Role: receptionist
- Password: test123
```

---

### 2️⃣ MANAGER DASHBOARD (manager@example.com)
**Navigate to:**
- **Payroll** → Click "Generate Payroll" → Create monthly payroll
- **Attendance** → Click "Add Record" → Add attendance entry
- **Staff** → View all staff (read-only)

**Example Data:**
```
Payroll Generation:
- Period: April 2026
- Staff: Select any employee
- Base Salary: ₱25000
- Overtime: 5 hours
- Deductions: ₱1500

Attendance Entry:
- Employee: Select staff
- Date: Today
- Time In: 08:00 AM
- Time Out: 05:00 PM
- Status: Present
```

---

### 3️⃣ RECEPTIONIST DASHBOARD (receptionist@example.com)
**Navigate to:**
- **Appointments** → Click "Book Appointment" → Create new booking
- **Customers** → Click "Add Customer" → Create customer profile
- **Boardings** → Click "New Booking" → Create hotel reservation

**Example Data:**
```
New Appointment:
- Customer: John Smith
- Pet: Buddy (Golden Retriever)
- Service: Pet Grooming
- Date: Tomorrow 10:00 AM
- Veterinarian: Any available

New Customer:
- Name: Maria Cruz
- Email: maria.cruz@email.com
- Phone: 0917-987-6543
- Address: 456 Manila St

New Boarding:
- Pet: Select any pet
- Check-in: Tomorrow
- Check-out: 3 days later
- Room: Any available
```

---

### 4️⃣ CASHIER DASHBOARD (cashier@example.com)
**Navigate to:**
- **POS** → Add items to cart → Click "Checkout" → Process payment
- **Transactions** → View all sales
- **Dashboard** → See daily sales summary

**Example Transaction:**
```
POS Sale:
1. Click on "Dog Treats Pack" (₱8.99)
2. Click on "Pet Shampoo" (₱15.50)
3. Cart Total: ₱24.49
4. Payment Method: Cash
5. Cash Received: ₱500
6. Change: ₱475.51
7. Click "Complete Sale"
```

---

### 5️⃣ INVENTORY DASHBOARD (inventory@example.com)
**Navigate to:**
- **Inventory** → Click "Add New Item" → Create inventory item
- **Stock Adjustments** → Select item → Click "Adjust Stock"
- **Low Stock** → View items needing reorder

**Example Data:**
```
New Inventory Item:
- SKU: TREAT-002
- Name: Cat Treats Premium
- Stock: 50
- Reorder Level: 10
- Price: ₱12.50
- Expiry: 6 months from now

Stock Adjustment:
- Item: Dog Food Bag
- Adjustment: +20 units
- Reason: New stock arrival
```

---

### 6️⃣ VET DASHBOARD (vet@example.com)
**Navigate to:**
- **Appointments** → View scheduled appointments
- **Patients** → View pet medical records
- **Medical Records** → View treatment history

**Note:** Vet role is primarily read-only for viewing appointments and medical records. They can mark appointments as complete but cannot create new system entities.

---

### 7️⃣ CUSTOMER PORTAL (customer@example.com)
**Navigate to:**
- **My Pets** → Click "Add Pet" → Register new pet
- **Appointments** → Click "Book Now" → Schedule service
- **Boarding** → Click "Book Stay" → Reserve hotel room

**Example Data:**
```
New Pet:
- Name: Whiskers
- Species: Cat
- Breed: Persian
- Birth Date: 2023-05-15

Book Appointment:
- Pet: Select your pet
- Service: Veterinary Checkup
- Date: Next week
- Time: 2:00 PM

Book Boarding:
- Pet: Select your pet
- Check-in: Weekend
- Check-out: After 2 nights
```

---

## 🔄 WORKFLOW DEMONSTRATION

### Complete Transaction Flow:
1. **Receptionist** creates appointment → Customer books service
2. **Customer** arrives → **Receptionist** checks them in
3. **Vet** completes service → Marks appointment done
4. **Cashier** processes payment → Creates sale transaction
5. **Inventory** stock reduces automatically (if products sold)
6. **Admin** can view all activity in History/Reports

---

## 📊 EXPECTED RESULTS

After creating test data, you should see:

| Feature | Expected Result |
|---------|-----------------|
| New User | Appears in Users list with role |
| New Appointment | Shows in calendar with status |
| New Sale | Adds to daily revenue total |
| New Inventory | Shows in stock count |
| New Customer | Available for booking |
| New Boarding | Shows occupancy in dashboard |
| New Payroll | Calculated with deductions |
| Activity | Logged in System History |

---

## ⚡ QUICK TEST CHECKLIST

- [ ] Admin: Create a new user
- [ ] Admin: Add a new service
- [ ] Manager: Generate payroll
- [ ] Manager: Add attendance record
- [ ] Receptionist: Book appointment
- [ ] Receptionist: Add customer
- [ ] Cashier: Process POS sale
- [ ] Inventory: Add new item
- [ ] Customer: Book appointment
- [ ] Check System History shows all activities

---

## 🆘 IF SOMETHING DOESN'T WORK

1. **Check login** - Make sure you're using correct email/password
2. **Check permissions** - Each role has specific access limits
3. **Refresh page** - Some data may need page reload
4. **Check console** - Browser console shows errors
5. **Try incognito** - Clear browser cache if needed

---

## 🎓 PRESENTATION TIPS

1. **Start with Admin** - Show full system control
2. **Demo RBAC switching** - Log out, log in as different roles
3. **Show data persistence** - Data created in one role visible to others
4. **Highlight security** - Each role sees only their allowed features
5. **End with Reports** - Show comprehensive analytics

**Good luck with your presentation! 🎉**
