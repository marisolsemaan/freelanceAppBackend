import { useEffect, useRef, useState } from "react";
import "../style/multiSelect.css";

function MultiSelect({
  options,
  selectedValues,
  onChange,
  getLabel,
  getValue,
  placeholder,
  addButtonText,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const multiSelectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        multiSelectRef.current &&
        !multiSelectRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOptions = options.filter((option) =>
    getLabel(option)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const toggleOption = (value) => {
    if (selectedValues.includes(value)) {
      onChange(
        selectedValues.filter(
          (selectedValue) => selectedValue !== value
        )
      );
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const removeOption = (value) => {
    onChange(
      selectedValues.filter(
        (selectedValue) => selectedValue !== value
      )
    );
  };

  const selectedOptions = options.filter((option) =>
    selectedValues.includes(getValue(option))
  );

  return (
    <div className="multi-select" ref={multiSelectRef}>
      {/* SELECTED ITEMS */}

      <div className="selected-items">
        {selectedOptions.map((option) => (
          <span
            className="selected-item"
            key={getValue(option)}
          >
            {getLabel(option)}

            <button
              type="button"
              onClick={() =>
                removeOption(getValue(option))
              }
              aria-label={`Remove ${getLabel(option)}`}
            >
              <i className="bi bi-x"></i>
            </button>
          </span>
        ))}

        <button
          type="button"
          className="add-selection-button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <i className="bi bi-plus-lg"></i>
          {addButtonText}
        </button>
      </div>

      {/* DROPDOWN */}

      {isOpen && (
        <div className="multi-select-dropdown">

          <div className="multi-select-search">
            <i className="bi bi-search"></i>

            <input
              type="text"
              placeholder={placeholder}
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              autoFocus
            />
          </div>

          <div className="multi-select-options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const value = getValue(option);
                const isSelected =
                  selectedValues.includes(value);

                return (
                  <button
                    type="button"
                    className={`multi-select-option ${
                      isSelected ? "selected" : ""
                    }`}
                    key={value}
                    onClick={() => toggleOption(value)}
                  >
                    <span className="option-checkbox">
                      {isSelected && (
                        <i className="bi bi-check-lg"></i>
                      )}
                    </span>

                    {getLabel(option)}
                  </button>
                );
              })
            ) : (
              <p className="no-options">
                No results found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiSelect;