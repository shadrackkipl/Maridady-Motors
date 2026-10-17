import ToyotaLogo from "../assets/CarLogos/Toyota.png";
import NissanLogo from "../assets/CarLogos/Nissan.JPG";
import MercedesBenzLogo from "../assets/CarLogos/Mercedes.png";
import MazdaLogo from "../assets/CarLogos/Mazda.png";
import MitsubishiLogo from "../assets/CarLogos/Mistubishi.jpg";
import SuzukiLogo from "../assets/CarLogos/Suzuki.JPG";
import SubaruLogo from "../assets/CarLogos/Subaru.png";
import HondaLogo from "../assets/CarLogos/Honda.PNG";
import IsuzuLogo from "../assets/CarLogos/Isuzu.png";
import VolkswagenLogo from "../assets/CarLogos/Volkswagen.PNG";
import LexusLogo from "../assets/CarLogos/Lexus.PNG";
import VolvoLogo from "../assets/CarLogos/Volvo.PNG";
import FordLogo from "../assets/CarLogos/Ford.PNG";
import BmwLogo from "../assets/CarLogos/bmw.PNG";
import AudiLogo from "../assets/CarLogos/Audi.PNG";
import DaihatsuLogo from "../assets/CarLogos/Daihatsu.PNG";




 export const makeOptions = [
  {
    name: "Toyota",
    count: "1,197 vehicles",
    image: ToyotaLogo,
    inventoryKeyByMake: "Toyota",
  },
  {
    name: "Nissan",
    count: "146 vehicles",
    image: NissanLogo,
    inventoryKeyByMake: "Nissan",
  },
  {
    name: "Mercedes-Benz",
    count: "137 vehicles",
    image: MercedesBenzLogo,
    inventoryKeyByMake: "MercedesBenz",
  },
  {
    name: "Mazda",
    count: "131 vehicles",
    image: MazdaLogo,
    inventoryKeyByMake: "Mazda",
  },
  {
    name: "Mitsubishi",
    count: "121 vehicles",
    image: MitsubishiLogo,
    inventoryKeyByMake: "Mitsubishi",
  },
  {
    name: "Suzuki",
    count: "117 vehicles",
    image: SuzukiLogo,
    inventoryKeyByMake: "Suzuki",
  },
  {
    name: "Subaru",
    count: "95 vehicles",
    image: SubaruLogo,
    inventoryKeyByMake: "Subaru",
  },
  {
    name: "Honda",
    count: "91 vehicles",
    image: HondaLogo,
    inventoryKeyByMake: "Honda",
  },
  {
    name: "Isuzu",
    count: "88 vehicles",
    image: IsuzuLogo,
    inventoryKeyByMake: "Isuzu",
  },
  {
    name: "Volkswagen",
    count: "41 vehicles",
    image: VolkswagenLogo,
    inventoryKeyByMake: "Volkswagen",
  },
  {
    name: "Lexus",
    count: "0 vehicles",
    image: LexusLogo,
    inventoryKeyByMake: "Lexus",
  },
  {
    name: "Volvo",
    count: "0 vehicles",
    image: VolvoLogo,
    inventoryKeyByMake: "Volvo",
  },
  {
    name: "Ford",
    count: "0 vehicles",
    image: FordLogo,
    inventoryKeyByMake: "Ford",
  },
  {
    name: "BMW",
    count: "0 vehicles",
    image: BmwLogo,
    inventoryKeyByMake: "BMW",
  },
  {
    name: "Audi",
    count: "0 vehicles",
    image: AudiLogo,
    inventoryKeyByMake: "Audi",
  },
  {
    name: "Daihatsu",
    count: "0 vehicles",
    image: DaihatsuLogo,
    inventoryKeyByMake: "Daihatsu",
  },
];




// Helpers shared by the search card and the search page.

// "Mercedes-Benz", "MercedesBenz" and "mercedes benz" all become "mercedesbenz"
export const normalizeKey = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

/**
 * Groups the cars in stock by make and model, with real counts.
 * makeOptions (from constants) is used to look up each make's logo.
 * With includeEmpty, makes from makeOptions that have no cars are listed
 * too, with a count of 0.
 */
export const buildMakeGroups = (
  cars,
  makeOptions = [],
  { includeEmpty = false } = {}
) => {
  const logos = new Map();
  makeOptions.forEach((option) => {
    logos.set(normalizeKey(option.name), option);
    logos.set(normalizeKey(option.inventoryKeyByMake), option);
  });

  const groups = new Map();

  cars.forEach((car) => {
    const makeKey = normalizeKey(car.make);
    if (!makeKey) return;

    if (!groups.has(makeKey)) {
      const option = logos.get(makeKey);
      groups.set(makeKey, {
        key: makeKey,
        name: option?.name || String(car.make).trim(),
        image: option?.image || null,
        count: 0,
        models: new Map(),
      });
    }

    const group = groups.get(makeKey);
    group.count += 1;

    const modelKey = normalizeKey(car.model_name);
    if (!modelKey) return;

    const model = group.models.get(modelKey) || {
      key: modelKey,
      name: String(car.model_name).trim(),
      count: 0,
    };
    model.count += 1;
    group.models.set(modelKey, model);
  });

  if (includeEmpty) {
    makeOptions.forEach((option) => {
      const makeKey = normalizeKey(option.name);
      if (!groups.has(makeKey)) {
        groups.set(makeKey, {
          key: makeKey,
          name: option.name,
          image: option.image || null,
          count: 0,
          models: new Map(),
        });
      }
    });
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      models: [...group.models.values()].sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

/**
 * selection: { [makeKey]: [modelKey, ...] } from the search card.
 * A car passes when it matches a selected make + model (or nothing is
 * selected), the car type, and the price range.
 */
export const filterCars = (
  cars,
  { selection = {}, bodyType = "", minPrice = "", maxPrice = "" }
) => {
  const picks = Object.entries(selection).filter(
    ([, models]) => models.length > 0
  );
  const min = minPrice === "" ? null : Number(minPrice);
  const max = maxPrice === "" ? null : Number(maxPrice);

  return cars.filter((car) => {
    if (picks.length > 0) {
      const makeKey = normalizeKey(car.make);
      const modelKey = normalizeKey(car.model_name);
      const matches = picks.some(
        ([key, models]) => key === makeKey && models.includes(modelKey)
      );
      if (!matches) return false;
    }

    if (bodyType && car.body_type !== bodyType) return false;

    const price = Number(car.price);
    if (min !== null && price < min) return false;
    if (max !== null && price > max) return false;

    return true;
  });
};

// URL format for a selection: "toyota:rav4,toyota:harrier,subaru:forester"
export const selectionToParam = (selection = {}) =>
  Object.entries(selection)
    .flatMap(([makeKey, models]) =>
      models.map((modelKey) => `${makeKey}:${modelKey}`)
    )
    .sort()
    .join(",");

export const paramToSelection = (param) => {
  const selection = {};
  (param || "")
    .split(",")
    .filter(Boolean)
    .forEach((pair) => {
      const [makeKey, modelKey] = pair.split(":");
      if (!makeKey || !modelKey) return;
      selection[makeKey] = [...(selection[makeKey] || []), modelKey];
    });
  return selection;
};