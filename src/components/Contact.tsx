import { MdArrowOutward, MdCopyright } from "react-icons/md";
import "./styles/Contact.css";
import {
  EMAIL,
  PHONE,
  PHONE_HREF,
  GITHUB_URL,
  LINKEDIN_URL,
  RESUME_PATH,
} from "../data/constants";

const Contact = () => {
  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h3>Contact</h3>
        <div className="contact-flex">
          <div className="contact-box">
            <h4>Email</h4>
            <p>
              <a href={`mailto:${EMAIL}`} data-cursor="disable">
                {EMAIL}
              </a>
            </p>
            <h4>Phone</h4>
            <p>
              <a href={PHONE_HREF} data-cursor="disable">
                {PHONE}
              </a>
            </p>
            <h4>Location</h4>
            <p>Paris, France</p>
            <h4>Education</h4>
            <p>MSc Data Science &amp; Analytics, EPITA</p>
          </div>
          <div className="contact-box">
            <h4>Social</h4>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              Github <MdArrowOutward />
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              Linkedin <MdArrowOutward />
            </a>
            <a
              href={RESUME_PATH}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              Résumé <MdArrowOutward />
            </a>
          </div>
          <div className="contact-box">
            <h2>
              Designed and Developed <br /> by <span>Vedant Rajput</span>
            </h2>
            <h5>
              <MdCopyright /> 2026
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
