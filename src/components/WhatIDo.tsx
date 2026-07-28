import { useEffect, useRef } from "react";
import "./styles/WhatIDo.css";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const WhatIDo = () => {
  const containerRef = useRef<(HTMLDivElement | null)[]>([]);
  const setRef = (el: HTMLDivElement | null, index: number) => {
    containerRef.current[index] = el;
  };
  useEffect(() => {
    if (ScrollTrigger.isTouch) {
      containerRef.current.forEach((container) => {
        if (container) {
          container.classList.remove("what-noTouch");
          container.addEventListener("click", () => handleClick(container));
        }
      });
    }
    return () => {
      containerRef.current.forEach((container) => {
        if (container) {
          container.removeEventListener("click", () => handleClick(container));
        }
      });
    };
  }, []);
  return (
    <div className="whatIDO">
      <div className="what-box">
        <h2 className="title">
          W<span className="hat-h2">HAT</span>
          <div>
            I<span className="do-h2"> DO</span>
          </div>
        </h2>
      </div>
      <div className="what-box">
        <div className="what-box-in">
          <div className="what-border2">
            <svg width="100%">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
              <line
                x1="100%"
                y1="0"
                x2="100%"
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
            </svg>
          </div>
          <div
            className="what-content what-noTouch"
            ref={(el) => setRef(el, 0)}
          >
            <div className="what-border1">
              <svg height="100%">
                <line
                  x1="0"
                  y1="0"
                  x2="100%"
                  y2="0"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
                <line
                  x1="0"
                  y1="100%"
                  x2="100%"
                  y2="100%"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
              </svg>
            </div>
            <div className="what-corner"></div>

            <div className="what-content-in">
              <h3>MACHINE LEARNING</h3>
              <h4>Research to Trained Models</h4>
              <p>
                Deep learning architectures measured against real baselines —
                CNNs that read MRI scans, Bi-LSTMs that forecast space weather.
              </p>
              <h5>Skillset & tools</h5>
              <div className="what-content-flex">
                <div className="what-tags">Python</div>
                <div className="what-tags">TensorFlow</div>
                <div className="what-tags">Keras</div>
                <div className="what-tags">PyTorch</div>
                <div className="what-tags">Scikit-Learn</div>
                <div className="what-tags">CNN</div>
                <div className="what-tags">LSTM</div>
                <div className="what-tags">Computer Vision</div>
                <div className="what-tags">NumPy</div>
                <div className="what-tags">Pandas</div>
                <div className="what-tags">Matplotlib</div>
                <div className="what-tags">Seaborn</div>
                <div className="what-tags">Streamlit</div>
                <div className="what-tags">SQL</div>
                <div className="what-tags">PostgreSQL</div>
              </div>
              <div className="what-arrow"></div>
            </div>
          </div>
          <div
            className="what-content what-noTouch"
            ref={(el) => setRef(el, 1)}
          >
            <div className="what-border1">
              <svg height="100%">
                <line
                  x1="0"
                  y1="100%"
                  x2="100%"
                  y2="100%"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
              </svg>
            </div>
            <div className="what-corner"></div>
            <div className="what-content-in">
              <h3>AI ENGINEERING</h3>
              <h4>Systems That Stay Honest</h4>
              <p>
                RAG retrieval, multi-agent pipelines, and the MLOps scaffolding
                that keeps models trustworthy in production.
              </p>
              <h5>Skillset & tools</h5>
              <div className="what-content-flex">
                <div className="what-tags">RAG</div>
                <div className="what-tags">LLMs</div>
                <div className="what-tags">Vector Embedding</div>
                <div className="what-tags">Hugging Face</div>
                <div className="what-tags">Claude</div>
                <div className="what-tags">Gemini</div>
                <div className="what-tags">n8n</div>
                <div className="what-tags">Airflow 3</div>
                <div className="what-tags">MLflow</div>
                <div className="what-tags">Great Expectations</div>
                <div className="what-tags">FastAPI</div>
                <div className="what-tags">Docker</div>
                <div className="what-tags">AWS</div>
                <div className="what-tags">Git</div>
                <div className="what-tags">GitHub Actions</div>
              </div>
              <div className="what-arrow"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIDo;

function handleClick(container: HTMLDivElement) {
  container.classList.toggle("what-content-active");
  container.classList.remove("what-sibling");
  if (container.parentElement) {
    const siblings = Array.from(container.parentElement.children);

    siblings.forEach((sibling) => {
      if (sibling !== container) {
        sibling.classList.remove("what-content-active");
        sibling.classList.toggle("what-sibling");
      }
    });
  }
}
