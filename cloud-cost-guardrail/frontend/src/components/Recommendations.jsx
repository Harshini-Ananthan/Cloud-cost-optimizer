import React from 'react';
import { Lightbulb, ChevronRight } from 'lucide-react';

const Recommendations = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="recommendations-container empty">
        <h3>Optimization Recommendations</h3>
        <p>No active recommendations at the moment. Your cloud is optimized!</p>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <div className="section-header">
        <Lightbulb color="#10b981" size={24} />
        <h3>Optimization Recommendations</h3>
      </div>
      
      <div className="rec-list">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="rec-card">
            <div className="rec-header">
              <span className="rec-root-cause">{rec.root_cause}</span>
              <span className="rec-savings">Save ~${rec.estimated_savings.toFixed(2)}</span>
            </div>
            <p className="rec-issue">{rec.detected_issue} on {rec.date.split(' ')[0]}</p>
            <p className="rec-text">{rec.recommendation}</p>
            <button className="rec-action">
              Apply Fix <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
