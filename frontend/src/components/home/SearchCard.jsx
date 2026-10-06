import React, { useState } from "react";
import { makeOptions, vehicleInventory } from "../../constants";

const SearchCard = ({ onApply, onClear }) => {
  const [selectedModels, setSelectedModels] = useState({});
  const [expandedMake, setExpandedMake] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleMake = (makeKey) => {
    setExpandedMake((current) => (current === makeKey ? null : makeKey));
  };

  const toggleModel = (makeKey, modelName) => {
    setSelectedModels((currentSelection) => {
      const makeModels = currentSelection[makeKey] ?? [];
      const nextModels = makeModels.includes(modelName)
        ? makeModels.filter((model) => model !== modelName)
        : [...makeModels, modelName];

      return { ...currentSelection, [makeKey]: nextModels };
    });
  };

  const applyFilters = () => {
    onApply?.(selectedModels);
  };

  const clearFilters = () => {
    setSelectedModels({});
    setSearchQuery("");
    onClear?.();
  };

  const query = searchQuery.trim().toLowerCase();
  const filteredMakes = makeOptions.filter((option) => {
    const inventoryKey = option.inventoryKeyByMake ?? option.name;
    const models = vehicleInventory[inventoryKey] ?? [];
    return (
      !query ||
      option.name.toLowerCase().includes(query) ||
      models.some((model) => model.name.toLowerCase().includes(query))
    );
  });

  return (
    <div className="mt-0 flex h-auto min-h-[420px] w-full max-w-full flex-col overflow-hidden rounded-[18px] border border-[#d8d0c1] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.14)] lg:mt-2 lg:h-[650px] lg:max-w-[360px] lg:shrink-0">
      <div className="bg-[#2d2d2d] px-5 py-4">
        <h2 className="text-[17px] font-bold tracking-[-0.02em] text-white">
          Search By Make &amp; Model
        </h2>
      </div>

      <div className="px-4 py-4">
        <div className="rounded-[10px] border border-[#d5cdb8] bg-white px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
          <input
            type="text"
            id="vehicle-search"
            name="vehicle-search"
            placeholder="Search makes..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full bg-transparent text-sm text-[#1f1f1f] placeholder:text-[#7a7469] focus:outline-none"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 px-2 pb-2">
        <ul className="h-full overflow-y-auto pr-1">
          {filteredMakes.map((option) => {
            const inventoryKey = option.inventoryKeyByMake ?? option.name;
            const models = vehicleInventory[inventoryKey] ?? [];
            const isExpanded = expandedMake === inventoryKey;
            const checkedModels = selectedModels[inventoryKey] ?? [];

            return (
              <li
                key={option.name}
                className="border-b border-black/50 px-2 last:border-b-0"
              >
                <div>
                  <button
                    type="button"
                    onClick={() => toggleMake(inventoryKey)}
                    className="flex w-full items-center gap-3 py-[12px] text-left"
                  >
                    <img
                      src={option.image}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-full bg-white object-contain p-1 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]"
                    />

                    <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="block truncate text-[15px] font-semibold leading-[1.2] text-[#1d1d1d]">
                          {option.name}
                        </span>
                        <span className="mt-1 block text-[12px] leading-[1.2] text-[#6b6a68]">
                          {option.count}
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
                      {models
                        .filter(
                          (model) =>
                            !query ||
                            option.name.toLowerCase().includes(query) ||
                            model.name.toLowerCase().includes(query),
                        )
                        .map((model) => {
                          const checkboxId = `${inventoryKey}-${model.name}`;
                          const isChecked = checkedModels.includes(model.name);

                          return (
                            <li key={model.name}>
                              <label
                                htmlFor={checkboxId}
                                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-white/40"
                              >
                                <input
                                  id={checkboxId}
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() =>
                                    toggleModel(inventoryKey, model.name)
                                  }
                                  className="h-4 w-4 accent-black"
                                />
                                <span className="min-w-0 flex-1 truncate text-[#1d1d1d]">
                                  {model.name}
                                </span>
                                <span className="shrink-0 text-[11px] text-[#6b6a68]">
                                  {model.stock} in stock
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
      <div className="flex gap-3 border-black/50 bg-white px-4 py-3">
        <button
          type="button"
          onClick={applyFilters}
          className="flex-1 rounded-md bg-[#2d2d2d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2d2d2d]-300"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={clearFilters}
          className="flex-1 rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-300"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default SearchCard;
