import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { CalendarDays, Clock, User, CalendarPlus, X } from "lucide-react";
import { CustomSelect } from "./CustomSelect";

import { API_BASE } from "../config";

export function BookingDashboard() {
  const { token, themeColor } = useAuth();
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const [slotRes, aptRes] = await Promise.all([
        axios.get(`${API_BASE}/api/booking/slots/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/booking/appointments/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setSlots(slotRes.data);
      setAppointments(aptRes.data);
    } catch (err) {
      console.error("Failed to fetch booking data", err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingAppointments = appointments
    .filter((a) => a.status === "Scheduled")
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        a.start_time.localeCompare(b.start_time),
    );
  const availableSlots = slots
    .filter((s) => !s.is_booked && s.date >= todayStr)
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        a.start_time.localeCompare(b.start_time),
    );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative z-10 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Appointments & Booking
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage staff calendar, slots, and customer bookings.
          </p>
        </div>
        <button
          onClick={() => setIsBookingModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 bg-primary"
          style={{ backgroundColor: themeColor }}
        >
          <CalendarPlus className="w-4 h-4" /> Book Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Appointments List */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/20 space-y-6 md:col-span-2">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl shadow-sm"
              style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
            >
              <CalendarDays className="w-5 h-5" />
            </div>
            <h3 className="font-bold tracking-tight text-xl">
              Upcoming Appointments
            </h3>
          </div>

          {isFetching ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground border border-dashed border-border/50 rounded-xl">
                  No upcoming appointments.
                </div>
              ) : (
                upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-background rounded-lg p-3 shadow-sm text-center border border-border/50 min-w-[70px]">
                        <div className="text-xs font-bold text-muted-foreground uppercase">
                          {new Date(apt.date).toLocaleString("default", {
                            month: "short",
                          })}
                        </div>
                        <div
                          className="text-xl font-black"
                          style={{ color: themeColor }}
                        >
                          {new Date(apt.date).getDate()}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-lg">
                          {apt.customer_name ||
                            `Customer ID: ${apt.customer_id.substring(0, 8)}`}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3" />{" "}
                          {apt.start_time.substring(0, 5)} -{" "}
                          {apt.end_time.substring(0, 5)}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <User className="w-3 h-3" /> with{" "}
                          <span className="font-semibold">
                            {apt.employee_name || "Staff"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-xs font-bold">
                        Scheduled
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Available Slots Widget */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/20 space-y-6 md:col-span-1">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl shadow-sm"
              style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
            >
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold tracking-tight text-xl">
              Available Slots
            </h3>
          </div>

          {isFetching ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {availableSlots.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground border border-dashed border-border/50 rounded-xl text-sm">
                  No available slots found.
                </div>
              ) : (
                availableSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3 bg-muted/20 border border-border/50 rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="text-sm font-bold text-foreground mb-1">
                      {slot.date}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {slot.start_time.substring(0, 5)} -{" "}
                        {slot.end_time.substring(0, 5)}
                      </span>
                      <span className="font-semibold">
                        {slot.employee_name}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {isBookingModalOpen && (
        <BookingModal
          availableSlots={availableSlots}
          onClose={() => setIsBookingModalOpen(false)}
          onSuccess={() => {
            setIsBookingModalOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function BookingModal({ availableSlots, onClose, onSuccess }) {
  const { token, themeColor } = useAuth();
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlotId) return alert("Please select a time slot.");
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE}/api/booking/appointments/book/`,
        {
          slot_id: selectedSlotId,
          customer_id: customerId,
          customer_name: customerName,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onSuccess();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div
        className="glass-panel w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-slide-up border-t-4"
        style={{ borderColor: themeColor }}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold">New Appointment</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Schedule a booking for a customer.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Customer ID *</label>
            <input
              required
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="e.g. CUST-001"
              className="w-full glass-input rounded-xl px-4 py-2"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Jane Smith"
              className="w-full glass-input rounded-xl px-4 py-2"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Available Slots *</label>
            <CustomSelect
              required
              value={selectedSlotId}
              onChange={(e) => setSelectedSlotId(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-2 bg-background"
            >
              <option value="">-- Select a Time Slot --</option>
              {availableSlots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.date} | {slot.start_time.substring(0, 5)} |{" "}
                  {slot.employee_name}
                </option>
              ))}
            </CustomSelect>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl text-sm font-bold text-white shadow-md transition-all active:scale-95"
              style={{ backgroundColor: themeColor }}
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
