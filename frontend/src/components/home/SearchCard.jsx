import React, { useState } from "react";
import { makeOptions, vehicleInventory } from "../../constants";

const inventoryKeyByMake = {
  "Mercedes-Benz": "MercedesBenz",
};

const SearchCard = () => {
  const [selectedModels, setSelectedModels] = useState({});

  const toggleModel = (makeName, modelName) => {
    setSelectedModels((currentSelection) => {
      const makeModels = currentSelection[makeName] ?? [];
      const nextModels = makeModels.includes(modelName)
        ? makeModels.filter((model) => model !== modelName)
        : [...makeModels, modelName];

      return { ...currentSelection, [makeName]: nextModels };
    });
  };

  return (
    <div className="align-center w-[360px] h-[650px] mt-10 ml-5 rounded-[18px] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
      <div className="bg-black px-5 py-4 rounded-t-[18px]">
        <h2 className="text-[17px] font-bold tracking-[-0.02em] text-white">
          Search By Make &amp; Model
        </h2>
      </div>
      <div className="px-5 py-4">
        <input
          type="text"
          id="vehicle-search"
          name="vehicle-search"
          placeholder="Search makes..."
          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition duration-200 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-black-500"
        />
      </div>
      <div className="px-5 pb-4">
        <h2 className="mb-2 text-[17px] font-bold tracking-[-0.02em] text-black">
          Browse by make
        </h2>
        <ul className="max-h-120 space-y-1 overflow-y-auto">
          {makeOptions.map((option) => {
            const inventoryKey = inventoryKeyByMake[option.name] ?? option.name;
            const models = vehicleInventory[inventoryKey];

            return (
              <li
                key={option.name}
                className="rounded-lg px-3 py-2 text-slate-800 transition hover:bg-slate-50"
              >
                <details>
                  <summary className="flex cursor-pointer list-none items-center gap-3">
                    <img
                      src={option.image}
                      alt=""
                      className="h-7 w-7 shrink-0 rounded-md bg-white p-1 object-contain shadow-sm"
                    />
                    <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        {option.name}
                      </span>
                      <span className="shrink-0 text-xs text-slate-500">
                        {option.count}
                      </span>
                    </span>
                    <span aria-hidden="true" className="text-xs text-slate-500">
                      ▾
                    </span>
                  </summary>
                  <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto border-l border-slate-200 pl-3">
                    {models.map((model) => {
                      const checkboxId = `${inventoryKey}-${model.name}`;

                      return (
                        <li key={model.name}>
                          <label
                            htmlFor={checkboxId}
                            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-white"
                          >
                            <input
                              id={checkboxId}
                              type="checkbox"
                              checked={(selectedModels[option.name] ?? []).includes(
                                model.name,
                              )}
                              onChange={() =>
                                toggleModel(option.name, model.name)
                              }
                              className="h-4 w-4 accent-black"
                            />
                            <span className="min-w-0 flex-1 truncate">
                              {model.name}
                            </span>
                            <span className="shrink-0 text-xs text-slate-500">
                              {model.stock} in stock
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default SearchCard;
