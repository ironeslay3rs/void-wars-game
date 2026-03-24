"use client";

import { useMemo, useState } from "react";

import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import {
  feastCourses,
  feastHallScreenData,
  type FeastCourse,
} from "@/features/black-market/feastHallData";

const defaultCourse = feastCourses[0];

export default function FeastHallLane() {
  const [selectedCourseId, setSelectedCourseId] =
    useState<FeastCourse["id"]>(defaultCourse.id);
  const [servedCourseId, setServedCourseId] = useState<FeastCourse["id"] | null>(
    null,
  );

  const selectedCourse = useMemo(
    () =>
      feastCourses.find((course) => course.id === selectedCourseId) ?? defaultCourse,
    [selectedCourseId],
  );

  const servedCourse = useMemo(
    () =>
      feastCourses.find((course) => course.id === servedCourseId) ?? null,
    [servedCourseId],
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(120,75,30,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
        <ScreenHeader
          eyebrow={feastHallScreenData.eyebrow}
          title={feastHallScreenData.title}
          subtitle={feastHallScreenData.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {feastHallScreenData.statusCards.map((card) => (
            <PlaceholderPanel
              key={card.label}
              label={card.label}
              value={card.value}
              hint={card.hint}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title="Gluttony Lane"
            description="One live lane only. Pick a supplier, claim a plate, and let the hall reveal who fed you tonight."
          >
            <div className="space-y-4">
              {feastCourses.map((course) => {
                const isSelected = course.id === selectedCourse.id;

                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`block w-full rounded-xl border p-4 text-left transition ${course.accentClass} ${
                      isSelected
                        ? "shadow-[0_0_0_1px_rgba(255,255,255,0.18)]"
                        : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                          {course.supplier}
                        </p>
                        <h3 className="mt-1 text-base font-semibold text-white">
                          {course.title}
                        </h3>
                      </div>

                      <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/65">
                        {isSelected ? "Selected" : "Available"}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-white/70">{course.taste}</p>
                    <p className="mt-2 text-sm text-white/55">{course.laneNote}</p>
                  </button>
                );
              })}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setServedCourseId(selectedCourse.id)}
                  className="rounded-xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/20"
                >
                  Serve This Plate
                </button>

                <button
                  type="button"
                  onClick={() => setServedCourseId(null)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10"
                >
                  Clear Table
                </button>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Feast Ledger"
            description="A tiny load-bearing result panel for Book 1. No economy rewrite, no extra lanes, no fake recovery layer."
          >
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                  Selected Supplier
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  {selectedCourse.supplier}
                </p>
                <p className="mt-2 text-sm text-white/60">{selectedCourse.taste}</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                  Table State
                </p>

                {servedCourse ? (
                  <div className="mt-2 space-y-2">
                    <p className="text-base font-semibold text-white">
                      Plate served: {servedCourse.title}
                    </p>
                    <p className="text-sm text-white/65">{servedCourse.aftertaste}</p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-white/60">
                    No plate served yet. Choose one of the three suppliers and commit the table.
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-white/55">
                Feast Hall is one Gluttony lane inside the neutral Black Market citadel. Verdant Coil, Chrome Synod, and Ember Vault can all feed the room, but none of them own it.
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
