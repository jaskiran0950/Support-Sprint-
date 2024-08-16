import React from "react";
import useLoadScripts from "../pages/hooks/useLoadScripts";
import toast from "react-hot-toast";
import { useState } from "react";

const scripts = [
  "/assets/vendor/bootstrap/js/bootstrap.bundle.min.js",
  "/assets/vendor/php-email-form/validate.js",
  "/assets/vendor/aos/aos.js",
  "/assets/vendor/swiper/swiper-bundle.min.js",
  "/assets/vendor/waypoints/noframework.waypoints.js",
  "/assets/vendor/imagesloaded/imagesloaded.pkgd.min.js",
  "/assets/vendor/isotope-layout/isotope.pkgd.min.js",
  "/assets/js/main.js",
];

export default function Landing() {
  useLoadScripts(scripts);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    organization: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.email) errors.email = "Email is required";
    if (!formData.phone) errors.phone = "Phone number is required";
    if (!formData.address) errors.address = "Address is required";
    if (!formData.organization)
      errors.organization = "Organization is required";
    if (!formData.message) errors.message = "Message is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch("/api/contact-us", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log("Form submitted successfully");
        toast.success("Your message has been sent. Thank you!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          organization: "",
          message: "",
        });
        setErrors({});
      } else {
        const errorData = await response.json();
        if (
          errorData.error === "Contact request already sent from this email."
        ) {
          toast.error("Contact request already sent from this email.");
        } else {
          console.error("Failed to submit form");
          toast.error("Failed to submit form");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting form");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  return (
    <>
      <main className="main-landing">
        <header
          id="header"
          className="header d-flex align-items-center fixed-top"
        >
          <div className="container-fluid container-xl position-relative d-flex align-items-center">
            <a href="#home" className="logo d-flex align-items-center me-auto">
              {/* <!-- Uncomment the line below if you also wish to use an image logo --> */}
              {/* <!-- <img src="assets/img/logo.png" alt="" width="100" height="100"> --> */}
              <img src="\assets\images\logo1.JPG" alt="logo" width="180"></img>
            </a>

            <nav id="navmenu" className="navmenu">
              <ul>
                <li>
                  <a href="#home" className="">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#about">About</a>
                </li>
                <li>
                  <a href="#services">Features</a>
                </li>
                <li>
                  <a href="#contact">Contact</a>
                </li>
              </ul>
              <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
            </nav>

            <a className="btn-getstarted" href="/login">
              Sign In
            </a>
          </div>
        </header>

        <section id="home" className="hero section">
          <div className="container">
            <div className="row gy-4">
              <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center">
                <h1 className="">Better Solutions For Tech Support</h1>
                <p className="">
                  We are team of talented designers making websites with
                  Bootstrap
                </p>
                <div className="d-flex">
                  <a className="btn-get-started" href="/login">
                    Sign In
                  </a>
                  {/* <a href="https://www.youtube.com/watch?v=LXb3EKWsInQ" className="glightbox btn-watch-video d-flex align-items-center"><i className="bi bi-play-circle"></i><span>Watch Video</span></a> */}
                </div>
              </div>
              <div className="col-lg-6 order-1 order-lg-2 hero-img">
                <img
                  src="assets/img/hero-img.png"
                  className="img-fluid animated"
                  alt=""
                />
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="about section">
          <div className="container section-title">
            <h2>About Us</h2>
          </div>

          <div className="container">
            <div className="row gy-4">
              <div className="col-lg-6 content" data-aos-delay="100">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <ul>
                  <li>
                    <i className="bi bi-check2-circle"></i>{" "}
                    <span>
                      Ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </span>
                  </li>
                  <li>
                    <i className="bi bi-check2-circle"></i>{" "}
                    <span>
                      Duis aute irure dolor in reprehenderit in voluptate velit.
                    </span>
                  </li>
                  <li>
                    <i className="bi bi-check2-circle"></i>{" "}
                    <span>Ullamco laboris nisi ut aliquip ex ea commodo</span>
                  </li>
                </ul>
              </div>

              <div className="col-lg-6" data-aos-delay="200">
                <p>
                  Ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis
                  aute irure dolor in reprehenderit in voluptate velit esse
                  cillum dolore eu fugiat nulla pariatur. Excepteur sint
                  occaecat cupidatat non proident, sunt in culpa qui officia
                  deserunt mollit anim id est laborum.{" "}
                </p>
                <a href="#" className="read-more">
                  <span>Read More</span>
                  <i className="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="services section">
          <div className="container section-title">
            <h2>Features</h2>
            <p>
              Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
              consectetur velit
            </p>
          </div>

          <div className="container">
            <div className="row gy-4">
              <div className="col-xl-3 col-md-6 d-flex" data-aos-delay="100">
                <div className="service-item position-relative">
                  <div className="icon">
                    <i className="bi bi-activity icon"></i>
                  </div>
                  <h4>
                    <a href="service-details.html" className="stretched-link">
                      Lorem Ipsum
                    </a>
                  </h4>
                  <p>
                    Voluptatum deleniti atque corrupti quos dolores et quas
                    molestias excepturi
                  </p>
                </div>
              </div>

              <div className="col-xl-3 col-md-6 d-flex" data-aos-delay="200">
                <div className="service-item position-relative">
                  <div className="icon">
                    <i className="bi bi-bounding-box-circles icon"></i>
                  </div>
                  <h4>
                    <a href="service-details.html" className="stretched-link">
                      Sed ut perspici
                    </a>
                  </h4>
                  <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit
                    esse cillum dolore
                  </p>
                </div>
              </div>

              <div className="col-xl-3 col-md-6 d-flex" data-aos-delay="300">
                <div className="service-item position-relative">
                  <div className="icon">
                    <i className="bi bi-calendar4-week icon"></i>
                  </div>
                  <h4>
                    <a href="service-details.html" className="stretched-link">
                      Magni Dolores
                    </a>
                  </h4>
                  <p>
                    Excepteur sint occaecat cupidatat non proident, sunt in
                    culpa qui officia
                  </p>
                </div>
              </div>

              <div className="col-xl-3 col-md-6 d-flex" data-aos-delay="400">
                <div className="service-item position-relative">
                  <div className="icon">
                    <i className="bi bi-broadcast icon"></i>
                  </div>
                  <h4>
                    <a href="service-details.html" className="stretched-link">
                      Nemo Enim
                    </a>
                  </h4>
                  <p>
                    At vero eos et accusamus et iusto odio dignissimos ducimus
                    qui blanditiis
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="call-to-action" className="call-to-action section">
          <img src="assets/img/cta-bg.jpg" alt="" />

          <div className="container">
            <div className="row" data-aos-delay="100">
              <div className="col-xl-9 text-center text-xl-start">
                <h3>Call To Action</h3>
                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse
                  cillum dolore eu fugiat nulla pariatur. Excepteur sint
                  occaecat cupidatat non proident, sunt in culpa qui officia
                  deserunt mollit anim id est laborum.
                </p>
              </div>
              <div className="col-xl-3 cta-btn-container text-center">
                <a className="cta-btn align-middle" href="#contact">
                  Call To Action
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="contact section">
          <div className="container section-title">
            <h2>Contact</h2>
            <p>
              Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
              consectetur velit
            </p>
          </div>

          <div className="container" data-aos-delay="100">
            <div className="row gy-4">
              <div className="col-lg-5">
                <div className="info-wrap">
                  <div className="info-item d-flex" data-aos-delay="200">
                    <i className="bi bi-geo-alt flex-shrink-0"></i>
                    <div>
                      <h3>Address</h3>
                      <p>A108 Adam Street, New York, NY 535022</p>
                    </div>
                  </div>

                  <div className="info-item d-flex" data-aos-delay="300">
                    <i className="bi bi-telephone flex-shrink-0"></i>
                    <div>
                      <h3>Call Us</h3>
                      <p>+1 5589 55488 55</p>
                    </div>
                  </div>

                  <div className="info-item d-flex" data-aos-delay="400">
                    <i className="bi bi-envelope flex-shrink-0"></i>
                    <div>
                      <h3>Email Us</h3>
                      <p>info@example.com</p>
                    </div>
                  </div>

                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d48389.78314118045!2d-74.006138!3d40.710059!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a22a3bda30d%3A0xb89d1fe6bc499443!2sDowntown%20Conference%20Center!5e0!3m2!1sen!2sus!4v1676961268712!5m2!1sen!2sus"
                    frameborder="0"
                    className="map"
                    allowfullscreen=""
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>

              <div className="col-lg-7">
                <form className="php-email-form" data-aos-delay="200">
                  <div className="row gy-4">
                    <div className="col-md-6">
                      <label htmlFor="name-field" className="pb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        name="name"
                        id="name-field"
                        className="form-control"
                        onChange={handleChange}
                        required
                      />

                      {errors.name && !formData.name && (
                        <span className="validations">
                          Plaese enter valid Name.
                        </span>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="email-field" className="pb-2">
                        Organization Name
                      </label>
                      <input
                        value={formData.organization}
                        type="text"
                        className="form-control"
                        name="organization"
                        id="email-field"
                        required
                        onChange={handleChange}
                      />
                      {errors.organization && !formData.organization && (
                        <span className="validations">
                          Plaese enter valid Organization Name.
                        </span>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="email-field" className="pb-2">
                        Organization Email
                      </label>
                      <input
                        value={formData.email}
                        type="email"
                        className="form-control"
                        name="email"
                        id="email-field"
                        required
                        onChange={handleChange}
                      />
                      {errors.email && !formData.email && (
                        <span className="validations">
                          Plaese enter valid Email.
                        </span>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="phone-field" className="pb-2">
                        Organization Phone Number
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        className="form-control"
                        name="phone"
                        id="email-field"
                        required
                        onChange={handleChange}
                      />
                      {errors.phone && !formData.phone && (
                        <span className="validations">
                          Plaese enter valid Phone Number.
                        </span>
                      )}
                    </div>

                    <div className="col-md-12">
                      <label htmlFor="subject-field" className="pb-2">
                        Organization Address
                      </label>
                      <input
                        value={formData.address}
                        type="text"
                        className="form-control"
                        name="address"
                        id="subject-field"
                        required
                        onChange={handleChange}
                      />
                      {errors.address && !formData.address && (
                        <span className="validations">
                          Plaese enter valid Address.
                        </span>
                      )}
                    </div>

                    <div className="col-md-12">
                      <label htmlFor="message-field" className="pb-2">
                        Message
                      </label>
                      <textarea
                        value={formData.message}
                        className="form-control"
                        name="message"
                        rows="10"
                        id="message-field"
                        required
                        onChange={handleChange}
                      ></textarea>
                      {errors.message && !formData.message && (
                        <span className="validations">
                          Plaese enter valid Message
                        </span>
                      )}
                    </div>

                    <div className="col-md-12 text-center">
                      <div className="loading">Loading</div>
                      <div className="error-message"></div>
                      <div className="sent-message">
                        Your message has been sent. Thank you!
                      </div>

                      <button type="submit" onClick={handleSubmit}>
                        Send Message
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
        <footer id="footer" className="footer">
          <div className="footer-newsletter">
            <div className="container">
              <div className="row justify-content-center text-center">
                <div className="col-lg-6">
                  <h4>Join Our Newsletter</h4>
                  <p>
                    Subscribe to our newsletter and receive the latest news
                    about our products and services!
                  </p>
                  <form
                    action="forms/newsletter.php"
                    method="post"
                    className="php-email-form"
                  >
                    <div className="newsletter-form">
                      <input type="email" name="email" />
                      <input type="submit" value="Subscribe" />
                    </div>
                    <div className="loading">Loading</div>
                    <div className="error-message"></div>
                    <div className="sent-message">
                      Your subscription request has been sent. Thank you!
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div className="container footer-top">
            <div className="row gy-4">
              <div className="col-lg-4 col-md-6 footer-about">
                <a href="index.html" className="d-flex align-items-center">
                  <span className="sitename">Arsha</span>
                </a>
                <div className="footer-contact pt-3">
                  <p>A108 Adam Street</p>
                  <p>New York, NY 535022</p>
                  <p className="mt-3">
                    <strong>Phone:</strong> <span>+1 5589 55488 55</span>
                  </p>
                  <p>
                    <strong>Email:</strong> <span>info@example.com</span>
                  </p>
                </div>
              </div>

              <div className="col-lg-2 col-md-3 footer-links">
                <h4>Useful Links</h4>
                <ul>
                  <li>
                    <i className="bi bi-chevron-right"></i> <a href="#">Home</a>
                  </li>
                  <li>
                    <i className="bi bi-chevron-right"></i>{" "}
                    <a href="#">About us</a>
                  </li>
                  <li>
                    <i className="bi bi-chevron-right"></i>{" "}
                    <a href="#">Services</a>
                  </li>
                  <li>
                    <i className="bi bi-chevron-right"></i>{" "}
                    <a href="#">Terms of service</a>
                  </li>
                </ul>
              </div>

              <div className="col-lg-2 col-md-3 footer-links">
                <h4>Our Services</h4>
                <ul>
                  <li>
                    <i className="bi bi-chevron-right"></i>{" "}
                    <a href="#">Web Design</a>
                  </li>
                  <li>
                    <i className="bi bi-chevron-right"></i>{" "}
                    <a href="#">Web Development</a>
                  </li>
                  <li>
                    <i className="bi bi-chevron-right"></i>{" "}
                    <a href="#">Product Management</a>
                  </li>
                  <li>
                    <i className="bi bi-chevron-right"></i>{" "}
                    <a href="#">Marketing</a>
                  </li>
                </ul>
              </div>

              <div className="col-lg-4 col-md-12">
                <h4>Follow Us</h4>
                <p>
                  Cras fermentum odio eu feugiat lide par naso tierra videa
                  magna derita valies
                </p>
                <div className="social-links d-flex">
                  <a href="">
                    <i className="bi bi-twitter"></i>
                  </a>
                  <a href="">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href="">
                    <i className="bi bi-instagram"></i>
                  </a>
                  <a href="">
                    <i className="bi bi-linkedin"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="container copyright text-center mt-4">
            <p>
              © <span>Copyright</span>{" "}
              <strong className="px-1 sitename">Arsha</strong>{" "}
              <span>All Rights Reserved</span>
            </p>
            <div className="credits">
              Designed by <a href="https://bootstrapmade.com/">BootstrapMade</a>
            </div>
          </div>
        </footer>
      </main>

      <a
        href="#"
        id="scroll-top"
        className="scroll-top d-flex align-items-center justify-content-center"
      >
        <i className="bi bi-arrow-up-short"></i>
      </a>
    </>
  );
}
