import { useState, useCallback } from "react";
import "./styles/Work.css";
import WorkImage from "./WorkImage";
import { MdArrowBack, MdArrowForward } from "react-icons/md";

const projects = [
  {
    title: "NASA's Helio-Forecast",
    category: "Geomagnetic Storm Prediction via Deep Learning",
    tools: "TensorFlow, Keras, Bidirectional LSTM, Custom ETL",
    image: "/images/nasa-helio-forecast.webp",
    link: "https://github.com/vedant-rajput/NASA-s-Helio-Forecast-Geomagnetic-Storm-Prediction-via-Deep-Learning-on-Solar-Wind-Telemetry",
  },
  {
    title: "European AI Regulatory Compliance Engine",
    category: "Multi-Agent RAG",
    tools: "Qdrant, Gemini, BM25 + RRF, FastMCP, DuckDuckGo",
    image: "/images/eu-ai-compliance-rag.webp",
    link: "https://github.com/vedant-rajput/European-AI-Regulatory-Compliance-Engine-Multi-Agent-RAG",
  },
  {
    title: "End-to-End MLOps Pipeline",
    category: "Taxi Fare Prediction",
    tools: "Airflow 3, MLflow, FastAPI, Docker, Great Expectations",
    image: "/images/mlops-taxi-fare.webp",
    link: "https://github.com/vedant-rajput/taxi-fair-prediction",
  },
  {
    title: "MRI Brain Tumor Classification",
    category: "Published Research — Hybrid VGG16-NADE Model",
    tools: "VGG16, NADE, Transfer Learning, Keras, Cross-Validation",
    image: "/images/mri-brain-tumor.webp",
    link: "https://github.com/vedant-rajput/MRI-Brain-Tumor-Classification-using-Hybrid-VGG16-NADE-Model",
  },
];

const Work = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentIndex(index);
      setTimeout(() => setIsAnimating(false), 500);
    },
    [isAnimating]
  );

  const goToPrev = useCallback(() => {
    const newIndex =
      currentIndex === 0 ? projects.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, goToSlide]);

  const goToNext = useCallback(() => {
    const newIndex =
      currentIndex === projects.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  }, [currentIndex, goToSlide]);

  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>

        <div className="carousel-wrapper">
          {/* Navigation Arrows */}
          <button
            className="carousel-arrow carousel-arrow-left"
            onClick={goToPrev}
            aria-label="Previous project"
            data-cursor="disable"
          >
            <MdArrowBack />
          </button>
          <button
            className="carousel-arrow carousel-arrow-right"
            onClick={goToNext}
            aria-label="Next project"
            data-cursor="disable"
          >
            <MdArrowForward />
          </button>

          {/* Slides */}
          <div className="carousel-track-container">
            <div
              className="carousel-track"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {projects.map((project, index) => (
                <div className="carousel-slide" key={index}>
                  <div className="carousel-content">
                    <div className="carousel-info">
                      <div className="carousel-number">
                        <h3>0{index + 1}</h3>
                      </div>
                      <div className="carousel-details">
                        <h4>{project.title}</h4>
                        <p className="carousel-category">
                          {project.category}
                        </p>
                        <div className="carousel-tools">
                          <span className="tools-label">Tools & Features</span>
                          <p>{project.tools}</p>
                        </div>
                      </div>
                    </div>
                    <div className="carousel-image-wrapper">
                      <WorkImage
                        image={project.image}
                        alt={project.title}
                        link={project.link}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dot Indicators */}
          <div className="carousel-dots">
            {projects.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentIndex ? "carousel-dot-active" : ""
                  }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to project ${index + 1}`}
                data-cursor="disable"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Work;
