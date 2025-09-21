import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth as firebaseAuth } from "../firebase";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, push, set } from "firebase/database";
const ChatLeftSidebar = ({ activeTab, itineraries, selectedItineraryId, onItinerarySelect }) => {

    const [profile, setProfile] = useState({});
    const [isEditing, setIsEditing] = useState(false);

    const auth = getAuth();
    const user = auth.currentUser;

    // const db = getDatabase();



    // Fetch profile data
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            const userDoc = doc(db, "users", user.uid);
            const snapshot = await getDoc(userDoc);
            if (snapshot.exists()) {
                setProfile(snapshot.data().profile || {});
            }
        };
        fetchProfile();
    }, [user]);

    // Handle input change
    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };


console.log(profile);



    // Save changes to Firestore
    const handleSave = async () => {
        if (!user) return;
        const userDoc = doc(db, "users", user.uid);
        await updateDoc(userDoc, {
            profile: profile,
        });
        setIsEditing(false);
    };

    useEffect(() => {
        const carousel = window.jQuery('#user-status-carousel');
        if (carousel.length > 0 && typeof carousel.owlCarousel === 'function') {
            carousel.owlCarousel({
                items: 4,
                loop: false,
                margin: 16,
                nav: false,
                dots: false,
            });
        }

        // Cleanup function
        return () => {
            if (carousel.length > 0 && typeof carousel.owlCarousel === 'function' && carousel.data('owl.carousel')) {
                carousel.owlCarousel('destroy');
            }
        };
    }, [activeTab]); // Re-run when activeTab changes

    const getLastMessage = (messages) => {
        if (!messages) return { message: 'No messages yet' };
        const messageValues = Object.values(messages);
        if (messageValues.length === 0) return { message: 'No messages yet' };
        // Sort by timestamp to be sure
        messageValues.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return messageValues[0];
    };




const createNewItinerary = async () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    alert("You must be logged in to create an itinerary.");
    return;
  }

  // Realtime Database reference
  const rdb = getDatabase();
  const itinerariesRef = ref(rdb, `users/user_id/${currentUser.uid}/itineraries`);

  // Create a new itinerary with a unique ID
  const newItineraryRef = push(itinerariesRef);

  // Initialize blank itinerary
await set(newItineraryRef, {
    messages: {
      // optionally initialize typing
      typing: false,
      message_id: {}
    },
    state: {
      itinerary: {
        trip_name: "Untitled Itinerary"
      }
    }
  });

  console.log("New itinerary created:", newItineraryRef.key);
};


    return (
        <div className="chat-leftsidebar me-lg-1 ms-lg-0">
            <div className="tab-content">
                {/* Start Profile tab-pane */}
                <div className={`tab-pane fade h-100 ${activeTab === 'profile' ? 'show active' : ''}`} id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
                    <div className="d-flex flex-column h-100">
                        {/* Start profile content */}
                        <div className="px-4 pt-4">
                            <div className="user-chat-nav float-end">
                                <div className="dropdown">
                                    <a href="#" className="font-size-18 text-muted dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i className="ri-more-2-fill"></i>
                                    </a>
                                    <div className="dropdown-menu dropdown-menu-end">
                                        <a className="dropdown-item" href="#">Edit</a>
                                        <a className="dropdown-item" href="#">Action</a>
                                        <div className="dropdown-divider"></div>
                                        <a className="dropdown-item" href="#">Another action</a>
                                    </div>
                                </div>
                            </div>
                            <h4 className="mb-0">My Profile</h4>
                        </div>

                        <div className="text-center p-4 border-bottom">
                            <div className="mb-4">
                                <img src="assets/images/users/avatar-1.jpg" className="rounded-circle avatar-lg img-thumbnail" alt="" />
                            </div>

                            <h5 className="font-size-16 mb-1 text-truncate">{profile.firstname} {profile.lastname}</h5>
                            <p className="text-muted text-truncate mb-1"><i className="ri-record-circle-fill font-size-10 text-success me-1 ms-0 d-inline-block"></i> Active</p>
                        </div>
                        {/* End profile user */}

                        {/* Start user-profile-desc */}
                        <div className="p-4 user-profile-desc flex-grow-1" style={{overflowY: 'auto'}} data-simplebar>
                            <div className="text-muted">
                                {/* <p className="mb-4">If several languages coalesce, the grammar of the resulting language is more simple and regular than that of the individual.</p> */}
                            </div>

                            <div id="tabprofile" className="accordion">
                                <div className="accordion-item card border mb-2">
                                    <div className="accordion-header" id="about2">
                                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#about" aria-expanded="true" aria-controls="about">
                                            <h5 className="font-size-14 m-0">
                                                <i className="ri-user-2-line me-2 ms-0 ms-0 align-middle d-inline-block"></i> About
                                            </h5>
                                        </button>
                                    </div>
                                    <div id="about" className="accordion-collapse collapse show" aria-labelledby="about2" data-bs-parent="#tabprofile">
                                        <div className="accordion-body">
                                            <div>
                                                <p className="text-muted mb-1">Name</p> 
                                                <h5 className="font-size-14">{profile.firstname} {profile.lastname}</h5>
                                            </div>

                                            <div className="mt-4">
                                                <p className="text-muted mb-1">Email</p>
                                                <h5 className="font-size-14">{profile.email}</h5>
                                            </div>

                                            <div className="mt-4">
                                                <p className="text-muted mb-1">Phone</p>
                                                <h5 className="font-size-14">{profile.phone}</h5>
                                            </div>

                                            <div className="mt-4">
                                                <p className="text-muted mb-1">Gender</p>
                                                <h5 className="font-size-14">{profile.gender}</h5>
                                            </div>

                                            <div className="mt-4">
                                                <p className="text-muted mb-1">Address</p>
                                                <h5 className="font-size-14 mb-0">{typeof profile.address === 'object' ? JSON.stringify(profile.address) : profile.address}</h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* End About card */}

                                <div className="card accordion-item border">
                                    <div className="accordion-header" id="attachfile2">
                                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#attachfile" aria-expanded="false" aria-controls="attachfile">
                                            <h5 className="font-size-14 m-0">
                                                <i className="ri-attachment-line me-2 ms-0 ms-0 align-middle d-inline-block"></i> Attached Documents
                                            </h5>
                                        </button>
                                    </div>
                                    <div id="attachfile" className="accordion-collapse collapse" aria-labelledby="attachfile2" data-bs-parent="#tabprofile">
                                        <div className="accordion-body">
                                            <div className="card p-2 border mb-2">
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar-sm me-3 ms-0">
                                                        <div className="avatar-title bg-primary-subtle text-primary rounded font-size-20">
                                                            <i className="ri-file-text-fill"></i>
                                                        </div>
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <div className="text-start">
                                                            <h5 className="font-size-14 mb-1">Admin-A.zip</h5>
                                                            <p className="text-muted font-size-13 mb-0">12.5 MB</p>
                                                        </div>
                                                    </div>

                                                    <div className="ms-4 me-0">
                                                        <ul className="list-inline mb-0 font-size-18">
                                                            <li className="list-inline-item">
                                                                <a href="#" className="text-muted px-1">
                                                                    <i className="ri-download-2-line"></i>
                                                                </a>
                                                            </li>
                                                            <li className="list-inline-item dropdown">
                                                                <a className="dropdown-toggle text-muted px-1" href="#" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                                    <i className="ri-more-fill"></i>
                                                                </a>
                                                                <div className="dropdown-menu dropdown-menu-end">
                                                                    <a className="dropdown-item" href="#">Action</a>
                                                                    <a className="dropdown-item" href="#">Another action</a>
                                                                    <div className="dropdown-divider"></div>
                                                                    <a className="dropdown-item" href="#">Delete</a>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* end profile-user-accordion */}

                            </div>
                            {/* end user-profile-desc */}
                        </div>
                    </div>
                    {/* End Profile tab-pane */}
                </div>
                {/* Start chats tab-pane */}
      <div
  className={`tab-pane fade ${activeTab === "chat" ? "show active" : ""}`}
  id="pills-chat"
  role="tabpanel"
  aria-labelledby="pills-chat-tab"
>
  <div className="d-flex flex-column h-100">

    {/* Header Section */}
    <div className="px-4 pt-4">
      <h4 className="mb-4">Ease My Trip Holiday</h4>

      {/* Search box */}
      <div className="search-box chat-search-box mb-3">
        <div
          className="input-group rounded-pill shadow-sm overflow-hidden"
          style={{ border: "1px solid #e0e0e0" }}
        >
          <span
            className="input-group-text bg-white border-0 pe-2 ps-3"
            style={{ border: "none" }}
          >
            <i className="ri-search-line text-muted fs-5"></i>
          </span>
          <input
            type="text"
            className="form-control border-0 bg-white"
            placeholder="Search messages or users"
            aria-label="Search messages or users"
            style={{
              boxShadow: "none",
              outline: "none",
            }}
          />
        </div>

        {/* Create Button (kept under search) */}
        <button
          className="btn btn-sm mt-2 w-100 rounded-pill"
          onClick={createNewItinerary}
          style={{
            backgroundColor: "#17B8E0",
            borderColor: "#17B8E0",
            color: "#ffffff",
          }}
        >
          + Create New Itinerary
        </button>
      </div>
    </div>

    {/* User status carousel placeholder */}
    <div className="px-4 pb-4" dir="ltr">
      {/* user status carousel */}
    </div>

    {/* Recent Itineraries */}
    <div className="flex-grow-1">
      <div className="d-flex justify-content-between align-items-center px-4 mb-2">
        <h5 className="mb-0 font-size-16">Recent Itineraries</h5>
      </div>

      <div className="chat-message-list px-4" data-simplebar>
        <ul className="list-unstyled chat-list chat-user-list">
          {Object.keys(itineraries).map((itineraryId, index) => {
            const itinerary = itineraries[itineraryId];
            const lastMessage = getLastMessage(itinerary?.messages?.message_id);
            const tripName =
              itinerary.state?.itinerary?.trip_name || `Itinerary ${index + 1}`;
            const isActive = itineraryId === selectedItineraryId;

            return (
              <li
                key={itineraryId}
                className={`mb-2 rounded-3 ${isActive ? "text-white" : ""}`}
                style={{
                  backgroundColor: isActive ? "#17B8E0" : "transparent",
                  cursor: "pointer",
                }}
                onClick={() => onItinerarySelect(itineraryId)}
              >
                <div className="d-flex align-items-center p-3">
                  <div className="chat-user-img align-self-center me-3 ms-0">
                    <div className="avatar-xs">
                      <span
                        className="avatar-title rounded-circle text-white"
                        style={{
                          backgroundColor: isActive ? "#155C87" : "#0980B5",
                        }}
                      >
                        {tripName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex-grow-1 overflow-hidden">
                    <h5 className="text-truncate font-size-15 mb-1">
                      {tripName}
                    </h5>
                    <p className="chat-user-message text-truncate mb-0">
                      {lastMessage?.message}
                    </p>
                  </div>

                  <div className="font-size-11 ms-2">
                    {lastMessage?.timestamp
                      ? new Date(lastMessage.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  </div>
</div>


                {/* End chats tab-pane */}
                      <div
  className={`tab-pane fade ${activeTab === 'groups' ? 'show active' : ''}`}
  id="pills-groups"
  role="tabpanel"
  aria-labelledby="pills-groups-tab"
>
  <div className="p-4">
    <h4 className="mb-4">Personalization</h4>

    {/* Bootstrap Accordion */}
    <div className="accordion" id="personalizationAccordion">
      {/* Food */}
      <div className="accordion-item">
        <h2 className="accordion-header" id="headingFood">
          <button
            className="accordion-button"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseFood"
            aria-expanded="true"
            aria-controls="collapseFood"
          >
            Food
          </button>
        </h2>
        <div
          id="collapseFood"
          className="accordion-collapse collapse show"
          aria-labelledby="headingFood"
          data-bs-parent="#personalizationAccordion"
        >
          <div className="accordion-body">
            <ul className="list-unstyled mb-0">
              {["Italian", "Spicy", "Vegetarian"].map((item, index) => (
                <li key={index}>#{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Travel Style */}
      <div className="accordion-item">
        <h2 className="accordion-header" id="headingTravelStyle">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseTravelStyle"
            aria-expanded="false"
            aria-controls="collapseTravelStyle"
          >
            Travel Style
          </button>
        </h2>
        <div
          id="collapseTravelStyle"
          className="accordion-collapse collapse"
          aria-labelledby="headingTravelStyle"
          data-bs-parent="#personalizationAccordion"
        >
          <div className="accordion-body">
            <ul className="list-unstyled mb-0">
              {["Adventure", "Relaxing", "Budget-friendly"].map(
                (item, index) => (
                  <li key={index}>#{item}</li>
                )
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Hotel */}
      <div className="accordion-item">
        <h2 className="accordion-header" id="headingHotel">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseHotel"
            aria-expanded="false"
            aria-controls="collapseHotel"
          >
            Hotel
          </button>
        </h2>
        <div
          id="collapseHotel"
          className="accordion-collapse collapse"
          aria-labelledby="headingHotel"
          data-bs-parent="#personalizationAccordion"
        >
          <div className="accordion-body">
            <ul className="list-unstyled mb-0">
              {["Boutique", "Free WiFi", "Swimming Pool"].map((item, index) => (
                <li key={index}>#{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Flight */}
      <div className="accordion-item">
        <h2 className="accordion-header" id="headingFlight">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseFlight"
            aria-expanded="false"
            aria-controls="collapseFlight"
          >
            Flight
          </button>
        </h2>
        <div
          id="collapseFlight"
          className="accordion-collapse collapse"
          aria-labelledby="headingFlight"
          data-bs-parent="#personalizationAccordion"
        >
          <div className="accordion-body">
            <ul className="list-unstyled mb-0">
              {["Window Seat", "Extra Legroom"].map((item, index) => (
                <li key={index}>#{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Cab */}
      <div className="accordion-item">
        <h2 className="accordion-header" id="headingCab">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseCab"
            aria-expanded="false"
            aria-controls="collapseCab"
          >
            Cab
          </button>
        </h2>
        <div
          id="collapseCab"
          className="accordion-collapse collapse"
          aria-labelledby="headingCab"
          data-bs-parent="#personalizationAccordion"
        >
          <div className="accordion-body">
            <ul className="list-unstyled mb-0">
              {["SUV", "EV"].map((item, index) => (
                <li key={index}>#{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Train */}
      <div className="accordion-item">
        <h2 className="accordion-header" id="headingTrain">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseTrain"
            aria-expanded="false"
            aria-controls="collapseTrain"
          >
            Train
          </button>
        </h2>
        <div
          id="collapseTrain"
          className="accordion-collapse collapse"
          aria-labelledby="headingTrain"
          data-bs-parent="#personalizationAccordion"
        >
          <div className="accordion-body">
            <ul className="list-unstyled mb-0">
              {["AC Chair Car"].map((item, index) => (
                <li key={index}>#{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bus */}
      <div className="accordion-item">
        <h2 className="accordion-header" id="headingBus">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseBus"
            aria-expanded="false"
            aria-controls="collapseBus"
          >
            Bus
          </button>
        </h2>
        <div
          id="collapseBus"
          className="accordion-collapse collapse"
          aria-labelledby="headingBus"
          data-bs-parent="#personalizationAccordion"
        >
          <div className="accordion-body">
            <ul className="list-unstyled mb-0">
              {["Sleeper", "AC"].map((item, index) => (
                <li key={index}>#{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
    {/* End Accordion */}
  </div>
</div>

                    {/* End groups tab-pane */}

                    {/* Start contacts tab-pane */}
                    <div className={`tab-pane fade ${activeTab === 'contacts' ? 'show active' : ''}`} id="pills-contacts" role="tabpanel" aria-labelledby="pills-contacts-tab">
                        {/* Start Contact content */}
                        <div>
                            <div className="p-4">
                                <div className="user-chat-nav float-end">
                                    <div data-bs-toggle="tooltip" data-bs-placement="bottom" title="Add Contact">
                                        {/* Button trigger modal */}
                                        <button type="button" className="btn btn-link text-decoration-none text-muted font-size-18 py-0" data-bs-toggle="modal" data-bs-target="#addContact-exampleModal">
                                            <i className="ri-user-add-line"></i>
                                        </button>
                                    </div>
                                </div>
                                <h4 className="mb-4">Family & Friends</h4>

                                {/* Start Add contact Modal */}
                                <div className="modal fade" id="addContact-exampleModal" tabIndex="-1" role="dialog" aria-labelledby="addContact-exampleModalLabel" aria-hidden="true">
                                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title font-size-16" id="addContact-exampleModalLabel">Add Contact</h5>
                                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">
                                                </button>
                                            </div>
                                            <div className="modal-body p-4">
                                                <form>
                                                    <div className="mb-3">
                                                        <label htmlFor="addcontactemail-input" className="form-label">Email</label>
                                                        <input type="email" className="form-control" id="addcontactemail-input" placeholder="Enter Email" />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="addcontact-invitemessage-input" className="form-label">Invatation Message</label>
                                                        <textarea className="form-control" id="addcontact-invitemessage-input" rows="3" placeholder="Enter Message"></textarea>
                                                    </div>
                                                </form>
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-link" data-bs-dismiss="modal">Close</button>
                                                <button type="button" className="btn btn-primary">Invite Contact</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* End Add contact Modal */}

                                <div className="search-box chat-search-box">
                                    <div className="input-group bg-light  input-group-lg rounded-3">
                                        <div className="input-group-prepend">
                                            <button className="btn btn-link text-decoration-none text-muted pe-1 ps-3" type="button">
                                                <i className="ri-search-line search-icon font-size-18"></i>
                                            </button>
                                        </div>
                                        <input type="text" className="form-control bg-light" placeholder="Search users.." />
                                    </div>
                                </div>
                                {/* End search-box */}
                            </div>
                            {/* end p-4 */}

                            {/* Start contact lists */}
                            <div className="p-4 chat-message-list chat-group-list" data-simplebar>
        
                                <div>
                                    <div className="p-3 fw-bold text-primary">
                                        A
                                    </div>

                                    <ul className="list-unstyled contact-list">
                                        <li>
                                            <div className="d-flex align-items-center">
                                                <div className="flex-grow-1">
                                                    <h5 className="font-size-14 m-0">Albert Rodarte</h5>
                                                </div>
                                                <div className="dropdown">
                                                    <a href="#" className="text-muted dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                        <i className="ri-more-2-fill"></i>
                                                    </a>
                                                    <div className="dropdown-menu dropdown-menu-end">
                                                        <a className="dropdown-item" href="#">Share <i className="ri-share-line float-end text-muted"></i></a>
                                                        <a className="dropdown-item" href="#">Block <i className="ri-forbid-line float-end text-muted"></i></a>
                                                        <a className="dropdown-item" href="#">Remove <i className="ri-delete-bin-line float-end text-muted"></i></a>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                {/* end contact list A */}

                            </div>
                            {/* end contact lists */}
                        </div>
                        {/* Start Contact content */}
                    </div>
                    {/* End contacts tab-pane */}
                    
                    {/* Start settings tab-pane */}
 <div
      className={`tab-pane fade h-100 ${
        activeTab === "settings" ? "show active" : ""
      }`}
      id="pills-setting"
      role="tabpanel"
      aria-labelledby="pills-setting-tab"
    >
      <div className="d-flex flex-column h-100">
        <div className="px-4 pt-4">
          <h4 className="mb-0">Settings</h4>
        </div>

        <div className="text-center border-bottom p-4">
          <div className="mb-4 profile-user">
            <img
              src={profile.profilePhotoUrl || "assets/images/users/avatar-1.jpg"}
              className="rounded-circle avatar-lg img-thumbnail"
              alt=""
            />
            <button
              type="button"
              className="btn btn-light bg-light avatar-xs p-0 rounded-circle profile-photo-edit"
            >
              <i className="ri-pencil-fill"></i>
            </button>
          </div>

          <h5 className="font-size-16 mb-1 text-truncate">
            {profile.firstname} {profile.lastname}
          </h5>
          <div className="dropdown d-inline-block mb-1">
            <a
              className="text-muted dropdown-toggle pb-1 d-block"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              Available <i className="mdi mdi-chevron-down"></i>
            </a>
            <div className="dropdown-menu">
              <a className="dropdown-item" href="#">
                Available
              </a>
              <a className="dropdown-item" href="#">
                Busy
              </a>
            </div>
          </div>
        </div>

        {/* Profile Info Accordion */}
        <div
          className="p-4 user-profile-desc flex-grow-1"
          style={{ overflowY: "auto" }}
          data-simplebar
        >
          <div id="settingprofile" className="accordion">
            <div className="accordion-item card border mb-2">
              <div className="accordion-header" id="personalinfo1">
                <button
                  className="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#personalinfo"
                  aria-expanded="true"
                  aria-controls="personalinfo"
                >
                  <h5 className="font-size-14 m-0">Personal Info</h5>
                </button>
              </div>
              <div
                id="personalinfo"
                className="accordion-collapse collapse show"
                aria-labelledby="personalinfo1"
                data-bs-parent="#settingprofile"
              >
                <div className="accordion-body">
                  <div className="float-end">
                    {!isEditing ? (
                      <button
                        type="button"
                        className="btn btn-light btn-sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <i className="ri-edit-fill me-1 ms-0 align-middle"></i>{" "}
                        Edit
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-success btn-sm mb-2"
                        onClick={handleSave}
                      >
                        Save
                      </button>
                    )}
                  </div>

                  <div>
                    <p className="text-muted mb-1">Name</p>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          name="firstname"
                          value={profile.firstname || ""}
                          onChange={handleChange}
                          className="form-control mb-2"
                        />
                        <input
                          type="text"
                          name="lastname"
                          value={profile.lastname || ""}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </>
                    ) : (
                      <h5 className="font-size-14">
                        {profile.firstname} {profile.lastname}
                      </h5>
                    )}
                  </div>

                  <div className="mt-4">
                    <p className="text-muted mb-1">Email</p>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={profile.email || ""}
                        onChange={handleChange}
                        className="form-control"
                      />
                    ) : (
                      <h5 className="font-size-14">{profile.email}</h5>
                    )}
                  </div>

                  <div className="mt-4">
                    <p className="text-muted mb-1">Phone</p>
                    {isEditing ? (
                      <input
                        type="text"
                        name="phone"
                        value={profile.phone || ""}
                        onChange={handleChange}
                        className="form-control"
                      />
                    ) : (
                      <h5 className="font-size-14">{profile.phone}</h5>
                    )}
                  </div>

                  <div className="mt-4">
                    <p className="text-muted mb-1">Gender</p>
                    {isEditing ? (
                      <select
                        name="gender"
                        value={profile.gender || ""}
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    ) : (
                      <h5 className="font-size-14">{profile.gender}</h5>
                    )}
                  </div>

                  {/* <div className="mt-4">
                    <p className="text-muted mb-1">Date of Birth</p>
                    {isEditing ? (
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={profile.dateOfBirth || ""}
                        onChange={handleChange}
                        className="form-control"
                      />
                    ) : (
                      <h5 className="font-size-14">{profile.dateOfBirth}</h5>
                    )}
                  </div> */}

                  <div className="mt-4">
                    <p className="text-muted mb-1">Address</p>
                    {isEditing ? (
                      <textarea
                        name="address"
                        value={profile.address || ""}
                        onChange={handleChange}
                        className="form-control"
                      />
                    ) : (
                      <h5 className="font-size-14 mb-0">
                        {typeof profile.address === 'object' ? JSON.stringify(profile.address) : profile.address}
                      </h5>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* end personal info card */}
          </div>
        </div>
      </div>
    </div>
                
            </div>
        </div>
    );
}
export default ChatLeftSidebar;