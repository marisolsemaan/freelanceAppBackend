import { useMemo, useState } from "react";

import JobFilters from "../../components/worker/JobFilters";
import { DEMO_JOBS } from "../../constants/demoJobs";
import Navbar from "../../components/layout/Navbar";
import JobCard from "../../components/worker/JobCard";

import "../../style/SearchJobs.css";

export default function SearchJobs() {
  const [filters, setFilters] = useState({});
  const [searchText, setSearchText] = useState("");

  // Temporary data.
  // Later this will come from getJobPosts().
  const jobs = DEMO_JOBS;

  const visibleJobs = useMemo(() => {
    let filteredJobs = [...jobs];

    if (filters.cityId) {
      filteredJobs = filteredJobs.filter(
        (job) =>
          Number(job.cityId) === Number(filters.cityId)
      );
    }

    if (filters.professionId) {
      filteredJobs = filteredJobs.filter(
        (job) =>
          Number(job.professionId) ===
          Number(filters.professionId)
      );
    }

    if (filters.budgetType) {
      filteredJobs = filteredJobs.filter(
        (job) =>
          Number(job.budgetType) ===
          Number(filters.budgetType)
      );
    }

    if (filters.maxPrice) {
      filteredJobs = filteredJobs.filter(
        (job) =>
          Number(job.price) <=
          Number(filters.maxPrice)
      );
    }

    if (searchText.trim()) {
      const term = searchText.trim().toLowerCase();

      filteredJobs = filteredJobs.filter((job) => {
        const title = job.title?.toLowerCase() ?? "";
        const description = job.description?.toLowerCase() ?? "";

        return (
          title.includes(term) ||
          description.includes(term)
        );
      });
    }

    return filteredJobs;
  }, [jobs, filters, searchText]);

  return (
    <>
      <Navbar />

      <main className="search-jobs-page">
        <div className="container-xl py-4 py-md-5">

          <div className="search-page-header">

            <div>

              <h1 className="page-title">
                Find Local Jobs
              </h1>

              <p className="page-subtitle">
                Browse available jobs and connect directly with clients across Lebanon.
              </p>
            </div>

         

          </div>

          <JobFilters
            onApply={setFilters}
            onSearchChange={setSearchText}
          />

          {visibleJobs.length === 0 ? (
            <div className="empty-jobs">
              <div className="empty-jobs-icon">
                <i className="bi bi-search" />
              </div>

              <h5>No jobs found</h5>

              <p>
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="row g-4">
              {visibleJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                />
              ))}
            </div>
          )}

        </div>
      </main>
    </>
  );
}