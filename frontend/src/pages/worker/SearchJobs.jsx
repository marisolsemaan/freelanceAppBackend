import { useEffect, useMemo, useState } from "react";

import JobFilters from "../../components/worker/JobFilters";
import Navbar from "../../components/layout/Navbar";
import JobCard from "../../components/worker/JobCard";
import { getJobPosts } from "../../services/jobPostWorkerService"; 
import { getCities, getProfessions,} from "../../services/jobPostClientService";

import "../../style/SearchJobs.css";

export default function SearchJobs() {
  const [cities, setCities] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [filters, setFilters] = useState({});
  const [searchText, setSearchText] = useState("");

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchLookups = async () => {
    try {
      const [citiesResponse, professionsResponse] =
        await Promise.all([
          getCities(),
          getProfessions(),
        ]);

      setCities(citiesResponse.data ?? citiesResponse);
      setProfessions(
        professionsResponse.data ?? professionsResponse
      );
    } catch (err) {
      console.error(
        "Failed to load lookup data:",
        err
      );
    }
  };

  fetchLookups();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchJobs = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getJobPosts(filters);

        if (!cancelled) {
          setJobs(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchJobs();

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const visibleJobs = useMemo(() => {
    if (!searchText.trim()) {
      return jobs;
    }

    const term = searchText.trim().toLowerCase();

    return jobs.filter((job) => {
      const title = job.title?.toLowerCase() ?? "";
      const description = job.description?.toLowerCase() ?? "";

      return title.includes(term) || description.includes(term);
    });
  }, [jobs, searchText]);

  return (
    <>
      <Navbar />

      <main className="search-jobs-page">
        <div className="container-xl py-4 py-md-5">

          <div className="search-page-header">
            <div>
              <h1 className="page-title">Find Local Jobs</h1>
              <p className="page-subtitle">
                Browse available jobs and connect directly with clients across Lebanon.
              </p>
            </div>
          </div>

          <JobFilters cities={cities} professions={professions} onApply={setFilters} onSearchChange={setSearchText} />

          {loading ? (
            <div className="empty-jobs">
              <div className="empty-jobs-icon">
                <i className="bi bi-hourglass-split" />
              </div>
              <h5>Loading jobs…</h5>
            </div>
          ) : error ? (
            <div className="empty-jobs">
              <div className="empty-jobs-icon">
                <i className="bi bi-exclamation-triangle" />
              </div>
              <h5>Something went wrong</h5>
              <p>{error}</p>
            </div>
          ) : visibleJobs.length === 0 ? (
            <div className="empty-jobs">
              <div className="empty-jobs-icon">
                <i className="bi bi-search" />
              </div>
              <h5>No jobs found</h5>
              <p>Try changing your search or filters.</p>
            </div>
          ) : (
            <div className="row g-4">
              {visibleJobs.map((job) => (
              <JobCard key={job.id} job={job}  cities={cities} professions={professions}/>
              ))}
            </div>
          )}

        </div>
      </main>
    </>
  );
}