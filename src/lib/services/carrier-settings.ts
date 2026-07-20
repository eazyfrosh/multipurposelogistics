import { getAll, upsert } from "@/lib/services/store";
import { ALL_CARRIERS } from "@/lib/data/carriers";
import type { CarrierSetting } from "@/types";

const COLLECTION = "carrier_settings";

export async function getCarrierSettings(): Promise<CarrierSetting[]> {
  const existing = await getAll<CarrierSetting>(COLLECTION);
  if (existing.length > 0) {
    const byCode = new Map(existing.map((c) => [c.code, c]));
    return ALL_CARRIERS.map(
      (c) =>
        byCode.get(c.code) ?? {
          id: c.code,
          code: c.code,
          name: c.name,
          prefix: c.prefix,
          active: true,
          serviceTypes: c.serviceTypes,
        }
    );
  }
  const seeded: CarrierSetting[] = ALL_CARRIERS.map((c) => ({
    id: c.code,
    code: c.code,
    name: c.name,
    prefix: c.prefix,
    active: true,
    serviceTypes: c.serviceTypes,
  }));
  await Promise.all(seeded.map((c) => upsert(COLLECTION, c)));
  return seeded;
}

export async function setCarrierActive(code: string, active: boolean) {
  const settings = await getCarrierSettings();
  const target = settings.find((c) => c.code === code);
  if (!target) return;
  await upsert(COLLECTION, { ...target, active });
}
