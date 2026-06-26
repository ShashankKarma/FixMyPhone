import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { shopsAPI, appointmentsAPI } from '../../services/api';
import { Smartphone, Calendar, Clock, DollarSign, ChevronRight, ChevronLeft, CheckCircle, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

const today = new Date().toISOString().split('T')[0];

const BookAppointment = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Wizard steps state
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [notes, setNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Time slots list
  const timeSlots = [
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "01:00 PM - 02:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
    "04:00 PM - 05:00 PM",
    "05:00 PM - 06:00 PM"
  ];

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const formatDateString = (year, month, day) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const isDateInPast = (year, month, day) => {
    const cellDateString = formatDateString(year, month, day);
    return cellDateString < today;
  };

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayInstance = new Date(year, month, 1);
    const startDay = firstDayInstance.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();
    const days = [];
    
    // Prefix days from previous month
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        day: prevTotalDays - i,
        month: month === 0 ? 11 : month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false
      });
    }
    
    // Days of current month
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        month: month,
        year: year,
        isCurrentMonth: true
      });
    }
    
    // Suffix days for next month to complete the grid
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        day: i,
        month: month === 11 ? 0 : month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  // Fetch shop & services details
  useEffect(() => {
    const loadShopData = async () => {
      try {
        setLoading(true);
        const [shopData, servicesData] = await Promise.all([
          shopsAPI.getShopById(shopId),
          shopsAPI.getServicesByShop(shopId)
        ]);
        setShop(shopData);

        // Append "Other / Custom Problem" option
        const otherService = {
          id: -1,
          name: "Other / Custom Problem",
          customName: "Please describe your problem in the notes section below",
          price: 0.0,
          durationMinutes: 0
        };
        setServices([...servicesData, otherService]);
        setError(null);
      } catch (err) {
        console.error('Error loading shop/services:', err);
        setError('Failed to load shop details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadShopData();
  }, [shopId]);

  // Load occupied slots when date changes
  useEffect(() => {
    if (selectedDate) {
      const loadOccupiedSlots = async () => {
        try {
          const slots = await appointmentsAPI.getOccupiedSlots(shopId, selectedDate);
          setOccupiedSlots(slots);
        } catch (err) {
          console.error('Error fetching occupied slots:', err);
        }
      };
      loadOccupiedSlots();
    }
  }, [selectedDate, shopId]);

  const handleNextStep = () => {
    if (step === 1 && !selectedService) return;
    if (step === 2) {
      if (!selectedDate || !selectedSlot) return;
      if (selectedDate < today) {
        setError('Appointment date must be in the present or future.');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleConfirmBooking = async () => {
    try {
      setBookingLoading(true);
      setError(null);
      const payload = {
        shopId: parseInt(shopId),
        serviceId: selectedService.id,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        notes: notes
      };
      await appointmentsAPI.bookAppointment(payload);
      setBookingSuccess(true);
    } catch (err) {
      console.error('Error booking appointment:', err);
      let errorMsg = 'Failed to complete booking. Please try again.';
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else if (typeof err.response.data === 'object') {
          const fieldErrors = Object.values(err.response.data);
          if (fieldErrors.length > 0) {
            errorMsg = fieldErrors.join(', ');
          } else if (err.response.data.message) {
            errorMsg = err.response.data.message;
          }
        }
      }
      setError(errorMsg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  if (error && step !== 3) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-md mx-auto bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center">
          {error}
          <div className="mt-4">
            <Link to="/dashboard" className="text-sky-400 hover:underline">Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
              <Smartphone className="h-8 w-8 text-sky-400 mr-2" />
              <span className="font-extrabold text-xl tracking-wider bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
                FixMyPhone
              </span>
            </Link>
            <div className="text-slate-400 text-sm font-medium">
              Booking at <span className="text-white font-bold">{shop?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {bookingSuccess ? (
          /* Success Screen */
          <div className="bg-slate-950/40 border border-slate-800 p-8 rounded-3xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/5 rounded-full filter blur-2xl"></div>
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-emerald-400 animate-bounce" />
            </div>
            <h2 className="text-3xl font-extrabold mb-4">Repair Booked Successfully!</h2>
            <p className="text-slate-400 max-w-md mx-auto mb-8">
              Your appointment at <span className="text-white font-semibold">{shop?.name}</span> has been confirmed. You can track status updates on your dashboard.
            </p>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left max-w-md mx-auto mb-8 space-y-3">
              <div className="flex justify-between"><span className="text-slate-400">Service:</span><span className="font-semibold">{selectedService?.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Date:</span><span className="font-semibold">{selectedDate}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Time:</span><span className="font-semibold">{selectedSlot}</span></div>
            </div>

            <Link to="/dashboard" className="inline-flex items-center space-x-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl shadow-lg transition">
              <span>Go to Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          /* Booking Wizard Steps */
          <div>
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-10 px-4">
              <div className={`flex items-center ${step >= 1 ? 'text-sky-400' : 'text-slate-600'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold border-2 ${step >= 1 ? 'border-sky-400 bg-sky-500/10' : 'border-slate-700'}`}>1</div>
                <span className="hidden sm:inline ml-2 text-sm font-semibold">Choose Service</span>
              </div>
              <div className="h-0.5 flex-1 bg-slate-800 mx-4"></div>
              <div className={`flex items-center ${step >= 2 ? 'text-sky-400' : 'text-slate-600'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold border-2 ${step >= 2 ? 'border-sky-400 bg-sky-500/10' : 'border-slate-700'}`}>2</div>
                <span className="hidden sm:inline ml-2 text-sm font-semibold">Schedule Time</span>
              </div>
              <div className="h-0.5 flex-1 bg-slate-800 mx-4"></div>
              <div className={`flex items-center ${step >= 3 ? 'text-sky-400' : 'text-slate-600'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold border-2 ${step >= 3 ? 'border-sky-400 bg-sky-500/10' : 'border-slate-700'}`}>3</div>
                <span className="hidden sm:inline ml-2 text-sm font-semibold">Confirm</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6">
                {error}
              </div>
            )}

            {/* Step 1: Select Service */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Select a Repair Service</h2>
                <div className="grid grid-cols-1 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`border p-5 rounded-2xl cursor-pointer transition duration-300 flex justify-between items-center ${selectedService?.id === service.id ? 'border-sky-500 bg-sky-500/5' : 'border-slate-850 bg-slate-950/20 hover:border-slate-700'}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400">
                          <Smartphone className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="font-bold text-lg">{service.name}</div>
                          {service.customName && <div className="text-slate-400 text-sm mt-0.5">{service.customName}</div>}
                          {service.durationMinutes > 0 && (
                            <div className="text-slate-500 text-xs mt-1">Duration: {service.durationMinutes} mins</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {services.length === 0 && (
                    <div className="text-slate-500 text-center py-10 bg-slate-900 border border-slate-800 rounded-2xl">
                      This shop doesn't have any services listed yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Choose Date & Time */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Select Date & Time Slot</h2>

                <div>
                  <label className="block text-slate-400 text-sm font-semibold mb-3 flex items-center justify-between">
                    <span>Select Date</span>
                    {selectedDate && (
                      <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full">
                        Selected: {selectedDate}
                      </span>
                    )}
                  </label>
                  
                  <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                    {/* Calendar Month Header */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold text-base text-white tracking-wide">
                        {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
                      </span>
                      <div className="flex space-x-1.5">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          className="p-1.5 border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 hover:text-white rounded-lg transition"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className="p-1.5 border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 hover:text-white rounded-lg transition"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Weekday Names Header */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 mb-2.5">
                      <div>Sun</div>
                      <div>Mon</div>
                      <div>Tue</div>
                      <div>Wed</div>
                      <div>Thu</div>
                      <div>Fri</div>
                      <div>Sat</div>
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {getCalendarDays().map((cell, idx) => {
                        const dateStr = formatDateString(cell.year, cell.month, cell.day);
                        const isPast = isDateInPast(cell.year, cell.month, cell.day);
                        const isSelected = selectedDate === dateStr;
                        const isActiveMonth = cell.isCurrentMonth;
                        
                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={isPast || !isActiveMonth}
                            onClick={() => {
                              setSelectedDate(dateStr);
                              setSelectedSlot(''); // reset slot when date changes
                              setError(null);
                            }}
                            className={`
                              h-9 w-full flex items-center justify-center rounded-lg text-sm font-semibold transition duration-200
                              ${!isActiveMonth ? 'text-slate-800 cursor-not-allowed select-none bg-transparent' : ''}
                              ${isPast && isActiveMonth ? 'text-slate-600 line-through cursor-not-allowed bg-slate-950/20 opacity-40' : ''}
                              ${isSelected && isActiveMonth ? 'bg-sky-500 text-white font-bold shadow-md shadow-sky-500/20 scale-[1.05]' : ''}
                              ${!isSelected && !isPast && isActiveMonth ? 'text-slate-300 hover:bg-slate-800 bg-slate-900/40 hover:text-white' : ''}
                            `}
                          >
                            {cell.day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {selectedDate && (
                  <div>
                    <label className="block text-slate-400 text-sm font-semibold mb-3">Available Slots</label>
                    <div className="grid grid-cols-2 gap-3">
                      {timeSlots.map((slot) => {
                        const isOccupied = occupiedSlots.some(os => os.toLowerCase() === slot.toLowerCase());
                        return (
                          <button
                            key={slot}
                            disabled={isOccupied}
                            onClick={() => setSelectedSlot(slot)}
                            className={`flex items-center justify-center p-4 rounded-xl border text-sm font-semibold transition ${isOccupied ? 'bg-slate-950/20 border-slate-850 text-slate-600 cursor-not-allowed line-through' : selectedSlot === slot ? 'border-sky-500 bg-sky-500/10 text-white' : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 text-slate-300'}`}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{slot}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Enter Notes & Confirm */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Review and Confirm</h2>

                {/* Summary Card */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
                    <ShieldCheck className="h-6 w-6 text-sky-400" />
                    <span className="font-bold text-lg">Booking Details</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500">Repair Shop</div>
                      <div className="font-semibold text-white mt-1">{shop?.name}</div>
                      <div className="text-slate-400 text-xs">{shop?.address}, {shop?.city}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Service</div>
                      <div className="font-semibold text-white mt-1">{selectedService?.name}</div>
                      {selectedService?.durationMinutes > 0 && (
                        <div className="text-slate-400 text-xs">Estimated: {selectedService?.durationMinutes} mins</div>
                      )}
                    </div>
                    <div>
                      <div className="text-slate-500">Date</div>
                      <div className="font-semibold text-white mt-1">{selectedDate}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Time Slot</div>
                      <div className="font-semibold text-white mt-1">{selectedSlot}</div>
                    </div>
                  </div>


                </div>

                {/* Notes Input */}
                <div>
                  <label className="block text-slate-400 text-sm font-semibold mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>Special Notes (Optional)</span>
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Provide details about your phone (e.g. brand, model, issue details, color, passcode if needed for testing)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-sky-500 text-white p-4 rounded-xl outline-none transition"
                  ></textarea>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-800">
              {step > 1 ? (
                <button
                  onClick={handlePrevStep}
                  className="flex items-center space-x-1.5 px-5 py-3 border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 hover:text-white rounded-xl transition font-semibold"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
              ) : (
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1.5 px-5 py-3 border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 hover:text-white rounded-xl transition font-semibold"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Cancel</span>
                </Link>
              )}

              {step < 3 ? (
                <button
                  disabled={(step === 1 && !selectedService) || (step === 2 && (!selectedDate || !selectedSlot))}
                  onClick={handleNextStep}
                  className={`flex items-center space-x-1.5 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-lg transition font-semibold disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <span>Continue</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  disabled={bookingLoading}
                  onClick={handleConfirmBooking}
                  className="flex items-center space-x-1.5 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-lg transition font-semibold disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span>Booking...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Booking</span>
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;
