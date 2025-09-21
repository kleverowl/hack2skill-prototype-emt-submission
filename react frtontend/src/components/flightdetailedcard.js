import React from 'react';
import PropTypes from 'prop-types';
import { Plane, Clock, MapPin, Users, Luggage, CheckCircle, AlertCircle, XCircle, Calendar } from 'lucide-react';

const FlightDetailsCard = ({
  airline = { name: "SkyHigh Airlines", logo: "/api/placeholder/40/40", code: "SH" },
  flight = { number: "SH-276789", aircraft: "Boeing 787 Dreamliner", class: "Economy" },
  departure = { city: "New York", airport: "JFK", code: "JFK", time: "14:30", date: "2024-03-15" },
  arrival = { city: "London", airport: "Heathrow", code: "LHR", time: "02:45", date: "2024-03-16" },
  duration = "8h 15m",
  stops = 0,
  price = { amount: 899, currency: "USD", symbol: "$" },
  baggage = { checkedWeight: "23 kg", cabinWeight: "7 kg", extraAvailable: true, freeChecked: 1 },
  amenities = { meal: true, wifi: false, entertainment: true, powerOutlet: true },
  seatLayout = "3-3-3 configuration",
  status = "available",
  policies = { reschedule: "Free rescheduling within 24 hours of booking", refund: "Refunds available with a 10% cancellation fee if cancelled 48 hours before departure" },
  onBook
}) => {
  // Status configuration
  const statusConfig = {
    available: { 
      variant: 'success', 
      icon: CheckCircle, 
      text: 'Available',
      buttonClass: 'btn-primary',
      buttonText: 'Book Flight'
    },
    limited: { 
      variant: 'warning', 
      icon: AlertCircle, 
      text: 'Few seats left',
      buttonClass: 'btn-warning',
      buttonText: 'Book Now'
    },
    soldout: { 
      variant: 'danger', 
      icon: XCircle, 
      text: 'Sold Out',
      buttonClass: 'btn-secondary',
      buttonText: 'Unavailable'
    }
  };

  const currentStatus = statusConfig[status] || statusConfig.available;
  const StatusIcon = currentStatus.icon;

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  // Get stop text
  const getStopText = (stops) => {
    if (stops === 0) return 'Direct Flight';
    if (stops === 1) return '1 Stop';
    return `${stops} Stops`;
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body p-4">
        {/* Header Section */}
        <div className="row align-items-center mb-4">
          <div className="col-md-8">
            <div className="d-flex align-items-center">
              <img 
                src={airline.logo} 
                alt={`${airline.name} logo`}
                className="rounded-circle me-3"
                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
              />
              <div>
                <h3 className="mb-1 fw-bold text-dark">{airline.name}</h3>
                <div className="d-flex align-items-center text-muted">
                  <span className="me-3">Flight {flight.number}</span>
                  <span className="me-3">•</span>
                  <span>{flight.aircraft}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4 text-md-end">
            <span className={`badge bg-${currentStatus.variant} fs-6 d-inline-flex align-items-center gap-2 px-3 py-2`}>
              <StatusIcon size={16} />
              {currentStatus.text}
            </span>
          </div>
        </div>

        {/* Flight Route Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="bg-light rounded p-4">
              <div className="row align-items-center">
                {/* Departure */}
                <div className="col-md-4 text-center text-md-start">
                  <div className="d-flex align-items-center justify-content-center justify-content-md-start mb-2">
                    <MapPin className="text-primary me-2" size={20} />
                    <span className="fw-semibold text-muted">Departure</span>
                  </div>
                  <div className="display-6 fw-bold text-primary mb-1">{formatTime(departure.time)}</div>
                  <div className="h5 mb-1">{departure.city}</div>
                  <div className="text-muted mb-1">{departure.code} - {departure.airport}</div>
                  <div className="d-flex align-items-center justify-content-center justify-content-md-start text-muted">
                    <Calendar size={14} className="me-1" />
                    <small>{formatDate(departure.date)}</small>
                  </div>
                </div>

                {/* Flight Path */}
                <div className="col-md-4 text-center my-3 my-md-0">
                  <div className="d-flex align-items-center justify-content-center position-relative">
                    <div className="flex-grow-1 bg-secondary" style={{ height: '2px', maxWidth: '100px' }}></div>
                    <div className="mx-3 d-flex flex-column align-items-center">
                      <Plane className="text-primary mb-2" size={24} style={{ transform: 'rotate(90deg)' }} />
                      <div className="fw-semibold text-dark">{duration}</div>
                      <small className="text-muted">{getStopText(stops)}</small>
                    </div>
                    <div className="flex-grow-1 bg-secondary" style={{ height: '2px', maxWidth: '100px' }}></div>
                  </div>
                </div>

                {/* Arrival */}
                <div className="col-md-4 text-center text-md-end">
                  <div className="d-flex align-items-center justify-content-center justify-content-md-end mb-2">
                    <span className="fw-semibold text-muted">Arrival</span>
                    <MapPin className="text-success ms-2" size={20} />
                  </div>
                  <div className="display-6 fw-bold text-success mb-1">{formatTime(arrival.time)}</div>
                  <div className="h5 mb-1">{arrival.city}</div>
                  <div className="text-muted mb-1">{arrival.code} - {arrival.airport}</div>
                  <div className="d-flex align-items-center justify-content-center justify-content-md-end text-muted">
                    <Calendar size={14} className="me-1" />
                    <small>{formatDate(arrival.date)}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flight Details Grid */}
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <div className="card bg-light border-0 h-100">
              <div className="card-body">
                <h6 className="card-title d-flex align-items-center mb-3">
                  <Users className="text-primary me-2" size={18} />
                  Flight Details
                </h6>
                <div className="row">
                  <div className="col-6">
                    <small className="text-muted d-block">Class</small>
                    <span className="fw-semibold">{flight.class}</span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Seat Layout</small>
                    <span className="fw-semibold">{seatLayout}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-6 mb-3">
            <div className="card bg-light border-0 h-100">
              <div className="card-body">
                <h6 className="card-title d-flex align-items-center mb-3">
                  <Luggage className="text-primary me-2" size={18} />
                  Baggage Allowance
                </h6>
                <div className="row">
                  <div className="col-6">
                    <small className="text-muted d-block">Checked</small>
                    <span className="fw-semibold">{baggage.checkedWeight}</span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Cabin</small>
                    <span className="fw-semibold">{baggage.cabinWeight}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities Section */}
        <div className="mb-4">
          <h6 className="mb-3">Included Amenities</h6>
          <div className="row">
            <div className="col-md-6">
              <div className="d-flex align-items-center mb-2">
                <span className={`badge ${amenities.meal ? 'bg-success' : 'bg-secondary'} me-2`}>
                  {amenities.meal ? '✓' : '✗'}
                </span>
                <span>Complimentary Meal</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <span className={`badge ${amenities.entertainment ? 'bg-success' : 'bg-secondary'} me-2`}>
                  {amenities.entertainment ? '✓' : '✗'}
                </span>
                <span>In-flight Entertainment</span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center mb-2">
                <span className={`badge ${amenities.wifi ? 'bg-success' : 'bg-secondary'} me-2`}>
                  {amenities.wifi ? '✓' : '✗'}
                </span>
                <span>Wi-Fi Access</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <span className={`badge ${amenities.powerOutlet ? 'bg-success' : 'bg-secondary'} me-2`}>
                  {amenities.powerOutlet ? '✓' : '✗'}
                </span>
                <span>Power Outlet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Policies Section */}
        <div className="mb-4">
          <h6 className="mb-3">Booking Policies</h6>
          <div className="row">
            <div className="col-md-6">
              <div className="d-flex align-items-start mb-2">
                <Clock className="text-primary me-2 mt-1" size={16} />
                <div>
                  <small className="fw-semibold d-block">Rescheduling</small>
                  <small className="text-muted">{policies.reschedule}</small>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-start mb-2">
                <span className="text-primary me-2 mt-1">↩️</span>
                <div>
                  <small className="fw-semibold d-block">Refund Policy</small>
                  <small className="text-muted">{policies.refund}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price and Booking Section */}
        <div className="border-top pt-4">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="d-flex align-items-baseline">
                <span className="display-4 fw-bold text-primary me-2">
                  {price.symbol}{price.amount.toLocaleString()}
                </span>
                <div>
                  <small className="text-muted d-block">per person</small>
                  <small className="text-muted">Total for 1 passenger</small>
                </div>
              </div>
            </div>
            <div className="col-md-6 text-md-end mt-3 mt-md-0">
              <button 
                className={`btn ${currentStatus.buttonClass} btn-lg px-5 py-3 fw-semibold`}
                onClick={onBook}
                disabled={status === 'soldout'}
                style={{ minWidth: '200px' }}
              >
                {currentStatus.buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

FlightDetailsCard.propTypes = {
  airline: PropTypes.shape({
    name: PropTypes.string.isRequired,
    logo: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired
  }),
  flight: PropTypes.shape({
    number: PropTypes.string.isRequired,
    aircraft: PropTypes.string.isRequired,
    class: PropTypes.string.isRequired
  }),
  departure: PropTypes.shape({
    city: PropTypes.string.isRequired,
    airport: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired
  }),
  arrival: PropTypes.shape({
    city: PropTypes.string.isRequired,
    airport: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired
  }),
  duration: PropTypes.string,
  stops: PropTypes.number,
  price: PropTypes.shape({
    amount: PropTypes.number.isRequired,
    currency: PropTypes.string.isRequired,
    symbol: PropTypes.string.isRequired
  }),
  baggage: PropTypes.shape({
    checkedWeight: PropTypes.string,
    cabinWeight: PropTypes.string,
    extraAvailable: PropTypes.bool,
    freeChecked: PropTypes.number
  }),
  amenities: PropTypes.shape({
    meal: PropTypes.bool,
    wifi: PropTypes.bool,
    entertainment: PropTypes.bool,
    powerOutlet: PropTypes.bool
  }),
  seatLayout: PropTypes.string,
  status: PropTypes.oneOf(['available', 'limited', 'soldout']),
  policies: PropTypes.shape({
    reschedule: PropTypes.string,
    refund: PropTypes.string
  }),
  onBook: PropTypes.func
};

export default FlightDetailsCard;