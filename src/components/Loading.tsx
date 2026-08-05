import { useEffect, useRef, useState } from "react";
import "./styles/Loading.css";
import { useLoading } from "../context/loadingContext";

import Marquee from "react-fast-marquee";

const Loading = ({ percent }: { percent: number }) => {
  const { setIsLoading } = useLoading();
  const [loaded, setLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);
  const completedRef = useRef(false);

  // Latch on the first time percent hits 100: once the reveal is scheduled,
  // a stray lower write to the loading state must not cancel it, so no
  // cleanup is returned on purpose.
  useEffect(() => {
    if (percent < 100 || completedRef.current) return;
    completedRef.current = true;
    setTimeout(() => setLoaded(true), 600);
    setTimeout(() => setIsLoaded(true), 1600);
  }, [percent]);

  useEffect(() => {
    if (!isLoaded) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    import("./utils/initialFX").then((module) => {
      setClicked(true);
      timer = setTimeout(() => {
        module.initialFX();
        setIsLoading(false);
      }, 900);
    });
    return () => clearTimeout(timer);
  }, [isLoaded, setIsLoading]);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const { currentTarget: target } = e;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty("--mouse-x", `${x}px`);
    target.style.setProperty("--mouse-y", `${y}px`);
  }

  return (
    <>
      <div className="loading-header">
        <a href="/#" className="loader-title" data-cursor="disable">
          VR
        </a>
        <div className={`loaderGame ${clicked && "loader-out"}`}>
          <div className="loaderGame-container">
            <div className="loaderGame-in">
              {[...Array(27)].map((_, index) => (
                <div className="loaderGame-line" key={index}></div>
              ))}
            </div>
            <div className="loaderGame-ball"></div>
          </div>
        </div>
      </div>
      <div className="loading-screen">
        <div className="loading-marquee">
          <Marquee>
            <span> AI &amp; Machine Learning Engineer</span>{" "}
            <span>Data Science &amp; Analytics</span>
            <span> AI &amp; Machine Learning Engineer</span>{" "}
            <span>Data Science &amp; Analytics</span>
          </Marquee>
        </div>
        <div
          className={`loading-wrap ${clicked && "loading-clicked"}`}
          onMouseMove={(e) => handleMouseMove(e)}
        >
          <div className="loading-hover"></div>
          <div className={`loading-button ${loaded && "loading-complete"}`}>
            <div className="loading-container">
              <div className="loading-content">
                <div className="loading-content-in">
                  Loading <span>{percent}%</span>
                </div>
              </div>
              <div className="loading-box"></div>
            </div>
            <div className="loading-content2">
              <span>Welcome</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loading;
