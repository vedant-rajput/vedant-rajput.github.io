import "./styles/About.css";

const About = () => {
  return (
    <div className="about-section" id="about">
      <div className="about-me">
        <h3 className="title">About Me</h3>
        <p className="para">
          I'm a Data Science &amp; Analytics Master's student at EPITA in Paris,
          where research questions turn into systems that actually ship. That path
          runs from published deep learning research on MRI brain tumour
          classification to end-to-end ML pipelines built with Python, TensorFlow
          and AWS — and lately to RAG architectures, LLMs and NLP. I'm looking for
          a 6-month AI &amp; Machine Learning internship starting July 2026, to
          point research-driven analysis at production-scale problems.
        </p>
      </div>
    </div>
  );
};

export default About;
