// Data access + scheduling logic.
//
// We keep two collections instead of one giant "events" collection, because
// most lessons repeat weekly and we don't want to create 52 documents/year
// per student just to represent that.
//
// recurringLessons/{id}
//   { studentId, dayOfWeek (0=Sun..6=Sat), startTime "HH:MM", duration, active }
//
// scheduleExceptions/{id}
//   A one-off change layered on top of the recurring template for one date.
//   { date "YYYY-MM-DD", type, recurringLessonId, studentId, startTime, duration, label,
//     rescheduleReason, rescheduleEligible, makeupOwed }
//   type is one of:
//     "cancelled"  - the recurring lesson on this date does not happen
//     "moved"      - the recurring lesson on this date happens at a different time
//                    (startTime/duration describe the NEW time)
//     "oneOff"     - a lesson that exists only on this date (e.g. a rebooked makeup),
//                    not tied to any recurring template
//     "block"      - time that should not be scheduled (the "caution yellow" slots)

import { db } from "../firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

const recurringRef = collection(db, "recurringLessons");
const exceptionsRef = collection(db, "scheduleExceptions");

export function subscribeToRecurringLessons(callback) {
  return onSnapshot(recurringRef, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function subscribeToExceptions(callback) {
  return onSnapshot(exceptionsRef, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function addRecurringLesson(lesson) {
  return addDoc(recurringRef, { ...lesson, active: true, createdAt: serverTimestamp() });
}

export async function updateRecurringLesson(id, updates) {
  return updateDoc(doc(db, "recurringLessons", id), updates);
}

export async function addException(exception) {
  return addDoc(exceptionsRef, { ...exception, createdAt: serverTimestamp() });
}

export async function updateException(id, updates) {
  return updateDoc(doc(db, "scheduleExceptions", id), updates);
}

export async function deleteException(id) {
  return deleteDoc(doc(db, "scheduleExceptions", id));
}

// Reschedules a specific occurrence of a recurring lesson:
// marks the original date as cancelled, and (if newDate/newStartTime given)
// creates a linked one-off lesson at the new time. If newDate is left blank,
// this just records that a makeup is owed.
export async function rescheduleLesson({
  recurringLessonId,
  studentId,
  originalDate,
  originalStartTime,
  originalDuration,
  reason,
  eligible,
  newDate,
  newStartTime,
  newDuration,
}) {
  await addException({
    date: originalDate,
    type: "cancelled",
    recurringLessonId,
    studentId,
    startTime: originalStartTime,
    duration: originalDuration,
    rescheduleReason: reason,
    rescheduleEligible: eligible,
    makeupOwed: eligible && !newDate,
  });

  if (newDate && newStartTime) {
    await addException({
      date: newDate,
      type: "oneOff",
      recurringLessonId,
      studentId,
      startTime: newStartTime,
      duration: newDuration || originalDuration,
      label: "Makeup lesson",
    });
  }
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function dayOfWeek(dateStr) {
  // dateStr: "YYYY-MM-DD" -> 0=Sun..6=Sat, parsed as local date (not UTC)
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

export function dayName(dateStr) {
  return DAY_NAMES[dayOfWeek(dateStr)];
}

// Combines recurring templates + exceptions into the final list of slots
// to render for one date. Each returned item:
// { id, studentId, startTime, duration, kind: "lesson" | "block", label }
export function scheduleForDate(dateStr, recurringLessons, exceptions) {
  const dow = dayOfWeek(dateStr);
  const todaysExceptions = exceptions.filter((e) => e.date === dateStr);
  const cancelledRecurringIds = new Set(
    todaysExceptions.filter((e) => e.type === "cancelled").map((e) => e.recurringLessonId)
  );
  const movedByRecurringId = new Map(
    todaysExceptions.filter((e) => e.type === "moved").map((e) => [e.recurringLessonId, e])
  );

  const items = [];

  for (const rl of recurringLessons) {
    if (!rl.active || rl.dayOfWeek !== dow) continue;
    if (cancelledRecurringIds.has(rl.id) && !movedByRecurringId.has(rl.id)) continue;

       const moved = movedByRecurringId.get(rl.id);
    items.push({
      id: rl.id,
      studentId: rl.studentId,
      startTime: moved ? moved.startTime : rl.startTime,
      duration: moved ? moved.duration : rl.duration,
      kind: "lesson",
      source: "recurring",
      recurringLessonId: rl.id,
    });
  }

  for (const e of todaysExceptions) {
    if (e.type === "oneOff") {
      items.push({
        id: e.id,
        studentId: e.studentId,
        startTime: e.startTime,
        duration: e.duration,
        kind: "lesson",
        label: e.label,
        source: "oneOff",
        recurringLessonId: e.recurringLessonId || null,
      });
    }
    if (e.type === "block") {
      items.push({
        id: e.id,
        startTime: e.startTime,
        duration: e.duration,
        kind: "block",
        label: e.label || "Not available",
      });
    }
  }

  return items.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

// True if a student has any exception marked makeupOwed with no rebooked lesson yet.
export function hasOwedMakeup(exceptions, studentId) {
  return exceptions.some((e) => e.studentId === studentId && e.makeupOwed);
}
