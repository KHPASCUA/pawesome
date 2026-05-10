# Availability-Based Booking System - Manual Testing Guide

## Overview
This guide provides step-by-step instructions for testing the new availability checking features in the customer booking system.

## Prerequisites
- Backend server running with availability endpoints
- Frontend development server running
- Customer account for testing
- At least one pet added to the customer account

## Test Scenarios

### 1. Veterinary Booking Flow

#### Step 1: Login as Customer
- Navigate to login page
- Enter customer credentials
- Verify successful login and redirect to customer dashboard

#### Step 2: Open Veterinary Booking
- From customer dashboard, click "Book Pet Services" or navigate to CustomerBookings
- Select "Veterinary" booking type
- Verify the veterinary booking modal opens

#### Step 3: Select Date and Service
- Choose a date from the date picker (today or future date)
- Select a veterinary service from the dropdown
- Verify "Checking availability..." indicator appears
- Wait for availability data to load

#### Step 4: Confirm Available Slots Appear
- Verify time slots grid appears below the date field
- Check that available slots are clickable and marked "Available"
- Verify unavailable slots are disabled and marked "Booked" or show reason
- Confirm slot times are displayed in readable format (e.g., "9:00 AM")

#### Step 5: Select Available Slot
- Click on an available time slot
- Verify the slot becomes highlighted/selected
- Confirm the selected time appears in the time input field
- Check that form validation passes

#### Step 6: Submit Booking Successfully
- Fill in required fields (pet selection, reason for visit)
- Click submit button
- Verify booking is submitted successfully
- Check for success message: "Veterinary request submitted successfully. Please wait for approval."

### 2. Grooming Booking Flow

#### Step 1: Open Grooming Booking
- Navigate to CustomerBookings or GroomingForm
- Select "Grooming" booking type
- Verify grooming booking form opens

#### Step 2: Select Available Date
- Choose a date from the date picker
- Verify "Checking availability..." indicator appears
- Wait for availability check to complete

#### Step 3: Confirm Available Message Appears
- Look for green success message: "This grooming date is available for booking."
- Verify the message has a checkmark icon
- Confirm form is ready for submission

#### Step 4: Try Unavailable Date
- Choose a date that might have existing grooming appointments
- Verify red message appears: "This grooming date is already reserved. Please choose another date."
- Check if existing booking details are shown (if applicable)
- Confirm submit button is disabled or shows warning

### 3. Boarding/Hotel Booking Flow

#### Step 1: Open Boarding/Hotel Booking
- Navigate to CustomerBookings or HotelForm
- Select "Pet Hotel" booking type
- Verify hotel booking form opens

#### Step 2: Select Check-in/Check-out Dates
- Choose check-in date (today or future date)
- Choose check-out date (after check-in date)
- Verify "Checking room availability..." indicator appears
- Wait for room availability to load

#### Step 3: Confirm Available Rooms/Kennels Appear
- Verify rooms grid appears with available rooms
- Check that each room card shows:
  - Room name (e.g., "Room A", "Deluxe Suite")
  - Room type
  - Capacity information
  - Daily rate
  - Availability status
- Confirm available rooms are clickable
- Verify unavailable rooms are disabled

#### Step 4: Select Available Room
- Click on an available room
- Verify the room becomes highlighted/selected
- Check that room selection is stored
- Confirm form validation passes

#### Step 5: Submit Booking Successfully
- Fill in required fields (pet details, special instructions)
- Click submit button
- Verify booking is submitted successfully
- Check for success message about boarding request

### 4. Duplicate Booking Conflict Prevention

#### Step 1: Try Duplicate Veterinary Slot
- Submit a veterinary booking for a specific time slot
- Immediately try to submit another booking for the same time slot
- Verify HTTP 422 error appears: "This schedule is no longer available. Please choose another slot."
- Confirm the second booking is rejected

#### Step 2: Try Duplicate Grooming Date
- Submit a grooming booking for a specific date
- Try to submit another grooming booking for the same date
- Verify error message: "This grooming date is already reserved. Please choose another date."
- Confirm the duplicate booking is blocked

#### Step 3: Try Overlapping Boarding Room Date
- Submit a boarding booking for Room A, Jan 1-3
- Try to submit another booking for Room A, Jan 2-4 (overlapping dates)
- Verify error message about room availability
- Confirm the overlapping booking is rejected

### 5. System Verification

#### Step 1: Confirm Customer Store is Still Gone
- Navigate to routes that previously had Customer Store
- Verify Customer Store components are not present
- Check that only availability-based booking forms exist

#### Step 2: Confirm Cashier POS Still Works
- Navigate to cashier dashboard/routes
- Verify POS functionality is unchanged
- Test basic POS operations (if accessible)

#### Step 3: Confirm npm run Build Still Passes
- Run `npm run build` in frontend directory
- Verify build completes successfully (exit code 0)
- Check for no critical build errors

## Expected Behaviors

### Loading States
- "Checking availability..." appears during API calls
- Spinners or loading indicators are visible
- Forms remain responsive during loading

### Error Handling
- Clear error messages when API calls fail
- Graceful fallback when availability data is missing
- User-friendly prompts for next actions

### Validation
- Forms cannot be submitted without required availability selections
- Real-time validation feedback
- Backend conflict detection with HTTP 422 responses

### UI/UX
- Available options are clearly marked and clickable
- Unavailable options are disabled and visually distinct
- Selection states are clearly indicated
- Success/error messages are prominent and clear

## Troubleshooting

### Common Issues
1. **Availability not loading**: Check backend server and API endpoints
2. **Form submission blocked**: Verify all required fields are filled
3. **Build errors**: Check for syntax errors in modified files
4. **API errors**: Verify backend availability endpoints are working

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify network requests in browser dev tools
3. Check backend logs for API errors
4. Test availability endpoints directly (curl/Postman)

## Test Results Checklist

- [ ] Veterinary booking availability works correctly
- [ ] Grooming booking availability works correctly  
- [ ] Boarding booking availability works correctly
- [ ] Duplicate booking conflicts are prevented
- [ ] Customer Store is still removed
- [ ] Cashier POS still functions
- [ ] npm run build passes
- [ ] All loading states work properly
- [ ] Error handling is functional
- [ ] UI/UX is intuitive and responsive

## Notes
Record any issues, bugs, or improvements discovered during testing:
________________________________________________________________
________________________________________________________________
________________________________________________________________
