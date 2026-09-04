// Data access for the "students" collection.
//
// Shape of a student document:
// {
//   firstName: string,
//   lastInitial: string,
//   parentName: string,
//   phone: string,
//   email: string,
//   notes: string,
//   defaultDuration: 30 | 45 | 60,
//   createdAt: timestamp,
// }

import { db } from "../firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const studentsRef = collection(db, "students");

// Subscribes to the alphabetized student list. Calls callback(students) any
// time the data changes (including immediately with the current data).
// Returns an unsubscribe function - call it on component unmount.
export function subscribeToStudents(callback) {
  const q = query(studentsRef, orderBy("firstName"));
  return onSnapshot(q, (snapshot) => {
    const students = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(students);
  });
}

export async function addStudent(student) {
  return addDoc(studentsRef, {
    ...student,
    createdAt: serverTimestamp(),
  });
}

export async function updateStudent(studentId, updates) {
  return updateDoc(doc(db, "students", studentId), updates);
}

export async function deleteStudent(studentId) {
  return deleteDoc(doc(db, "students", studentId));
}

// Formats a student for display on the calendar, e.g. "Emma S."
export function displayName(student) {
  if (!student) return "";
  return `${student.firstName} ${student.lastInitial}.`;
}
