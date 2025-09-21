import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

import elogo from "../elogo.png"

const SideMenu = ({ activeTab, setActiveTab, theme, toggleTheme }) => {
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleThemeToggle = (e) => {
        e.preventDefault();
        toggleTheme();
    }

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await signOut(auth);
            // The onAuthStateChanged listener in App.js will handle the redirect
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    return (
        <div className="side-menu flex-lg-column me-lg-1 ms-lg-0">
            {/* LOGO */}
            <div className="navbar-brand-box">
                <a href="#" className="logo logo-dark">
                    <span className="logo-sm">
                        <img src={elogo} alt="" height="60" />
                    </span>
                </a>

                <a href="#" className="logo logo-light">
                    <span className="logo-sm">
                        <img src={elogo} alt="" height="60" />
                    </span>
                </a>
            </div>
            {/* end navbar-brand-box */}

            {/* Start side-menu nav */}
            <div className="flex-lg-column my-auto">
                <ul className="nav nav-pills side-menu-nav justify-content-center" role="tablist">
                    <li className="nav-item" data-bs-toggle="tooltip" data-bs-placement="top" title="Profile">
                        <a className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                           onClick={() => handleTabClick('profile')}
                           id="pills-user-tab" data-bs-toggle="pill" href="#pills-user" role="tab">
                            <i className="ri-user-2-line"></i>
                        </a>
                    </li>
                    <li className="nav-item" data-bs-toggle="tooltip" data-bs-placement="top" title="Chats">
                        <a className={`nav-link ${activeTab === 'chat' ? 'active' : ''}`}
                           onClick={() => handleTabClick('chat')}
                           id="pills-chat-tab" data-bs-toggle="pill" href="#pills-chat" role="tab">
                            <i className="ri-message-3-line"></i>
                        </a>
                    </li>
                    <li className="nav-item" data-bs-toggle="tooltip" data-bs-placement="top" title="Groups">
                        <a className={`nav-link ${activeTab === 'groups' ? 'active' : ''}`}
                           onClick={() => handleTabClick('groups')}
                           id="pills-groups-tab" data-bs-toggle="pill" href="#pills-groups" role="tab">
                            <i className="ri-group-line"></i>
                        </a>
                    </li>
                    <li className="nav-item" data-bs-toggle="tooltip" data-bs-placement="top" title="Contacts">
                        <a className={`nav-link ${activeTab === 'contacts' ? 'active' : ''}`}
                           onClick={() => handleTabClick('contacts')}
                           id="pills-contacts-tab" data-bs-toggle="pill" href="#pills-contacts" role="tab">
                            <i className="ri-contacts-line"></i>
                        </a>
                    </li>
                    <li className="nav-item" data-bs-toggle="tooltip" data-bs-placement="top" title="Settings">
                        <a className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                           onClick={() => handleTabClick('settings')}
                           id="pills-setting-tab" data-bs-toggle="pill" href="#pills-setting" role="tab">
                            <i className="ri-settings-2-line"></i>
                        </a>
                    </li>
                    <li className="nav-item dropdown profile-user-dropdown d-inline-block d-lg-none">
                        <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <img src="assets/images/users/avatar-1.jpg" alt="" className="profile-user rounded-circle" />
                        </a>
                        <div className="dropdown-menu">
                            <a className="dropdown-item" href="#">Profile <i className="ri-profile-line float-end text-muted"></i></a>
                            <a className="dropdown-item" href="#">Setting <i className="ri-settings-3-line float-end text-muted"></i></a>
                            <div className="dropdown-divider"></div>
                            <a className="dropdown-item" href="#" onClick={handleLogout}>Log out <i className="ri-logout-circle-r-line float-end text-muted"></i></a>
                        </div>
                    </li>
                </ul>
            </div>
            {/* end side-menu nav */}

            <div className="flex-lg-column d-none d-lg-block">
                <ul className="nav side-menu-nav justify-content-center">
                    <li className="nav-item">
                        <a className="nav-link light-dark-mode" href="#" onClick={handleThemeToggle} data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-placement="right" title="Dark / Light Mode">
                            <i className={`theme-mode-icon ${theme === 'light' ? 'ri-sun-line' : 'ri-moon-line'}`}></i>
                        </a>
                    </li>

                    <li className="nav-item btn-group dropup profile-user-dropdown">
                        <a className="nav-link " href="#" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <img src="assets/images/users/avatar-1.jpg" alt="" className="profile-user rounded-circle" />
                        </a>
                        <div className="dropdown-menu">
                            <a className="dropdown-item" href="#">Profile <i className="ri-profile-line float-end text-muted"></i></a>
                            <a className="dropdown-item" href="#">Setting <i className="ri-settings-3-line float-end text-muted"></i></a>
                            <div className="dropdown-divider"></div>
                            <a className="dropdown-item" href="#" onClick={handleLogout}>Log out <i className="ri-logout-circle-r-line float-end text-muted"></i></a>
                        </div>
                    </li>
                </ul>
            </div>
            {/* Side menu user */}
        </div>
        );
    }
    
    export default SideMenu;