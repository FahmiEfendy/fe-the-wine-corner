import { Link } from 'react-router-dom';

import { InstagramIcon } from './Icons';

import '../styles/Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div>
                        <h3 className="footer-logo">THE WINE CORNER</h3>
                        <p className="footer-text">
                            Your premium destination for the world's finest wines. Hand-selected for quality and character.
                        </p>
                    </div>
                    <div>
                        <h4 className="footer-heading">Discover</h4>
                        <ul className="footer-links">
                            <li><Link to="/red-wine">Red Wines</Link></li>
                            <li>White Wines</li>
                            <li>Soju</li>
                            <li>Whisky</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="footer-heading">Our Social Media</h4>
                        <ul className="footer-links">
                            <li>
                                <a href="https://www.instagram.com/thewinecorner.id/" target="_blank" rel="noopener noreferrer" className="footer-social-link">
                                    <InstagramIcon size={18} /> @thewinecorner.id
                                </a>
                            </li>
                        </ul>

                        <h4 className="footer-heading" style={{ marginTop: '20px' }}>Our Store</h4>
                        <ul className="footer-links">
                            <li>
                                <a href="https://www.google.com/maps/place/The+Wine+Corner/@-6.2643896,106.783088,15z/data=!4m5!3m4!1s0x0:0x5cde2091b0d7ada3!8m2!3d-6.2643735!4d106.7830896" target="_blank" rel="noopener noreferrer">
                                    PIM 2 Lt. LG North Atrium No. 3<br />
                                    Jakarta Selatan - 12310 <br />
                                    (Near Celebrity Fitness)
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="footer-heading">Contact Us</h4>
                        <ul className="footer-links">
                            <li>
                                <a href="tel:08991890269">
                                    628991890269
                                </a>
                            </li>
                        </ul>

                        <h4 className="footer-heading" style={{ marginTop: '20px' }}>Whatsapp</h4>
                        <ul className="footer-links">
                            <li>
                                <a href="http://wa.me/6288991890269" target="_blank" rel="noopener noreferrer">
                                    6288991890269
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    © 2026 THE WINE CORNER. ALL RIGHTS RESERVED.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
