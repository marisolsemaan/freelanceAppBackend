import { useNavigate } from "react-router-dom";
import { useState } from "react";

import {timeAgo, getInitials, formatPrice,} from "../../utils/format";
import "../../style/jobCard.css";

export default function JobCard({job, cities, professions,})
{
  console.log("cities:", cities);
console.log("professions:", professions);
console.log("job:", job);
  const city = cities.find(
    (item) =>
      Number(item.city_Id) === Number(job.cityId)
  );

  const profession = professions.find(
    (item) =>
      Number(item.profession_Id) === Number(job.professionId)
  );

  const hasPrice =Number(job.price) > 0;
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleConnect = () => {
    navigate(`/worker/conversations/${job.id}`, {
      state: {
        jobTitle: job.title,
        clientName: job.clientName,
        clientId: job.clientId,
      },
    });
  };

  const handleClientProfile = () => {
    navigate(`/worker/clients/${job.clientId}`);
  };

  return (
    <div className="col-12 col-md-6 col-xl-4">
      <div className="job-card h-100">

        <div className="job-card-header">
          <div className="job-icon">
            <i className="bi bi-briefcase" />
          </div>

          <div className="job-title-section">
            <h5 className="job-card-title">
              {job.title}
            </h5>

            <span className="job-client-info">
              Posted by {job.clientName}
            </span>
          </div>

          {hasPrice && (
          <div className="job-price-section">
                <span className="job-price">
                  {formatPrice(job.price)}
                </span>
              
                <span className="job-budget-type">
                  {job.budgetType}
                </span>
          </div>
          )}
            
        </div>

          <div className="job-tags-row">
      
            {profession && (
              <span className="job-tag job-tag-profession">
                <i className="bi bi-tag" />
                {profession.profession_Title}
              </span>
            )}
          

          
            {city && ( <span className="job-tag job-tag-city"> <i className="bi bi-geo-alt" />{city.city_Name}</span> )}
        

          <span className="job-time">
            <i className="bi bi-clock" />
            {timeAgo(job.createdAt)}
          </span>

        </div>

       <div className={`job-card-desc ${expanded ? "expanded" : ""}`}>
        <p>
          {job.description}
        </p>

        {job.description?.length > 150 && (
          <button
            type="button"
            className="view-more-btn"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "View less" : "View more"}
          </button>
        )}
        </div>

        <div className="job-card-footer">
          <div className="job-client">
            <div className="avatar-initials">
              {getInitials(job.clientName)}
            </div>

            <div>
              <span className="job-client-name">
                {job.clientName}
              </span>

              {Number(job.clientRating ?? 0) > 0 && (
                <span className="job-rating">
                  <i className="bi bi-star-fill" />
                  {Number(job.clientRating).toFixed(1)}
                </span>
              )}

              <button type="button" className="preview-client-btn  " onClick={handleClientProfile}>
                Preview Client
              </button>
            </div>
          </div>

          <button
            type="button"
            className="btn job-connect-btn"
            onClick={handleConnect}
          >
            <i className="bi bi-chat-square-text" />
            Connect 
          </button>
        </div>

      


      </div>
    </div>
  );
}