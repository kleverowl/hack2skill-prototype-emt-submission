import React, { useState, useEffect } from 'react';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // adjust path to your firebase.js

const HotelDetails = ({ hotelId }) => {
  const [hotelData, setHotelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        // Access dummyData -> document "hotel"
const hotelRef = doc(db, "dummyData", "hotels", "list", hotelId);
const hotelDoc = await getDoc(hotelRef);

if (hotelDoc.exists()) {
  setHotelData(hotelDoc.data());
} else {
  console.log("No such hotel!");
}
      } catch (error) {
        console.error("Error fetching hotel:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [hotelId]);

  const renderStars = (rating) => {
    if (!rating) return null;
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="fas fa-star text-warning"></i>);
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt text-warning"></i>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star text-warning"></i>);
    }

    return stars;
  };

  const nextImage = () => {
    if (hotelData?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % hotelData.images.length);
    }
  };

  const prevImage = () => {
    if (hotelData?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + hotelData.images.length) % hotelData.images.length);
    }
  };

  if (loading) return <p className="text-center p-4">Loading hotel details...</p>;
  if (!hotelData) return <p className="text-center p-4">Hotel not found</p>;

  return (
    <div className="container-fluid bg-light" style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />

      <div className="card shadow-sm border-0">
        {/* Header */}
        <div className="card-header bg-white border-0 p-4">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h2 className="fw-bold mb-2">{hotelData.name}</h2>
              <p className="text-muted mb-2">{hotelData.location?.city || hotelData.address}</p>
              <div className="d-flex align-items-center">
                {hotelData.rating && (
                  <>
                    <span className="badge bg-success me-2">{hotelData.rating}</span>
                    <div className="me-2">{renderStars(hotelData.rating)}</div>
                  </>
                )}
                {hotelData.starCategory && <span className="text-muted">{"★".repeat(hotelData.starCategory)}</span>}
              </div>
            </div>
            <div className="text-end">
              <span className="badge bg-danger mb-2">SELECTED HOTEL</span>
              <br />
              <button className="btn btn-link text-primary p-0">CHANGE</button>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="position-relative" style={{ height: "400px" }}>
          <img
            src={hotelData.images ? hotelData.images[currentImageIndex] : hotelData.thumbnail}
            alt="Hotel main view"
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />

          <button
            className="btn btn-dark btn-sm position-absolute bottom-0 start-0 m-3"
            onClick={() => {}}
          >
            <i className="fas fa-images me-2"></i>VIEW GALLERY →
          </button>

          {hotelData.images && hotelData.images.length > 1 && (
            <>
              <button
                className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-2"
                onClick={prevImage}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button
                className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-2"
                onClick={nextImage}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="card-body p-0 mt-2 border-top pt-2">
          <ul className="nav nav-tabs border-0 nav-pills ms-2">
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>About the hotel</button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>Rooms</button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'facilities' ? 'active' : ''}`} onClick={() => setActiveTab('facilities')}>Facilities</button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'location' ? 'active' : ''}`} onClick={() => setActiveTab('location')}>Location</button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="tab-content p-4">
            {activeTab === 'about' && (
              <div>
                <div className="row mb-4">
                  <div className="col-md-6">
                    <p><strong>Check in:</strong> {hotelData.check_in_time || hotelData.checkIn}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Check out:</strong> {hotelData.check_out_time || hotelData.checkOut}</p>
                  </div>
                </div>

                {hotelData.description && <p className="mb-4">{hotelData.description}</p>}

                {hotelData.breakfastOptions && (
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <h6>Breakfast options include:</h6>
                      <p>{hotelData.breakfastOptions.join(', ')}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <h6>Activities available:</h6>
                      <p>{hotelData.activities?.join(', ') || "Not specified"}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'facilities' && hotelData.amenities && (
              <div>
                <h6 className="mb-3">Hotel Amenities</h6>
                <div className="row">
                  {hotelData.amenities.map((amenity, index) => (
                    <div key={index} className="col-md-4 mb-2">
                      <i className="fas fa-check text-success me-2"></i>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div>
                <h6 className="mb-3">Hotel Location</h6>
                <p><strong>Address:</strong> {hotelData.address}</p>
                <div className="bg-light p-3 rounded">
                  <p className="mb-0">Interactive map would be displayed here</p>
                </div>
              </div>
            )}

            {activeTab === 'rooms' && (
              <div>
                <h6 className="mb-3">Room Information</h6>
                <p>Room details and booking options would be displayed here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Hotel Rules - left as in your original UI */}
        <div className="border-top">
          <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
              <h6 className="mb-2 mb-md-0">Hotel Rules</h6>
              <span className="text-primary small">View All (8)</span>
            </div>
            {/* ... your rules cards unchanged ... */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
