
import React from 'react';
import { useState } from 'react';
import HotelDetails from './hotel';
import FlightCard from './flightcard';
import FlightDetailsCard from './flightdetailedcard';
import FlightDetailsMap from './flightdetailsmap';
import Iternity from './iternity';
import TravelItinerary from './iternity';


const UserChat = () => {
      const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState("Doris Brown");


   const handleSave = () => {
    setIsEditing(false);
    // 🔹 here you can call API to update username
    console.log("Updated name:", userName);
  };  

  
    return (
        <div className="user-chat w-100 overflow-hidden">
            <div className="d-lg-flex">

                {/* start chat conversation section */}
                <div className="w-100 overflow-hidden position-relative">
                    <div className="p-3 p-lg-4 border-bottom user-chat-topbar">
                        <div className="row align-items-center">
                            <div className="col-sm-4 col-8">
                                <div className="d-flex align-items-center">
                                    <div className="d-block d-lg-none me-2 ms-0">
                                        <a href="#" className="user-chat-remove text-muted font-size-16 p-2"><i className="ri-arrow-left-s-line"></i></a>
                                    </div>
                                    <div className="me-3 ms-0">
                                        <img src="assets/images/users/avatar-4.jpg" className="rounded-circle avatar-xs" alt="" />
                                    </div>
                                    <div className="flex-grow-1 overflow-hidden">
  <h5 className="font-size-16 mb-0 text-truncate d-flex align-items-center">
      {isEditing ? (
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          onBlur={handleSave}
          autoFocus
          className="me-2"
          style={{ maxWidth: "200px" }}
        />
      ) : (
        <span className="text-reset">{userName}</span>
      )}

      {/* Pen Icon */}
      <i
        className="ri-pencil-fill font-size-14 text-primary ms-2"
        style={{ cursor: "pointer" }}
        onClick={() => setIsEditing(true)}
      ></i>
    </h5>                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-8 col-4">
                                <ul className="list-inline user-chat-nav text-end mb-0">
                                    <li className="list-inline-item">
                                        <div className="dropdown">
                                            <button className="btn nav-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                <i className="ri-search-line"></i>
                                            </button>
                                            <div className="dropdown-menu p-0 dropdown-menu-end dropdown-menu-md">
                                                <div className="search-box p-2">
                                                    <input type="text" className="form-control bg-light border-0" placeholder="Search.." />
                                                </div>
                                            </div>
                                        </div>
                                    </li>

                                    <li className="list-inline-item d-none d-lg-inline-block me-2 ms-0">
                                        <button type="button" className="btn nav-btn" data-bs-toggle="offcanvas" data-bs-target="#flightOffcanvas" aria-controls="flightOffcanvas">
                                            <i className="ri-flight-takeoff-line"></i>
                                        </button>
                                    </li>

                                    <li className="list-inline-item d-none d-lg-inline-block me-2 ms-0">
                                        <button type="button" className="btn nav-btn" data-bs-toggle="offcanvas" data-bs-target="#hotelOffcanvas" aria-controls="hotelOffcanvas">
                                            <i className="ri-hotel-line"></i>
                                        </button>
                                    </li>

                                    <li className="list-inline-item d-none d-lg-inline-block me-2 ms-0">
                                        <button type="button" className="btn nav-btn" data-bs-toggle="offcanvas" data-bs-target="#itineraryOffcanvas" aria-controls="itineraryOffcanvas">
                                            <i className="ri-calendar-todo-line"></i>
                                        </button>
                                    </li>

                                    <li className="list-inline-item d-none d-lg-inline-block me-2 ms-0">
                                        <button type="button" className="btn nav-btn user-profile-show">
                                            <i className="ri-user-2-line"></i>
                                        </button>
                                    </li>

                                    <li className="list-inline-item">
                                        <div className="dropdown">
                                            <button className="btn nav-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                <i className="ri-more-fill"></i>
                                            </button>
                                            <div className="dropdown-menu dropdown-menu-end">
                                                <a className="dropdown-item d-block d-lg-none user-profile-show" href="#">View profile <i className="ri-user-2-line float-end text-muted"></i></a>
                                                <a className="dropdown-item d-block d-lg-none" href="#" data-bs-toggle="offcanvas" data-bs-target="#flightOffcanvas" aria-controls="flightOffcanvas">Flights <i className="ri-flight-takeoff-line float-end text-muted"></i></a>
                                                <a className="dropdown-item d-block d-lg-none" href="#" data-bs-toggle="offcanvas" data-bs-target="#hotelOffcanvas" aria-controls="hotelOffcanvas">Hotels <i className="ri-hotel-line float-end text-muted"></i></a>
                                                <a className="dropdown-item d-block d-lg-none" href="#" data-bs-toggle="offcanvas" data-bs-target="#itineraryOffcanvas" aria-controls="itineraryOffcanvas">Itinerary <i className="ri-calendar-todo-line float-end text-muted"></i></a>
                                                <a className="dropdown-item" href="#">Archive <i className="ri-archive-line float-end text-muted"></i></a>
                                                <a className="dropdown-item" href="#">Muted <i className="ri-volume-mute-line float-end text-muted"></i></a>
                                                <a className="dropdown-item" href="#">Delete <i className="ri-delete-bin-line float-end text-muted"></i></a>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    {/* end chat user head */}

                    {/* start chat conversation */}
                    <div className="chat-conversation p-3 p-lg-4" data-simplebar>
                        <ul className="list-unstyled mb-0">
                            <li>
                                <div className="conversation-list">
                                    <div className="chat-avatar">
                                        <img src="assets/images/users/avatar-4.jpg" alt="" />
                                    </div>

                                    <div className="user-chat-content">
                                        <div className="ctext-wrap">
                                            <div className="ctext-wrap-content">
                                                <p className="mb-0">
                                                    Good morning
                                                </p>
                                                <p className="chat-time mb-0"><i className="ri-time-line align-middle"></i> <span className="align-middle">10:00</span></p>
                                            </div>
                                            <div className="dropdown align-self-start">
                                                <a className="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                    <i className="ri-more-2-fill"></i>
                                                </a>
                                                <div className="dropdown-menu">
                                                    <a className="dropdown-item" href="#">Copy <i className="ri-file-copy-line float-end text-muted"></i></a>
                                                    <a className="dropdown-item" href="#">Save <i className="ri-save-line float-end text-muted"></i></a>
                                                    <a className="dropdown-item" href="#">Forward <i className="ri-chat-forward-line float-end text-muted"></i></a>
                                                    <a className="dropdown-item" href="#">Delete <i className="ri-delete-bin-line float-end text-muted"></i></a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="conversation-name">Doris Brown</div>
                                    </div>
                                </div>
                            </li>

                            <li className="right">
                                <div className="conversation-list">
                                    <div className="chat-avatar">
                                        <img src="assets/images/users/avatar-1.jpg" alt="" />
                                    </div>

                                    <div className="user-chat-content">
                                        <div className="ctext-wrap">
                                            <div className="ctext-wrap-content">
                                                <p className="mb-0">
                                                    Good morning, How are you? What about our next meeting?
                                                </p>
                                                <p className="chat-time mb-0"><i className="ri-time-line align-middle"></i> <span className="align-middle">10:02</span></p>
                                            </div>

                                            <div className="dropdown align-self-start">
                                                <a className="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                    <i className="ri-more-2-fill"></i>
                                                </a>
                                                <div className="dropdown-menu">
                                                    <a className="dropdown-item" href="#">Copy <i className="ri-file-copy-line float-end text-muted"></i></a>
                                                    <a className="dropdown-item" href="#">Save <i className="ri-save-line float-end text-muted"></i></a>
                                                    <a className="dropdown-item" href="#">Forward <i className="ri-chat-forward-line float-end text-muted"></i></a>
                                                    <a className="dropdown-item" href="#">Delete <i className="ri-delete-bin-line float-end text-muted"></i></a>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="conversation-name">Patricia Smith</div>
                                    </div>
                                </div>
                            </li>

                        </ul>

                    </div>
                    {/* end chat conversation */}
<div className="p-3 p-lg-4 border-top mb-0">
            <div className="row g-0 align-items-center">
              <div className="col">
                <input
                  type="text"
                  className="form-control bg-light border-light"
                  placeholder="Enter Message..."
                />
              </div>
              <div className="col-auto">
                <div className="chat-input-links ms-2">
                  <ul className="list-inline mb-0">
                    {/* <li className="list-inline-item">
                      <button type="button" className="btn btn-link text-muted">
                        <i className="ri-emotion-happy-line"></i>
                      </button>
                    </li>
                    <li className="list-inline-item">
                      <button type="button" className="btn btn-link text-muted">
                        <i className="ri-attachment-line"></i>
                      </button>
                    </li>
                    <li className="list-inline-item">
                      <button type="button" className="btn btn-link text-muted">
                        <i className="ri-image-2-line"></i>
                      </button>
                    </li> */}
                    <li className="list-inline-item">
                      <button
                        type="button"
                        className="btn btn-primary font-size-16 btn-lg chat-send waves-effect waves-light"
                      >
                        <i className="ri-send-plane-2-fill"></i>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
                </div>

                {/* Offcanvas Components */}
                <div className="offcanvas offcanvas-end " tabIndex="-1" id="flightOffcanvas" aria-labelledby="flightOffcanvasLabel"  style={{width: "600px"}}>
                    <div className="offcanvas-header">
                        <h5 id="flightOffcanvasLabel">Flight Information</h5>
                        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div className="offcanvas-body">
                        <FlightCard />
                        {/* <FlightDetailsCard /> */}
                        <FlightDetailsMap />
                    </div>
                </div>

                <div className="offcanvas offcanvas-end" tabIndex="-1" id="hotelOffcanvas" aria-labelledby="hotelOffcanvasLabel" style={{width: "600px"}}>
                    <div className="offcanvas-header">
                        <h5 id="hotelOffcanvasLabel">Hotel Information</h5>
                        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div className="offcanvas-body">
                        <HotelDetails />
                    </div>
                </div>

              <div 
  className="offcanvas offcanvas-end" 
  tabIndex="-1" 
  id="itineraryOffcanvas" 
  aria-labelledby="itineraryOffcanvasLabel" 
  style={{ width: "600px" }}
>
  <div className="offcanvas-header">
    <h5 id="itineraryOffcanvasLabel">Itinerary</h5>
    <button 
      type="button" 
      className="btn-close text-reset" 
      data-bs-dismiss="offcanvas" 
      aria-label="Close"
    ></button>
  </div>
  <div className="offcanvas-body">
    <TravelItinerary />

    {/* Share Itinerary Button */}
    <div className="mt-3 text-end">
      <button 
        className="btn btn-primary" 
        onClick={() => window.open("/iternity", "_blank")}
      >
        Share Itinerary
      </button>
    </div>
  </div>
</div>

            </div>
        </div>
    );
}

export default UserChat;
