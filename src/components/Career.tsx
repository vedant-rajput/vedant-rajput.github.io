import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>B.Tech, Computer Science &amp; Engineering</h4>
                <h5>JNTU Hyderabad, India</h5>
              </div>
              <h3>2020</h3>
            </div>
            <p>
              Four years at Jawaharlal Nehru Technological University, where a
              curiosity about data hardened into a discipline. Graduated 2024 —
              recognised as the equivalent of a French Master 1 / Bac+4.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Research Assistant Intern</h4>
                <h5>JNTUH — Faculty-Supervised Research</h5>
              </div>
              <h3>2023</h3>
            </div>
            <p>
              Investigated hybrid deep learning architectures for medical image
              classification, reaching 97% multi-class accuracy on MRI brain
              tumour datasets — 7 points above the VGG16 baseline. Built
              reproducible training and evaluation pipelines with rigorous data
              augmentation, transfer learning and cross-validation, testing the
              hypothesis that generative distribution modelling can sharpen
              discriminative CNN features when clinical data is scarce. The work
              was accepted for peer-reviewed publication.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>AI Engineer Intern</h4>
                <h5>MetaTaaraka AI Innovations</h5>
              </div>
              <h3>2026</h3>
            </div>
            <p>
              A structured AI engineering programme, AICTE-accredited under
              India's Ministry of Education. Designed and trained deep learning
              models across TensorFlow, Keras and PyTorch — supervised and
              unsupervised — tuning regularization, dropout and hyperparameters
              for performance. Delivered 4+ AI engineering projects end to end
              with Scikit-learn, Pandas and NumPy, covering EDA, feature
              engineering, model selection and cross-validation.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>MSc Data Science &amp; Analytics</h4>
                <h5>EPITA, Paris</h5>
              </div>
              <h3>NOW</h3>
            </div>
            <p>
              Now in Paris through March 2027, deepening the theory underneath
              the practice — and building in parallel: geomagnetic storm
              forecasting on NASA telemetry, a multi-agent RAG engine over EU
              regulation, and a production MLOps pipeline. Seeking a 6-month AI
              &amp; Machine Learning internship from July 2026.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
