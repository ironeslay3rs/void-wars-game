"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ItemPicker from "@/components/shared/ItemPicker";
import ScreenHeader from "@/components/shared/ScreenHeader";
import { useGame } from "@/features/game/gameContext";
import type { LoadoutSlotId } from "@/features/game/gameTypes";
import {
  FIELD_LOADOUT_PROFILES,
  getFieldLoadoutExposeDamageMult,
  getFieldLoadoutPostureFillMult,
  getFieldLoadoutStrikeMult,
  type FieldLoadoutProfile,
} from "@/features/combat/fieldLoadout";
import { getSchoolCombatPassives } from "@/features/combat/fieldCombatIdentity";
import {
  autoEquipStarterKit,
  getAvailableItemsForSlot,
  getEquippedItem,
  LOADOUT_SLOT_LABELS,
  LOADOUT_SLOT_ORDER,
} from "@/features/player/loadoutState";
import {
  describeLoadoutItemCombatProfile,
  getPlayerLoadoutCombatModifiers,
} from "@/features/combat/loadoutCombatStats";
import { VOID_EXPEDITION_PATH } from "@/features/void-maps/voidRoutes";
import { itemRankLabel } from "@/features/inventory/itemRanks";

export default function LoadoutPage() {
  const { state, dispatch } = useGame();
  const player = state.player;
  const passives = getSchoolCombatPassives(player);
  const current = player.fieldLoadoutProfile;
  const [pickerSlot, setPickerSlot] = useState<LoadoutSlotId | null>(null);
  const loadoutCombat = useMemo(
    () => getPlayerLoadoutCombatModifiers(player),
    [player],
  );

  const pickerItems = useMemo(() => {
    if (!pickerSlot) return [];
    return getAvailableItemsForSlot(
      player.loadoutSlots,
      pickerSlot,
      player.factionAlignment,
      player.craftedInventory,
    );
  }, [pickerSlot, player.factionAlignment, player.loadoutSlots, player.craftedInventory]);

  const availableWeaponItems = useMemo(
    () =>
      getAvailableItemsForSlot(
        player.loadoutSlots,
        "weapon",
        player.factionAlignment,
        player.craftedInventory,
      ),
    [player.factionAlignment, player.loadoutSlots, player.craftedInventory],
  );

  const mirefangSidearm = availableWeaponItems.find(
    (item) => item.id === "bio-mirefang-sidearm",
  );
  const isMirefangEquipped =
    player.loadoutSlots.weapon === "bio-mirefang-sidearm";

  const allSlotsEmpty = LOADOUT_SLOT_ORDER.every((s) => !player.loadoutSlots[s]);
  const nextEmptySlot = LOADOUT_SLOT_ORDER.find((s) => !player.loadoutSlots[s]);
  const weaponSlotEmpty = !player.loadoutSlots.weapon;

  function handleQuickEquip() {
    const filled = autoEquipStarterKit(player.loadoutSlots, player.factionAlignment);
    for (const slotKey of LOADOUT_SLOT_ORDER) {
      const id = filled[slotKey];
      if (id && !player.loadoutSlots[slotKey]) {
        dispatch({
          type: "EQUIP_LOADOUT_ITEM",
          payload: { slot: slotKey, itemId: id },
        });
      }
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(40,60,100,0.28),_rgba(5,8,18,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <ScreenHeader
          backHref="/home"
          backLabel="Back to Home"
          eyebrow="Operations / Field loadout"
          title="Combat loadout"
          subtitle="Rigs change posture pressure and expose damage on the void field (local shell drills). School passives unlock from path depth and Executional tier."
        />

        <section className="rounded-2xl border border-cyan-400/25 bg-cyan-950/20 p-6">
          <h2 className="text-lg font-black uppercase tracking-[0.06em] text-cyan-100">
            Field rig
          </h2>
          <p className="mt-2 text-sm text-white/65">
            Preparation matters: swap before deploying. Combat career focus still
            adds raw strike % on top of rig math.
          </p>
          <p className="mt-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-xs leading-relaxed text-white/60">
            Active rig — strike ×
            {getFieldLoadoutStrikeMult(current).toFixed(2)}, posture fill ×
            {getFieldLoadoutPostureFillMult(current).toFixed(2)}, expose window ×
            {getFieldLoadoutExposeDamageMult(current).toFixed(2)}.
          </p>
          <p className="mt-2 rounded-xl border border-cyan-300/20 bg-cyan-950/25 px-4 py-3 text-xs leading-relaxed text-cyan-100/90">
            Equipped weapon: {loadoutCombat.weaponFamily.toUpperCase()} ({loadoutCombat.strikeRangePct}% range)
            · strike +{loadoutCombat.damageBonusPct}% · armor mitigation {loadoutCombat.armorMitigationPct}%.
          </p>
          <div className="mt-3 rounded-xl border border-amber-300/25 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-100/90">
            New operator prompt: if your combat kit feels empty, visit the Black
            Market loop first, then return here to finalize your field setup.
            <div className="mt-2 flex flex-wrap gap-2">
              <Link
                href="/bazaar/black-market"
                className="rounded-lg border border-amber-200/45 bg-black/25 px-2 py-1 font-semibold uppercase tracking-[0.08em] text-amber-50 hover:border-amber-100/60"
              >
                Visit Black Market
              </Link>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {FIELD_LOADOUT_PROFILES.map((p) => {
              const active = current === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: "SET_FIELD_LOADOUT_PROFILE",
                      payload: p.id as FieldLoadoutProfile,
                    })
                  }
                  className={[
                    "rounded-xl border px-4 py-4 text-left transition",
                    active
                      ? "border-cyan-400/55 bg-cyan-500/15 shadow-[0_0_24px_rgba(34,211,238,0.12)]"
                      : "border-white/12 bg-black/30 hover:border-white/22",
                  ].join(" ")}
                >
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                    Rig
                  </div>
                  <div className="mt-1 text-sm font-black text-white">{p.label}</div>
                  <p className="mt-2 text-xs leading-relaxed text-white/60">{p.line}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-white/12 bg-white/[0.04] p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-black uppercase tracking-[0.06em] text-white">
              Active loadout slots
            </h2>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {mirefangSidearm && !isMirefangEquipped ? (
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: "EQUIP_LOADOUT_ITEM",
                      payload: {
                        slot: "weapon",
                        itemId: mirefangSidearm.id,
                      },
                    })
                  }
                  className="rounded-xl border border-emerald-400/45 bg-emerald-500/15 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-emerald-100 transition hover:bg-emerald-500/25"
                >
                  Equip Mirefang Sidearm
                </button>
              ) : null}
              {isMirefangEquipped ? (
                <span className="rounded-xl border border-emerald-400/35 bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-emerald-100/90">
                  Mirefang Equipped
                </span>
              ) : null}
              {allSlotsEmpty ? (
                <button
                  type="button"
                  onClick={handleQuickEquip}
                  className="rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-cyan-200 transition hover:bg-cyan-500/25"
                >
                  Quick Equip Kit
                </button>
              ) : null}
            </div>
          </div>
          <p className="mt-2 text-sm text-white/60">
            Equip items from owned inventory into your combat slots. Unequip returns the
            item to your available inventory list.
          </p>
          {weaponSlotEmpty ? (
            <p className="mt-3 rounded-xl border border-cyan-400/30 bg-cyan-950/20 px-4 py-3 text-xs leading-relaxed text-cyan-100/90">
              <span className="font-bold uppercase tracking-[0.12em] text-cyan-200">
                Equip weapon first
              </span>
              <span className="mt-1 block text-cyan-100/85">
                Your weapon sets strike range and damage bonuses on the void field — fill this
                slot before you tune armor, core, or runes.
              </span>
            </p>
          ) : null}

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {LOADOUT_SLOT_ORDER.map((slot) => {
              const equipped = getEquippedItem(
                player.loadoutSlots,
                slot,
                player.factionAlignment,
                player.craftedInventory,
              );
              const highlightEmpty = !equipped && slot === nextEmptySlot;
              return (
                <div
                  key={slot}
                  className={[
                    "rounded-xl border bg-black/25 p-4 transition",
                    highlightEmpty
                      ? "border-cyan-400/45 shadow-[0_0_20px_rgba(34,211,238,0.12)] ring-1 ring-cyan-400/25"
                      : "border-white/12",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                      {LOADOUT_SLOT_LABELS[slot]}
                    </div>
                    {highlightEmpty ? (
                      <span className="rounded-md border border-cyan-400/35 bg-cyan-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-cyan-100">
                        Next
                      </span>
                    ) : null}
                  </div>
                  {equipped ? (
                    <>
                      <div className="mt-2 text-sm font-black uppercase tracking-[0.05em] text-white">
                        {equipped.name}
                      </div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/45">
                        {equipped.rarity} / {equipped.type} / {itemRankLabel(equipped.rankTier)}
                      </div>
                      <div className="mt-2 text-xs text-white/65">{equipped.description}</div>
                      {describeLoadoutItemCombatProfile(equipped.id) ? (
                        <div className="mt-1 text-[11px] text-cyan-100/80">
                          {describeLoadoutItemCombatProfile(equipped.id)}
                        </div>
                      ) : null}
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({
                            type: "UNEQUIP_LOADOUT_ITEM",
                            payload: { slot },
                          })
                        }
                        className="mt-3 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/80 hover:border-white/30 hover:bg-white/10"
                      >
                        Unequip
                      </button>
                      <button
                        type="button"
                        onClick={() => setPickerSlot(slot)}
                        className="mt-2 rounded-lg border border-cyan-400/35 bg-cyan-500/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-cyan-100 hover:border-cyan-300/55 hover:bg-cyan-500/18"
                      >
                        Change Item
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="mt-2 text-sm text-white/60">
                        Slot empty. Equip an item from inventory.
                      </div>
                      <button
                        type="button"
                        onClick={() => setPickerSlot(slot)}
                        className="mt-3 rounded-lg border border-cyan-400/35 bg-cyan-500/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-cyan-100 hover:border-cyan-300/55 hover:bg-cyan-500/18"
                      >
                        Equip Item
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-white/12 bg-white/[0.04] p-6">
          <h2 className="text-lg font-black uppercase tracking-[0.06em] text-white">
            School combat identity
          </h2>
          <p className="mt-2 text-sm text-white/55">
            Passive row mirrors your mastery progression — no separate unlock grid
            in this build.
          </p>
          <ul className="mt-4 space-y-3">
            {passives.map((s) => (
              <li
                key={s.id}
                className={[
                  "rounded-xl border px-4 py-3 text-sm",
                  s.active
                    ? "border-emerald-400/35 bg-emerald-950/25 text-emerald-50/95"
                    : "border-white/10 bg-black/25 text-white/45",
                ].join(" ")}
              >
                <span className="font-bold uppercase tracking-wider text-[11px] text-white/70">
                  {s.school}
                </span>
                <div className="mt-1 font-semibold text-white/90">{s.label}</div>
                <div className="mt-1 text-xs text-white/60">{s.effectLine}</div>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href={VOID_EXPEDITION_PATH}
            className="inline-flex rounded-xl border border-cyan-400/35 bg-cyan-500/12 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-500/18"
          >
            Void Expedition
          </Link>
          <Link
            href="/character"
            className="inline-flex rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-white/25"
          >
            Character path
          </Link>
        </div>
      </div>
      {pickerSlot ? (
        <ItemPicker
          slot={pickerSlot}
          items={pickerItems}
          onClose={() => setPickerSlot(null)}
          onEquip={(itemId) => {
            dispatch({
              type: "EQUIP_LOADOUT_ITEM",
              payload: { slot: pickerSlot, itemId },
            });
            setPickerSlot(null);
          }}
        />
      ) : null}
    </main>
  );
}
