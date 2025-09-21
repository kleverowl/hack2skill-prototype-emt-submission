
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



const [messages] = useState([
    {
      id: 1,
      type: 'ai',
      messageType: 'text',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      time: '10:00',
      avatar: 'assets/images/ai-avatar.jpg',
      name: 'AI Assistant'
    },
    {
      id: 2,
      type: 'user',
      content: 'Hello, can you help me find a good restaurant nearby?',
      time: '10:01',
      avatar: 'assets/images/users/avatar-4.jpg',
      name: 'Doris Brown'
    },
    {
      id: 3,
      type: 'ai',
      messageType: 'text',
      content: 'Of course! I\'d be happy to help you find a great restaurant. What type of cuisine are you looking for?',
      time: '10:02',
      avatar: 'assets/images/ai-avatar.jpg',
      name: 'AI Assistant'
    },
    {
      id: 4,
      type: 'user',
      content: 'I\'m looking for Italian food',
      time: '10:03',
      avatar: 'assets/images/users/avatar-4.jpg',
      name: 'Doris Brown'
    },
    {
      id: 5,
      type: 'ai',
      messageType: 'image',
      content: 'Here\'s a great Italian restaurant I found for you:',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      time: '10:04',
      avatar: 'assets/images/ai-avatar.jpg',
      name: 'AI Assistant'
    },
    {
      id: 6,
      type: 'ai',
      messageType: 'map',
      content: 'Here\'s the location on the map:',
      location: { lat: 40.7589, lng: -73.9851, name: 'Bella Italia Restaurant' },
      time: '10:05',
      avatar: 'assets/images/ai-avatar.jpg',
      name: 'AI Assistant'
    },
    {
      id: 7,
      type: 'user',
      content: 'That looks great! Can you tell me more about it?',
      time: '10:06',
      avatar: 'assets/images/users/avatar-4.jpg',
      name: 'Doris Brown'
    },
    {
      id: 8,
      type: 'ai',
      messageType: 'image_text',
      content: 'This restaurant has excellent reviews and authentic Italian cuisine. They specialize in traditional pasta dishes and wood-fired pizzas.',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      time: '10:07',
      avatar: 'assets/images/ai-avatar.jpg',
      name: 'AI Assistant'
    },
    {
      id: 9,
      type: 'user',
      content: 'Perfect! I\'d like to make a reservation',
      time: '10:08',
      avatar: 'assets/images/users/avatar-4.jpg',
      name: 'Doris Brown'
    },
    {
      id: 10,
      type: 'ai',
      messageType: 'image_text_button',
      content: 'Great choice! Here are your options for this restaurant:',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      buttons: [
        { text: 'Make Reservation', variant: 'primary', action: 'reservation' },
        { text: 'Get Directions', variant: 'outline-secondary', action: 'directions' },
        { text: 'View Menu', variant: 'outline-primary', action: 'menu' }
      ],
      time: '10:09',
      avatar: 'assets/images/ai-avatar.jpg',
      name: 'AI Assistant'
    }
  ]);

  const handleButtonClick = (action, messageId) => {
    console.log(`Button clicked: ${action} for message ${messageId}`);
    // Handle button actions here
  };

  const MessageDropdown = ({ messageId }) => (
    <div className="dropdown align-self-start">
      <button 
        className="btn btn-link dropdown-toggle p-0" 
        type="button" 
        data-bs-toggle="dropdown" 
        aria-haspopup="true" 
        aria-expanded="false"
        style={{ border: 'none', background: 'none' }}
      >
        <i className="ri-more-2-fill"></i>
      </button>
      <div className="dropdown-menu">
        <a className="dropdown-item" href="#">Copy <i className="ri-file-copy-line float-end text-muted"></i></a>
        <a className="dropdown-item" href="#">Save <i className="ri-save-line float-end text-muted"></i></a>
        <a className="dropdown-item" href="#">Forward <i className="ri-chat-forward-line float-end text-muted"></i></a>
        <a className="dropdown-item" href="#">Delete <i className="ri-delete-bin-line float-end text-muted"></i></a>
      </div>
    </div>
  );

  const TextMessage = ({ message }) => (
    <div className="ctext-wrap-content">
      <p className="mb-0">{message.content}</p>
      <p className="chat-time mb-0">
        <i className="ri-time-line align-middle"></i> 
        <span className="align-middle">{message.time}</span>
      </p>
    </div>
  );

  const ImageMessage = ({ message }) => (
    <div className="ctext-wrap-content">
      {message.content && <p className="mb-2">{message.content}</p>}
      <div className="message-img mb-2">
        <img 
          src={message.image} 
          alt="Shared image" 
          className="img-fluid rounded"
          style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'cover' }}
        />
      </div>
      <p className="chat-time mb-0">
        <i className="ri-time-line align-middle"></i> 
        <span className="align-middle">{message.time}</span>
      </p>
    </div>
  );

  const MapMessage = ({ message }) => (
    <div className="ctext-wrap-content">
      {message.content && <p className="mb-2">{message.content}</p>}
      <div className="message-map mb-2">
        <div 
          className="map-placeholder d-flex align-items-center justify-content-center bg-light rounded"
          style={{ height: '200px', width: '300px' }}
        >
          <div className="text-center">
            <i className="ri-map-pin-line fs-1 text-primary"></i>
            <p className="mb-0 mt-2">{message.location.name}</p>
            <small className="text-muted">
              Lat: {message.location.lat}, Lng: {message.location.lng}
            </small>
          </div>
        </div>
      </div>
      <p className="chat-time mb-0">
        <i className="ri-time-line align-middle"></i> 
        <span className="align-middle">{message.time}</span>
      </p>
    </div>
  );

  const ImageTextMessage = ({ message }) => (
    <div className="ctext-wrap-content">
      <div className="message-img mb-2">
        <img 
          src={message.image} 
          alt="Shared image" 
          className="img-fluid rounded"
          style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'cover' }}
        />
      </div>
      <p className="mb-0">{message.content}</p>
      <p className="chat-time mb-0">
        <i className="ri-time-line align-middle"></i> 
        <span className="align-middle">{message.time}</span>
      </p>
    </div>
  );

  const ImageTextButtonMessage = ({ message }) => (
    <div className="ctext-wrap-content">
      <div className="message-img mb-2">
        <img 
          src={message.image} 
          alt="Shared image" 
          className="img-fluid rounded"
          style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'cover' }}
        />
      </div>
      <p className="mb-2">{message.content}</p>
      <div className="message-buttons mb-2">
        <div className="d-flex flex-wrap gap-2">
          {message.buttons.map((button, index) => (
            <button
              key={index}
              className={`btn btn-${button.variant} btn-sm`}
              onClick={() => handleButtonClick(button.action, message.id)}
            >
              {button.text}
            </button>
          ))}
        </div>
      </div>
      <p className="chat-time mb-0">
        <i className="ri-time-line align-middle"></i> 
        <span className="align-middle">{message.time}</span>
      </p>
    </div>
  );

  const renderMessageContent = (message) => {
    switch (message.messageType) {
      case 'image':
        return <ImageMessage message={message} />;
      case 'map':
        return <MapMessage message={message} />;
      case 'image_text':
        return <ImageTextMessage message={message} />;
      case 'image_text_button':
        return <ImageTextButtonMessage message={message} />;
      default:
        return <TextMessage message={message} />;
    }
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
  <div className="card-body">
              <div className="chat-conversation p-3" style={{ height: '600px', overflowY: 'auto' }}>
                <ul className="list-unstyled mb-0">
                  {messages.map((message) => (
                    <li key={message.id} className={message.type === 'user' ? 'right' : ''}>
                      <div className="conversation-list">
                        <div className="chat-avatar">
                          <div 
                            className="avatar-placeholder bg-secondary rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '40px', height: '40px' }}
                          >
                            {message.type === 'user' ? (
                              <i className="ri-user-fill text-white"></i>
                            ) : (
                              <i className="ri-robot-fill text-white"></i>
                            )}
                          </div>
                        </div>

                        <div className="user-chat-content">
                          <div className="ctext-wrap">
                            {message.type === 'user' ? (
                              <TextMessage message={message} />
                            ) : (
                              renderMessageContent(message)
                            )}
                            <MessageDropdown messageId={message.id} />
                          </div>
                          <div className="conversation-name">{message.name}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
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
