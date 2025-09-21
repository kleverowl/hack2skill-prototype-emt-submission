import React from 'react';
import PropTypes from 'prop-types';
import { Plane, Clock, MapPin, Users, Luggage, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

/**
 * FlightCard Component - A comprehensive flight information card using Bootstrap
 * Displays flight details including airline info, times, pricing, and amenities
 */
const FlightCard = ({
  airline = {
    name: "SkyHigh Airlines",
    logo: "/api/placeholder/40/40",
    code: "SH"
  },
  flight = {
    number: "SH-276789",
    aircraft: "Boeing 787 Dreamliner",
    class: "Economy"
  },
  departure = {
    city: "New York",
    airport: "JFK",
    code: "JFK",
    time: "14:30",
    date: "2024-03-15"
  },
  arrival = {
    city: "London",
    airport: "Heathrow",
    code: "LHR", 
    time: "02:45",
    date: "2024-03-16"
  },
  duration = "8h 15m",
  stops = 0,
  price = {
    amount: 899,
    currency: "USD",
    symbol: "$"
  },
  baggage = {
    checkedWeight: "23 kg",
    cabinWeight: "7 kg", 
    extraAvailable: true,
    freeChecked: 1
  },
  amenities = {
    meal: true,
    wifi: false,
    entertainment: true,
    powerOutlet: true
  },
  seatLayout = "3-3-3 configuration",
  status = "available", // available, limited, soldout
  policies = {
    reschedule: "Free rescheduling within 24 hours of booking",
    refund: "Refunds available with a 10% cancellation fee if cancelled 48 hours before departure"
  },
  onSelect,
  isSelected = false
}) => {
  // Status configuration
  const statusConfig = {
    available: { 
      variant: 'success', 
      icon: CheckCircle, 
      text: 'Available',
      buttonClass: 'btn-primary',
      buttonText: 'Select Flight'
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
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get stop text
  const getStopText = (stops) => {
    if (stops === 0) return 'Direct';
    if (stops === 1) return '1 Stop';
    return `${stops} Stops`;
  };

  return (
    <div className={`card shadow-sm border-0 mb-4 ${isSelected ? 'border border-primary' : ''}`}>
      <div className="card-body p-4">
        {/* Header Section - Airline Info */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center">
            <div className="rounded-circle me-3 bg-light d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
              <Plane className="text-primary" size={24} />
            </div>
            <div>
              <h5 className="mb-1 fw-bold text-dark">{airline.name}</h5>
              <small className="text-muted">{flight.number}</small>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="text-end">
            <span className={`badge bg-${currentStatus.variant} d-flex align-items-center gap-1`}>
              <StatusIcon size={14} />
              {currentStatus.text}
            </span>
          </div>
        </div>

        {/* Flight Route Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex align-items-center justify-content-between position-relative">
              {/* Departure */}
              <div className="text-center flex-shrink-0">
                <div className="h4 mb-1 fw-bold text-primary">{departure.time}</div>
                <div className="small text-muted mb-1">{formatDate(departure.date)}</div>
                <div className="fw-semibold">{departure.code}</div>
                <div className="small text-muted">{departure.city}</div>
              </div>

              {/* Flight Path */}
              <div className="flex-grow-1 mx-4">
                <div className="d-flex align-items-center justify-content-center position-relative">
                  <div className="flex-grow-1 bg-light" style={{ height: '2px' }}></div>
                  <div className="position-absolute bg-white px-3 d-flex flex-column align-items-center">
                    <Plane className="text-primary mb-1" size={20} style={{ transform: 'rotate(90deg)' }} />
                    <small className="text-muted fw-medium">{duration}</small>
                    <small className="text-muted">{getStopText(stops)}</small>
                  </div>
                  <div className="flex-grow-1 bg-light" style={{ height: '2px' }}></div>
                </div>
              </div>

              {/* Arrival */}
              <div className="text-center flex-shrink-0">
                <div className="h4 mb-1 fw-bold text-primary">{arrival.time}</div>
                <div className="small text-muted mb-1">{formatDate(arrival.date)}</div>
                <div className="fw-semibold">{arrival.code}</div>
                <div className="small text-muted">{arrival.city}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Aircraft and Class Info */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="d-flex align-items-center text-muted">
              <strong className="me-2">Model:</strong>
              <span>{flight.aircraft}</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="d-flex align-items-center text-muted">
              <strong className="me-2">Class:</strong>
              <span>{flight.class}</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="d-flex align-items-center text-muted">
              <strong className="me-2">Seat Layout:</strong>
              <span>{seatLayout}</span>
            </div>
          </div>
        </div>

        {/* What's Included Section */}
        <div className="mb-4">
          <h6 className="text-dark mb-3">What's included</h6>
          <div className="row">
            <div className="col-md-6">
              {/* Baggage Info */}
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <Luggage size={16} className="text-primary me-2" />
                  <span className="fw-medium">Baggage {baggage.checkedWeight}</span>
                </div>
                <div className="ms-4">
                  <small className="text-muted d-block">Cabin baggage {baggage.cabinWeight}</small>
                  {baggage.extraAvailable && (
                    <small className="text-warning">⚪ Available for extra baggage</small>
                  )}
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <span className="fw-medium">Amenities</span>
                </div>
                <div className="ms-4">
                  {amenities.meal && (
                    <small className="text-muted d-block">🍽️ Free meal</small>
                  )}
                  {amenities.entertainment && (
                    <small className="text-muted d-block">📺 In-flight entertainment</small>
                  )}
                  {amenities.powerOutlet && (
                    <small className="text-muted d-block">🔌 Power outlet</small>
                  )}
                  {amenities.wifi && (
                    <small className="text-muted d-block">📶 Wi-Fi available</small>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              {/* Policies */}
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <Clock size={16} className="text-primary me-2" />
                  <span className="fw-medium">Reschedule</span>
                </div>
                <div className="ms-4">
                  <small className="text-muted">{policies.reschedule}</small>
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <span className="fw-medium">↩️ Refund</span>
                </div>
                <div className="ms-4">
                  <small className="text-muted">{policies.refund}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price and Action Section */}
        <div className="d-flex align-items-center justify-content-between pt-3 border-top">
          <div className="d-flex align-items-center">
            <div className="me-4">
              <div className="h3 mb-0 fw-bold text-primary">
                {price.symbol}{price.amount.toLocaleString()}
              </div>
              <small className="text-muted">per person</small>
            </div>
          </div>
          
          {/* <button 
            className={`btn ${currentStatus.buttonClass} px-4 py-2 fw-semibold`}
            onClick={onSelect}
            disabled={status === 'soldout'}
            style={{ minWidth: '140px' }}
          >
            {currentStatus.buttonText}
          </button> */}
        </div>
      </div>
    </div>
  );
};

// PropTypes for type checking
FlightCard.propTypes = {
  airline: PropTypes.shape({
    name: PropTypes.string.isRequired,
    logo: PropTypes.string,
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
  onSelect: PropTypes.func,
  isSelected: PropTypes.bool
};

export default FlightCard;