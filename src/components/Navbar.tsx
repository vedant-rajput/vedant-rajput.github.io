import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MdOutlineMail } from "react-icons/md";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { setSmoother, getSmoother } from "../lib/smoother";
import { EMAIL } from "../data/constants";
import "./styles/Navbar.css";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);

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
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: reduceMotion ? 0 : 1.7,
      speed: reduceMotion ? 1 : 1.7,
      effects: true,
      autoResize: true,
      ignoreMobileResize: true,
    });
    setSmoother(smoother);

    smoother.scrollTop(0);
    smoother.paused(true);

    const onLinkClick = (e: Event) => {
      if (window.innerWidth > 1024) {
        e.preventDefault();
        const elem = e.currentTarget as HTMLAnchorElement;
        const section = elem.getAttribute("data-href");
        getSmoother()?.scrollTo(section, true, "top top");
      }
    };
    const links = document.querySelectorAll<HTMLAnchorElement>(".header ul a");
    links.forEach((link) => link.addEventListener("click", onLinkClick));

    const onResize = () => ScrollSmoother.refresh(true);
    window.addEventListener("resize", onResize);

    return () => {
      links.forEach((link) => link.removeEventListener("click", onLinkClick));
      window.removeEventListener("resize", onResize);
      smoother.kill();
      setSmoother(null);
    };
  }, []);

  return (
    <>
      <div className="header">
        <a href="/#" className="navbar-title glass-pill" data-cursor="disable">
          VR
        </a>
        <a
          href={`mailto:${EMAIL}`}
          className="navbar-connect glass-pill glass-pill-accent"
          data-cursor="disable"
        >
          <MdOutlineMail />
          {EMAIL}
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
