import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHotel,
  faStethoscope,
  faCut,
  faCalendarAlt,
  faPlus,
  faCheck,
  faClock,
  faBan,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";
import "./ReceptionistBookings.css";
import { API_URL } from "../../api/client";

const API_BASE_URL = API_URL.replace(/\/$/, "");

const ReceptionistBookings = () => {
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve', 'reject', 'reschedule'
  const [actionNote, setActionNote] = useState('');
  const [newDate, setNewDate] = useState('');
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentBooking, setSelectedPaymentBooking] = useState(null);
  const [paymentAction, setPaymentAction] = useState(null); // 'verify', 'reject'
  const [paymentNote, setPaymentNote] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedCancelBooking, setSelectedCancelBooking] = useState(null);
  const [cancelAction, setCancelAction] = useState(null); // 'approve', 'reject'
  const [cancelNote, setCancelNote] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedRescheduleBooking, setSelectedRescheduleBooking] = useState(null);
  const [rescheduleAction, setRescheduleAction] = useState(null); // 'approve', 'reject'
  const [rescheduleNote, setRescheduleNote] = useState('');
  const [rescheduleNewDate, setRescheduleNewDate] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryBooking, setSelectedHistoryBooking] = useState(null);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingFormData, setBookingFormData] = useState({
    customerId: "",
    petId: "",
    ownerName: "",
    petName: "",
    petType: "",
    breed: "",
    appointmentDate: "",
    appointmentTime: "10:00 AM",
    service: "",
    duration: "1 day",
    roomType: "",
    symptoms: "",
    medicalNotes: "",
    specialRequests: "",
    bookingType: "hotel",
    paymentMethod: "cash",
    paymentStatus: "pending",
    amount: "",
    paidAmount: "0"
  });

  // Sample data
  const customers = [
    { id: "CUST-001", name: "John Smith", phone: "+1-234-567-8901", email: "john.smith@email.com" },
    { id: "CUST-002", name: "Emily Davis", phone: "+1-234-567-8902", email: "emily.davis@email.com" },
    { id: "CUST-003", name: "Robert Wilson", phone: "+1-234-567-8903", email: "robert.wilson@email.com" },
    { id: "CUST-004", name: "Jessica Brown", phone: "+1-234-567-8904", email: "jessica.brown@email.com" },
    { id: "CUST-005", name: "Michael Johnson", phone: "+1-234-567-8905", email: "michael.johnson@email.com" },
  ];

  const pets = [
    { id: "PET-001", customerId: "CUST-001", name: "Buddy", type: "Dog", breed: "Golden Retriever", age: "3 years" },
    { id: "PET-002", customerId: "CUST-001", name: "Max", type: "Dog", breed: "Labrador", age: "5 years" },
    { id: "PET-003", customerId: "CUST-002", name: "Luna", type: "Cat", breed: "Persian", age: "2 years" },
    { id: "PET-004", customerId: "CUST-003", name: "Charlie", type: "Dog", breed: "German Shepherd", age: "4 years" },
    { id: "PET-005", customerId: "CUST-004", name: "Whiskers", type: "Cat", breed: "Siamese", age: "1 year" },
    { id: "PET-006", customerId: "CUST-005", name: "Bella", type: "Dog", breed: "Poodle", age: "6 years" },
    { id: "PET-007", customerId: "CUST-005", name: "Duke", type: "Dog", breed: "Bulldog", age: "2 years" },
  ];

  
  // Customer selection handler
  const handleCustomerChange = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setBookingFormData(prev => ({
        ...prev,
        customerId,
        petId: "",
        ownerName: customer.name,
        petName: "",
        petType: "",
        breed: ""
      }));
    }
  };

  // Pet selection handler
  const handlePetChange = (petId) => {
    const pet = pets.find(p => p.id === petId);
    if (pet) {
      setBookingFormData(prev => ({
        ...prev,
        petId,
        petName: pet.name,
        petType: pet.type,
        breed: pet.breed
      }));
    }
  };

  // Get pets for selected customer
  const getAvailablePets = () => {
    if (!bookingFormData.customerId) return [];
    return pets.filter(pet => pet.customerId === bookingFormData.customerId);
  };

  // Sort bookings by creation date (newest first)
  const sortedBookings = [...bookings].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Form handlers
  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    setBookingFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!bookingFormData.customerId || !bookingFormData.petId || !bookingFormData.appointmentDate) {
      alert("Please select a customer, pet, and appointment date.");
      return;
    }

    // Create service name and calculate amount based on booking type
    let serviceName = "";
    let amount = 0;

    if (bookingFormData.bookingType === "hotel") {
      serviceName = "Pet Hotel Stay";
      // Calculate based on room type and duration
      const roomRates = {
        "Standard Room": 50,
        "Deluxe Suite": 80,
        "Premium Suite": 120
      };
      const dailyRate = roomRates[bookingFormData.roomType] || 50;
      const duration = parseInt(bookingFormData.duration) || 1;
      amount = dailyRate * duration;
    } else if (bookingFormData.bookingType === "vet") {
      serviceName = bookingFormData.service || "Regular Checkup";
      // Vet service prices
      const vetPrices = {
        "Regular Checkup": 100,
        "Vaccination": 80,
        "Surgery": 500,
        "Emergency": 300
      };
      amount = vetPrices[bookingFormData.service] || 100;
    } else if (bookingFormData.bookingType === "grooming") {
      serviceName = bookingFormData.service || "Full Grooming";
      // Grooming service prices
      const groomingPrices = {
        "Full Grooming": 60,
        "Bath & Trim": 40,
        "Nail Trimming": 20,
        "Teeth Cleaning": 50
      };
      amount = groomingPrices[bookingFormData.service] || 60;
    }

    // Process payment
    let paymentStatus = "pending";
    let paidAmount = parseFloat(bookingFormData.paidAmount) || 0;

    if (paidAmount >= amount) {
      paymentStatus = "paid";
    } else if (paidAmount > 0) {
      paymentStatus = "partial";
    }

    // Create new booking object
    const newBooking = {
      id: `${bookingFormData.bookingType.toUpperCase()}-${Date.now()}`,
      type: bookingFormData.bookingType,
      petName: bookingFormData.petName,
      petType: bookingFormData.petType,
      breed: bookingFormData.breed,
      owner: bookingFormData.ownerName,
      ownerPhone: customers.find(c => c.id === bookingFormData.customerId)?.phone || "",
      service: serviceName,
      appointmentDate: bookingFormData.appointmentDate,
      appointmentTime: bookingFormData.appointmentTime,
      status: "confirmed",
      amount: amount,
      paidAmount: paidAmount,
      paymentMethod: bookingFormData.paymentMethod,
      paymentStatus: paymentStatus,
      createdAt: new Date().toISOString()
    };

    // Add booking type specific fields
    if (bookingFormData.bookingType === "hotel") {
      newBooking.roomType = bookingFormData.roomType;
      newBooking.duration = bookingFormData.duration;
      newBooking.checkIn = bookingFormData.appointmentDate;
      newBooking.checkOut = bookingFormData.appointmentDate;
    } else if (bookingFormData.bookingType === "vet") {
      newBooking.symptoms = bookingFormData.symptoms;
      newBooking.medicalNotes = bookingFormData.medicalNotes;
    } else if (bookingFormData.bookingType === "grooming") {
      newBooking.specialRequests = bookingFormData.specialRequests;
    }

    // POST to backend
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      let payload = {};

      if (bookingFormData.bookingType === "hotel") {
        endpoint = `${API_BASE_URL}/boardings`;
        payload = {
          pet_id: bookingFormData.petId,
          customer_id: bookingFormData.customerId,
          hotel_room_id: bookingFormData.roomType,
          check_in: bookingFormData.appointmentDate,
          check_out: bookingFormData.appointmentDate,
          total_amount: amount,
          payment_status: paymentStatus,
          paid_amount: paidAmount,
          payment_method: bookingFormData.paymentMethod
        };
      } else if (bookingFormData.bookingType === "vet") {
        endpoint = `${API_BASE_URL}/receptionist/appointments`;
        payload = {
          pet_id: bookingFormData.petId,
          customer_id: bookingFormData.customerId,
          service_id: bookingFormData.service,
          scheduled_at: `${bookingFormData.appointmentDate}T${bookingFormData.appointmentTime}`,
          price: amount,
          payment_status: paymentStatus,
          paid_amount: paidAmount,
          payment_method: bookingFormData.paymentMethod,
          symptoms: bookingFormData.symptoms,
          medical_notes: bookingFormData.medicalNotes
        };
      } else if (bookingFormData.bookingType === "grooming") {
        endpoint = `${API_BASE_URL}/grooming`;
        payload = {
          pet_id: bookingFormData.petId,
          customer_id: bookingFormData.customerId,
          service_id: bookingFormData.service,
          scheduled_at: `${bookingFormData.appointmentDate}T${bookingFormData.appointmentTime}`,
          price: amount,
          payment_status: paymentStatus,
          paid_amount: paidAmount,
          payment_method: bookingFormData.paymentMethod,
          special_requests: bookingFormData.specialRequests
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Add new booking to the bookings list after successful POST
        setBookings(prev => [...prev, newBooking]);
        console.log(`${bookingFormData.bookingType} appointment booked:`, bookingFormData);
        alert(`${bookingFormData.bookingType} appointment booked successfully!`);
        handleBookingCancel();
        fetchBookings();
      } else {
        alert('Failed to create booking. Please try again.');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  const handleBookingCancel = () => {
    setBookingFormData({
      customerId: "",
      petId: "",
      ownerName: "",
      petName: "",
      petType: "",
      breed: "",
      appointmentDate: "",
      appointmentTime: "10:00 AM",
      service: "",
      duration: "1 day",
      roomType: "Standard Room",
      specialRequests: "",
      bookingType: "hotel",
      paymentMethod: "cash",
      paymentStatus: "pending",
      paidAmount: "0"
    });
    setShowNewBookingModal(false);
  };

  // Check availability before approving
  const checkAvailability = async (booking, newDateValue = null) => {
    setCheckingAvailability(true);
    setAvailability(null);

    try {
      const token = localStorage.getItem('token');
      const targetDate = newDateValue || booking.appointmentDate || booking.checkIn;

      let endpoint = '';
      if (booking.type === 'hotel') {
        endpoint = `${API_BASE_URL}/boardings/available-rooms?check_in=${targetDate}&check_out=${targetDate}`;
      } else if (booking.type === 'vet') {
        endpoint = `${API_BASE_URL}/receptionist/appointment/list?from_date=${targetDate}&to_date=${targetDate}`;
      } else if (booking.type === 'grooming') {
        endpoint = `${API_BASE_URL}/grooming`;
      }
      
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      
      if (response.ok) {
        const data = await response.json();
        setAvailability({
          available: data.available !== false,
          message: data.message || 'Live route reachable',
          details: data
        });
      } else {
        setAvailability({
          available: false,
          message: 'Failed to check availability',
          details: null
        });
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailability({
        available: false,
        message: 'Error checking availability',
        details: null
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Send notification to customer about booking status change
  const sendCustomerNotification = async (booking, action, note) => {
    try {
      const token = localStorage.getItem('token');
      const notificationData = {
        customer_id: booking.customerId,
        booking_id: booking.id,
        booking_type: booking.type,
        pet_name: booking.petName,
        service: booking.service,
        action: action, // 'approved', 'rejected', 'rescheduled'
        note: note,
        date: booking.appointmentDate || booking.checkIn
      };

      const response = await fetch(`${API_BASE_URL}/notifications/booking-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      });

      if (response.ok) {
        console.log('Notification sent successfully');
      } else {
        console.error('Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  // Payment verification handlers
  const openPaymentModal = (booking, action) => {
    setSelectedPaymentBooking(booking);
    setPaymentAction(action);
    setPaymentNote('');
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPaymentBooking(null);
    setPaymentAction(null);
    setPaymentNote('');
  };

  const handlePaymentSubmit = async () => {
    if (!selectedPaymentBooking) return;

    try {
      const token = localStorage.getItem('token');
      const endpoint = `${API_BASE_URL}/cashier/payment-requests/${selectedPaymentBooking.id}/${paymentAction === 'verify' ? 'verify' : 'reject'}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cashier_remarks: paymentNote })
      });

      if (response.ok) {
        alert(`Payment ${paymentAction === 'verify' ? 'verified' : 'rejected'} successfully`);
        closePaymentModal();
        fetchBookings();
      } else {
        alert('Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to update payment status');
    }
  };

  // Cancel request handlers
  const openCancelModal = (booking, action) => {
    setSelectedCancelBooking(booking);
    setCancelAction(action);
    setCancelNote('');
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedCancelBooking(null);
    setCancelAction(null);
    setCancelNote('');
  };

  const handleCancelSubmit = async () => {
    if (!selectedCancelBooking) return;

    try {
      const token = localStorage.getItem('token');
      let endpoint = `${API_BASE_URL}/receptionist/appointments/${selectedCancelBooking.id}/cancel`;
      if (selectedCancelBooking.type === 'hotel') {
        endpoint = `${API_BASE_URL}/boardings/${selectedCancelBooking.id}/cancel`;
      }

      const payload = {
        action: cancelAction, // 'approve' or 'reject'
        note: cancelNote
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Send notification to customer
        await sendCustomerNotification(selectedCancelBooking, cancelAction === 'approve' ? 'cancelled' : 'cancel_rejected', cancelNote);

        alert(`Cancel request ${cancelAction === 'approve' ? 'approved' : 'rejected'} successfully`);
        closeCancelModal();
        fetchBookings();
      } else {
        alert('Failed to update cancel request');
      }
    } catch (error) {
      console.error('Error updating cancel request:', error);
      alert('Failed to update cancel request');
    }
  };

  // Reschedule request handlers
  const openRescheduleModal = (booking, action) => {
    setSelectedRescheduleBooking(booking);
    setRescheduleAction(action);
    setRescheduleNote('');
    setRescheduleNewDate('');
    setShowRescheduleModal(true);
  };

  const closeRescheduleModal = () => {
    setShowRescheduleModal(false);
    setSelectedRescheduleBooking(null);
    setRescheduleAction(null);
    setRescheduleNote('');
    setRescheduleNewDate('');
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedRescheduleBooking) return;

    try {
      const token = localStorage.getItem('token');
      let endpoint = `${API_BASE_URL}/receptionist/appointments/${selectedRescheduleBooking.id}/reschedule`;
      let payload = {
        scheduled_at: rescheduleNewDate,
        reason: rescheduleNote
      };

      if (selectedRescheduleBooking.type === 'hotel') {
        endpoint = `${API_BASE_URL}/boardings/${selectedRescheduleBooking.id}`;
        payload = {
          check_in: rescheduleNewDate,
          check_out: rescheduleNewDate,
          notes: rescheduleNote
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Send notification to customer
        await sendCustomerNotification(selectedRescheduleBooking, rescheduleAction === 'approve' ? 'rescheduled' : 'reschedule_rejected', rescheduleNote);

        alert(`Reschedule request ${rescheduleAction === 'approve' ? 'approved' : 'rejected'} successfully`);
        closeRescheduleModal();
        fetchBookings();
      } else {
        alert('Failed to update reschedule request');
      }
    } catch (error) {
      console.error('Error updating reschedule request:', error);
      alert('Failed to update reschedule request');
    }
  };

  // Booking history handlers
  const openHistoryModal = async (booking) => {
    setSelectedHistoryBooking(booking);
    setShowHistoryModal(true);

    // Fetch booking history from backend
    try {
      const token = localStorage.getItem('token');
      const endpoint = `${API_BASE_URL}/${booking.type === 'hotel' ? 'boardings' : 'receptionist/appointments'}/${booking.id}`;

      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBookingHistory(data.history || []);
      } else {
        // Fallback to mock history if API not available
        setBookingHistory([
          {
            id: 1,
            action: 'created',
            status: 'pending',
            note: 'Booking created by customer',
            timestamp: booking.createdAt,
            user: booking.owner
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching booking history:', error);
      // Fallback to mock history
      setBookingHistory([
        {
          id: 1,
          action: 'created',
            status: 'pending',
            note: 'Booking created by customer',
            timestamp: booking.createdAt,
            user: booking.owner
          }
        ]);
    }
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedHistoryBooking(null);
    setBookingHistory([]);
  };

  // Action handlers for booking requests
  const openActionModal = (booking, type) => {
    setSelectedBooking(booking);
    setActionType(type);
    setActionNote('');
    setNewDate('');
    setAvailability(null);
    setShowActionModal(true);
    
    // Check availability for approve and reschedule actions
    if (type === 'approve' || type === 'reschedule') {
      checkAvailability(booking);
    }
  };

  const closeActionModal = () => {
    setShowActionModal(false);
    setSelectedBooking(null);
    setActionType(null);
    setActionNote('');
    setNewDate('');
  };

  const handleActionSubmit = async () => {
    if (!selectedBooking) return;

    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      let method = 'POST';
      let payload = {};

      if (selectedBooking.type === 'hotel') {
        if (actionType === 'approve') {
          endpoint = `${API_BASE_URL}/boardings/${selectedBooking.id}/confirm`;
          payload = { notes: actionNote };
        } else if (actionType === 'reject') {
          endpoint = `${API_BASE_URL}/boardings/${selectedBooking.id}/reject`;
          payload = { reason: actionNote };
        } else if (actionType === 'reschedule') {
          endpoint = `${API_BASE_URL}/boardings/${selectedBooking.id}`;
          method = 'PUT';
          payload = { check_in: newDate, check_out: newDate, notes: actionNote };
        }
      } else if (selectedBooking.type === 'grooming') {
        endpoint = `${API_BASE_URL}/grooming/${selectedBooking.id}/status`;
        method = 'PUT';
        payload = {
          status: actionType === 'approve' ? 'approved' : actionType === 'reject' ? 'rejected' : 'pending',
          notes: actionNote,
        };
      } else {
        if (actionType === 'approve') {
          endpoint = `${API_BASE_URL}/appointments/${selectedBooking.id}/status`;
          method = 'PATCH';
          payload = { status: 'scheduled', notes: actionNote };
        } else if (actionType === 'reject') {
          endpoint = `${API_BASE_URL}/receptionist/appointments/${selectedBooking.id}/reject`;
          payload = { reason: actionNote };
        } else if (actionType === 'reschedule') {
          endpoint = `${API_BASE_URL}/receptionist/appointments/${selectedBooking.id}/reschedule`;
          payload = { scheduled_at: newDate, notes: actionNote };
        }
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Send notification to customer
        await sendCustomerNotification(selectedBooking, actionType, actionNote);

        alert(`Booking ${actionType}d successfully`);
        closeActionModal();
        fetchBookings();
      } else {
        alert('Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking');
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('token');
      const [bookingsRes, boardingsRes, groomingRes] = await Promise.all([
        fetch(`${API_BASE_URL}/receptionist/appointment/list`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/boardings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/grooming`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const allBookings = [];

      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        const bookings = Array.isArray(data) ? data : data.bookings || data.appointments || data.data || [];
        bookings.forEach(booking => {
          allBookings.push({
            id: booking.id,
            type: 'vet',
            petName: booking.pet?.name || 'Pet',
            petType: booking.pet?.species || 'Pet',
            breed: booking.pet?.breed || '',
            owner: booking.customer?.name || 'Customer',
            ownerPhone: booking.customer?.phone || '',
            service: booking.service?.name || booking.service || 'Veterinary Service',
            appointmentDate: booking.appointment_date || booking.scheduled_at || '',
            appointmentTime: booking.appointment_time || '',
            status: booking.status || 'pending',
            amount: 0,
            paidAmount: 0,
            paymentStatus: 'pending',
            createdAt: booking.created_at || new Date().toISOString()
          });
        });
      }

      if (boardingsRes.ok) {
        const data = await boardingsRes.json();
        const boardings = Array.isArray(data) ? data : data.boardings || data.data || [];
        boardings.forEach(boarding => {
          allBookings.push({
            id: boarding.id,
            type: 'hotel',
            petName: boarding.pet?.name || 'Pet',
            petType: boarding.pet?.species || 'Pet',
            breed: boarding.pet?.breed || '',
            owner: boarding.customer?.name || 'Customer',
            ownerPhone: boarding.customer?.phone || '',
            roomType: boarding.room_type || 'Room',
            checkIn: boarding.check_in || '',
            checkOut: boarding.check_out || '',
            service: 'Hotel Stay',
            appointmentDate: boarding.check_in || '',
            appointmentTime: '',
            status: boarding.status || 'pending',
            amount: boarding.total_amount || 0,
            paidAmount: boarding.paid_amount || 0,
            paymentStatus: boarding.payment_status || 'pending',
            createdAt: boarding.created_at || new Date().toISOString()
          });
        });
      }

      if (groomingRes.ok) {
        const data = await groomingRes.json();
        const groomings = Array.isArray(data) ? data : data.groomings || data.data || [];
        groomings.forEach((grooming) => {
          allBookings.push({
            id: grooming.id,
            type: 'grooming',
            petName: grooming.pet?.name || grooming.pet_name || 'Pet',
            petType: grooming.pet?.species || 'Pet',
            breed: grooming.pet?.breed || '',
            owner: grooming.customer?.name || grooming.customer_name || 'Customer',
            ownerPhone: grooming.customer?.phone || '',
            service: grooming.service || grooming.service_name || 'Grooming',
            appointmentDate: grooming.appointment_date || grooming.scheduled_at || '',
            appointmentTime: grooming.appointment_time || '',
            status: grooming.status || 'pending',
            amount: grooming.amount || grooming.price || 0,
            paidAmount: grooming.paid_amount || 0,
            paymentStatus: grooming.payment_status || 'unpaid',
            createdAt: grooming.created_at || new Date().toISOString()
          });
        });
      }

      allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(allBookings);
    } catch (error) {
      setError(error.message || "Failed to load bookings");
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bookings on mount
  useEffect(() => {
    fetchBookings();
    const intervalId = setInterval(fetchBookings, 30000); // fetch bookings every 30 seconds
    return () => clearInterval(intervalId);
  }, []);

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = filter === "all" || booking.status === filter;

    const keyword = searchTerm.toLowerCase();

    const matchesSearch =
      booking.id?.toString().toLowerCase().includes(keyword) ||
      booking.petName?.toLowerCase().includes(keyword) ||
      booking.owner?.toLowerCase().includes(keyword) ||
      booking.service?.toLowerCase().includes(keyword) ||
      booking.type?.toLowerCase().includes(keyword);

    return matchesStatus && matchesSearch;
  });

  // Dashboard summary stats
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const pendingPayments = bookings.filter(b => b.paymentStatus === 'pending').length;
  const cancelRequests = bookings.filter(b => b.status === 'cancel_requested').length;
  const rescheduleRequests = bookings.filter(b => b.status === 'reschedule_requested').length;

  return (
    <div className="receptionist-bookings">
      <div className="booking-header">
        <h2>
          <FontAwesomeIcon icon={faCalendarAlt} /> Booking Management
        </h2>
        <button
          className="primary-btn create-btn"
          onClick={() => setShowNewBookingModal(true)}
        >
          <FontAwesomeIcon icon={faPlus} />
          Create Booking
        </button>
      </div>

      {/* Dashboard Summary */}
      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>Pending Bookings</h3>
          <p className="summary-number">{pendingBookings}</p>
        </div>
        <div className="summary-card">
          <h3>Pending Payments</h3>
          <p className="summary-number">{pendingPayments}</p>
        </div>
        <div className="summary-card">
          <h3>Cancel Requests</h3>
          <p className="summary-number">{cancelRequests}</p>
        </div>
        <div className="summary-card">
          <h3>Reschedule Requests</h3>
          <p className="summary-number">{rescheduleRequests}</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="booking-tools">
        <input
          type="text"
          placeholder="Search by pet, owner, service, type, or booking ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="booking-search"
        />
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
          All
        </button>

        <button className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")}>
          Pending
        </button>

        <button className={filter === "confirmed" ? "active" : ""} onClick={() => setFilter("confirmed")}>
          Approved
        </button>

        <button className={filter === "cancel_requested" ? "active" : ""} onClick={() => setFilter("cancel_requested")}>
          Cancel Requests
        </button>

        <button className={filter === "reschedule_requested" ? "active" : ""} onClick={() => setFilter("reschedule_requested")}>
          Reschedule
        </button>

        <button className={filter === "cancelled" ? "active" : ""} onClick={() => setFilter("cancelled")}>
          Rejected
        </button>
      </div>
      
      {/* Bookings Table */}
      <div className="bookings-table-container">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Pet</th>
              <th>Owner</th>
              <th>Service</th>
              <th>Date</th>
              <th>Time</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                  No bookings found.
                </td>
              </tr>
            )}
            {filteredBookings.map((booking) => (
              <tr key={booking.id}>
                <td>
                  <span className={`booking-type ${booking.type}`}>
                    {booking.type === "hotel" && <FontAwesomeIcon icon={faHotel} />}
                    {booking.type === "vet" && <FontAwesomeIcon icon={faStethoscope} />}
                    {booking.type === "grooming" && <FontAwesomeIcon icon={faCut} />}
                    {booking.type === "hotel" && "Hotel"}
                    {booking.type === "vet" && "Vet"}
                    {booking.type === "grooming" && "Grooming"}
                  </span>
                </td>
                <td>{booking.petName}</td>
                <td>{booking.owner}</td>
                <td>{booking.service}</td>
                <td>{booking.appointmentDate || booking.checkIn}</td>
                <td>{booking.appointmentTime || "N/A"}</td>
                <td>
                  <span className={`payment-status ${booking.paymentStatus || 'pending'}`}>
                    {booking.paymentStatus === 'paid' ? 'Paid' :
                     booking.paymentStatus === 'partial' ? 'Partial' : 'Pending'}
                  </span>
                </td>
                <td>
                  <span className={`status ${booking.status}`}>
                    {booking.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {booking.status === 'pending' && (
                      <>
                        <button className="action-btn approve" onClick={() => openActionModal(booking, 'approve')} title="Approve">
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                        <button className="action-btn reject" onClick={() => openActionModal(booking, 'reject')} title="Reject">
                          <FontAwesomeIcon icon={faBan} />
                        </button>
                        <button className="action-btn reschedule" onClick={() => openActionModal(booking, 'reschedule')} title="Reschedule">
                          <FontAwesomeIcon icon={faClock} />
                        </button>
                      </>
                    )}
                    {booking.status === 'cancel_requested' && (
                      <>
                        <button className="action-btn approve" onClick={() => openCancelModal(booking, 'approve')} title="Approve Cancel">
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                        <button className="action-btn reject" onClick={() => openCancelModal(booking, 'reject')} title="Reject Cancel">
                          <FontAwesomeIcon icon={faBan} />
                        </button>
                      </>
                    )}
                    {booking.status === 'reschedule_requested' && (
                      <>
                        <button className="action-btn approve" onClick={() => openRescheduleModal(booking, 'approve')} title="Approve Reschedule">
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                        <button className="action-btn reject" onClick={() => openRescheduleModal(booking, 'reject')} title="Reject Reschedule">
                          <FontAwesomeIcon icon={faBan} />
                        </button>
                      </>
                    )}
                    <button className="action-btn history" onClick={() => openHistoryModal(booking)} title="View History">
                      <FontAwesomeIcon icon={faHistory} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Modal */}
      {showActionModal && selectedBooking && (
        <div className="appointment-modal-overlay" onClick={closeActionModal}>
          <div className="appointment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {actionType === 'approve' && 'Approve Booking'}
                {actionType === 'reject' && 'Reject Booking'}
                {actionType === 'reschedule' && 'Reschedule Booking'}
              </h2>
              <button className="close-btn" onClick={closeActionModal}>×</button>
            </div>
            <div className="modal-content">
              <div className="booking-details-summary">
                <p><strong>Pet:</strong> {selectedBooking.petName}</p>
                <p><strong>Owner:</strong> {selectedBooking.owner}</p>
                <p><strong>Service:</strong> {selectedBooking.service}</p>
                <p><strong>Date:</strong> {selectedBooking.appointmentDate || selectedBooking.checkIn}</p>
              </div>
              
              {/* Availability Check Display */}
              {(actionType === 'approve' || actionType === 'reschedule') && (
                <div className={`availability-check ${availability?.available ? 'available' : 'unavailable'}`}>
                  {checkingAvailability ? (
                    <p><strong>Checking availability...</strong></p>
                  ) : availability ? (
                    <>
                      <p><strong>Status:</strong> {availability.available ? '✓ Available' : '✗ Not Available'}</p>
                      <p>{availability.message}</p>
                    </>
                  ) : (
                    <p><strong>Status:</strong> Checking...</p>
                  )}
                </div>
              )}
              
              <form className="appointment-form" onSubmit={(e) => { e.preventDefault(); handleActionSubmit(); }}>
                <div className="form-group">
                  <label>
                    {actionType === 'reschedule' ? 'New Date' : 'Receptionist Note'}
                  </label>
                  {actionType === 'reschedule' ? (
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      required
                    />
                  ) : (
                    <textarea
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                      placeholder={actionType === 'approve' ? 'Add approval note (optional)...' : 'Provide reason for rejection...'}
                      rows={4}
                    />
                  )}
                </div>
                <div className="modal-actions">
                  <button type="button" className="secondary-btn" onClick={closeActionModal}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn" disabled={!availability?.available && (actionType === 'approve' || actionType === 'reschedule')}>
                    {actionType === 'approve' && 'Approve'}
                    {actionType === 'reject' && 'Reject'}
                    {actionType === 'reschedule' && 'Reschedule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Verification Modal */}
      {showPaymentModal && selectedPaymentBooking && (
        <div className="appointment-modal-overlay" onClick={closePaymentModal}>
          <div className="appointment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {paymentAction === 'verify' ? 'Verify Payment' : 'Reject Payment'}
              </h2>
              <button className="close-btn" onClick={closePaymentModal}>×</button>
            </div>
            <div className="modal-content">
              <div className="booking-details-summary">
                <p><strong>Pet:</strong> {selectedPaymentBooking.petName}</p>
                <p><strong>Owner:</strong> {selectedPaymentBooking.owner}</p>
                <p><strong>Service:</strong> {selectedPaymentBooking.service}</p>
                <p><strong>Amount:</strong> ${selectedPaymentBooking.amount}</p>
                <p><strong>Paid:</strong> ${selectedPaymentBooking.paidAmount}</p>
                <p><strong>Payment Status:</strong> {selectedPaymentBooking.paymentStatus}</p>
              </div>
              
              <form className="appointment-form" onSubmit={(e) => { e.preventDefault(); handlePaymentSubmit(); }}>
                <div className="form-group">
                  <label>Receptionist Note</label>
                  <textarea
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder={paymentAction === 'verify' ? 'Add verification note (optional)...' : 'Provide reason for rejection...'}
                    rows={4}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="secondary-btn" onClick={closePaymentModal}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    {paymentAction === 'verify' ? 'Verify Payment' : 'Reject Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Request Modal */}
      {showCancelModal && selectedCancelBooking && (
        <div className="appointment-modal-overlay" onClick={closeCancelModal}>
          <div className="appointment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {cancelAction === 'approve' ? 'Approve Cancel Request' : 'Reject Cancel Request'}
              </h2>
              <button className="close-btn" onClick={closeCancelModal}>×</button>
            </div>
            <div className="modal-content">
              <div className="booking-details-summary">
                <p><strong>Pet:</strong> {selectedCancelBooking.petName}</p>
                <p><strong>Owner:</strong> {selectedCancelBooking.owner}</p>
                <p><strong>Service:</strong> {selectedCancelBooking.service}</p>
                <p><strong>Date:</strong> {selectedCancelBooking.appointmentDate || selectedCancelBooking.checkIn}</p>
                <p><strong>Amount:</strong> ${selectedCancelBooking.amount}</p>
              </div>
              
              <form className="appointment-form" onSubmit={(e) => { e.preventDefault(); handleCancelSubmit(); }}>
                <div className="form-group">
                  <label>Receptionist Note</label>
                  <textarea
                    value={cancelNote}
                    onChange={(e) => setCancelNote(e.target.value)}
                    placeholder={cancelAction === 'approve' ? 'Add approval note (optional)...' : 'Provide reason for rejection...'}
                    rows={4}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="secondary-btn" onClick={closeCancelModal}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    {cancelAction === 'approve' ? 'Approve Cancel' : 'Reject Cancel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Booking History Modal */}
      {showHistoryModal && selectedHistoryBooking && (
        <div className="appointment-modal-overlay" onClick={closeHistoryModal}>
          <div className="appointment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking History</h2>
              <button className="close-btn" onClick={closeHistoryModal}>×</button>
            </div>
            <div className="modal-content">
              <div className="booking-details-summary">
                <p><strong>Pet:</strong> {selectedHistoryBooking.petName}</p>
                <p><strong>Owner:</strong> {selectedHistoryBooking.owner}</p>
                <p><strong>Service:</strong> {selectedHistoryBooking.service}</p>
                <p><strong>Date:</strong> {selectedHistoryBooking.appointmentDate || selectedHistoryBooking.checkIn}</p>
              </div>
              
              <div className="history-timeline">
                {bookingHistory.length === 0 ? (
                  <p className="no-history">No history available</p>
                ) : (
                  bookingHistory.map((historyItem) => (
                    <div key={historyItem.id} className="history-item">
                      <div className="history-timestamp">
                        {new Date(historyItem.timestamp).toLocaleString()}
                      </div>
                      <div className="history-content">
                        <div className="history-action">
                          <strong>{historyItem.action}</strong>
                          {historyItem.status && (
                            <span className={`history-status ${historyItem.status}`}>
                              {historyItem.status}
                            </span>
                          )}
                        </div>
                        {historyItem.note && (
                          <div className="history-note">{historyItem.note}</div>
                        )}
                        {historyItem.user && (
                          <div className="history-user">by {historyItem.user}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Walk-in Booking Modal */}
      {showNewBookingModal && (
        <div className="appointment-modal-overlay" onClick={() => setShowNewBookingModal(false)}>
          <div className="appointment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Booking (Walk-in)</h2>
              <button 
                className="close-btn"
                onClick={() => setShowNewBookingModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <form className="appointment-form" onSubmit={handleBookingSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Booking Type *</label>
                    <select
                      name="bookingType"
                      value={bookingFormData.bookingType}
                      onChange={handleBookingInputChange}
                      required
                    >
                      <option value="">Select booking type...</option>
                      <option value="hotel">Hotel</option>
                      <option value="vet">Veterinary</option>
                      <option value="grooming">Grooming</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Select Customer *</label>
                    <select
                      name="customerId"
                      value={bookingFormData.customerId}
                      onChange={(e) => handleCustomerChange(e.target.value)}
                      required
                    >
                      <option value="">Choose a customer...</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} ({customer.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Select Pet *</label>
                    <select
                      name="petId"
                      value={bookingFormData.petId}
                      onChange={(e) => handlePetChange(e.target.value)}
                      required
                      disabled={!bookingFormData.customerId}
                    >
                      <option value="">
                        {bookingFormData.customerId ? "Choose a pet..." : "Select customer first"}
                      </option>
                      {getAvailablePets().map(pet => (
                        <option key={pet.id} value={pet.id}>
                          {pet.name} ({pet.type} - {pet.breed})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Pet Name</label>
                    <input
                      type="text"
                      name="petName"
                      value={bookingFormData.petName}
                      onChange={handleBookingInputChange}
                      placeholder="Pet name (auto-filled)"
                      disabled
                      style={{ backgroundColor: '#f8f9fa' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Pet Type</label>
                    <input
                      type="text"
                      name="petType"
                      value={bookingFormData.petType}
                      onChange={handleBookingInputChange}
                      placeholder="Pet type (auto-filled)"
                      disabled
                      style={{ backgroundColor: '#f8f9fa' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Breed</label>
                    <input
                      type="text"
                      name="breed"
                      value={bookingFormData.breed}
                      onChange={handleBookingInputChange}
                      placeholder="Breed (auto-filled)"
                      disabled
                      style={{ backgroundColor: '#f8f9fa' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Owner Name</label>
                    <input
                      type="text"
                      name="ownerName"
                      value={bookingFormData.ownerName}
                      onChange={handleBookingInputChange}
                      placeholder="Owner name (auto-filled)"
                      disabled
                      style={{ backgroundColor: '#f8f9fa' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Appointment Date *</label>
                    <input
                      type="date"
                      name="appointmentDate"
                      value={bookingFormData.appointmentDate}
                      onChange={handleBookingInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Appointment Time</label>
                    <select
                      name="appointmentTime"
                      value={bookingFormData.appointmentTime}
                      onChange={handleBookingInputChange}
                    >
                      <option value="09:00 AM">9:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="02:00 PM">2:00 PM</option>
                      <option value="03:00 PM">3:00 PM</option>
                      <option value="04:00 PM">4:00 PM</option>
                      <option value="05:00 PM">5:00 PM</option>
                    </select>
                  </div>

                  {/* Dynamic fields based on booking type */}
                  {bookingFormData.bookingType === "hotel" && (
                    <>
                      <div className="form-group">
                        <label>Room Type *</label>
                        <select
                          name="roomType"
                          value={bookingFormData.roomType}
                          onChange={handleBookingInputChange}
                          required
                        >
                          <option value="Standard Room">Standard Room</option>
                          <option value="Deluxe Suite">Deluxe Suite</option>
                          <option value="Presidential Suite">Presidential Suite</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Duration *</label>
                        <select
                          name="duration"
                          value={bookingFormData.duration}
                          onChange={handleBookingInputChange}
                          required
                        >
                          <option value="1 day">1 day</option>
                          <option value="2 days">2 days</option>
                          <option value="3 days">3 days</option>
                          <option value="1 week">1 week</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Service *</label>
                        <select
                          name="service"
                          value={bookingFormData.service}
                          onChange={handleBookingInputChange}
                          required
                        >
                          <option value="Pet Hotel Stay">Pet Hotel Stay</option>
                          <option value="Day Care">Day Care</option>
                          <option value="Pet Training">Pet Training</option>
                        </select>
                      </div>
                    </>
                  )}

                  {bookingFormData.bookingType === "vet" && (
                    <>
                      <div className="form-group">
                        <label>Service *</label>
                        <select
                          name="service"
                          value={bookingFormData.service}
                          onChange={handleBookingInputChange}
                          required
                        >
                          <option value="Checkup">Checkup</option>
                          <option value="Vaccination">Vaccination</option>
                          <option value="Surgery">Surgery</option>
                          <option value="Dental Cleaning">Dental Cleaning</option>
                          <option value="Grooming">Grooming</option>
                          <option value="Emergency">Emergency</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Symptoms</label>
                        <textarea
                          name="symptoms"
                          value={bookingFormData.symptoms}
                          onChange={handleBookingInputChange}
                          placeholder="Describe symptoms or reason for visit..."
                        />
                      </div>
                    </>
                  )}

                  {bookingFormData.bookingType === "grooming" && (
                    <>
                      <div className="form-group">
                        <label>Service *</label>
                        <select
                          name="service"
                          value={bookingFormData.service}
                          onChange={handleBookingInputChange}
                          required
                        >
                          <option value="Bath">Bath</option>
                          <option value="Haircut">Haircut</option>
                          <option value="Nail Trim">Nail Trim</option>
                          <option value="Full Grooming">Full Grooming</option>
                          <option value="Teeth Cleaning">Teeth Cleaning</option>
                          <option value="Flea Treatment">Flea Treatment</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Payment Section */}
                  <div className="payment-section">
                    <h4>Payment Information</h4>
                    <div className="form-group">
                      <label>Payment Method *</label>
                      <select
                        name="paymentMethod"
                        value={bookingFormData.paymentMethod}
                        onChange={handleBookingInputChange}
                        required
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Credit Card</option>
                        <option value="gcash">GCash</option>
                        <option value="bank">Bank Transfer</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Paid Amount</label>
                      <input
                        type="number"
                        name="paidAmount"
                        value={bookingFormData.paidAmount}
                        onChange={handleBookingInputChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Special Requests</label>
                    <textarea
                      name="specialRequests"
                      value={bookingFormData.specialRequests}
                      onChange={handleBookingInputChange}
                      placeholder="Any special requests or notes..."
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="secondary-btn" onClick={handleBookingCancel}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    Create Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistBookings;
