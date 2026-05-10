import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./CustomerBookings.css";
import { apiRequest } from "../../api/client";
import {
  FaCalendarCheck,
  FaCheckCircle,
  FaClock,
  FaCut,
  FaHotel,
  FaPaw,
  FaReceipt,
  FaSearch,
  FaStethoscope,
  FaTimes,
  FaUpload,
  FaUser,
  FaWallet,
  FaExclamationTriangle,
  FaSyncAlt,
  FaClipboardList,
} from "react-icons/fa";

const groomingServices = [
  {
    name: "Basic Bath",
    category: "Grooming",
    price: 500,
    description: "Bath, blow dry, and basic coat cleaning.",
  },
  {
    name: "Full Grooming Package",
    category: "Grooming",
    price: 1500,
    description: "Bath, haircut, nail trim, ear cleaning, and finishing.",
  },
  {
    name: "Haircut Only",
    category: "Grooming",
    price: 800,
    description: "Breed-appropriate haircut or trimming.",
  },
  {
    name: "Nail Trim",
    category: "Grooming",
    price: 200,
    description: "Safe nail trimming for pets.",
  },
  {
    name: "Teeth Cleaning",
    category: "Grooming",
    price: 350,
    description: "Basic pet teeth cleaning.",
  },
];

const hotelServices = [
  {
    name: "Standard Room",
    category: "Pet Hotel",
    price: 500,
    description: "Comfortable standard boarding room.",
  },
  {
    name: "Deluxe Room",
    category: "Pet Hotel",
    price: 850,
    description: "Larger room with additional comfort.",
  },
  {
    name: "Suite",
    category: "Pet Hotel",
    price: 1200,
    description: "Premium suite for pets that need extra space.",
  },
];

const CustomerBookings = () => {
  const customerEmail = localStorage.getItem("email") || "";
  const customerName = localStorage.getItem("name") || "Customer";

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [bookings, setBookings] = useState([]);
  const [vetServices, setVetServices] = useState([]);
  const [pets, setPets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [petsLoading, setPetsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [veterinaryAvailability, setVeterinaryAvailability] = useState(null);
  const [groomingAvailability, setGroomingAvailability] = useState(null);
  const [boardingAvailability, setBoardingAvailability] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formData, setFormData] = useState({
    customer_name: customerName,
    customer_email: customerEmail,
    pet_id: "",
    pet_name: "",
    service_type: "",
    service_name: "",
    request_date: "",
    request_time: "",
    check_out_date: "",
    notes: "",
  });

  const safeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.data?.data)) return value.data.data;
    if (Array.isArray(value?.services)) return value.services;
    if (Array.isArray(value?.requests)) return value.requests;
    if (Array.isArray(value?.pets)) return value.pets;
    if (Array.isArray(value?.records)) return value.records;
    if (Array.isArray(value?.result)) return value.result;
    if (Array.isArray(value?.results)) return value.results;
    return [];
  };

  const getPetName = (pet) => pet?.name || pet?.pet_name || "Unnamed Pet";
  const getPetSpecies = (pet) => pet?.species || pet?.type || "Pet";
  const getPetBreed = (pet) => pet?.breed || "Unknown breed";

  const formatCurrency = (value) => {
    const number = Number(value || 0);

    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const formatDate = (value) => {
    if (!value) return "No date";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const normalizeStatus = (status) =>
    String(status || "pending").toLowerCase().replace(/\s+/g, "_");

  const getBookingTypeMeta = (type) => {
    const value = String(type || "").toLowerCase();

    if (value === "hotel") {
      return {
        id: "Hotel",
        type: "hotel",
        icon: <FaHotel />,
        emoji: "🏨",
        title: "Pet Hotel",
        shortTitle: "Hotel",
        description: "Reserve a comfortable stay for your pet.",
        defaultService: "Standard Room",
        accent: "hotel",
      };
    }

    if (value === "vet") {
      return {
        id: "Vet",
        type: "vet",
        icon: <FaStethoscope />,
        emoji: "🏥",
        title: "Veterinary",
        shortTitle: "Vet",
        description: "Book checkups, vaccines, and pet care services.",
        defaultService: "General Consultation",
        accent: "vet",
      };
    }

    return {
      id: "Groom",
      type: "grooming",
      icon: <FaCut />,
      emoji: "✂️",
      title: "Grooming",
      shortTitle: "Groom",
      description: "Schedule grooming and hygiene services.",
      defaultService: "Basic Bath",
      accent: "grooming",
    };
  };

  const bookingTypes = useMemo(
    () => [
      getBookingTypeMeta("hotel"),
      getBookingTypeMeta("vet"),
      getBookingTypeMeta("grooming"),
    ],
    []
  );

  const serviceOptions = useMemo(() => {
    if (selectedBooking === "Hotel") return hotelServices;
    if (selectedBooking === "Vet") return vetServices;
    if (selectedBooking === "Groom") return groomingServices;
    return [];
  }, [selectedBooking, vetServices]);

  const selectedService = useMemo(() => {
    return serviceOptions.find(
      (service) => String(service.name) === String(formData.service_name)
    );
  }, [serviceOptions, formData.service_name]);

  const fetchCustomerPets = useCallback(async () => {
    try {
      setPetsLoading(true);

      let petsData = null;

      try {
        petsData = await apiRequest("/customer/pets");
      } catch (customerPetsError) {
        console.warn("Customer pets endpoint failed. Trying /pets:", customerPetsError);
        petsData = await apiRequest("/pets");
      }

      const petList = safeArray(petsData);
      setPets(petList);
    } catch (error) {
      console.error("Failed to load customer pets:", error);
      setPets([]);
    } finally {
      setPetsLoading(false);
    }
  }, []);

  const fetchVetServices = useCallback(async () => {
    try {
      setServicesLoading(true);

      const data = await apiRequest("/services");
      const services = safeArray(data);

      setVetServices(services);
    } catch (error) {
      setVetServices([]);
    } finally {
      setServicesLoading(false);
    }
  }, []);

  const fetchBookings = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (!silent) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        if (!customerEmail) {
          setBookings([]);
          return;
        }

        const data = await apiRequest(
          `/customer/my-requests?email=${encodeURIComponent(customerEmail)}`
        );

        const requests = safeArray(data);

        const mappedBookings = requests.map((item) => {
          const meta = getBookingTypeMeta(item.type || item.service_type);

          return {
            id: item.id,
            raw: item,
            type: meta.shortTitle,
            serviceType: meta.type,
            icon: meta.emoji,
            title: meta.title,
            pet: item.pet || item.pet_name || "Unknown Pet",
            service: item.service || item.service_name || "Service Request",
            details: `${item.pet || item.pet_name || "Unknown Pet"} • ${
              item.service || item.service_name || "Service Request"
            }`,
            date: item.date || item.request_date || item.created_at || "",
            time: item.time || item.request_time || "",
            notes: item.notes || "",
            status: normalizeStatus(item.status),
          };
        });

        mappedBookings.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        setBookings(mappedBookings);
        setErrorMessage("");
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setErrorMessage("Failed to load your bookings. Please refresh the page.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [customerEmail]
  );

  useEffect(() => {
    fetchBookings();
    fetchVetServices();
    fetchCustomerPets();
  }, [fetchBookings, fetchVetServices, fetchCustomerPets]);

  const stats = useMemo(() => {
    return bookings.reduce(
      (acc, booking) => {
        acc.total += 1;
        acc[booking.status] = (acc[booking.status] || 0) + 1;

        if (booking.serviceType === "hotel") acc.hotel += 1;
        if (booking.serviceType === "vet") acc.vet += 1;
        if (booking.serviceType === "grooming") acc.grooming += 1;

        return acc;
      },
      {
        total: 0,
        pending: 0,
        approved: 0,
        completed: 0,
        rejected: 0,
        cancelled: 0,
        hotel: 0,
        vet: 0,
        grooming: 0,
      }
    );
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

      const text = [
        booking.title,
        booking.type,
        booking.pet,
        booking.service,
        booking.date,
        booking.time,
        booking.notes,
        booking.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !keyword || text.includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [bookings, searchTerm, statusFilter]);

  const showToast = (message, type = "success") => {
    if (type === "error") {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 3500);
      return;
    }

    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3500);
  };

  const handleSelect = (type) => {
    const meta = getBookingTypeMeta(type);

    setSelectedBooking(type);
    setReceipt(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setErrorMessage("");

    // Reset availability states
    setVeterinaryAvailability(null);
    setGroomingAvailability(null);
    setBoardingAvailability(null);
    setSelectedTimeSlot("");
    setSelectedRoom(null);

    setFormData({
      customer_name: customerName,
      customer_email: customerEmail,
      pet_id: "",
      pet_name: "",
      service_type: meta.type,
      service_name: meta.defaultService,
      request_date: "",
      request_time: "",
      check_out_date: "",
      notes: "",
    });
  };

  const handleClose = () => {
    setSelectedBooking(null);
    setReceipt(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errorMessage) setErrorMessage("");

    // Trigger availability checking when date or service changes for vet bookings
    if (selectedBooking === "Vet" && (name === "request_date" || name === "service_name")) {
      const updatedFormData = { ...formData, [name]: value };
      if (updatedFormData.request_date) {
        fetchVeterinaryAvailability(updatedFormData.request_date, updatedFormData.service_name);
      }
    }

    // Trigger availability checking when date changes for grooming bookings
    if (selectedBooking === "Groom" && name === "request_date") {
      if (value) {
        fetchGroomingAvailability(value);
      }
    }

    // Trigger availability checking when dates change for hotel bookings
    if (selectedBooking === "Hotel" && (name === "request_date" || name === "check_out_date")) {
      const updatedFormData = { ...formData, [name]: value };
      if (updatedFormData.request_date && updatedFormData.check_out_date) {
        fetchBoardingAvailability(updatedFormData.request_date, updatedFormData.check_out_date);
      }
    }
  };

  const handlePetSelect = (event) => {
    const petId = event.target.value;
    const selectedPet = pets.find((pet) => String(pet.id) === String(petId));

    setFormData((prev) => ({
      ...prev,
      pet_id: petId,
      pet_name: selectedPet ? getPetName(selectedPet) : "",
    }));

    if (errorMessage) setErrorMessage("");
  };

  const handleReceiptUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

    if (!allowedTypes.includes(file.type)) {
      showToast("Please upload JPG, PNG, WEBP, or PDF receipt only.", "error");
      return;
    }

    if (file.size > maxSize) {
      showToast("Receipt file must be 5MB or smaller.", "error");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setReceipt(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveReceipt = () => {
    setReceipt(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
  };

  const fetchVeterinaryAvailability = async (date, serviceName) => {
    try {
      setAvailabilityLoading(true);

      // Find service ID from vet services
      const service = vetServices.find((s) => s.name === serviceName);
      const serviceId = service?.id;

      const url = `/customer/availability/veterinary?date=${date}${serviceId ? `&service_id=${serviceId}` : ""}`;
      const data = await apiRequest(url);

      if (data.success) {
        setVeterinaryAvailability(data);
      } else {
        setVeterinaryAvailability(null);
        showToast(data.message || "Failed to check veterinary availability", "error");
      }
    } catch (error) {
      console.error("Error fetching veterinary availability:", error);
      setVeterinaryAvailability(null);
      showToast("Failed to check availability. Please try again.", "error");
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const fetchGroomingAvailability = async (date) => {
    try {
      setAvailabilityLoading(true);

      const data = await apiRequest(`/customer/availability/grooming?date=${date}`);

      if (data.success) {
        setGroomingAvailability(data);
      } else {
        setGroomingAvailability(null);
        showToast(data.message || "Failed to check grooming availability", "error");
      }
    } catch (error) {
      console.error("Error fetching grooming availability:", error);
      setGroomingAvailability(null);
      showToast("Failed to check availability. Please try again.", "error");
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const fetchBoardingAvailability = async (checkIn, checkOut) => {
    try {
      setAvailabilityLoading(true);

      const data = await apiRequest(`/customer/availability/boarding?check_in=${checkIn}&check_out=${checkOut}`);

      if (data.success) {
        setBoardingAvailability(data);
      } else {
        setBoardingAvailability(null);
        showToast(data.message || "Failed to check boarding availability", "error");
      }
    } catch (error) {
      console.error("Error fetching boarding availability:", error);
      setBoardingAvailability(null);
      showToast("Failed to check availability. Please try again.", "error");
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot.time);
    setFormData((prev) => ({ ...prev, request_time: slot.time }));
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    // For hotel bookings, we'll store the room info in form data
    setFormData((prev) => ({ ...prev, hotel_room_id: room.id }));
  };

  const validateForm = () => {
    if (!formData.customer_name.trim()) return "Customer name is required.";
    if (!formData.customer_email.trim()) return "Customer email is required.";
    if (!formData.pet_id && !formData.pet_name.trim()) return "Please select a pet.";
    if (!formData.service_type) return "Please select a booking type.";
    if (!formData.service_name) return "Please select a service.";
    if (!formData.request_date) return "Please select a preferred date.";

    // For veterinary bookings, ensure time slot is selected and available
    if (selectedBooking === "Vet") {
      if (!selectedTimeSlot) return "Please select an available time slot.";
      if (veterinaryAvailability && !veterinaryAvailability.slots?.find((slot) => slot.time === selectedTimeSlot && slot.available)) {
        return "Selected time slot is not available. Please choose another slot.";
      }
    }

    // For grooming bookings, check availability
    if (selectedBooking === "Groom") {
      if (groomingAvailability && !groomingAvailability.available) {
        return "This grooming date is already reserved. Please choose another date.";
      }
    }

    // For hotel bookings, ensure room is selected and available
    if (selectedBooking === "Hotel") {
      if (!selectedRoom) return "Please select an available room.";
      if (boardingAvailability && !boardingAvailability.rooms?.find((room) => room.id === selectedRoom.id && room.available)) {
        return "Selected room is not available. Please choose another room.";
      }
    }

    const selectedDateTime = new Date(
      `${formData.request_date}T${formData.request_time || "12:00"}:00`
    );

    if (Number.isNaN(selectedDateTime.getTime())) {
      return "Please select a valid schedule.";
    }

    if (selectedDateTime < new Date()) {
      return "Schedule cannot be in the past.";
    }

    if (formData.service_type === "vet" && !formData.notes.trim()) {
      return "Please describe the reason for the veterinary visit.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        customer_name: formData.customer_name,
        customer_email: customerEmail || formData.customer_email,
        pet_id: formData.pet_id,
        pet_name: formData.pet_name,
        service_type: formData.service_type,
        service_name: formData.service_name,
        request_date: formData.request_date,
        request_time: formData.request_time,
        notes: formData.notes,
        request_type: formData.service_type, // Backend expects request_type
      };

      console.log("Submitting booking request:", payload);

      const data = await apiRequest("/customer/requests", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      console.log("Booking response:", data);

      if (data.success) {
        showToast(
          `${getBookingTypeMeta(formData.service_type).title} request submitted successfully. Please wait for approval.`
        );

        await fetchBookings({ silent: true });

        setTimeout(() => {
          handleClose();
        }, 800);
      } else {
        showToast(data.message || "Failed to submit booking request.", "error");
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      const errorMessage = error?.message || "Failed to submit booking. Please try again.";
      showToast(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = () => {
    fetchBookings({ silent: true });
    fetchCustomerPets();
    fetchVetServices();
  };

  const selectedMeta = selectedBooking ? getBookingTypeMeta(selectedBooking) : null;

  return (
    <div className="customer-bookings">
      {successMessage && (
        <div className="customer-booking-toast success">
          <FaCheckCircle />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="customer-booking-toast error">
          <FaExclamationTriangle />
          <span>{errorMessage}</span>
        </div>
      )}

      <section className="bookings-hero">
        <div className="bookings-hero-copy">
          <span className="bookings-eyebrow">
            <FaCalendarCheck />
            Customer Booking Center
          </span>

          <h1>Book Pet Services</h1>

          <p>
            Request pet hotel reservations, grooming appointments, and veterinary
            services in one professional booking center.
          </p>
        </div>

        <button
          className={`booking-refresh-btn ${refreshing ? "refreshing" : ""}`}
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <FaSyncAlt />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </section>

      <section className="booking-stats-grid">
        <article className="booking-stat-card">
          <span>
            <FaClipboardList />
          </span>
          <div>
            <strong>{stats.total}</strong>
            <p>Total Bookings</p>
          </div>
        </article>

        <article className="booking-stat-card">
          <span>
            <FaClock />
          </span>
          <div>
            <strong>{stats.pending}</strong>
            <p>Pending Approval</p>
          </div>
        </article>

        <article className="booking-stat-card">
          <span>
            <FaCheckCircle />
          </span>
          <div>
            <strong>{stats.approved}</strong>
            <p>Approved</p>
          </div>
        </article>

        <article className="booking-stat-card">
          <span>
            <FaPaw />
          </span>
          <div>
            <strong>{stats.completed}</strong>
            <p>Completed</p>
          </div>
        </article>
      </section>

      <section className="booking-type-section">
        <div className="section-heading">
          <div>
            <h2>Choose Booking Type</h2>
            <p>Select the type of service you want to request for your pet.</p>
          </div>
        </div>

        <div className="booking-types-grid">
          {bookingTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              className={`booking-type-card ${type.accent}`}
              onClick={() => handleSelect(type.id)}
            >
              <span className="booking-icon">{type.icon}</span>
              <strong>{type.title}</strong>
              <p>{type.description}</p>

              <span className="booking-type-count">
                {type.type === "hotel" && `${stats.hotel} requests`}
                {type.type === "vet" && `${stats.vet} requests`}
                {type.type === "grooming" && `${stats.grooming} requests`}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="recent-bookings">
        <div className="recent-bookings-header">
          <div>
            <h2>My Booking Requests</h2>
            <p>Track all your submitted hotel, grooming, and veterinary requests.</p>
          </div>
        </div>

        <div className="booking-toolbar">
          <div className="booking-search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search by pet, service, date, status..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm("")}>
                <FaTimes />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="booking-filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="booking-empty-state">
            <FaSyncAlt className="spin" />
            <h3>Loading bookings...</h3>
            <p>Please wait while we fetch your booking records.</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="booking-empty-state">
            <FaCalendarCheck />
            <h3>No bookings found</h3>
            <p>
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter."
                : "Start by selecting Hotel, Veterinary, or Grooming service above."}
            </p>
          </div>
        ) : (
          <div className="bookings-list">
            {filteredBookings.map((booking) => (
              <article key={booking.id} className="booking-item">
                <div className="booking-main">
                  <span className={`booking-type-icon ${booking.serviceType}`}>
                    {booking.icon}
                  </span>

                  <div>
                    <h3>{booking.title}</h3>
                    <p>{booking.details}</p>

                    <div className="booking-meta">
                      <span>
                        <FaCalendarCheck />
                        {formatDate(booking.date)}
                      </span>

                      {booking.time && (
                        <span>
                          <FaClock />
                          {booking.time}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <span className={`booking-status ${booking.status}`}>
                  {booking.status.replace(/_/g, " ")}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedBooking && selectedMeta && (
        <div className="booking-modal-overlay" onClick={handleClose}>
          <div className="booking-modal" onClick={(event) => event.stopPropagation()}>
            <div className="booking-modal-header">
              <div className="booking-modal-title">
                <span className={`modal-service-icon ${selectedMeta.accent}`}>
                  {selectedMeta.icon}
                </span>

                <div>
                  <span className="bookings-eyebrow">New Booking Request</span>
                  <h2>{selectedMeta.title}</h2>
                  <p>{selectedMeta.description}</p>
                </div>
              </div>

              <button className="close-modal-btn" onClick={handleClose} type="button">
                <FaTimes />
              </button>
            </div>

            <form className="booking-form" onSubmit={handleSubmit}>
              <div className="booking-form-section">
                <div className="form-section-title">
                  <FaUser />
                  <div>
                    <h3>Customer & Pet Information</h3>
                    <p>Confirm your details and choose the pet for this request.</p>
                  </div>
                </div>

                <div className="booking-form-grid">
                  <label className="form-group">
                    Customer Name
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      required
                    />
                  </label>

                  <label className="form-group">
                    Customer Email
                    <input
                      type="email"
                      name="customer_email"
                      value={formData.customer_email}
                      onChange={handleInputChange}
                      required
                    />
                  </label>

                  <label className="form-group full-width">
                    Select Pet

                    {petsLoading ? (
                      <div className="pet-select-helper">
                        Loading your pets...
                      </div>
                    ) : pets.length > 0 ? (
                      <select
                        name="pet_id"
                        value={formData.pet_id}
                        onChange={handlePetSelect}
                        required
                      >
                        <option value="">Choose your pet...</option>

                        {pets.map((pet) => (
                          <option key={pet.id} value={pet.id}>
                            {getPetName(pet)} • {getPetSpecies(pet)} • {getPetBreed(pet)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="pet-select-empty">
                        <strong>No pets found</strong>
                        <p>Please add your pet first in the My Pets page before creating a booking.</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="booking-form-section">
                <div className="form-section-title">
                  {selectedMeta.icon}
                  <div>
                    <h3>Service Details</h3>
                    <p>Select your preferred service and schedule.</p>
                  </div>
                </div>

                <div className="booking-form-grid">
                  <label className="form-group full-width">
                    Service
                    <select
                      name="service_name"
                      value={formData.service_name}
                      onChange={handleInputChange}
                      required
                    >
                      {serviceOptions.map((service) => (
                        <option key={`${service.name}-${service.price}`} value={service.name}>
                          {service.name}
                          {service.category ? ` • ${service.category}` : ""} -{" "}
                          {formatCurrency(service.price || 0)}
                        </option>
                      ))}
                    </select>

                    {selectedBooking === "Vet" && servicesLoading && (
                      <small>Loading veterinary services...</small>
                    )}
                  </label>

                  {selectedBooking === "Hotel" ? (
                    <>
                      <label className="form-group">
                        Check-in Date
                        <input
                          type="date"
                          name="request_date"
                          value={formData.request_date}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                      </label>

                      <label className="form-group">
                        Check-out Date
                        <input
                          type="date"
                          name="check_out_date"
                          value={formData.check_out_date || ""}
                          onChange={handleInputChange}
                          min={formData.request_date || new Date().toISOString().split("T")[0]}
                          required
                        />
                      </label>
                    </>
                  ) : (
                    <>
                      <label className="form-group">
                        Preferred Date
                        <input
                          type="date"
                          name="request_date"
                          value={formData.request_date}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                      </label>

                      <label className="form-group">
                        Preferred Time
                        <input
                          type="time"
                          name="request_time"
                          value={formData.request_time}
                          onChange={handleInputChange}
                          required={selectedBooking !== "Hotel"}
                        />
                      </label>
                    </>
                  )}

                  {/* Availability Display Section */}
                  {(selectedBooking === "Vet" || selectedBooking === "Groom" || selectedBooking === "Hotel") && (
                    <div className="form-group full-width availability-section">
                      <div className="availability-header">
                        <span className="availability-title">
                          {selectedBooking === "Vet" && "Available Time Slots"}
                          {selectedBooking === "Groom" && "Date Availability"}
                          {selectedBooking === "Hotel" && "Available Rooms"}
                        </span>
                        {availabilityLoading && <span className="availability-loading">Checking...</span>}
                      </div>

                      {/* Veterinary Availability */}
                      {selectedBooking === "Vet" && veterinaryAvailability && (
                        <div className="availability-content">
                          {veterinaryAvailability.slots && veterinaryAvailability.slots.length > 0 ? (
                            <div className="time-slots-grid">
                              {veterinaryAvailability.slots.map((slot) => (
                                <button
                                  key={slot.time}
                                  type="button"
                                  className={`time-slot ${!slot.available ? 'unavailable' : ''} ${selectedTimeSlot === slot.time ? 'selected' : ''}`}
                                  onClick={() => slot.available && handleTimeSlotSelect(slot)}
                                  disabled={!slot.available}
                                >
                                  <span className="slot-time">{slot.label}</span>
                                  <span className="slot-status">
                                    {slot.available ? 'Available' : slot.reason || 'Booked'}
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="no-availability">
                              <p>No available veterinary slots for this date. Please choose another date.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Grooming Availability */}
                      {selectedBooking === "Groom" && groomingAvailability && (
                        <div className="availability-content">
                          {groomingAvailability.available ? (
                            <div className="availability-success">
                              <span className="availability-icon">✓</span>
                              <span>This grooming date is available for booking.</span>
                            </div>
                          ) : (
                            <div className="no-availability">
                              <p>This grooming date is already reserved. Please choose another date.</p>
                              {groomingAvailability.existing_appointment && (
                                <div className="existing-booking">
                                  <small>Existing booking: {groomingAvailability.existing_appointment.pet_name} - {groomingAvailability.existing_appointment.service}</small>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Boarding Availability */}
                      {selectedBooking === "Hotel" && boardingAvailability && (
                        <div className="availability-content">
                          {boardingAvailability.rooms && boardingAvailability.rooms.length > 0 ? (
                            <div className="rooms-grid">
                              {boardingAvailability.rooms.map((room) => (
                                <button
                                  key={room.id}
                                  type="button"
                                  className={`room-card ${!room.available ? 'unavailable' : ''} ${selectedRoom?.id === room.id ? 'selected' : ''}`}
                                  onClick={() => room.available && handleRoomSelect(room)}
                                  disabled={!room.available}
                                >
                                  <div className="room-header">
                                    <span className="room-name">{room.name}</span>
                                    <span className="room-type">{room.type}</span>
                                  </div>
                                  <div className="room-details">
                                    <span className="room-capacity">Capacity: {room.capacity}</span>
                                    <span className="room-rate">{formatCurrency(room.daily_rate)}/day</span>
                                  </div>
                                  <span className="room-status">
                                    {room.available ? 'Available' : room.reason || 'Not Available'}
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="no-availability">
                              <p>No rooms or kennels are available for the selected date range.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Show message when no availability data yet */}
                      {!veterinaryAvailability && !groomingAvailability && !boardingAvailability && !availabilityLoading && (
                        <div className="availability-prompt">
                          <p>Select a date to check availability.</p>
                        </div>
                      )}
                    </div>
                  )}

                  <label className="form-group full-width">
                    {selectedBooking === "Vet"
                      ? "Reason for Visit"
                      : selectedBooking === "Hotel"
                      ? "Special Requests"
                      : "Special Instructions"}
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder={
                        selectedBooking === "Vet"
                          ? "Describe symptoms, concerns, or reason for visit..."
                          : selectedBooking === "Hotel"
                          ? "Diet, medication, exercise, or care instructions..."
                          : "Preferred haircut, coat concerns, or grooming instructions..."
                      }
                      rows="4"
                      required={selectedBooking === "Vet"}
                    />
                  </label>
                </div>
              </div>

              <div className="booking-form-section payment-section">
                <div className="form-section-title">
                  <FaWallet />
                  <div>
                    <h3>Payment Information</h3>
                    <p>
                      Uploading receipt is optional here. Cashier verification can be
                      handled after approval.
                    </p>
                  </div>
                </div>

                <div className="booking-payment-summary">
                  <div>
                    <small>Selected Service</small>
                    <strong>{selectedService?.name || formData.service_name}</strong>
                  </div>

                  <div>
                    <small>Estimated Fee</small>
                    <strong>{formatCurrency(selectedService?.price || 0)}</strong>
                  </div>
                </div>

                <label className="file-upload">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleReceiptUpload}
                  />

                  <span>
                    <FaUpload />
                  </span>

                  <div>
                    <strong>{receipt ? receipt.name : "Upload payment receipt"}</strong>
                    <p>JPG, PNG, WEBP, or PDF up to 5MB.</p>
                  </div>
                </label>

                {previewUrl && (
                  <div className="receipt-preview">
                    <div className="preview-header">
                      <span>
                        <FaReceipt />
                        Receipt Preview
                      </span>

                      <button type="button" onClick={handleRemoveReceipt}>
                        Remove
                      </button>
                    </div>

                    {receipt?.type === "application/pdf" ? (
                      <div className="pdf-preview">PDF receipt selected: {receipt.name}</div>
                    ) : (
                      <img src={previewUrl} alt="Receipt Preview" />
                    )}
                  </div>
                )}
              </div>

              <div className="booking-form-actions">
                <button type="button" className="cancel-btn" onClick={handleClose}>
                  Cancel
                </button>

                <button type="submit" className="submit-btn" disabled={submitting || pets.length === 0}>
                  {submitting ? "Submitting..." : "Submit Booking Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBookings;
