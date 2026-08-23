import { useState } from "react";
import { CITIES,PROFESSIONS, BUDGET_TYPES,} from "../../constants/prefixedData";

const emptyDraft = {
  cityId: "",
  professionId: "",
  budgetType: "",
  maxPrice: "",
};

export default function JobFilters({
  onApply,
  onSearchChange,
}) {
  const [search, setSearch] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);

  const handleSearch = (e) => {
    const value = e.target.value;

    setSearch(value);
    onSearchChange(value);
  };

  const handleField = (field) => (e) => {
    setDraft((current) => ({
      ...current,
      [field]: e.target.value,
    }));
  };

  const apply = () => {
    onApply({
      cityId: draft.cityId || undefined,
      professionId: draft.professionId || undefined,
      budgetType: draft.budgetType || undefined,
      maxPrice: draft.maxPrice || undefined,
    });

    setShowPanel(false);
  };

  const clear = () => {
    setDraft(emptyDraft);
    onApply({});
  };

  const activeCount = Object.values(draft).filter(Boolean).length;

  return (
    <div className="job-filters mb-4">
      <div className="d-flex gap-2 mb-2">
        <div className="position-relative flex-grow-1">
          <i className="bi bi-search search-icon" />

          <input
            className="form-control search-input rounded-3"
            placeholder="Search jobs, skills, or categories..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        <button
          type="button"
          className={`btn filter-toggle rounded-3 d-flex align-items-center gap-2 ${
            showPanel ? "active" : ""
          }`}
          onClick={() => setShowPanel((value) => !value)}
        >
          <i className="bi bi-sliders" />

          <span className="d-none d-sm-inline">
            Filters
            {activeCount > 0 && ` (${activeCount})`}
          </span>
        </button>
      </div>

      {showPanel && (
        <div className="filter-panel">
          <div className="row g-3">

            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label">
                City
              </label>

              <select
                className="form-select rounded-3"
                value={draft.cityId}
                onChange={handleField("cityId")}
              >
                <option value="">Any city</option>

                {CITIES.map((city) => (
                  <option
                    key={city.id}
                    value={city.id}
                  >
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label">
                Profession
              </label>

              <select
                className="form-select rounded-3"
                value={draft.professionId}
                onChange={handleField("professionId")}
              >
                <option value="">
                  Any profession
                </option>

                {PROFESSIONS.map((profession) => (
                  <option
                    key={profession.id}
                    value={profession.id}
                  >
                    {profession.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label">
                Budget type
              </label>

              <select
                className="form-select rounded-3"
                value={draft.budgetType}
                onChange={handleField("budgetType")}
              >
                <option value="">
                  Any type
                </option>

                {BUDGET_TYPES.map((budget) => (
                  <option
                    key={budget.value}
                    value={budget.value}
                  >
                    {budget.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label">
                Maximum price
              </label>

              <input
                type="number"
                min="1"
                className="form-control rounded-3"
                placeholder="No limit"
                value={draft.maxPrice}
                onChange={handleField("maxPrice")}
              />
            </div>

          </div>

          <div className="filter-actions">
            <button
              type="button"
              className="btn apply-btn rounded-3"
              onClick={apply}
            >
              Apply filters
            </button>

            <button
              type="button"
              className="btn clear-btn rounded-3"
              onClick={clear}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}