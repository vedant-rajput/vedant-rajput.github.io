import { FaGithub, FaLinkedinIn, FaEnvelope } from "react-icons/fa6";
import "./styles/SocialIcons.css";
import { TbNotes } from "react-icons/tb";
import { useEffect, useRef } from "react";
import HoverLinks from "./HoverLinks";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, RESUME_PATH } from "../data/constants";

const SocialIcons = () => {
  const socialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const social = socialRef.current;
    if (!social) return;

    const cleanups: (() => void)[] = [];

    social.querySelectorAll("span").forEach((elem) => {
      const link = elem.querySelector("a");
      if (!link) return;

      const rect = elem.getBoundingClientRect();
      let mouseX = rect.width / 2;
      let mouseY = rect.height / 2;
      let currentX = 0;
      let currentY = 0;
      let frameId: number;

      const updatePosition = () => {
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;

        link.style.setProperty("--siLeft", `${currentX}px`);
        link.style.setProperty("--siTop", `${currentY}px`);

        frameId = requestAnimationFrame(updatePosition);
      };

      const onMouseMove = (e: MouseEvent) => {
        const bounds = elem.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;

        if (x < 40 && x > 10 && y < 40 && y > 5) {
          mouseX = x;
          mouseY = y;
        } else {
          mouseX = bounds.width / 2;
          mouseY = bounds.height / 2;
        }
      };

      document.addEventListener("mousemove", onMouseMove);
      frameId = requestAnimationFrame(updatePosition);

      cleanups.push(() => {
        cancelAnimationFrame(frameId);
        document.removeEventListener("mousemove", onMouseMove);
      });
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return (
    <div className="icons-section">
      <div
        className="social-icons"
        data-cursor="icons"
        id="social"
        ref={socialRef}
      >
        <span>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <FaGithub />
          </a>
        </span>
        <span>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <FaLinkedinIn />
          </a>
        </span>
        <span>
          <a href={`mailto:${EMAIL}`} aria-label="Email">
            <FaEnvelope />
          </a>
        </span>
      </div>
      <a
        className="resume-button"
        href={RESUME_PATH}
        target="_blank"
        rel="noopener noreferrer"
      >
        <HoverLinks text="RESUME" />
        <span>
          <TbNotes />
        </span>
      </a>
    </div>
  );
};

export default SocialIcons;
