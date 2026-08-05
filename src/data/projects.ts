export interface Project {
  title: string;
  category: string;
  tools: string;
  image: string;
  link: string;
}

export const projects: Project[] = [
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
