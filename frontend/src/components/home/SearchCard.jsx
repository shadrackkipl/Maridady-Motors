import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { makeOptions } from "../../constants";
import { buildMakeGroups, selectionToParam } from "../../constants";
const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

/**
 * Make & model picker built from the cars actually in stock.
 *
 * - `cars` (optional): cars already loaded by the parent. If omitted, the
 *   card loads them from the API itself (use this on the home page).
 * - `showEmptyMakes`: also list makes with no cars, as "0 vehicles".
 * - `applyPath`: if set (e.g. "/car-listing"), Apply opens that page with the
 *   chosen models in the URL (?models=...), which the listing page reads.
 * - `initialSelection`: models to tick when the card first appears.
 * - `onApply(selection, names)`: `selection` is
 *   { [makeKey]: [modelKey, ...] } (normalised keys, used for filtering) and
 *   `names` is { "Toyota": ["RAV4", ...] } with the readable names.
 */
const SearchCard = ({
  cars: carsProp,
  showEmptyMakes = false,
  applyPath,
  initialSelection,
  onApply,
  onClear,
}) => {
  const navigate = useNavigate();
  const [fetchedCars, setFetchedCars] = useState([]);
  const [loading, setLoading] = useState(carsProp === undefined);
  const [loadError, setLoadError] = useState(false);
  const [selectedModels, setSelectedModels] = useState(initialSelection ?? {});
  const [expandedMake, setExpandedMake] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (carsProp !== undefined) return undefined;

    const controller = new AbortController();

    axios
      .get(`${API_URL}/api/cars/`, { signal: controller.signal })
      .then((response) => {
        setFetchedCars(Array.isArray(response.data) ? response.data : []);
      })
      .catch((requestError) => {
        if (axios.isCancel(requestError)) return;
        console.error("Error loading vehicles for search:", requestError);
        setLoadError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [carsProp]);

  const cars = carsProp ?? fetchedCars;

  const groups = useMemo(
    () =>
      buildMakeGroups(cars, makeOptions, { includeEmpty: showEmptyMakes }),
    [cars, showEmptyMakes]
  );

  const toggleMake = (makeKey) => {
    setExpandedMake((current) => (current === makeKey ? null : makeKey));
  };

  const toggleModel = (makeKey, modelKey) => {
    setSelectedModels((currentSelection) => {
      const makeModels = currentSelection[makeKey] ?? [];
      const nextModels = makeModels.includes(modelKey)
        ? makeModels.filter((model) => model !== modelKey)
        : [...makeModels, modelKey];

      return { ...currentSelection, [makeKey]: nextModels };
    });
  };

  const toggleAllModels = (group) => {
    setSelectedModels((currentSelection) => {
      const current = currentSelection[group.key] ?? [];
      const allKeys = group.models.map((model) => model.key);
      const allChecked =
        allKeys.length > 0 && allKeys.every((key) => current.includes(key));

      return { ...currentSelection, [group.key]: allChecked ? [] : allKeys };
    });
  };

  const applyFilters = () => {
    const selectedNames = {};
    groups.forEach((group) => {
      const keys = selectedModels[group.key] ?? [];
      if (keys.length > 0) {
        selectedNames[group.name] = group.models
          .filter((model) => keys.includes(model.key))
          .map((model) => model.name);
      }
    });

    onApply?.(selectedModels, selectedNames);

    if (applyPath) {
      const param = selectionToParam(selectedModels);
      navigate(
        param
          ? `${applyPath}?${new URLSearchParams({ models: param }).toString()}`
          : applyPath
      );
    }
  };

  const clearFilters = () => {
    setSelectedModels({});
    setSearchQuery("");
    onClear?.();
  };

  const query = searchQuery.trim().toLowerCase();
  const visibleGroups = groups.filter(
    (group) =>
      !query ||
      group.name.toLowerCase().includes(query) ||
      group.models.some((model) => model.name.toLowerCase().includes(query))
  );

  return (
    <div className="mt-0 flex  w-full max-w-full flex-col overflow-hidden rounded-[18px] border border-[#d8d0c1] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.14)]">
      <div className="shrink-0 bg-[#2d2d2d] px-4 py-4 sm:px-5">
        <h2 className="text-[17px] font-bold tracking-[-0.02em] text-white">
          Search By Make &amp; Model
        </h2>
      </div>

      <div className="shrink-0 px-4 py-4">
        <div className="rounded-[10px] border border-[#d5cdb8] bg-white px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
          <input
            type="text"
            id="vehicle-search"
            name="vehicle-search"
            aria-label="Search vehicle makes and models"
            placeholder="Search makes and models..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full bg-transparent text-sm text-[#1f1f1f] placeholder:text-[#7a7469] focus:outline-none"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 px-2 pb-2">
        <ul className="h-full overflow-y-auto pr-1">
          {visibleGroups.length === 0 && (
            <li className="px-2 py-4 text-sm text-[#6b6a68]">
              {loading
                ? "Loading vehicles..."
                : loadError
                  ? "Unable to load vehicles."
                  : groups.length === 0
                    ? "No vehicles in stock yet."
                    : "No makes or models match your search."}
            </li>
          )}

          {visibleGroups.map((group) => {
            const isExpanded = expandedMake === group.key;
            const checkedModels = selectedModels[group.key] ?? [];
            const allChecked =
              group.models.length > 0 &&
              group.models.every((model) => checkedModels.includes(model.key));

            return (
              <li
                key={group.key}
                className="border-b border-black/50 px-2 last:border-b-0"
              >
                <div>
                  <button
                    type="button"
                    onClick={() => toggleMake(group.key)}
                    aria-expanded={isExpanded}
                    className="flex min-h-12 w-full items-center gap-3 py-2 text-left"
                  >
                    {group.image ? (
                      <img
                        src={group.image}
                        alt=""
                        className="h-9 w-9 shrink-0 rounded-full bg-white object-contain p-1 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600"
                      >
                        {group.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}

                    <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="block truncate text-[15px] font-semibold leading-[1.2] text-[#1d1d1d]">
                          {group.name}
                        </span>
                        <span className="mt-1 block text-[12px] leading-[1.2] text-[#6b6a68]">
                          {group.count}{" "}
                          {group.count === 1 ? "vehicle" : "vehicles"}
                          {checkedModels.length > 0 &&
                            ` · ${checkedModels.length} selected`}
                        </span>
                      </div>

                      <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        fill="none"
                        className={`h-4 w-4 shrink-0 text-[#1d1d1d] transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      >
                        <path
                          d="M5 7.5L10 12.5L15 7.5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </button>

                  {isExpanded && (
                    <ul className="max-h-64 space-y-1 overflow-y-auto border-l border-[#d6cfbf] pb-2 pl-3 pr-1">
                      {group.models.length === 0 && (
                        <li className="px-2 py-2 text-sm text-[#6b6a68]">
                          No vehicles in stock.
                        </li>
                      )}

                      {group.models.length > 1 && (
                        <li>
                          <label
                            htmlFor={`${group.key}-all`}
                            className="flex min-h-10 cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm font-semibold hover:bg-black/5"
                          >
                            <input
                              id={`${group.key}-all`}
                              type="checkbox"
                              checked={allChecked}
                              onChange={() => toggleAllModels(group)}
                              className="h-4 w-4 accent-black"
                            />
                            <span className="min-w-0 flex-1 truncate text-[#1d1d1d]">
                              All {group.name}
                            </span>
                          </label>
                        </li>
                      )}

                      {group.models
                        .filter(
                          (model) =>
                            !query ||
                            group.name.toLowerCase().includes(query) ||
                            model.name.toLowerCase().includes(query)
                        )
                        .map((model) => {
                          const checkboxId = `${group.key}-${model.key}`;
                          const isChecked = checkedModels.includes(model.key);

                          return (
                            <li key={model.key}>
                              <label
                                htmlFor={checkboxId}
                                className="flex min-h-10 cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm hover:bg-black/5"
                              >
                                <input
                                  id={checkboxId}
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() =>
                                    toggleModel(group.key, model.key)
                                  }
                                  className="h-4 w-4 accent-black"
                                />
                                <span className="min-w-0 flex-1 truncate text-[#1d1d1d]">
                                  {model.name}
                                </span>
                                <span className="shrink-0 text-[11px] text-[#6b6a68]">
                                  {model.count} in stock
                                </span>
                              </label>
                            </li>
                          );
                        })}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex shrink-0 gap-3 border-t border-black/10 bg-white px-4 py-3">
        <button
          type="button"
          onClick={applyFilters}
          className="min-h-11 flex-1 rounded-md bg-[#2d2d2d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={clearFilters}
          className="min-h-11 flex-1 rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-300"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default SearchCard;