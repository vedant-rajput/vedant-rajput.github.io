import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MdOutlineMail } from "react-icons/md";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import "./styles/Navbar.css";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);
export let smoother: ScrollSmoother;

const navItems = [
  { id: "about", label: "ABOUT" },
  { id: "work", label: "WORK" },
  { id: "contact", label: "CONTACT" },
];

const Navbar = () => {
  const [active, setActive] = useState("");

  // Highlight whichever section is crossing the upper third of the viewport.
  useEffect(() => {
    const onScroll = () => {
      const line = window.innerHeight * 0.35;
      let current = "";
      for (const { id } of navItems) {
        const el = document.getElementById(id);
        if (!el) continue;
        const { top, bottom } = el.getBoundingClientRect();
        if (top <= line && bottom >= line) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.7,
      speed: 1.7,
      effects: true,
      autoResize: true,
      ignoreMobileResize: true,
    });

    smoother.scrollTop(0);
    smoother.paused(true);

    let links = document.querySelectorAll(".header ul a");
    links.forEach((elem) => {
      let element = elem as HTMLAnchorElement;
      element.addEventListener("click", (e) => {
        if (window.innerWidth > 1024) {
          e.preventDefault();
          let elem = e.currentTarget as HTMLAnchorElement;
          let section = elem.getAttribute("data-href");
          smoother.scrollTo(section, true, "top top");
        }
      });
    });
    window.addEventListener("resize", () => {
      ScrollSmoother.refresh(true);
    });
  }, []);
  return (
    <>
      <div className="header">
        <a href="/#" className="navbar-title glass-pill" data-cursor="disable">
          VR
        </a>
        <a
          href="mailto:vedantt.rajput@gmail.com"
          className="navbar-connect glass-pill glass-pill-accent"
          data-cursor="disable"
        >
          <MdOutlineMail />
          vedantt.rajput@gmail.com
        </a>
        <ul>
          {navItems.map(({ id, label }) => (
            <li key={id}>
              <a
                data-href={`#${id}`}
                href={`#${id}`}
                className={`glass-pill${active === id ? " glass-pill-active" : ""}`}
              >
                <HoverLinks text={label} />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
